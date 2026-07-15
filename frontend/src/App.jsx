import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import ScoreApplicant from "./pages/dashboard/ScoreApplicant";
import Documents from "./pages/dashboard/Documents";
import PolicyAssistant from "./pages/dashboard/PolicyAssistant";
import Fairness from "./pages/dashboard/Fairness";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="score" element={<ScoreApplicant />} />
          <Route path="documents" element={<Documents />} />
          <Route path="policy-assistant" element={<PolicyAssistant />} />
          <Route path="fairness" element={<Fairness />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
