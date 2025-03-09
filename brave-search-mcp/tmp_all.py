# Brave Search MCP Server and Client in Google Colab (without ngrok)
# This single script handles both server and client in the same environment

# --- PART 1: INSTALL DEPENDENCIES ---
#!pip install langchain langchain_openai autogen requests flask python-dotenv

# --- PART 2: BRAVE SEARCH MCP SERVER SETUP ---
import threading
import time
from flask import Flask, request, jsonify
import requests
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Create a simple Flask server to act as our MCP server
app = Flask(__name__)

# Your Brave Search API key
BRAVE_SEARCH_API_KEY = os.getenv("BRAVE_SEARCH_API_KEY")
if not BRAVE_SEARCH_API_KEY:
    print("ERROR: BRAVE_SEARCH_API_KEY environment variable is not set.")
    print("Please create a .env file based on .env.example and add your Brave Search API key.")
    print("You can get a Brave Search API key from: https://brave.com/search/api/")
BRAVE_SEARCH_ENDPOINT = "https://api.search.brave.com/res/v1/web/search"

# Add a basic route for testing
@app.route('/', methods=['GET'])
def hello():
    return jsonify({"status": "MCP server is running"}), 200

@app.route('/search', methods=['POST'])
def search():
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

# Function to run the Flask server in a separate thread
def run_flask_server():
    app.run(host='127.0.0.1', port=8080, debug=False, use_reloader=False)

# Start the server in a background thread
server_thread = threading.Thread(target=run_flask_server)
server_thread.daemon = True
server_thread.start()

# Give the server time to start
print("Starting MCP server...")
time.sleep(5)  # Increased wait time
print("MCP Server is now running at http://127.0.0.1:8080")

# --- PART 3: LANGCHAIN CLIENT IMPLEMENTATION ---
from langchain.tools import Tool
from langchain_openai import ChatOpenAI
from langchain.agents import AgentType, initialize_agent

def brave_search(query):
    """Use Brave Search to find information on the web via local MCP server."""
    url = "http://127.0.0.1:8080/search"
    headers = {
        "Content-Type": "application/json",
        "X-Subscription-Token": BRAVE_SEARCH_API_KEY
    }
    payload = {"query": query, "count": 5}
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        results = response.json()
        formatted_results = []
        for i, result in enumerate(results.get("results", [])):
            formatted_results.append(f"{i+1}. {result.get('title')}: {result.get('url')}\n{result.get('description')}\n")
        return "\n".join(formatted_results)
    else:
        return f"Error: {response.status_code} - {response.text}"

# --- PART 4: AUTOGEN CLIENT IMPLEMENTATION ---
import autogen

# Configure the LLM
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
config_list = [
    {
        "model": "gpt-4",
        "api_key": OPENAI_API_KEY  # Replace with your OpenAI API key
    }
]

# Define the function to query the local MCP server
def query_brave_search(query):
    """Query the local Brave Search MCP server."""
    url = "http://127.0.0.1:8080/search"
    headers = {
        "Content-Type": "application/json",
        "X-Subscription-Token": BRAVE_SEARCH_API_KEY
    }
    payload = {"query": query, "count": 5}
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()
    else:
        return f"Error: {response.status_code} - {response.text}"

# --- PART 5: DEMONSTRATION UI ---
from IPython.display import HTML, display
import ipywidgets as widgets

def run_langchain_demo(query):
    # Create a LangChain tool
    brave_tool = Tool(
        name="BraveSearch",
        description="Useful for searching the web about current events, data, or any information you need to answer questions.",
        func=brave_search
    )
    
    # Initialize the LLM
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    llm = ChatOpenAI(api_key=OPENAI_API_KEY, temperature=0)  # Replace with your OpenAI API key
    
    # Initialize the agent with the Brave Search tool
    agent = initialize_agent(
        [brave_tool],
        llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True
    )
    
    return agent.run(query)

def run_autogen_demo(query):
    # Create AutoGen agents
    assistant = autogen.AssistantAgent(
        name="assistant",
        llm_config={"config_list": config_list}
    )
    
    user_proxy = autogen.UserProxyAgent(
        name="user_proxy",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=10,
        code_execution_config={"work_dir": "coding"},
        function_map={"brave_search": query_brave_search}
    )
    
    # Start the conversation
    user_proxy.initiate_chat(
        assistant,
        message=f"Use the brave_search function to find information about: {query}, then summarize the findings."
    )

# Create demo UI
demo_type = widgets.RadioButtons(
    options=['LangChain', 'AutoGen'],
    description='Demo Type:',
    disabled=False
)

query_input = widgets.Text(
    value='What are the latest developments in quantum computing?',
    placeholder='Enter your search query',
    description='Query:',
    disabled=False
)

run_button = widgets.Button(
    description='Run Demo',
    disabled=False,
    button_style='success',
    tooltip='Click to run the selected demo with your query'
)

output = widgets.Output()

def on_button_click(b):
    with output:
        output.clear_output()
        print(f"Running {demo_type.value} demo with query: {query_input.value}")
        if demo_type.value == 'LangChain':
            result = run_langchain_demo(query_input.value)
            print(f"\nResult: {result}")
        else:
            run_autogen_demo(query_input.value)

run_button.on_click(on_button_click)

# Display the UI
display(demo_type, query_input, run_button, output)

# Test direct API calls to confirm server is working
print("\nTesting direct API calls to the MCP server...")

# First, test the root endpoint
try:
    root_response = requests.get("http://127.0.0.1:8080/")
    print(f"Root endpoint test - Status: {root_response.status_code}")
    if root_response.status_code == 200:
        print("Root endpoint is working!")
    else:
        print(f"Root endpoint error: {root_response.text}")
except Exception as e:
    print(f"Connection error to root endpoint: {str(e)}")

# Then, test the search endpoint
try:
    search_response = requests.post(
        "http://127.0.0.1:8080/search",
        headers={
            "Content-Type": "application/json",
            "X-Subscription-Token": BRAVE_SEARCH_API_KEY
        },
        json={"query": "test query", "count": 1}
    )
    print(f"Search endpoint test - Status: {search_response.status_code}")
    if search_response.status_code == 200:
        print("Search endpoint is working correctly!")
        print(f"Response preview: {str(search_response.json())[:200]}...")
    else:
        print(f"Search endpoint error: {search_response.text}")
except Exception as e:
    print(f"Connection error to search endpoint: {str(e)}")
