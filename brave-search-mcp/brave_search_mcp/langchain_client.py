"""
LangChain Client for Brave Search MCP

This module implements a LangChain client that uses the Brave Search MCP server
to search the web and answer questions.
"""

import os
import requests
from langchain.tools import Tool
from langchain_openai import ChatOpenAI
from langchain.agents import AgentType, initialize_agent
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def brave_search(query):
    """
    Use Brave Search to find information on the web via local MCP server.
    
    Args:
        query (str): The search query
        
    Returns:
        str: Formatted search results
    """
    url = "http://127.0.0.1:8080/search"
    headers = {"Content-Type": "application/json"}
    payload = {"query": query, "count": 5}

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        results = response.json()
        formatted_results = []
        for i, result in enumerate(results.get("results", [])):
            formatted_results.append(
                f"{i+1}. {result.get('title')}: {result.get('url')}\n"
                f"{result.get('description')}\n"
            )
        return "\n".join(formatted_results)
    else:
        return f"Error: {response.status_code} - {response.text}"

def create_langchain_agent():
    """
    Create a LangChain agent with the Brave Search tool.
    
    Returns:
        Agent: A LangChain agent
    """
    # Create a LangChain tool
    brave_tool = Tool(
        name="BraveSearch",
        description="Useful for searching the web about current events, data, or any information you need to answer questions.",
        func=brave_search
    )

    # Initialize the LLM with API key from .env
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key or openai_api_key == "your_openai_api_key_here":
        print("⚠️ Warning: OPENAI_API_KEY not properly set in .env file")

    llm = ChatOpenAI(api_key=openai_api_key, temperature=0)

    # Initialize the agent with the Brave Search tool
    agent = initialize_agent(
        [brave_tool],
        llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True
    )
    
    return agent

def run_langchain_demo(query):
    """
    Run a demo of the LangChain agent with the given query.
    
    Args:
        query (str): The query to run
        
    Returns:
        str: The agent's response
    """
    agent = create_langchain_agent()
    return agent.run(query)

if __name__ == "__main__":
    # Test the LangChain client
    test_query = "What are the latest developments in quantum computing?"
    print(f"Running LangChain demo with query: {test_query}")
    result = run_langchain_demo(test_query)
    print(f"\nResult: {result}")