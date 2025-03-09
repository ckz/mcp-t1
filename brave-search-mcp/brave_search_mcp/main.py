"""
Main script for Brave Search MCP Server and Client

This script sets up and runs the Brave Search MCP server and provides
functionality to test the server and run demos.
"""

import os
import threading
import time
import requests
from dotenv import load_dotenv
from .server import run_server
from .langchain_client import run_langchain_demo
from .autogen_client import run_autogen_demo

# Load environment variables from .env file
load_dotenv()

# Create .env file if it doesn't exist
def create_env_file_if_not_exists():
    """Create a .env file if it doesn't exist."""
    if not os.path.exists('.env'):
        print("Creating .env file...")
        with open('.env', 'w') as f:
            f.write("# API Keys for MCP Server and Client\n")
            f.write("BRAVE_SEARCH_API_KEY=your_brave_search_api_key_here\n")
            f.write("OPENAI_API_KEY=your_openai_api_key_here\n")
        print(".env file created. Please edit it to add your API keys, then run this script again.")

def start_server():
    """Start the MCP server in a background thread."""
    # Start the server in a background thread
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()

    # Give the server time to start
    print("Starting MCP server...")
    time.sleep(5)  # Wait time
    print("MCP Server is now running at http://127.0.0.1:8080")
    
    return server_thread

def test_server():
    """Test the MCP server by making direct API calls."""
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
            headers={"Content-Type": "application/json"},
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

def main():
    """Main function to run the application."""
    # Create .env file if it doesn't exist
    create_env_file_if_not_exists()
    
    # Start the server
    server_thread = start_server()
    
    # Test the server
    test_server()
    
    # Provide instructions for running demos
    print("\nServer is running. You can now run demos using:")
    print("1. For LangChain demo: python -c 'from brave_search_mcp.langchain_client import run_langchain_demo; run_langchain_demo(\"your query here\")'")
    print("2. For AutoGen demo: python -c 'from brave_search_mcp.autogen_client import run_autogen_demo; run_autogen_demo(\"your query here\")'")
    print("3. For interactive UI in Jupyter/Colab: from brave_search_mcp.demo_ui import create_demo_ui; create_demo_ui()")
    
    # Keep the main thread running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down...")

if __name__ == "__main__":
    main()