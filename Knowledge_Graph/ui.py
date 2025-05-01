import streamlit as st

# This must be the first Streamlit command
st.set_page_config(page_title="MNNIT BoG Chatbot", page_icon=":school:", layout="wide")

from neo4j import GraphDatabase
from sentence_transformers import SentenceTransformer
from groq import Groq
from config import NEO4J_URL, NEO4J_USER, NEO4J_PASSWORD, NEO4J_DATABASE, GROQ_API_KEY, GROQ_MODEL
import re
import time

# Initialize session state
if 'messages' not in st.session_state:
    st.session_state.messages = []

# Load models and clients
@st.cache_resource
def load_models():
    print("Loading SentenceTransformer model...")
    embed_model = SentenceTransformer('all-MiniLM-L6-v2')
    print("SentenceTransformer loaded ✅")
    
    print("Loading Groq Client...")
    groq_client = Groq(api_key=GROQ_API_KEY)
    print("Groq Client loaded ✅")
    
    return embed_model, groq_client

embed_model, groq_client = load_models()

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

def get_similar_chunks(query, top_k=100, min_score_threshold=0.6):
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

def ask_groq(query, context_chunks, max_tokens=5500):
   
    if not context_chunks:  
        context_chunks = get_similar_chunks(query, top_k=100, min_score_threshold=0.3)


    def estimate_tokens(text):
        return len(text.split()) * 1.3  # rough estimate: 1.3 tokens per word

    selected_chunks = []
    total_tokens = estimate_tokens(query) + 200  # include room for instructions and response

    for chunk in context_chunks:
        chunk_text = chunk['text'][:1200]  # truncate long text for safety
        chunk_tokens = estimate_tokens(chunk_text)

        if total_tokens + chunk_tokens > max_tokens:
            break

        selected_chunks.append({
            "text": chunk_text,
            "score": chunk["score"],
            "metadata": chunk["metadata"]
        })

        total_tokens += chunk_tokens

    if not selected_chunks:
        return "I'm sorry, the information is not available right now."

    context = "\n\n".join(
        f"[BoG: {chunk['metadata'].get('bog_number', 'N/A')} | Item: {chunk['metadata'].get('item_no', 'N/A')} | Date: {chunk['metadata'].get('meeting_date', 'N/A')} | Score: {chunk['score']:.2f}]\n{chunk['text']}"
        for chunk in selected_chunks
    )

    print("Sending prompt to Groq LLM...")

    try:
        completion = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a highly knowledgeable assistant specialized in MNNIT Allahabad Board of Governors (BoG) meetings.\n\n"
                        "If the information is not explicitly present in the context, intelligently infer or reconstruct it based on the given context. "
                        "Give answer in proper point-wise paragraph format. Minimum 50 words. "
                        "Never say you don't know. Respond formally, accurately, and with full confidence.\n\n"
                        f"Context:\n{context}"
                    )
                },
                {
                    "role": "user",
                    "content": query
                }
            ]
        )
    except Exception as e:
        print(f"❌ Groq error: {e}")
        return "⚠️ Something went wrong with Groq. Please try again later."

    print("✅ Groq responded")
    return completion.choices[0].message.content


# ✅ Format response with HTML
def format_response(response_text):
    formatted_html = """
    <div style="font-family: 'Segoe UI', sans-serif; font-size: 1rem; padding: 1rem;">
        <div style="background-color:#f0f4ff; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-weight: 600;">
            📌 MNNIT BoG Meeting Analysis
        </div>
    """

    paragraphs = [p.strip() for p in response_text.split("\n\n") if p.strip()]
    for para in paragraphs:
        if para.lower().startswith("based on"):
            formatted_html += f"""
            <div style=" border-left: 5px solid #ffa94d; color: #FAF6E9; padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1rem;">
                {para}
            </div>
            """
        elif para[:2].isdigit() and para[2] == ".":
            formatted_html += f"""
            <div style="margin-left: 1rem; color: #FAF6E9; margin-bottom: 0.5rem;">
                <p><strong>{para[:2]}</strong>{para[2:]}</p>
            </div>
            """
        elif "note that" in para.lower() or "please note" in para.lower():
            formatted_html += f"""
            <div style=" padding: 0.75rem 1rem; color: #FAF6E9; border-radius: 4px; border-left: 5px solid #38d9a9; margin-bottom: 1rem;">
                {para}
            </div>
            """
        else:
            formatted_html += f"<p style='margin-bottom: 1rem; color: #FAF6E9;'>{para}</p>"

    formatted_html += "</div>"
    return formatted_html


# Sidebar
with st.sidebar:
    st.title("MNNIT BoG Chatbot")
    st.markdown("""
    *About this Chatbot:*
    
    This AI assistant specializes in answering questions about MNNIT Allahabad's Board of Governors (BoG) meetings.
    
    It can retrieve and analyze information from meeting minutes, including:
    - Specific BoG meeting numbers (e.g., 75th) 
    - Meeting dates (e.g., January 31, 2023)
    
    The chatbot combines vector search with a powerful LLM to provide accurate, detailed responses.
    """)
    
    st.markdown("---")
    st.markdown("*Example Queries:*")
    st.markdown("- What was discussed in the 75th BoG meeting about faculty recruitment?")
    st.markdown("- Show me details about the meeting on January 31, 2023")
    st.markdown("- Tell me about specif professor detail?")
    
    st.markdown("---")
    st.markdown("*System Status:*")
    st.markdown(f"- Using Groq model: {GROQ_MODEL}")
    st.markdown("- Vector database: Neo4j")
    st.markdown("- Embedding model: all-MiniLM-L6-v2")

# Main chat interface
st.title("MNNIT Board of Governors Chatbot")
st.caption("Ask questions about MNNIT Allahabad BoG meetings and get detailed answers")

# Display chat messages
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"], unsafe_allow_html=True)

# Chat input
if prompt := st.chat_input("Ask about BoG meetings..."):
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    # Display user message
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # Display assistant response
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        full_response = ""
        
        # Show loading spinner while processing
        with st.spinner("Searching BoG meeting records..."):
            # Get relevant context chunks
            context_chunks = get_similar_chunks(prompt)
            
            # Get LLM response
            assistant_response = ask_groq(prompt, context_chunks)
        
        # Format and display response beautifully
        time.sleep(1)
    
        full_response = assistant_response
        formatted_html = format_response(full_response)
        st.components.v1.html(formatted_html, height=600, scrolling=True)

    
    # Add assistant response to chat history
    st.session_state.messages.append({"role": "assistant", "content": formatted_html})