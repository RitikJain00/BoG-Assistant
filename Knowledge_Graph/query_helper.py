from neo4j import GraphDatabase
from sentence_transformers import SentenceTransformer
from groq import Groq
from config import NEO4J_URL, NEO4J_USER, NEO4J_PASSWORD, NEO4J_DATABASE, GROQ_API_KEY, GROQ_MODEL
import re

# Load embedding model
print("Loading SentenceTransformer model...")
embed_model = SentenceTransformer('all-MiniLM-L6-v2')
print("SentenceTransformer loaded ✅")

# Load Groq LLM client
print("Loading Groq Client...")
groq_client = Groq(api_key=GROQ_API_KEY)
print("Groq Client loaded ✅")

def extract_metadata_from_query(query):
    metadata = {}

    bog_match = re.search(r'\b(\d{1,3})(st|nd|rd|th)\b', query.lower())
    if bog_match:
        metadata["bog_number"] = bog_match.group(0).lower()

    item_match = re.search(r'item\s+no\.?\s*(\d+\.\d+)', query.lower())
    if item_match:
        metadata["item_no"] = item_match.group(1)

    date_match = re.search(r'(\d{4})[-/](\d{2})[-/](\d{2})', query)
    if date_match:
        metadata["meeting_date"] = f"{date_match.group(1)}-{date_match.group(2)}-{date_match.group(3)}"

    return metadata

def get_similar_chunks(query, top_k=100, min_score_threshold=0.5):
    print(f"Received query: {query}")

    embedding = embed_model.encode(query, normalize_embeddings=True).tolist()
    print("✅ Embedding generated")

    metadata_filters = extract_metadata_from_query(query)
    print(f"🔎 Metadata from query: {metadata_filters}")

    cypher_filter = "WHERE score >= $minScore"
    if "bog_number" in metadata_filters:
        cypher_filter += " AND c.bog_number = $bog_number"
    if "item_no" in metadata_filters:
        cypher_filter += " AND c.item_no = $item_no"
    if "meeting_date" in metadata_filters:
        cypher_filter += " AND c.meeting_date = $meeting_date"

    cypher_query = f"""
    CALL db.index.vector.queryNodes('chunkVectorIndex', {top_k}, $queryEmbedding)
    YIELD node, score
    MATCH (c:Chunk)-[:HAS_EMBEDDING]->(node)
    {cypher_filter}
    RETURN c.text AS text, c.bog_number AS bog, c.item_no AS item,
           c.meeting_date AS date, c.source_file AS file, score AS score
    ORDER BY score DESC
    """

    with GraphDatabase.driver(NEO4J_URL, auth=(NEO4J_USER, NEO4J_PASSWORD)) as driver:
        records, _, _ = driver.execute_query(
            cypher_query,
            queryEmbedding=embedding,
            minScore=min_score_threshold,
            bog_number=metadata_filters.get("bog_number"),
            item_no=metadata_filters.get("item_no"),
            meeting_date=metadata_filters.get("meeting_date"),
            database_=NEO4J_DATABASE
        )
        print("✅ Query executed")

    return [
        {
            "text": r["text"],
            "score": r["score"],
            "metadata": {
                "bog_number": r["bog"],
                "item_no": r.get("item"),
                "meeting_date": r["date"],
                "source_file": r["file"]
            }
        }
        for r in records
    ]

def ask_groq(query, context_chunks):
    # Retry with more relaxed threshold if initial retrieval failed
    if not context_chunks:
        print("⚠️ No context found with default parameters. Retrying with top_k=150 and min_score_threshold=0.3")
        context_chunks = get_similar_chunks(query, top_k=150, min_score_threshold=0.3)

    if not context_chunks:
        return "I'm sorry, I couldn't retrieve any relevant information. Please try rephrasing your query."

    context = "\n\n".join(
        f"[BoG: {chunk['metadata'].get('bog_number', 'N/A')} | Item: {chunk['metadata'].get('item_no', 'N/A')} | Date: {chunk['metadata'].get('meeting_date', 'N/A')} | Score: {chunk['score']:.2f}]\n{chunk['text']}"
        for chunk in context_chunks
    )

    print("Sending prompt to Groq LLM...")
    completion = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a highly knowledgeable assistant specialized in MNNIT Allahabad Board of Governors (BoG) meetings.\n\n"
                    "If the information is not explicitly present in the context, intelligently infer or reconstruct it based on the given in very details if you have more context give answer atleast 150 words, if you have less context give answer atleast 50 words.\n"
                    "Never say you don’t know. Respond formally, accurately, and with full confidence.\n\n"
                    f"Context:\n{context}"
                )
            },
            {
                "role": "user",
                "content": query
            }
        ]
    )
    print("✅ Groq responded")
    return completion.choices[0].message.content
