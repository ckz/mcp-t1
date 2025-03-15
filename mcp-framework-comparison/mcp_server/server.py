"""
MCP Server implementation.

This module implements the Model Context Protocol (MCP) server that provides
tools and resources for AI frameworks to interact with.
"""

import json
import logging
import os
import sys
from typing import Any, Dict, List, Optional, Union

from modelcontextprotocol.server import Server
from modelcontextprotocol.server.stdio import StdioServerTransport
from modelcontextprotocol.types import (
    CallToolRequestSchema,
    ErrorCode,
    ListResourcesRequestSchema,
    ListResourceTemplatesRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ReadResourceRequestSchema,
)

from mcp_server.tools import KnowledgeBaseTool, DataAnalysisTool, DocumentProcessingTool
from mcp_server.resources import WebSearchResource, DocumentResource

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stderr)]
)
logger = logging.getLogger(__name__)


class MCPServer:
    """MCP Server implementation for framework comparison."""
    
    def __init__(self):
        """Initialize the MCP server."""
        self.server = Server(
            {
                "name": "mcp-framework-comparison",
                "version": "0.1.0",
            },
            {
                "capabilities": {
                    "resources": {},
                    "tools": {},
                }
            }
        )
        
        # Initialize tools
        self.knowledge_base_tool = KnowledgeBaseTool()
        self.data_analysis_tool = DataAnalysisTool()
        self.document_processing_tool = DocumentProcessingTool()
        
        # Initialize resources
        self.web_search_resource = WebSearchResource()
        self.document_resource = DocumentResource()
        
        # Set up request handlers
        self._setup_tool_handlers()
        self._setup_resource_handlers()
        
        # Error handling
        self.server.onerror = self._handle_error
    
    def _setup_tool_handlers(self):
        """Set up handlers for tool-related requests."""
        self.server.setRequestHandler(ListToolsRequestSchema, self._handle_list_tools)
        self.server.setRequestHandler(CallToolRequestSchema, self._handle_call_tool)
    
    def _setup_resource_handlers(self):
        """Set up handlers for resource-related requests."""
        self.server.setRequestHandler(ListResourcesRequestSchema, self._handle_list_resources)
        self.server.setRequestHandler(ListResourceTemplatesRequestSchema, self._handle_list_resource_templates)
        self.server.setRequestHandler(ReadResourceRequestSchema, self._handle_read_resource)
    
    async def _handle_list_tools(self, request):
        """Handle ListTools request."""
        return {
            "tools": [
                {
                    "name": "knowledge_base_get_info",
                    "description": "Get information from the knowledge base",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "topic": {
                                "type": "string",
                                "description": "The main topic to retrieve information about"
                            },
                            "subtopic": {
                                "type": "string",
                                "description": "Optional subtopic for more specific information"
                            }
                        },
                        "required": ["topic"]
                    }
                },
                {
                    "name": "knowledge_base_list_topics",
                    "description": "List all available topics in the knowledge base",
                    "inputSchema": {
                        "type": "object",
                        "properties": {}
                    }
                },
                {
                    "name": "knowledge_base_search",
                    "description": "Search the knowledge base for a query",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "The search query"
                            }
                        },
                        "required": ["query"]
                    }
                },
                {
                    "name": "data_analysis_get_summary_statistics",
                    "description": "Get summary statistics for the dataset",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "column": {
                                "type": "string",
                                "description": "Optional column name to get statistics for"
                            }
                        }
                    }
                },
                {
                    "name": "data_analysis_filter_data",
                    "description": "Filter the dataset based on a condition",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "column": {
                                "type": "string",
                                "description": "Column name to filter on"
                            },
                            "operator": {
                                "type": "string",
                                "description": "Comparison operator ('eq', 'gt', 'lt', 'gte', 'lte', 'contains')"
                            },
                            "value": {
                                "oneOf": [
                                    {"type": "string"},
                                    {"type": "number"}
                                ],
                                "description": "Value to compare against"
                            }
                        },
                        "required": ["column", "operator", "value"]
                    }
                },
                {
                    "name": "data_analysis_get_correlation",
                    "description": "Calculate correlation between two columns",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "column1": {
                                "type": "string",
                                "description": "First column name"
                            },
                            "column2": {
                                "type": "string",
                                "description": "Second column name"
                            }
                        },
                        "required": ["column1", "column2"]
                    }
                },
                {
                    "name": "document_processing_extract_entities",
                    "description": "Extract entities from text",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "text": {
                                "type": "string",
                                "description": "The text to extract entities from"
                            }
                        },
                        "required": ["text"]
                    }
                },
                {
                    "name": "document_processing_summarize",
                    "description": "Generate a summary of the text",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "text": {
                                "type": "string",
                                "description": "The text to summarize"
                            },
                            "max_length": {
                                "type": "integer",
                                "description": "Maximum length of the summary"
                            }
                        },
                        "required": ["text"]
                    }
                },
                {
                    "name": "document_processing_extract_keywords",
                    "description": "Extract keywords from text",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "text": {
                                "type": "string",
                                "description": "The text to extract keywords from"
                            },
                            "max_keywords": {
                                "type": "integer",
                                "description": "Maximum number of keywords to extract"
                            }
                        },
                        "required": ["text"]
                    }
                }
            ]
        }
    
    async def _handle_call_tool(self, request):
        """Handle CallTool request."""
        tool_name = request.params.name
        arguments = request.params.arguments
        
        try:
            # Knowledge base tools
            if tool_name == "knowledge_base_get_info":
                result = self.knowledge_base_tool.get_info(
                    topic=arguments.get("topic"),
                    subtopic=arguments.get("subtopic")
                )
            elif tool_name == "knowledge_base_list_topics":
                result = self.knowledge_base_tool.list_topics()
            elif tool_name == "knowledge_base_search":
                result = self.knowledge_base_tool.search(
                    query=arguments.get("query")
                )
            
            # Data analysis tools
            elif tool_name == "data_analysis_get_summary_statistics":
                result = self.data_analysis_tool.get_summary_statistics(
                    column=arguments.get("column")
                )
            elif tool_name == "data_analysis_filter_data":
                result = self.data_analysis_tool.filter_data(
                    column=arguments.get("column"),
                    operator=arguments.get("operator"),
                    value=arguments.get("value")
                )
            elif tool_name == "data_analysis_get_correlation":
                result = self.data_analysis_tool.get_correlation(
                    column1=arguments.get("column1"),
                    column2=arguments.get("column2")
                )
            
            # Document processing tools
            elif tool_name == "document_processing_extract_entities":
                result = self.document_processing_tool.extract_entities(
                    text=arguments.get("text")
                )
            elif tool_name == "document_processing_summarize":
                result = self.document_processing_tool.summarize(
                    text=arguments.get("text"),
                    max_length=arguments.get("max_length", 100)
                )
            elif tool_name == "document_processing_extract_keywords":
                result = self.document_processing_tool.extract_keywords(
                    text=arguments.get("text"),
                    max_keywords=arguments.get("max_keywords", 5)
                )
            else:
                raise McpError(
                    ErrorCode.MethodNotFound,
                    f"Unknown tool: {tool_name}"
                )
            
            # Convert result to JSON string
            result_json = json.dumps(result, indent=2)
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": result_json
                    }
                ]
            }
        except Exception as e:
            logger.exception(f"Error calling tool {tool_name}")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error: {str(e)}"
                    }
                ],
                "isError": True
            }
    
    async def _handle_list_resources(self, request):
        """Handle ListResources request."""
        return {
            "resources": [
                {
                    "uri": "mcp://documents/list",
                    "name": "Document List",
                    "mimeType": "application/json",
                    "description": "List of all available documents"
                }
            ]
        }
    
    async def _handle_list_resource_templates(self, request):
        """Handle ListResourceTemplates request."""
        return {
            "resourceTemplates": [
                {
                    "uriTemplate": "mcp://web-search/{query}",
                    "name": "Web Search",
                    "mimeType": "application/json",
                    "description": "Search the web for a query"
                },
                {
                    "uriTemplate": "mcp://documents/{document_id}",
                    "name": "Document",
                    "mimeType": "application/json",
                    "description": "Get a document by ID"
                },
                {
                    "uriTemplate": "mcp://documents/search/{query}",
                    "name": "Document Search",
                    "mimeType": "application/json",
                    "description": "Search documents for a query"
                }
            ]
        }
    
    async def _handle_read_resource(self, request):
        """Handle ReadResource request."""
        uri = request.params.uri
        
        try:
            # Static resources
            if uri == "mcp://documents/list":
                result = self.document_resource.list_documents()
                return {
                    "contents": [
                        {
                            "uri": uri,
                            "mimeType": "application/json",
                            "text": json.dumps(result, indent=2)
                        }
                    ]
                }
            
            # Web search resource template
            web_search_match = uri.startswith("mcp://web-search/")
            if web_search_match:
                query = uri[len("mcp://web-search/"):]
                result = self.web_search_resource.search(query)
                return {
                    "contents": [
                        {
                            "uri": uri,
                            "mimeType": "application/json",
                            "text": json.dumps(result, indent=2)
                        }
                    ]
                }
            
            # Document resource template
            document_match = uri.startswith("mcp://documents/")
            if document_match and not uri.startswith("mcp://documents/search/"):
                document_id = uri[len("mcp://documents/"):]
                result = self.document_resource.get_document(document_id)
                return {
                    "contents": [
                        {
                            "uri": uri,
                            "mimeType": "application/json",
                            "text": json.dumps(result, indent=2)
                        }
                    ]
                }
            
            # Document search resource template
            document_search_match = uri.startswith("mcp://documents/search/")
            if document_search_match:
                query = uri[len("mcp://documents/search/"):]
                result = self.document_resource.search_documents(query)
                return {
                    "contents": [
                        {
                            "uri": uri,
                            "mimeType": "application/json",
                            "text": json.dumps(result, indent=2)
                        }
                    ]
                }
            
            raise McpError(
                ErrorCode.InvalidRequest,
                f"Unknown resource URI: {uri}"
            )
        except Exception as e:
            logger.exception(f"Error reading resource {uri}")
            raise McpError(
                ErrorCode.InternalError,
                f"Error reading resource: {str(e)}"
            )
    
    def _handle_error(self, error):
        """Handle errors."""
        logger.error(f"MCP Error: {error}")
    
    async def run(self):
        """Run the MCP server."""
        transport = StdioServerTransport()
        await self.server.connect(transport)
        logger.info("MCP server running on stdio")


def main():
    """Run the MCP server."""
    import asyncio
    
    server = MCPServer()
    
    try:
        asyncio.run(server.run())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.exception("Error running server")
        sys.exit(1)


if __name__ == "__main__":
    main()