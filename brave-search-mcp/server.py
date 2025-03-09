"""
Brave Search MCP Server

This module implements a Flask server that acts as an MCP server for Brave Search.
It provides endpoints for searching the web using the Brave Search API.
"""

import os
from flask import Flask, request, jsonify
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get API keys from environment variables
BRAVE_SEARCH_API_KEY = os.getenv("BRAVE_SEARCH_API_KEY")
if not BRAVE_SEARCH_API_KEY or BRAVE_SEARCH_API_KEY == "your_brave_search_api_key_here":
    print("⚠️ Warning: BRAVE_SEARCH_API_KEY not properly set in .env file")

BRAVE_SEARCH_ENDPOINT = "https://api.search.brave.com/res/v1/web/search"

# Create a Flask server
app = Flask(__name__)

# Add a basic route for testing
@app.route('/', methods=['GET'])
def hello():
    """Root endpoint for testing server availability."""
    return jsonify({"status": "MCP server is running"}), 200

@app.route('/search', methods=['POST'])
def search():
    """
    Search endpoint that forwards requests to the Brave Search API.
    
    Expected JSON payload:
    {
        "query": "search query",
        "count": 5  # optional, defaults to 5
    }
    """
    data = request.json
    query = data.get('query', '')
    count = data.get('count', 5)

    # Call the actual Brave Search API
    headers = {
        "Accept": "application/json",
        "X-Subscription-Token": BRAVE_SEARCH_API_KEY
    }
    params = {
        "q": query,
        "count": count
    }

    response = requests.get(BRAVE_SEARCH_ENDPOINT, headers=headers, params=params)

    if response.status_code == 200:
        # Process the response to match our expected format
        results = response.json()
        processed_results = {
            "results": [
                {
                    "title": item.get("title", ""),
                    "url": item.get("url", ""),
                    "description": item.get("description", "")
                }
                for item in results.get("web", {}).get("results", [])
            ]
        }
        return jsonify(processed_results)
    else:
        return jsonify({"error": f"Error: {response.status_code} - {response.text}"}), 500

def run_server(host='127.0.0.1', port=8080):
    """Run the Flask server."""
    app.run(host=host, port=port, debug=False, use_reloader=False)

if __name__ == "__main__":
    run_server()