"""
LangChain integration with MCP server.

This module demonstrates how to integrate LangChain with an MCP server.
"""

import json
import logging
import os
import sys
from typing import Any, Dict, List, Optional, Type

from langchain.tools import BaseTool
from langchain.agents import AgentType, initialize_agent
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain_core.language_models import LLM
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.outputs import LLMResult

# Add parent directory to path to import mcp_client
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class MCPClient:
    """Simple MCP client for demonstration purposes."""
    
    def __init__(self, server_url: str = "http://localhost:8000"):
        """Initialize the MCP client."""
        self.server_url = server_url
    
    def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Call an MCP tool.
        
        Args:
            tool_name: Name of the tool to call
            arguments: Arguments to pass to the tool
            
        Returns:
            Tool response
        """
        # In a real implementation, this would use the MCP protocol
        # For demonstration, we'll simulate the response
        
        logger.info(f"Calling MCP tool: {tool_name} with arguments: {arguments}")
        
        # Simulate calling the MCP server
        if tool_name == "knowledge_base_get_info":
            from mcp_server.tools import KnowledgeBaseTool
            return KnowledgeBaseTool.get_info(
                topic=arguments.get("topic"),
                subtopic=arguments.get("subtopic")
            )
        elif tool_name == "knowledge_base_search":
            from mcp_server.tools import KnowledgeBaseTool
            return KnowledgeBaseTool.search(
                query=arguments.get("query")
            )
        elif tool_name == "data_analysis_get_summary_statistics":
            from mcp_server.tools import DataAnalysisTool
            return DataAnalysisTool.get_summary_statistics(
                column=arguments.get("column")
            )
        elif tool_name == "document_processing_summarize":
            from mcp_server.tools import DocumentProcessingTool
            return DocumentProcessingTool.summarize(
                text=arguments.get("text"),
                max_length=arguments.get("max_length", 100)
            )
        else:
            raise ValueError(f"Unknown tool: {tool_name}")
    
    def get_resource(self, uri: str) -> Dict[str, Any]:
        """
        Get an MCP resource.
        
        Args:
            uri: URI of the resource to get
            
        Returns:
            Resource content
        """
        # In a real implementation, this would use the MCP protocol
        # For demonstration, we'll simulate the response
        
        logger.info(f"Getting MCP resource: {uri}")
        
        # Simulate getting the resource
        if uri.startswith("mcp://documents/"):
            from mcp_server.resources import DocumentResource
            document_id = uri[len("mcp://documents/"):]
            return DocumentResource.get_document(document_id)
        elif uri.startswith("mcp://web-search/"):
            from mcp_server.resources import WebSearchResource
            query = uri[len("mcp://web-search/"):]
            return WebSearchResource.search(query)
        else:
            raise ValueError(f"Unknown resource URI: {uri}")


class MCPKnowledgeBaseTool(BaseTool):
    """LangChain tool that uses MCP knowledge base."""
    
    name: str = "mcp_knowledge_base"
    description: str = "Useful for retrieving information from the knowledge base. Input should be a query string."
    client: MCPClient = None
    
    def __init__(self, client: MCPClient):
        """
        Initialize the MCP knowledge base tool.
        
        Args:
            client: MCP client
        """
        super().__init__(client=client)
    
    def _run(self, query: str) -> str:
        """
        Run the tool.
        
        Args:
            query: Query string
            
        Returns:
            Tool response as a string
        """
        # Call MCP tool
        result = self.client.call_tool("knowledge_base_search", {"query": query})
        
        # Format the result as a string
        return json.dumps(result, indent=2)


class MCPDataAnalysisTool(BaseTool):
    """LangChain tool that uses MCP data analysis."""
    
    name: str = "mcp_data_analysis"
    description: str = "Useful for analyzing data. Input should be a column name or 'all' for all columns."
    client: MCPClient = None
    
    def __init__(self, client: MCPClient):
        """
        Initialize the MCP data analysis tool.
        
        Args:
            client: MCP client
        """
        super().__init__(client=client)
    
    def _run(self, column: str) -> str:
        """
        Run the tool.
        
        Args:
            column: Column name or 'all'
            
        Returns:
            Tool response as a string
        """
        # Call MCP tool
        if column.lower() == "all":
            result = self.client.call_tool("data_analysis_get_summary_statistics", {})
        else:
            result = self.client.call_tool("data_analysis_get_summary_statistics", {"column": column})
        
        # Format the result as a string
        return json.dumps(result, indent=2)


class MCPDocumentTool(BaseTool):
    """LangChain tool that uses MCP document processing."""
    
    name: str = "mcp_document"
    description: str = "Useful for processing documents. Input should be a document ID or a search query prefixed with 'search:'."
    client: MCPClient = None
    
    def __init__(self, client: MCPClient):
        """
        Initialize the MCP document tool.
        
        Args:
            client: MCP client
        """
        super().__init__(client=client)
    
    def _run(self, input_str: str) -> str:
        """
        Run the tool.
        
        Args:
            input_str: Document ID or search query
            
        Returns:
            Tool response as a string
        """
        # Check if this is a search query
        if input_str.lower().startswith("search:"):
            query = input_str[len("search:"):].strip()
            uri = f"mcp://documents/search/{query}"
            result = self.client.get_resource(uri)
        else:
            # Assume it's a document ID
            uri = f"mcp://documents/{input_str}"
            result = self.client.get_resource(uri)
            
            # If it's a document with content, summarize it
            if "content" in result and isinstance(result["content"], str):
                summary = self.client.call_tool(
                    "document_processing_summarize",
                    {"text": result["content"]}
                )
                result["summary"] = summary
        
        # Format the result as a string
        return json.dumps(result, indent=2)


class MCPWebSearchTool(BaseTool):
    """LangChain tool that uses MCP web search."""
    
    name: str = "mcp_web_search"
    description: str = "Useful for searching the web. Input should be a search query."
    client: MCPClient = None
    
    def __init__(self, client: MCPClient):
        """
        Initialize the MCP web search tool.
        
        Args:
            client: MCP client
        """
        super().__init__(client=client)
    
    def _run(self, query: str) -> str:
        """
        Run the tool.
        
        Args:
            query: Search query
            
        Returns:
            Tool response as a string
        """
        # Get web search results
        uri = f"mcp://web-search/{query}"
        result = self.client.get_resource(uri)
        
        # Format the result as a string
        return json.dumps(result, indent=2)


def run_mcp_examples():
    """Run direct MCP integration examples."""
    # Initialize MCP client
    client = MCPClient()
    
    print("\n" + "="*50)
    print("MCP Knowledge Base Examples")
    print("="*50)
    
    # Example 1: Get information about LlamaIndex
    print("\nExample 1: Information about LlamaIndex")
    print("-"*40)
    result = client.call_tool("knowledge_base_get_info", {"topic": "ai_frameworks", "subtopic": "llama_index"})
    print(json.dumps(result, indent=2))
    
    # Example 2: Compare frameworks
    print("\nExample 2: Framework Comparison")
    print("-"*40)
    frameworks = client.call_tool("knowledge_base_get_info", {"topic": "ai_frameworks"})
    print("Key features comparison:")
    for name, info in frameworks.items():
        print(f"\n{name}:")
        print(f"Description: {info['description']}")
        print(f"Key features: {', '.join(info['key_features'])}")
    
    # Example 3: Search functionality
    print("\nExample 3: Search for specific capabilities")
    print("-"*40)
    search_terms = ["agents", "RAG", "tool"]
    for term in search_terms:
        print(f"\nSearching for '{term}':")
        results = client.call_tool("knowledge_base_search", {"query": term})
        print(json.dumps(results, indent=2))


if __name__ == "__main__":
    run_mcp_examples()