from sentence_transformers import SentenceTransformer
import psycopg2

# --- Load and chunk the documents ---
def chunk_text(text, chunk_size=500, overlap=50):
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

documents = {
    "reg_b_adverse_action": "docs/clean_reg_b_adverse_action.txt",
    "fair_lending_overview": "docs/clean_fair_lending_overview.txt",
}

all_chunks = []  # list of (source, chunk_text)

for source, path in documents.items():
    with open(path, encoding="utf-8") as f:
        text = f.read()
    chunks = chunk_text(text)
    for c in chunks:
        all_chunks.append((source, c))

print(f"Total chunks created: {len(all_chunks)}")

# --- Generate embeddings ---
model = SentenceTransformer("all-MiniLM-L6-v2")
texts = [c[1] for c in all_chunks]
embeddings = model.encode(texts, show_progress_bar=True)

print(f"Embedding shape: {embeddings.shape}")

# --- Store in Postgres ---
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    dbname="pms_platform",
    user="pms_admin",
    password="localdevpassword"
)
cur = conn.cursor()

# clear any old data first, so reruns don't duplicate
cur.execute("DELETE FROM loan_risk_policy_chunks;")

for (source, chunk), embedding in zip(all_chunks, embeddings):
    cur.execute(
        "INSERT INTO loan_risk_policy_chunks (source, chunk_text, embedding) VALUES (%s, %s, %s)",
        (source, chunk, embedding.tolist())
    )

conn.commit()
cur.close()
conn.close()

print("Saved all chunks to Postgres.")