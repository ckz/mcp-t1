#!/usr/bin/env python3
"""
Web Demo for Brave Search MCP

This script creates a simple web interface for the Brave Search MCP demo.
"""

import os
import sys
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Ensure the templates directory exists
os.makedirs(os.path.join(os.path.dirname(__file__), 'templates'), exist_ok=True)

# Create a simple HTML template
with open(os.path.join(os.path.dirname(__file__), 'templates', 'index.html'), 'w') as f:
    f.write("""
<!DOCTYPE html>
<html>
<head>
    <title>Brave Search MCP Demo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 5px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
        }
        input[type="text"] {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #45a049;
        }
        .result {
            margin-top: 20px;
            white-space: pre-wrap;
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>Brave Search MCP Demo</h1>
    <div class="container">
        <div class="form-group">
            <label for="demo-type">Demo Type:</label>
            <select id="demo-type" name="demo-type">
                <option value="langchain">LangChain</option>
                <option value="autogen">AutoGen</option>
            </select>
        </div>
        <div class="form-group">
            <label for="query">Query:</label>
            <input type="text" id="query" name="query" value="What are the latest developments in quantum computing?">
        </div>
        <button id="run-demo">Run Demo</button>
        <div id="result" class="result" style="display: none;"></div>
    </div>

    <script>
        document.getElementById('run-demo').addEventListener('click', function() {
            const demoType = document.getElementById('demo-type').value;
            const query = document.getElementById('query').value;
            const resultDiv = document.getElementById('result');
            
            resultDiv.textContent = 'Running query, please wait...';
            resultDiv.style.display = 'block';
            
            fetch('/run-demo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    demoType: demoType,
                    query: query
                }),
            })
            .then(response => response.json())
            .then(data => {
                resultDiv.textContent = data.result;
            })
            .catch((error) => {
                resultDiv.textContent = 'Error: ' + error;
            });
        });
    </script>
</body>
</html>
    """)

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')

@app.route('/run-demo', methods=['POST'])
def run_demo():
    """Run the selected demo with the provided query."""
    data = request.json
    demo_type = data.get('demoType')
    query = data.get('query')
    
    result = "Processing..."
    
    try:
        if demo_type == 'langchain':
            # Import and run the LangChain demo
            from brave_search_mcp.langchain_client import run_langchain_demo
            result = run_langchain_demo(query)
        else:
            # Import and run the AutoGen demo
            from brave_search_mcp.autogen_client import run_autogen_demo
            result = "AutoGen demo started. Check the terminal for output."
            # AutoGen demo prints to stdout, so we can't capture it easily
            run_autogen_demo(query)
    except Exception as e:
        result = f"Error: {str(e)}"
    
    return jsonify({"result": result})

if __name__ == "__main__":
    print("Starting Brave Search MCP Web Demo...")
    print("Open your browser at http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)