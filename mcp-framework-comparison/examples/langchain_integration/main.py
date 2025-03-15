"""
LangChain integration with MCP server.

This module demonstrates how to integrate LangChain with an MCP server.
"""

import json
import logging
import os
import sys
from typing import Any, Dict, List, Optional, Type

from langchain.agents import AgentType, initialize_agent
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.schema import BaseMemory
from langchain_core.language_models import LLM
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.outputs import LLMResult
from langchain_core.tools import Tool, BaseTool

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


def create_mcp_knowledge_tool(client: MCPClient) -> Tool:
    """Create a LangChain tool for accessing MCP knowledge base."""
    
    def knowledge_tool_fn(query: str) -> str:
        """Access the knowledge base."""
        query_lower = query.lower()
        
        # Check for framework-specific queries
        for framework in ["llamaindex", "llama index", "langchain", "smolagents", "autogen"]:
            if framework.replace(" ", "") in query_lower.replace(" ", ""):
                framework_id = framework.replace(" ", "_")
                result = client.call_tool(
                    "knowledge_base_get_info",
                    {"topic": "ai_frameworks", "subtopic": framework_id}
                )
                if framework_id in result:
                    return json.dumps(result[framework_id], indent=2)
        
        # Check for MCP-specific queries
        if "mcp" in query_lower:
            result = client.call_tool("knowledge_base_get_info", {"topic": "mcp"})
            return json.dumps(result, indent=2)
        
        # Fall back to general search
        result = client.call_tool("knowledge_base_search", {"query": query})
        return json.dumps(result, indent=2)
    
    return Tool(
        name="mcp_knowledge_base",
        description="Useful for retrieving information from the knowledge base. Input should be a query string.",
        func=knowledge_tool_fn
    )


def create_mcp_data_tool(client: MCPClient) -> Tool:
    """Create a LangChain tool for accessing MCP data analysis."""
    
    def data_tool_fn(column: str) -> str:
        """Analyze data."""
        if column.lower() == "all":
            result = client.call_tool("data_analysis_get_summary_statistics", {})
        else:
            result = client.call_tool("data_analysis_get_summary_statistics", {"column": column})
        return json.dumps(result, indent=2)
    
    return Tool(
        name="mcp_data_analysis",
        description="Useful for analyzing data. Input should be a column name or 'all' for all columns.",
        func=data_tool_fn
    )


def create_mcp_document_tool(client: MCPClient) -> Tool:
    """Create a LangChain tool for accessing MCP document processing."""
    
    def document_tool_fn(input_str: str) -> str:
        """Process documents."""
        if input_str.lower().startswith("search:"):
            query = input_str[len("search:"):].strip()
            uri = f"mcp://documents/search/{query}"
            result = client.get_resource(uri)
        else:
            uri = f"mcp://documents/{input_str}"
            result = client.get_resource(uri)
            
            if "content" in result and isinstance(result["content"], str):
                summary = client.call_tool(
                    "document_processing_summarize",
                    {"text": result["content"]}
                )
                result["summary"] = summary
        
        return json.dumps(result, indent=2)
    
    return Tool(
        name="mcp_document",
        description="Useful for processing documents. Input should be a document ID or a search query prefixed with 'search:'.",
        func=document_tool_fn
    )


def create_mcp_web_search_tool(client: MCPClient) -> Tool:
    """Create a LangChain tool for accessing MCP web search."""
    
    def web_search_tool_fn(query: str) -> str:
        """Search the web."""
        uri = f"mcp://web-search/{query}"
        result = client.get_resource(uri)
        return json.dumps(result, indent=2)
    
    return Tool(
        name="mcp_web_search",
        description="Useful for searching the web. Input should be a search query.",
        func=web_search_tool_fn
    )


class MockLLM(LLM):
    """Mock LLM for demonstration purposes."""
    
    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        """Process the prompt and return a response."""
        prompt_lower = prompt.lower()
        
        # Check for framework-specific queries
        if "llamaindex" in prompt_lower or "llama index" in prompt_lower:
            return "I'll use the mcp_knowledge_base tool to search for information about LlamaIndex."
        elif "langchain" in prompt_lower:
            return "I'll use the mcp_knowledge_base tool to search for information about LangChain."
        elif "smolagents" in prompt_lower:
            return "I'll use the mcp_knowledge_base tool to search for information about SmolaGents."
        elif "autogen" in prompt_lower:
            return "I'll use the mcp_knowledge_base tool to search for information about AutoGen."
        elif "mcp" in prompt_lower:
            return "I'll use the mcp_knowledge_base tool to search for information about MCP."
        
        # Check for specific operations
        if "compare" in prompt_lower or "comparison" in prompt_lower:
            return "I'll use the mcp_knowledge_base tool to get information about all frameworks."
        elif "analyze" in prompt_lower or "statistics" in prompt_lower:
            return "I'll use the mcp_data_analysis tool to analyze the data."
        elif "document" in prompt_lower or "guide" in prompt_lower:
            return "I'll use the mcp_document tool to process the document."
        elif "search" in prompt_lower:
            return "I'll use the mcp_web_search tool to search the web."
        
        # Default response
        return "I'll help you with that using the appropriate MCP tool."
    
    @property
    def _llm_type(self) -> str:
        """Return the LLM type."""
        return "mock_llm"
    
    @property
    def _identifying_params(self) -> Dict[str, Any]:
        """Get the identifying parameters."""
        return {"name": "mock_llm"}


def run_mcp_examples():
    """Run MCP integration examples."""
    # Initialize MCP client and LLM
    client = MCPClient()
    llm = MockLLM()
    
    print("\n" + "="*50)
    print("LangChain Integration with MCP Server")
    print("="*50)
    
    # Create MCP tools
    tools = [
        create_mcp_knowledge_tool(client),
        create_mcp_data_tool(client),
        create_mcp_document_tool(client),
        create_mcp_web_search_tool(client)
    ]
    
    # Example 1: Direct tool use
    print("\nExample 1: Direct Tool Use")
    print("-"*40)
    
    # Use knowledge base tool
    print("Knowledge Base Query: Tell me about LlamaIndex")
    result = tools[0].run("Tell me about LlamaIndex")
    print(f"Result:\n{result}")
    
    # Use data analysis tool
    print("\nData Analysis: Get statistics for temperature")
    result = tools[1].run("temperature")
    print(f"Result:\n{result}")
    
    # Example 2: Agent with tools
    print("\nExample 2: Agent with Tools")
    print("-"*40)
    
    # Initialize agent with system message
    agent = initialize_agent(
        tools,
        llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        handle_parsing_errors=True,
        verbose=True,
        agent_kwargs={
            "prefix": """You are a helpful AI assistant with access to MCP tools for retrieving information about AI frameworks, analyzing data, processing documents, and searching the web. Use these tools to provide accurate and detailed responses."""
        }
    )
    
    # Run agent with different queries
    queries = [
        "What can you tell me about LlamaIndex and its key features?",
        "Which frameworks provide strong support for building agent-based systems?",
        "How do different frameworks integrate with MCP and what are their unique capabilities?"
    ]
    
    for query in queries:
        print(f"\nQuery: {query}")
        try:
            response = agent.run(query)
            print(f"Response:\n{response}")
        except Exception as e:
            print(f"Error: {str(e)}")
    
    # Example 3: Chain with memory
    print("\nExample 3: Chain with Memory")
    print("-"*40)
    
    # Create a chain with memory
    template = """
    You are a knowledgeable AI assistant with access to MCP tools for retrieving accurate information about AI frameworks and their capabilities.

    Based on our conversation and the available tools, help me understand:
    {input}
    
    Previous conversation:
    {history}
    
    Let's use the MCP knowledge base to provide accurate and detailed information.
    """
    
    prompt = PromptTemplate(
        input_variables=["input", "history"],
        template=template
    )
    
    memory = ConversationBufferMemory(
        memory_key="history",
        input_key="input",
        return_messages=True
    )
    
    chain = LLMChain(
        llm=llm,
        prompt=prompt,
        memory=memory,
        verbose=True
    )
    
    # Run chain with a sequence of related queries
    queries = [
        "What are the main use cases and features of LlamaIndex?",
        "How does LlamaIndex's approach compare to LangChain's architecture?",
        "Can LlamaIndex and LangChain be used together through MCP integration?"
    ]
    
    for query in queries:
        print(f"\nQuery: {query}")
        response = chain.run(input=query)
        print(f"Response:\n{response}")


if __name__ == "__main__":
    run_mcp_examples()