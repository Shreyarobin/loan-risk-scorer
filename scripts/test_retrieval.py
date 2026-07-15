from sentence_transformers import SentenceTransformer
import psycopg2

model = SentenceTransformer("all-MiniLM-L6-v2")

query = "What does a lender have to tell an applicant if their loan is denied?"
query_embedding = model.encode(query).tolist()

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    dbname="pms_platform",
    user="pms_admin",
    password="localdevpassword"
)
cur = conn.cursor()

# <-> is pgvector's distance operator (smaller = more similar)
cur.execute(
    """
    SELECT source, chunk_text, embedding <-> %s::vector AS distance
    FROM loan_risk_policy_chunks
    ORDER BY distance
    LIMIT 3;
    """,
    (query_embedding,)
)

results = cur.fetchall()
for source, chunk, distance in results:
    print(f"\n--- Source: {source} | Distance: {distance:.4f} ---")
    print(chunk[:300])

cur.close()
conn.close()