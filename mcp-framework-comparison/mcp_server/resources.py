"""
Resources implementation for the MCP server.

This module defines the resources that the MCP server provides to clients.
Each resource represents a specific data source that can be accessed by clients.
"""

import json
import logging
from typing import Any, Dict, List, Optional
import requests
from datetime import datetime

logger = logging.getLogger(__name__)

# Mock web search results for demonstration purposes
WEB_SEARCH_RESULTS = {
    "llama index": [
        {
            "title": "LlamaIndex",
            "url": "https://www.llamaindex.ai/",
            "snippet": "LlamaIndex is a data framework for LLM applications to ingest, structure, and access private or domain-specific data."
        },
        {
            "title": "GitHub - jerryjliu/llama_index: LlamaIndex (GPT Index) is a data framework...",
            "url": "https://github.com/jerryjliu/llama_index",
            "snippet": "LlamaIndex (GPT Index) is a data framework for your LLM applications. It provides a central interface to connect your LLMs with external data."
        },
        {
            "title": "LlamaIndex Documentation",
            "url": "https://docs.llamaindex.ai/",
            "snippet": "LlamaIndex is a simple, flexible data framework for connecting custom data sources to large language models."
        }
    ],
    "langchain": [
        {
            "title": "LangChain",
            "url": "https://www.langchain.com/",
            "snippet": "LangChain is a framework for developing applications powered by language models."
        },
        {
            "title": "GitHub - langchain-ai/langchain: Building applications with LLMs...",
            "url": "https://github.com/langchain-ai/langchain",
            "snippet": "Building applications with LLMs through composability. LangChain is a framework for developing applications powered by language models."
        },
        {
            "title": "LangChain Documentation",
            "url": "https://python.langchain.com/docs/get_started/introduction",
            "snippet": "LangChain is a framework for developing applications powered by language models. It enables applications that are context-aware and reasoning-based."
        }
    ],
    "smolagents": [
        {
            "title": "GitHub - huggingface/smolagents: Lightweight agent framework",
            "url": "https://github.com/huggingface/smolagents",
            "snippet": "SmolaGents is a lightweight agent framework for building AI agents from Hugging Face."
        },
        {
            "title": "Hugging Face's blog - Introducing SmolaGents",
            "url": "https://huggingface.co/blog/smolagents",
            "snippet": "SmolaGents is a lightweight agent framework that enables LLMs to use tools effectively."
        }
    ],
    "autogen": [
        {
            "title": "GitHub - microsoft/autogen: Enable Next-Gen LLM Applications",
            "url": "https://github.com/microsoft/autogen",
            "snippet": "AutoGen is a framework that enables the development of LLM applications using multiple agents that can converse with each other to solve tasks."
        },
        {
            "title": "AutoGen Documentation",
            "url": "https://microsoft.github.io/autogen/",
            "snippet": "AutoGen offers conversable agents powered by LLMs, tools, human inputs, and other agents."
        },
        {
            "title": "Microsoft Research - AutoGen",
            "url": "https://www.microsoft.com/en-us/research/project/autogen/",
            "snippet": "AutoGen is a framework that enables development of LLM applications using multiple agents."
        }
    ],
    "mcp": [
        {
            "title": "GitHub - model-context-protocol/model-context-protocol",
            "url": "https://github.com/model-context-protocol/model-context-protocol",
            "snippet": "Model Context Protocol (MCP) is a protocol for LLMs to access external tools and resources."
        },
        {
            "title": "MCP Specification",
            "url": "https://model-context-protocol.github.io/model-context-protocol/",
            "snippet": "The Model Context Protocol (MCP) is a protocol for LLMs to access external tools and resources."
        }
    ]
}

# Mock document collection for demonstration purposes
DOCUMENTS = {
    "mcp_overview": {
        "title": "Model Context Protocol Overview",
        "content": """
        # Model Context Protocol (MCP)
        
        The Model Context Protocol (MCP) is a protocol for LLMs to access external tools and resources.
        
        ## Key Components
        
        1. **Server**: Implements the protocol and provides tools and resources
        2. **Client**: Connects to the server and uses the tools and resources
        3. **Transport**: Handles communication between the client and server
        4. **Tools**: Executable functions that can be invoked by clients
        5. **Resources**: Data sources that can be accessed by clients
        
        ## Benefits
        
        - Standardized interface for LLMs to access external capabilities
        - Extensible architecture for adding new tools and resources
        - Language-agnostic protocol that can be implemented in any programming language
        - Secure access to external systems through controlled interfaces
        """,
        "metadata": {
            "author": "MCP Team",
            "date": "2023-01-15",
            "tags": ["mcp", "protocol", "llm", "tools", "resources"]
        }
    },
    "llama_index_guide": {
        "title": "LlamaIndex Integration Guide",
        "content": """
        # LlamaIndex Integration Guide
        
        This guide explains how to integrate LlamaIndex with the Model Context Protocol (MCP).
        
        ## Prerequisites
        
        - Python 3.9+
        - LlamaIndex 0.8.0+
        - MCP client library
        
        ## Integration Steps
        
        1. Install the required packages:
           ```
           pip install llama-index mcp-client
           ```
        
        2. Initialize the MCP client:
           ```python
           from mcp_client import MCPClient
           
           client = MCPClient(server_url="http://localhost:8000")
           ```
        
        3. Create a custom retriever that uses MCP:
           ```python
           from llama_index.core.retrievers import BaseRetriever
           
           class MCPRetriever(BaseRetriever):
               def __init__(self, client, tool_name):
                   self.client = client
                   self.tool_name = tool_name
                   
               def retrieve(self, query):
                   # Use MCP tool to retrieve information
                   result = self.client.call_tool(self.tool_name, {"query": query})
                   
                   # Convert to LlamaIndex nodes
                   # ...
           ```
        
        4. Use the retriever in your LlamaIndex application:
           ```python
           retriever = MCPRetriever(client, "knowledge_base_tool")
           query_engine = RetrieverQueryEngine(retriever)
           response = query_engine.query("Tell me about MCP")
           ```
        """,
        "metadata": {
            "author": "LlamaIndex Team",
            "date": "2023-03-20",
            "tags": ["llama_index", "integration", "mcp", "retriever"]
        }
    },
    "langchain_guide": {
        "title": "LangChain Integration Guide",
        "content": """
        # LangChain Integration Guide
        
        This guide explains how to integrate LangChain with the Model Context Protocol (MCP).
        
        ## Prerequisites
        
        - Python 3.9+
        - LangChain 0.0.300+
        - MCP client library
        
        ## Integration Steps
        
        1. Install the required packages:
           ```
           pip install langchain mcp-client
           ```
        
        2. Initialize the MCP client:
           ```python
           from mcp_client import MCPClient
           
           client = MCPClient(server_url="http://localhost:8000")
           ```
        
        3. Create a custom tool that uses MCP:
           ```python
           from langchain.tools import BaseTool
           
           class MCPTool(BaseTool):
               name = "mcp_knowledge_base"
               description = "Access knowledge base through MCP"
               
               def __init__(self, client, tool_name):
                   self.client = client
                   self.tool_name = tool_name
                   super().__init__()
                   
               def _run(self, query):
                   return self.client.call_tool(self.tool_name, {"query": query})
           ```
        
        4. Use the tool in your LangChain application:
           ```python
           from langchain.agents import initialize_agent, AgentType
           
           tools = [MCPTool(client, "knowledge_base_tool")]
           agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION)
           agent.run("Tell me about MCP")
           ```
        """,
        "metadata": {
            "author": "LangChain Team",
            "date": "2023-04-10",
            "tags": ["langchain", "integration", "mcp", "tool"]
        }
    },
    "smolagents_guide": {
        "title": "SmolaGents Integration Guide",
        "content": """
        # SmolaGents Integration Guide
        
        This guide explains how to integrate SmolaGents with the Model Context Protocol (MCP).
        
        ## Prerequisites
        
        - Python 3.9+
        - SmolaGents 0.0.1+
        - MCP client library
        
        ## Integration Steps
        
        1. Install the required packages:
           ```
           pip install smolagents mcp-client
           ```
        
        2. Initialize the MCP client:
           ```python
           from mcp_client import MCPClient
           
           client = MCPClient(server_url="http://localhost:8000")
           ```
        
        3. Create a custom tool that uses MCP:
           ```python
           from smolagents.tools import Tool
           
           def mcp_tool_fn(query):
               return client.call_tool("knowledge_base_tool", {"query": query})
           
           mcp_tool = Tool(
               name="mcp_knowledge_base",
               description="Access knowledge base through MCP",
               function=mcp_tool_fn
           )
           ```
        
        4. Use the tool in your SmolaGents application:
           ```python
           from smolagents import Agent
           
           agent = Agent(
               llm=llm,
               tools=[mcp_tool]
           )
           
           agent.run("Tell me about MCP")
           ```
        """,
        "metadata": {
            "author": "Hugging Face Team",
            "date": "2023-05-15",
            "tags": ["smolagents", "integration", "mcp", "tool"]
        }
    },
    "autogen_guide": {
        "title": "AutoGen Integration Guide",
        "content": "# AutoGen Integration Guide\n\nThis guide explains how to integrate AutoGen with the Model Context Protocol (MCP).\n\n## Prerequisites\n\n- Python 3.9+\n- AutoGen 0.2.0+\n- MCP client library\n\n## Integration Steps\n\n1. Install the required packages:\n   ```\n   pip install pyautogen mcp-client\n   ```\n\n2. Initialize the MCP client:\n   ```python\n   from mcp_client import MCPClient\n   \n   client = MCPClient(server_url=\"http://localhost:8000\")\n   ```\n\n3. Create a custom function that uses MCP:\n   ```python\n   def mcp_knowledge_base(query):\n       \"\"\"\n       Access knowledge base through MCP.\n       \n       Args:\n           query: The query to search for\n           \n       Returns:\n           The search results\n       \"\"\"\n       return client.call_tool(\"knowledge_base_tool\", {\"query\": query})\n   ```\n\n4. Use the function in your AutoGen application:\n   ```python\n   import autogen\n   \n   # Register the function with AutoGen\n   autogen.register_function(mcp_knowledge_base)\n   \n   # Create agents\n   assistant = autogen.AssistantAgent(\n       name=\"assistant\",\n       llm_config={\"config\": \"...\"}\n   )\n   \n   user_proxy = autogen.UserProxyAgent(\n       name=\"user_proxy\",\n       human_input_mode=\"NEVER\",\n       function_map={\"mcp_knowledge_base\": mcp_knowledge_base}\n   )\n   \n   # Start the conversation\n   user_proxy.initiate_chat(\n       assistant,\n       message=\"Tell me about MCP\"\n   )\n   ```",
        "metadata": {
            "author": "Microsoft Research",
            "date": "2023-06-20",
            "tags": ["autogen", "integration", "mcp", "function"]
        }
    }
}


class WebSearchResource:
    """Resource for accessing web search results."""
    
    @staticmethod
    def search(query: str, num_results: int = 3) -> Dict[str, Any]:
        """
        Search the web for a query.
        
        Args:
            query: The search query
            num_results: Number of results to return
            
        Returns:
            Dictionary containing search results
        """
        # This is a mock implementation for demonstration purposes
        query_lower = query.lower()
        
        # Check if we have mock results for this query
        for key, results in WEB_SEARCH_RESULTS.items():
            if key in query_lower:
                return {
                    "query": query,
                    "results": results[:num_results],
                    "timestamp": datetime.now().isoformat()
                }
        
        # If no specific results, return generic results
        return {
            "query": query,
            "results": [
                {
                    "title": "Model Context Protocol (MCP)",
                    "url": "https://github.com/model-context-protocol/model-context-protocol",
                    "snippet": "MCP is a protocol for LLMs to access external tools and resources."
                },
                {
                    "title": "AI Framework Comparison",
                    "url": "https://example.com/ai-framework-comparison",
                    "snippet": "A comparison of popular AI frameworks including LlamaIndex, LangChain, SmolaGents, and AutoGen."
                }
            ],
            "timestamp": datetime.now().isoformat()
        }


class DocumentResource:
    """Resource for accessing documents."""
    
    @staticmethod
    def get_document(document_id: str) -> Dict[str, Any]:
        """
        Get a document by ID.
        
        Args:
            document_id: The document ID
            
        Returns:
            Dictionary containing the document
        """
        if document_id not in DOCUMENTS:
            return {"error": f"Document '{document_id}' not found"}
        
        return DOCUMENTS[document_id]
    
    @staticmethod
    def list_documents() -> Dict[str, Any]:
        """
        List all available documents.
        
        Returns:
            Dictionary containing document metadata
        """
        documents = []
        for doc_id, doc in DOCUMENTS.items():
            documents.append({
                "id": doc_id,
                "title": doc["title"],
                "content": doc["content"],
                "metadata": doc["metadata"]
            })
        return {
            "documents": documents
        }
    
    @staticmethod
    def search_documents(query: str) -> Dict[str, Any]:
        """
        Search documents for a query.
        
        Args:
            query: The search query
            
        Returns:
            Dictionary containing search results
        """
        query_lower = query.lower()
        results = []
        
        for doc_id, doc in DOCUMENTS.items():
            # Check title
            if query_lower in doc["title"].lower():
                results.append({
                    "id": doc_id,
                    "title": doc["title"],
                    "metadata": doc["metadata"],
                    "match": "title"
                })
                continue
                
            # Check content
            if query_lower in doc["content"].lower():
                results.append({
                    "id": doc_id,
                    "title": doc["title"],
                    "metadata": doc["metadata"],
                    "match": "content"
                })
                continue
                
            # Check metadata
            for key, value in doc["metadata"].items():
                if isinstance(value, str) and query_lower in value.lower():
                    results.append({
                        "id": doc_id,
                        "title": doc["title"],
                        "metadata": doc["metadata"],
                        "match": f"metadata.{key}"
                    })
                    break
                elif isinstance(value, list):
                    for item in value:
                        if isinstance(item, str) and query_lower in item.lower():
                            results.append({
                                "id": doc_id,
                                "title": doc["title"],
                                "metadata": doc["metadata"],
                                "match": f"metadata.{key}"
                            })
                            break
        
        return {
            "query": query,
            "results": results
        }