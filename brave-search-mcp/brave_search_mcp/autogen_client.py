"""
AutoGen Client for Brave Search MCP

This module implements an AutoGen client that uses the Brave Search MCP server
to search the web and answer questions.
"""

import os
import requests
import autogen
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def query_brave_search(query):
    """
    Query the local Brave Search MCP server.
    
    Args:
        query (str): The search query
        
    Returns:
        dict: The search results
    """
    url = "http://127.0.0.1:8080/search"
    headers = {"Content-Type": "application/json"}
    payload = {"query": query, "count": 5}

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()
    else:
        return f"Error: {response.status_code} - {response.text}"

def create_autogen_agents():
    """
    Create AutoGen agents with the Brave Search function.
    
    Returns:
        tuple: A tuple of (assistant, user_proxy) agents
    """
    # Initialize the LLM with API key from .env
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key or openai_api_key == "your_openai_api_key_here":
        print("⚠️ Warning: OPENAI_API_KEY not properly set in .env file")

    config_list = [
        {
            "model": "gpt-4",
            "api_key": openai_api_key
        }
    ]

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
    
    return assistant, user_proxy

def run_autogen_demo(query):
    """
    Run a demo of the AutoGen agents with the given query.
    
    Args:
        query (str): The query to run
    """
    assistant, user_proxy = create_autogen_agents()
    
    # Start the conversation
    user_proxy.initiate_chat(
        assistant,
        message=f"Use the brave_search function to find information about: {query}, then summarize the findings."
    )

if __name__ == "__main__":
    # Test the AutoGen client
    test_query = "What are the latest developments in quantum computing?"
    print(f"Running AutoGen demo with query: {test_query}")
    run_autogen_demo(test_query)