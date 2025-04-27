# query_helper.py

from neo4j import GraphDatabase
from sentence_transformers import SentenceTransformer
from groq import Groq
from config import NEO4J_URL, NEO4J_USER, NEO4J_PASSWORD, NEO4J_DATABASE, GROQ_API_KEY, GROQ_MODEL

print("Loading SentenceTransformer model...")
embed_model = SentenceTransformer('all-MiniLM-L6-v2')
print("SentenceTransformer loaded ✅")

print("Loading Groq Client...")
groq_client = Groq(api_key=GROQ_API_KEY)
print("Groq Client loaded ✅")

def get_similar_chunks(query):
    print(f"Received query: {query}")
    # Embed the user query
    embedding = embed_model.encode(query).tolist()
    print(f"Generated embedding for query ✅")

    print("Connecting to Neo4j database...")
    with GraphDatabase.driver(NEO4J_URL, auth=(NEO4J_USER, NEO4J_PASSWORD)) as driver:
        print("Connected to Neo4j ✅")
        cypher_query = """
        CALL db.index.vector.queryNodes('chunkVectorIndex', 6, $queryEmbedding)
        YIELD node, score
        MATCH (c:Chunk)-[:HAS_EMBEDDING]->(node)
        RETURN c.text as Text, score as Score
        """
        records, summary, keys = driver.execute_query(
            cypher_query,
            queryEmbedding=embedding,
            database_=NEO4J_DATABASE
        )
        print("Query executed ✅")
    return [record['Text'] for record in records]

def ask_groq(query, context_chunks):
    context = "\n".join(context_chunks)

    print("Sending prompt to Groq LLM...")
    completion = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are MNNNIT Allahabad bog assistant and tell you about bog meetings "
                    "You receive queries in Spanish and always respond in English accurately, "
                    "thinking step by step and ensuring no spelling or grammatical mistakes.\n\n"
                    f"Context:\n{context}"
                )
            },
            {
                "role": "user",
                "content": query
            }
        ]
    )
    print("Received response from Groq ✅")
    return completion.choices[0].message.content
