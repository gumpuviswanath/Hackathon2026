import psycopg2
from sentence_transformers import SentenceTransformer

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="memorydb",
    user="postgres",
    password="postgres",
    host="localhost",
    port=5432
)
cur = conn.cursor()

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

def search_context(query: str, top_k: int = 5):
    # Generate embedding for the query
    embedding = model.encode(query).tolist()

    # Run semantic similarity search using pgvector
    cur.execute(
        "SELECT id, snippet FROM memory ORDER BY embedding <-> %s LIMIT %s;",
        (embedding, top_k)
    )
    results = cur.fetchall()
    return results

if __name__ == "__main__":
    q = input("Enter your search query: ")
    matches = search_context(q)
    print(f"\nTop results for query: '{q}'\n")
    for mid, snippet in matches:
        print(f"ID: {mid}\nSnippet:\n{snippet[:300]}...\n{'-'*40}")
