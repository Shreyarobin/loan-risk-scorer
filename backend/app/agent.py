from typing import TypedDict, Optional
import requests
from langgraph.graph import StateGraph, END


class LoanAgentState(TypedDict):
    applicant_data: dict
    risk_probability: Optional[float]
    risk_label: Optional[str]
    top_factors: Optional[list]
    narrative_explanation: Optional[str]
    policy_notes: Optional[str]
    memo: Optional[str]
    approval_status: Optional[str]  # "pending", "approved", "rejected"


API_BASE = "http://127.0.0.1:8000"


def score_node(state: LoanAgentState) -> LoanAgentState:
    response = requests.post(f"{API_BASE}/score", json=state["applicant_data"])
    result = response.json()
    state["risk_probability"] = result["risk_probability"]
    state["risk_label"] = result["risk_label"]
    return state


def explain_node(state: LoanAgentState) -> LoanAgentState:
    response = requests.post(f"{API_BASE}/score/narrative", json=state["applicant_data"])
    result = response.json()
    state["narrative_explanation"] = result["narrative_explanation"]
    return state


def policy_node(state: LoanAgentState) -> LoanAgentState:
    if state["risk_label"] == "high_risk":
        question = "What must a lender disclose to an applicant when denying a loan?"
    else:
        question = "What are a lender's obligations when approving a loan?"

    response = requests.post(f"{API_BASE}/policy-assistant/ask", json={"question": question})
    result = response.json()
    state["policy_notes"] = result["answer"]
    return state


def memo_node(state: LoanAgentState) -> LoanAgentState:
    memo = f"""LOAN RISK ASSESSMENT MEMO
==========================
Risk Probability: {state['risk_probability']}
Decision: {state['risk_label']}

Explanation for Applicant:
{state['narrative_explanation']}

Policy/Compliance Notes:
{state['policy_notes']}

Status: PENDING HUMAN APPROVAL
"""
    state["memo"] = memo
    state["approval_status"] = "pending"
    return state


def approval_gate_node(state: LoanAgentState) -> LoanAgentState:
    # In a full production system, this would pause execution and wait for a human
    # to call a separate "approve" endpoint (LangGraph's interrupt() mechanism).
    # For this version, the agent completes its full run but explicitly marks the
    # result as unresolved — nothing downstream may treat "pending" as a final decision.
    state["approval_status"] = "pending"
    return state


def build_agent_graph():
    graph = StateGraph(LoanAgentState)

    graph.add_node("score", score_node)
    graph.add_node("explain", explain_node)
    graph.add_node("policy", policy_node)
    graph.add_node("memo", memo_node)
    graph.add_node("approval_gate", approval_gate_node)

    graph.set_entry_point("score")
    graph.add_edge("score", "explain")
    graph.add_edge("explain", "policy")
    graph.add_edge("policy", "memo")
    graph.add_edge("memo", "approval_gate")
    graph.add_edge("approval_gate", END)

    return graph.compile()