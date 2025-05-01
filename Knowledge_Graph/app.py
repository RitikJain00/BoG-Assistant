# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from query_helper import get_similar_chunks, ask_groq

app = Flask(__name__)
CORS(app)


@app.route("/query", methods=["POST"])
def query():
    data = request.get_json()
    user_query = data.get("query", "")

    if not user_query:
        return jsonify({"error": "No query provided"}), 400

    try:
        chunks = get_similar_chunks(user_query)
        response = ask_groq(user_query, chunks)
        return jsonify({"answer": response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
