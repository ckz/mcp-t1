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
        
        # Import tools here to ensure they're loaded after server initialization
        from mcp_server.tools import KnowledgeBaseTool, DocumentProcessingTool
        
        logger.info(f"Calling MCP tool: {tool_name} with arguments: {arguments}")
        
        try:
            if tool_name == "knowledge_base_get_info":
                return KnowledgeBaseTool().get_info(
                    topic=arguments.get("topic"),
                    subtopic=arguments.get("subtopic")
                )
            elif tool_name == "knowledge_base_search":
                return KnowledgeBaseTool().search(
                    query=arguments.get("query")
                )
            elif tool_name == "document_processing_summarize":
                return DocumentProcessingTool().summarize(
                    text=arguments.get("text"),
                    max_length=arguments.get("max_length", 100)
                )
            else:
                raise ValueError(f"Unknown tool: {tool_name}")
        except Exception as e:
            logger.error(f"Error calling tool {tool_name}: {str(e)}")
            return {"error": str(e)}
    
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
        
        # Import resources here to ensure they're loaded after server initialization
        from mcp_server.resources import DocumentResource, WebSearchResource
        
        logger.info(f"Getting MCP resource: {uri}")
        
        try:
            if uri == "mcp://documents/list":
                return DocumentResource().list_documents()
            elif uri.startswith("mcp://documents/search/"):
                query = uri[len("mcp://documents/search/"):]
                return DocumentResource().search_documents(query)
            elif uri.startswith("mcp://documents/"):
                document_id = uri[len("mcp://documents/"):]
                return DocumentResource().get_document(document_id)
            elif uri.startswith("mcp://web-search/"):
                query = uri[len("mcp://web-search/"):]
                return WebSearchResource().search(query)
            else:
                raise ValueError(f"Unknown resource URI: {uri}")
        except Exception as e:
            logger.error(f"Error getting resource {uri}: {str(e)}")
            return {"error": str(e)}


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
        
        # Try getting direct info about LlamaIndex
        info_results = self.client.call_tool("knowledge_base_get_info", {"topic": "ai_frameworks", "subtopic": "llama_index"})
        
        # Convert results to nodes
        nodes = []
        
        # Process the direct info results
        if isinstance(info_results, dict) and "llama_index" in info_results:
            framework_data = info_results["llama_index"]
            text = (
                "LlamaIndex:\n"
                f"Description: {framework_data['description']}\n\n"
                f"Key Features:\n- {'\n- '.join(framework_data['key_features'])}\n\n"
                f"Use Cases:\n- {'\n- '.join(framework_data['use_cases'])}\n\n"
                f"GitHub Repository: {framework_data['github']}"
            )
            node = TextNode(text=text)
            nodes.append(NodeWithScore(node=node, score=1.0))
        
        # If no direct results, try searching
        if not nodes:
            search_results = self.client.call_tool(self.tool_name, {"query": query})
            if isinstance(search_results, dict):
                for topic, topic_data in search_results.items():
                    if topic == "ai_frameworks":
                        for framework, framework_data in topic_data.items():
                            text = (
                                f"{framework}:\n"
                                f"Description: {framework_data['description']}\n"
                                f"Key features: {', '.join(framework_data['key_features'])}\n"
                                f"Use cases: {', '.join(framework_data['use_cases'])}\n"
                                f"GitHub: {framework_data['github']}"
                            )
                            node = TextNode(text=text)
                            nodes.append(NodeWithScore(node=node, score=0.8))
                    elif topic == "mcp":
                        text = (
                            f"MCP:\n"
                            f"Description: {topic_data['description']}\n"
                            f"Components: {', '.join(topic_data['components'])}\n"
                            f"Benefits: {', '.join(topic_data['benefits'])}\n"
                            f"Specification: {topic_data['specification']}"
                        )
                        node = TextNode(text=text)
                        nodes.append(NodeWithScore(node=node, score=0.5))
        
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
        
        # Try searching documents first
        search_results = self.client.get_resource(f"mcp://documents/search/{search_query}")
        nodes = []
        
        # Process search results
        if "results" in search_results:
            for result in search_results["results"]:
                doc = self.client.get_resource(f"mcp://documents/{result['id']}")
                if "content" in doc:
                    node = TextNode(
                        text=doc["content"],
                        metadata={
                            "title": doc.get("title", ""),
                            "id": result["id"],
                            "author": doc.get("metadata", {}).get("author", ""),
                            "date": doc.get("metadata", {}).get("date", ""),
                            "tags": doc.get("metadata", {}).get("tags", [])
                        }
                    )
                    
                    # Score based on match type
                    score = 0.9 if result.get("match") == "title" else 0.7
                    nodes.append(NodeWithScore(node=node, score=score))
        
        # If no search results, try getting all documents and filtering
        if not nodes:
            docs = self.client.get_resource("mcp://documents/list")
            if "documents" in docs:
                for doc_info in docs["documents"]:
                    doc = self.client.get_resource(f"mcp://documents/{doc_info['id']}")
                    if "content" in doc:
                        # Check if this document is relevant to the query
                        query_terms = search_query.lower().split()
                        title_terms = doc["title"].lower().split()
                        content_preview = doc["content"][:500].lower()  # Check first 500 chars
                        
                        # Calculate relevance score
                        score = 0.0
                        for term in query_terms:
                            if term in title_terms:
                                score = max(score, 0.8)
                            elif term in content_preview:
                                score = max(score, 0.6)
                            elif any(term in tag.lower() for tag in doc.get("metadata", {}).get("tags", [])):
                                score = max(score, 0.4)
                        
                        if score > 0:
                            node = TextNode(
                                text=doc["content"],
                                metadata={
                                    "title": doc.get("title", ""),
                                    "id": doc_info["id"],
                                    "author": doc.get("metadata", {}).get("author", ""),
                                    "date": doc.get("metadata", {}).get("date", ""),
                                    "tags": doc.get("metadata", {}).get("tags", [])
                                }
                            )
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
    print("\nRetrieved information:")
    if nodes:
        for i, node in enumerate(nodes, 1):
            print(f"\nNode {i}:")
            print(node.node.text)
    else:
        print("No relevant information found.")
    
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
    print("\nRetrieved information:")
    if nodes:
        for i, node in enumerate(nodes, 1):
            print(f"\nNode {i} (score: {node.score:.2f}):")
            print(f"Title: {node.node.metadata.get('title', 'Untitled')}")
            print(f"Author: {node.node.metadata.get('author', 'Unknown')}")
            print(f"Date: {node.node.metadata.get('date', 'Unknown')}")
            print(f"Content preview: {node.node.text[:200]}...")
    else:
        print("No relevant documents found.")
    
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