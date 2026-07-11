import os
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

def store_snippet(snippet: str):
    embedding = model.encode(snippet).tolist()
    cur.execute(
        "INSERT INTO memory (snippet, embedding) VALUES (%s, %s)",
        (snippet, embedding)
    )
    conn.commit()

def main():
    for root, _, files in os.walk("."):
        for f in files:
            if f.endswith(".py"):
                with open(os.path.join(root, f)) as fh:
                    code = fh.read()
                    store_snippet(code)
    print("Code context stored in pgvector!")

if __name__ == "__main__":
    main()
