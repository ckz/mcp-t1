"""
LlamaIndex integration with MCP server.

This module demonstrates how to integrate LlamaIndex with an MCP server.
"""

import json
import logging
import os
import sys
from typing import Any, Dict, List, Optional

import requests
from llama_index.core import Document, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.retrievers import BaseRetriever
from llama_index.core.schema import NodeWithScore, QueryBundle, TextNode
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.response_synthesizers import ResponseMode

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


class MCPRetriever(BaseRetriever):
    """LlamaIndex retriever that uses MCP for retrieval."""
    
    def __init__(self, client: MCPClient, tool_name: str = "knowledge_base_search"):
        """
        Initialize the MCP retriever.
        
        Args:
            client: MCP client
            tool_name: Name of the MCP tool to use for retrieval
        """
        self.client = client
        self.tool_name = tool_name
        super().__init__()
    
    def _retrieve(self, query_bundle: QueryBundle) -> List[NodeWithScore]:
        """
        Retrieve nodes for a query.
        
        Args:
            query_bundle: Query bundle
            
        Returns:
            List of nodes with scores
        """
        query = query_bundle.query_str
        
        # Call MCP tool to get results
        results = self.client.call_tool(self.tool_name, {"query": query})
        
        # Convert results to nodes
        nodes = []
        
        # Process the results based on their structure
        # This is a simplified implementation for demonstration
        if isinstance(results, dict):
            for topic, topic_data in results.items():
                if isinstance(topic_data, dict):
                    for subtopic, subtopic_data in topic_data.items():
                        if isinstance(subtopic_data, (str, list)):
                            text = f"{topic} - {subtopic}: {subtopic_data}"
                            node = TextNode(text=text)
                            nodes.append(NodeWithScore(node=node, score=1.0))
                else:
                    text = f"{topic}: {topic_data}"
                    node = TextNode(text=text)
                    nodes.append(NodeWithScore(node=node, score=1.0))
        
        return nodes


class MCPDocumentRetriever(BaseRetriever):
    """LlamaIndex retriever that uses MCP document resources."""
    
    def __init__(self, client: MCPClient, query_prefix: str = ""):
        """
        Initialize the MCP document retriever.
        
        Args:
            client: MCP client
            query_prefix: Optional prefix to add to the query
        """
        self.client = client
        self.query_prefix = query_prefix
        super().__init__()
    
    def _retrieve(self, query_bundle: QueryBundle) -> List[NodeWithScore]:
        """
        Retrieve nodes for a query.
        
        Args:
            query_bundle: Query bundle
            
        Returns:
            List of nodes with scores
        """
        query = query_bundle.query_str
        
        # Add prefix if specified
        if self.query_prefix:
            search_query = f"{self.query_prefix} {query}"
        else:
            search_query = query
        
        # Get document search results
        uri = f"mcp://documents/search/{search_query}"
        results = self.client.get_resource(uri)
        
        # Convert results to nodes
        nodes = []
        
        if "results" in results:
            for result in results["results"]:
                # Get the full document
                document = self.client.get_resource(f"mcp://documents/{result['id']}")
                
                if "content" in document:
                    # Create a node from the document content
                    node = TextNode(
                        text=document["content"],
                        metadata={
                            "title": document.get("title", ""),
                            "id": result["id"],
                            "match": result.get("match", "")
                        }
                    )
                    
                    # Assign a score based on the match type
                    score = 1.0
                    if result.get("match") == "title":
                        score = 0.9
                    elif result.get("match") == "content":
                        score = 0.7
                    elif result.get("match", "").startswith("metadata"):
                        score = 0.5
                    
                    nodes.append(NodeWithScore(node=node, score=score))
        return nodes


def run_llama_index_example():
    """Run the LlamaIndex integration example."""
    # Initialize MCP client
    client = MCPClient()
    
    print("\n" + "="*50)
    print("LlamaIndex Integration with MCP Server")
    print("="*50)
    
    # Example 1: Using MCP as a retriever
    print("\nExample 1: Using MCP as a retriever")
    print("-"*40)
    
    # Create retriever
    retriever = MCPRetriever(client)
    
    # Instead of using a query engine that requires an LLM, we'll just use the retriever directly
    # and print the retrieved nodes
    query = "Tell me about LlamaIndex"
    print(f"Query: {query}")
    nodes = retriever.retrieve(query)
    
    # Print the retrieved information
    print("Retrieved information:")
    for i, node in enumerate(nodes):
        print(f"Node {i+1}: {node.node.text}")
    
    # Example 2: Using MCP document resources
    print("\nExample 2: Using MCP document resources")
    print("-"*40)
    
    # Create document retriever
    doc_retriever = MCPDocumentRetriever(client)
    
    # Use the document retriever directly
    query = "How to integrate LlamaIndex with MCP"
    print(f"Query: {query}")
    nodes = doc_retriever.retrieve(query)
    
    # Print the retrieved information
    print("Retrieved information:")
    for i, node in enumerate(nodes):
        print(f"Node {i+1} (score: {node.score:.2f}): {node.node.text[:100]}...")
    
    # Example 3: Creating an index from MCP documents
    print("\nExample 3: Creating an index from MCP documents")
    print("-"*40)
    
    # Get all documents
    documents_resource = client.get_resource("mcp://documents/list")
    
    # Create documents
    documents = []
    if "documents" in documents_resource:
        for doc_info in documents_resource["documents"]:
            # Get the full document
            doc = client.get_resource(f"mcp://documents/{doc_info['id']}")
            
            if "content" in doc:
                # Create a Document object
                document = Document(
                    text=doc["content"],
                    metadata={
                        "title": doc.get("title", ""),
                        "id": doc_info["id"]
                    }
                )
                documents.append(document)
    
    # Create index without using an LLM
    parser = SentenceSplitter()
    nodes = parser.get_nodes_from_documents(documents)
    
    # Instead of creating a vector index and query engine, just print the documents
    print(f"Loaded {len(documents)} documents:")
    for i, doc in enumerate(documents):
        print(f"Document {i+1}: {doc.metadata.get('title', 'Untitled')}")
        print(f"Content preview: {doc.text[:100]}...")
        print()


if __name__ == "__main__":
    run_llama_index_example()