"""
AutoGen integration with MCP server.

This module demonstrates how to integrate AutoGen with an MCP server.
"""

import json
import logging
import os
import sys
from typing import Any, Dict, List, Optional, Callable, Union

# Note: This is a simulated implementation of AutoGen for demonstration purposes
# In a real implementation, you would import from the actual autogen package
class ConversableAgent:
    """Simulated AutoGen ConversableAgent class."""
    
    def __init__(self, name: str, system_message: str = "", llm_config: Optional[Dict[str, Any]] = None):
        """
        Initialize a conversable agent.
        
        Args:
            name: Agent name
            system_message: System message for the agent
            llm_config: LLM configuration
        """
        self.name = name
        self.system_message = system_message
        self.llm_config = llm_config or {}
        self.messages = []
    
    def send(self, message: str, recipient: "ConversableAgent") -> None:
        """
        Send a message to another agent.
        
        Args:
            message: Message to send
            recipient: Recipient agent
        """
        self.messages.append({"role": "user", "content": message})
        recipient.receive(message, self)
    
    def receive(self, message: str, sender: "ConversableAgent") -> None:
        """
        Receive a message from another agent.
        
        Args:
            message: Message received
            sender: Sender agent
        """
        self.messages.append({"role": "assistant", "content": message})


class AssistantAgent(ConversableAgent):
    """Simulated AutoGen AssistantAgent class."""
    
    def __init__(self, name: str, system_message: str = "", llm_config: Optional[Dict[str, Any]] = None):
        """
        Initialize an assistant agent.
        
        Args:
            name: Agent name
            system_message: System message for the agent
            llm_config: LLM configuration
        """
        super().__init__(name, system_message, llm_config)
    
    def receive(self, message: str, sender: ConversableAgent) -> None:
        """
        Receive a message from another agent.
        
        Args:
            message: Message received
            sender: Sender agent
        """
        # Store the message but don't call super().receive() to avoid recursion
        self.messages.append({"role": "assistant", "content": message})
        
        # Generate a response based on the message
        # This is a simplified implementation for demonstration
        if "knowledge base" in message.lower():
            response = "I'll search the knowledge base for that information."
        elif "data analysis" in message.lower():
            response = "I'll analyze the data for you."
        elif "document" in message.lower():
            response = "I'll process the document for you."
        elif "web search" in message.lower():
            response = "I'll search the web for that information."
        else:
            response = "I'll help you with that."
        
        # Add the response to our messages
        self.messages.append({"role": "user", "content": response})
        
        # Add the response to the sender's messages
        sender.messages.append({"role": "assistant", "content": response})


class UserProxyAgent(ConversableAgent):
    """Simulated AutoGen UserProxyAgent class."""
    
    def __init__(
        self,
        name: str,
        human_input_mode: str = "NEVER",
        function_map: Optional[Dict[str, Callable]] = None
    ):
        """
        Initialize a user proxy agent.
        
        Args:
            name: Agent name
            human_input_mode: Human input mode
            function_map: Map of function names to functions
        """
        super().__init__(name)
        self.human_input_mode = human_input_mode
        self.function_map = function_map or {}
    
    def receive(self, message: str, sender: ConversableAgent) -> None:
        """
        Receive a message from another agent.
        
        Args:
            message: Message received
            sender: Sender agent
        """
        # Store the message but don't call super().receive() to avoid recursion
        self.messages.append({"role": "assistant", "content": message})
        
        # Check if the message contains a function call
        for func_name, func in self.function_map.items():
            if func_name.lower() in message.lower():
                # Extract parameters from the message
                # This is a simplified implementation for demonstration
                params = {}
                if "query" in message.lower():
                    params["query"] = message.lower().split("query")[1].strip()
                
                # Call the function
                result = func(**params)
                
                # Add the result to our messages
                response = f"Function result: {result}"
                self.messages.append({"role": "user", "content": response})
                
                # Add the result to the sender's messages
                sender.messages.append({"role": "assistant", "content": response})
                return
    
    def initiate_chat(self, recipient: ConversableAgent, message: str) -> None:
        """
        Initiate a chat with another agent.
        
        Args:
            recipient: Recipient agent
            message: Initial message
        """
        self.send(message, recipient)


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
        elif tool_name == "data_analysis_filter_data":
            from mcp_server.tools import DataAnalysisTool
            return DataAnalysisTool.filter_data(
                column=arguments.get("column"),
                operator=arguments.get("operator"),
                value=arguments.get("value")
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


def mcp_knowledge_base(client: MCPClient, query: str = "", topic: str = "", subtopic: str = "") -> str:
    """
    Access the MCP knowledge base.
    
    Args:
        client: MCP client
        query: Search query
        topic: Topic to get information about
        subtopic: Subtopic to get information about
        
    Returns:
        Knowledge base response as a string
    """
    if query:
        result = client.call_tool("knowledge_base_search", {"query": query})
    elif topic:
        if subtopic:
            result = client.call_tool("knowledge_base_get_info", {"topic": topic, "subtopic": subtopic})
        else:
            result = client.call_tool("knowledge_base_get_info", {"topic": topic})
    else:
        result = client.call_tool("knowledge_base_list_topics", {})
    
    return json.dumps(result, indent=2)


def mcp_data_analysis(
    client: MCPClient,
    operation: str = "summary",
    column: str = "",
    column1: str = "",
    column2: str = "",
    filter_column: str = "",
    filter_operator: str = "",
    filter_value: Union[str, int, float] = ""
) -> str:
    """
    Perform data analysis using MCP.
    
    Args:
        client: MCP client
        operation: Operation to perform (summary, correlation, filter)
        column: Column name for summary statistics
        column1: First column name for correlation
        column2: Second column name for correlation
        filter_column: Column name for filtering
        filter_operator: Operator for filtering
        filter_value: Value for filtering
        
    Returns:
        Data analysis response as a string
    """
    if operation == "summary":
        if column:
            result = client.call_tool("data_analysis_get_summary_statistics", {"column": column})
        else:
            result = client.call_tool("data_analysis_get_summary_statistics", {})
    elif operation == "correlation":
        if column1 and column2:
            result = client.call_tool("data_analysis_get_correlation", {
                "column1": column1,
                "column2": column2
            })
        else:
            result = {"error": "Please specify two columns for correlation"}
    elif operation == "filter":
        if filter_column and filter_operator and filter_value:
            result = client.call_tool("data_analysis_filter_data", {
                "column": filter_column,
                "operator": filter_operator,
                "value": filter_value
            })
        else:
            result = {"error": "Please specify column, operator, and value for filtering"}
    else:
        result = {"error": f"Unknown operation: {operation}"}
    
    return json.dumps(result, indent=2)


def mcp_document_processing(
    client: MCPClient,
    operation: str = "list",
    document_id: str = "",
    text: str = "",
    query: str = ""
) -> str:
    """
    Process documents using MCP.
    
    Args:
        client: MCP client
        operation: Operation to perform (list, get, summarize, search)
        document_id: Document ID
        text: Text to process
        query: Search query
        
    Returns:
        Document processing response as a string
    """
    if operation == "list":
        result = client.get_resource("mcp://documents/list")
    elif operation == "get":
        if document_id:
            result = client.get_resource(f"mcp://documents/{document_id}")
        else:
            result = {"error": "Please specify a document ID"}
    elif operation == "summarize":
        if document_id:
            document = client.get_resource(f"mcp://documents/{document_id}")
            if "content" in document:
                result = client.call_tool("document_processing_summarize", {
                    "text": document["content"]
                })
            else:
                result = {"error": "Document has no content"}
        elif text:
            result = client.call_tool("document_processing_summarize", {
                "text": text
            })
        else:
            result = {"error": "Please specify a document ID or text"}
    elif operation == "search":
        if query:
            result = client.get_resource(f"mcp://documents/search/{query}")
        else:
            result = {"error": "Please specify a search query"}
    else:
        result = {"error": f"Unknown operation: {operation}"}
    
    return json.dumps(result, indent=2)


def mcp_web_search(client: MCPClient, query: str) -> str:
    """
    Search the web using MCP.
    
    Args:
        client: MCP client
        query: Search query
        
    Returns:
        Web search response as a string
    """
    result = client.get_resource(f"mcp://web-search/{query}")
    return json.dumps(result, indent=2)


def run_autogen_example():
    """Run the AutoGen integration example."""
    # Initialize MCP client
    client = MCPClient()
    
    print("\n" + "="*50)
    print("AutoGen Integration with MCP Server")
    print("="*50)
    
    # Example 1: Using MCP functions with AutoGen
    print("\nExample 1: Using MCP functions with AutoGen")
    print("-"*40)
    
    # Create function map
    function_map = {
        "mcp_knowledge_base": lambda **kwargs: mcp_knowledge_base(client, **kwargs),
        "mcp_data_analysis": lambda **kwargs: mcp_data_analysis(client, **kwargs),
        "mcp_document_processing": lambda **kwargs: mcp_document_processing(client, **kwargs),
        "mcp_web_search": lambda **kwargs: mcp_web_search(client, **kwargs)
    }
    
    # Create agents
    assistant = AssistantAgent(
        name="assistant",
        system_message="You are a helpful assistant that can use MCP functions to access knowledge, analyze data, process documents, and search the web.",
        llm_config={"config": "..."}
    )
    
    user_proxy = UserProxyAgent(
        name="user_proxy",
        human_input_mode="NEVER",
        function_map=function_map
    )
    
    # Example queries
    queries = [
        "Use mcp_knowledge_base to tell me about LlamaIndex",
        "Use mcp_data_analysis to get summary statistics for temperature",
        "Use mcp_document_processing to summarize the llama_index_guide document",
        "Use mcp_web_search to search for LangChain"
    ]
    
    for query in queries:
        print(f"\nQuery: {query}")
        user_proxy.initiate_chat(assistant, query)
        
        # Print the conversation
        print("\nConversation:")
        for i, message in enumerate(user_proxy.messages):
            role = message["role"]
            content = message["content"]
            print(f"{role.capitalize()}: {content}")
    
    # Example 2: Multi-agent conversation with MCP
    print("\nExample 2: Multi-agent conversation with MCP")
    print("-"*40)
    
    # Create specialized agents
    knowledge_agent = AssistantAgent(
        name="knowledge_agent",
        system_message="You are a knowledge expert that can access the MCP knowledge base.",
        llm_config={"config": "..."}
    )
    
    data_agent = AssistantAgent(
        name="data_agent",
        system_message="You are a data analyst that can analyze data using MCP.",
        llm_config={"config": "..."}
    )
    
    document_agent = AssistantAgent(
        name="document_agent",
        system_message="You are a document expert that can process documents using MCP.",
        llm_config={"config": "..."}
    )
    
    # Create a coordinator agent
    coordinator = AssistantAgent(
        name="coordinator",
        system_message="You are a coordinator that delegates tasks to specialized agents.",
        llm_config={"config": "..."}
    )
    
    # Create user proxy
    multi_user_proxy = UserProxyAgent(
        name="user_proxy",
        human_input_mode="NEVER",
        function_map=function_map
    )
    
    # Simulate a multi-agent conversation
    print("\nQuery: Tell me about the different AI frameworks and how they integrate with MCP")
    
    # User initiates the conversation with the coordinator
    multi_user_proxy.initiate_chat(
        coordinator,
        "Tell me about the different AI frameworks and how they integrate with MCP"
    )
    
    # Coordinator delegates to knowledge agent
    coordinator.send(
        "Can you provide information about the AI frameworks?",
        knowledge_agent
    )
    
    # Knowledge agent responds
    # In a real implementation, this would use the MCP knowledge base
    
    # Coordinator delegates to document agent
    coordinator.send(
        "Can you summarize the integration guides for each framework?",
        document_agent
    )
    
    # Document agent responds
    # In a real implementation, this would use the MCP document processing
    
    # Coordinator compiles the information and responds to the user
    coordinator.send(
        "Based on the information from the knowledge base and documents, here's a comparison of the different AI frameworks and their integration with MCP:\n\n"
        "1. LlamaIndex: Provides data indexing and retrieval capabilities. Integrates with MCP through custom retrievers.\n"
        "2. LangChain: Offers chains and agents for LLM applications. Integrates with MCP through custom tools.\n"
        "3. SmolaGents: A lightweight agent framework from Hugging Face. Integrates with MCP through tool functions.\n"
        "4. AutoGen: Supports multi-agent conversations. Integrates with MCP through function calling.",
        multi_user_proxy
    )
    
    # Print the conversation
    print("\nConversation:")
    for i, message in enumerate(multi_user_proxy.messages):
        role = message["role"]
        content = message["content"]
        print(f"{role.capitalize()}: {content}")


if __name__ == "__main__":
    run_autogen_example()