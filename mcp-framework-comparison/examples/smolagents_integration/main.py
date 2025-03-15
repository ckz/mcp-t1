"""
SmolaGents integration with MCP server.

This module demonstrates how to integrate SmolaGents with an MCP server.
"""

import json
import logging
import os
import sys
from typing import Any, Dict, List, Optional, Callable

# Note: This is a simulated implementation of SmolaGents for demonstration purposes
# In a real implementation, you would import from the actual smolagents package
class Tool:
    """Simulated SmolaGents Tool class."""
    
    def __init__(self, name: str, description: str, function: Callable):
        """
        Initialize a tool.
        
        Args:
            name: Tool name
            description: Tool description
            function: Tool function
        """
        self.name = name
        self.description = description
        self.function = function
    
    def __call__(self, *args, **kwargs):
        """Call the tool function."""
        return self.function(*args, **kwargs)


class Agent:
    """Simulated SmolaGents Agent class."""
    
    def __init__(self, llm: Any, tools: List[Tool]):
        """
        Initialize an agent.
        
        Args:
            llm: Language model
            tools: List of tools
        """
        self.llm = llm
        self.tools = tools
    
    def run(self, query: str) -> str:
        """
        Run the agent.
        
        Args:
            query: Query string
            
        Returns:
            Agent response
        """
        # This is a simplified implementation for demonstration
        # In a real implementation, the agent would use the LLM to decide which tools to use
        
        # For demonstration, we'll use a simple keyword matching approach
        response = f"Query: {query}\n\n"
        
        for tool in self.tools:
            if any(keyword in query.lower() for keyword in tool.name.lower().split("_")):
                result = tool(query)
                response += f"Using tool: {tool.name}\n"
                response += f"Result: {result}\n\n"
        
        return response


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
        elif tool_name == "document_processing_extract_entities":
            from mcp_server.tools import DocumentProcessingTool
            return DocumentProcessingTool.extract_entities(
                text=arguments.get("text")
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


def create_mcp_knowledge_tool(client: MCPClient) -> Tool:
    """
    Create a SmolaGents tool for accessing the MCP knowledge base.
    
    Args:
        client: MCP client
        
    Returns:
        SmolaGents tool
    """
    def knowledge_tool_fn(query: str) -> str:
        """
        Access the knowledge base.
        
        Args:
            query: Query string
            
        Returns:
            Knowledge base response as a string
        """
        # Parse the query to extract topic and subtopic
        parts = query.split(" about ")
        if len(parts) > 1:
            topic = parts[1].strip().lower()  # Convert to lowercase
            
            # Check if there's a subtopic
            topic_parts = topic.split(" specifically ")
            if len(topic_parts) > 1:
                topic = topic_parts[0].strip()
                subtopic = topic_parts[1].strip()
                result = client.call_tool("knowledge_base_get_info", {"topic": topic, "subtopic": subtopic})
            else:
                result = client.call_tool("knowledge_base_get_info", {"topic": topic})
        else:
            # Just search the knowledge base
            result = client.call_tool("knowledge_base_search", {"query": query})
        
        return json.dumps(result, indent=2)
    
    return Tool(
        name="mcp_knowledge",
        description="Access the knowledge base. Ask about a specific topic or search for information.",
        function=knowledge_tool_fn
    )


def create_mcp_data_tool(client: MCPClient) -> Tool:
    """
    Create a SmolaGents tool for accessing MCP data analysis.
    
    Args:
        client: MCP client
        
    Returns:
        SmolaGents tool
    """
    def data_tool_fn(query: str) -> str:
        """
        Analyze data.
        
        Args:
            query: Query string
            
        Returns:
            Data analysis response as a string
        """
        # Parse the query to extract column name
        if "statistics for" in query.lower():
            parts = query.lower().split("statistics for")
            if len(parts) > 1:
                column = parts[1].strip()
                result = client.call_tool("data_analysis_get_summary_statistics", {"column": column})
            else:
                result = client.call_tool("data_analysis_get_summary_statistics", {})
        elif "correlation between" in query.lower():
            parts = query.lower().split("correlation between")
            if len(parts) > 1:
                columns = parts[1].strip().split(" and ")
                if len(columns) > 1:
                    column1 = columns[0].strip()
                    column2 = columns[1].strip()
                    result = client.call_tool("data_analysis_get_correlation", {
                        "column1": column1,
                        "column2": column2
                    })
                else:
                    result = {"error": "Please specify two columns for correlation"}
            else:
                result = {"error": "Please specify two columns for correlation"}
        else:
            # Just get summary statistics for all columns
            result = client.call_tool("data_analysis_get_summary_statistics", {})
        
        return json.dumps(result, indent=2)
    
    return Tool(
        name="mcp_data_analysis",
        description="Analyze data. Get statistics for a specific column or all columns, or find correlation between columns.",
        function=data_tool_fn
    )


def create_mcp_document_tool(client: MCPClient) -> Tool:
    """
    Create a SmolaGents tool for accessing MCP document processing.
    
    Args:
        client: MCP client
        
    Returns:
        SmolaGents tool
    """
    def document_tool_fn(query: str) -> str:
        """
        Process documents.
        
        Args:
            query: Query string
            
        Returns:
            Document processing response as a string
        """
        # Parse the query to determine the operation
        query_lower = query.lower()
        
        if "summarize" in query_lower and "document" in query_lower:
            # Extract document ID
            for doc_id in ["mcp_overview", "llama_index_guide", "langchain_guide", "smolagents_guide", "autogen_guide"]:
                if doc_id in query_lower:
                    # Get the document
                    document = client.get_resource(f"mcp://documents/{doc_id}")
                    
                    # Summarize the content
                    if "content" in document:
                        result = client.call_tool("document_processing_summarize", {
                            "text": document["content"]
                        })
                        return json.dumps(result, indent=2)
            
            # If no specific document ID found, return an error
            return json.dumps({"error": "Please specify a valid document ID"}, indent=2)
        
        elif "extract entities" in query_lower and "document" in query_lower:
            # Extract document ID
            for doc_id in ["mcp_overview", "llama_index_guide", "langchain_guide", "smolagents_guide", "autogen_guide"]:
                if doc_id in query_lower:
                    # Get the document
                    document = client.get_resource(f"mcp://documents/{doc_id}")
                    
                    # Extract entities from the content
                    if "content" in document:
                        result = client.call_tool("document_processing_extract_entities", {
                            "text": document["content"]
                        })
                        return json.dumps(result, indent=2)
            
            # If no specific document ID found, return an error
            return json.dumps({"error": "Please specify a valid document ID"}, indent=2)
        
        elif "search" in query_lower and "document" in query_lower:
            # Extract search query
            parts = query_lower.split("search documents for")
            if len(parts) > 1:
                search_query = parts[1].strip()
                result = client.get_resource(f"mcp://documents/search/{search_query}")
                return json.dumps(result, indent=2)
            
            # If no search query found, return an error
            return json.dumps({"error": "Please specify a search query"}, indent=2)
        
        else:
            # Just list all documents
            result = client.get_resource("mcp://documents/list")
            return json.dumps(result, indent=2)
    
    return Tool(
        name="mcp_document",
        description="Process documents. Summarize a document, extract entities, search documents, or list all documents.",
        function=document_tool_fn
    )


def create_mcp_web_search_tool(client: MCPClient) -> Tool:
    """
    Create a SmolaGents tool for accessing MCP web search.
    
    Args:
        client: MCP client
        
    Returns:
        SmolaGents tool
    """
    def web_search_tool_fn(query: str) -> str:
        """
        Search the web.
        
        Args:
            query: Query string
            
        Returns:
            Web search response as a string
        """
        # Extract search query
        parts = query.lower().split("search for")
        if len(parts) > 1:
            search_query = parts[1].strip()
        else:
            search_query = query
        
        # Get web search results
        result = client.get_resource(f"mcp://web-search/{search_query}")
        return json.dumps(result, indent=2)
    
    return Tool(
        name="mcp_web_search",
        description="Search the web. Input should be a search query.",
        function=web_search_tool_fn
    )


# Simple mock LLM for demonstration purposes
class MockLLM:
    """Mock LLM for demonstration purposes."""
    
    def generate(self, prompt: str) -> str:
        """
        Generate a response for a prompt.
        
        Args:
            prompt: Prompt string
            
        Returns:
            Generated response
        """
        if "knowledge base" in prompt.lower():
            return "The knowledge base contains information about AI frameworks and MCP."
        elif "data analysis" in prompt.lower():
            return "The data analysis shows temperature, humidity, and other weather metrics."
        elif "document" in prompt.lower():
            return "The documents include guides for integrating different frameworks with MCP."
        elif "web search" in prompt.lower():
            return "The web search found information about LlamaIndex, LangChain, SmolaGents, and AutoGen."
        else:
            return "I can help you access knowledge, analyze data, process documents, and search the web using MCP."


def run_smolagents_example():
    """Run the SmolaGents integration example."""
    # Initialize MCP client
    client = MCPClient()
    
    # Initialize mock LLM
    llm = MockLLM()
    
    print("\n" + "="*50)
    print("SmolaGents Integration with MCP Server")
    print("="*50)
    
    # Example 1: Using MCP tools with SmolaGents
    print("\nExample 1: Using MCP tools with SmolaGents")
    print("-"*40)
    
    # Create tools
    knowledge_tool = create_mcp_knowledge_tool(client)
    data_tool = create_mcp_data_tool(client)
    document_tool = create_mcp_document_tool(client)
    web_search_tool = create_mcp_web_search_tool(client)
    
    # Create agent
    agent = Agent(
        llm=llm,
        tools=[knowledge_tool, data_tool, document_tool, web_search_tool]
    )
    
    # Run agent
    queries = [
        "Tell me about LlamaIndex",
        "Get statistics for temperature",
        "Summarize document llama_index_guide",
        "Search for LangChain"
    ]
    
    for query in queries:
        print(f"\nQuery: {query}")
        response = agent.run(query)
        print(f"Response:\n{response}")
    
    # Example 2: Chaining MCP tools in SmolaGents
    print("\nExample 2: Chaining MCP tools in SmolaGents")
    print("-"*40)
    
    def chain_tools_fn(query: str) -> str:
        """
        Chain multiple tools together.
        
        Args:
            query: Query string
            
        Returns:
            Combined response as a string
        """
        # First, search the knowledge base
        knowledge_result = json.loads(knowledge_tool(query))
        
        # Then, search for documents related to the query
        # Convert query to lowercase for better matching
        search_query = query.lower()
        document_result = json.loads(document_tool(f"search documents for {search_query}"))
        
        # Combine the results
        combined_result = {
            "knowledge": knowledge_result,
            "documents": document_result
        }
        
        return json.dumps(combined_result, indent=2)
    
    chain_tool = Tool(
        name="mcp_chain",
        description="Chain multiple tools together. Search the knowledge base and documents.",
        function=chain_tools_fn
    )
    
    # Create agent with chain tool
    chain_agent = Agent(
        llm=llm,
        tools=[chain_tool]
    )
    
    # Run agent
    query = "Tell me about MCP"
    print(f"\nQuery: {query}")
    response = chain_agent.run(query)
    print(f"Response:\n{response}")


if __name__ == "__main__":
    run_smolagents_example()