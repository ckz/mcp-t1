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

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    TextContent,
    Tool,
    Resource,
    ResourceTemplate,
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
            name="mcp-framework-comparison",
            version="0.1.0",
        )
        
        # Initialize tools
        self.knowledge_base_tool = KnowledgeBaseTool()
        self.data_analysis_tool = DataAnalysisTool()
        self.document_processing_tool = DocumentProcessingTool()
        
        # Initialize resources
        self.web_search_resource = WebSearchResource()
        self.document_resource = DocumentResource()
        
        # Register handlers
        self.register_handlers()
    
    def register_handlers(self):
        """Register handlers for requests."""
        # Tool handlers
        @self.server.list_tools()
        async def handle_list_tools():
            return await self._handle_list_tools()
        
        @self.server.call_tool()
        async def handle_call_tool(tool_name, arguments):
            return await self._handle_call_tool(tool_name, arguments)
        
        # Resource handlers
        @self.server.list_resources()
        async def handle_list_resources():
            return await self._handle_list_resources()
        
        @self.server.list_resource_templates()
        async def handle_list_resource_templates():
            return await self._handle_list_resource_templates()
        
        @self.server.read_resource()
        async def handle_read_resource(uri):
            return await self._handle_read_resource(uri)
    
    async def _handle_list_tools(self):
        """Handle ListTools request."""
        from mcp.types import Tool
        
        return [
            Tool(
                name="knowledge_base_get_info",
                description="Get information from the knowledge base",
                inputSchema={
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
            ),
            Tool(
                name="knowledge_base_list_topics",
                description="List all available topics in the knowledge base",
                inputSchema={
                    "type": "object",
                    "properties": {}
                }
            ),
            Tool(
                name="knowledge_base_search",
                description="Search the knowledge base for a query",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query"
                        }
                    },
                    "required": ["query"]
                }
            ),
            Tool(
                name="data_analysis_get_summary_statistics",
                description="Get summary statistics for the dataset",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "column": {
                            "type": "string",
                            "description": "Optional column name to get statistics for"
                        }
                    }
                }
            ),
            Tool(
                name="data_analysis_filter_data",
                description="Filter the dataset based on a condition",
                inputSchema={
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
            ),
            Tool(
                name="data_analysis_get_correlation",
                description="Calculate correlation between two columns",
                inputSchema={
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
            ),
            Tool(
                name="document_processing_extract_entities",
                description="Extract entities from text",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "text": {
                            "type": "string",
                            "description": "The text to extract entities from"
                        }
                    },
                    "required": ["text"]
                }
            ),
            Tool(
                name="document_processing_summarize",
                description="Generate a summary of the text",
                inputSchema={
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
            ),
            Tool(
                name="document_processing_extract_keywords",
                description="Extract keywords from text",
                inputSchema={
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
            )
        ]
    
    async def _handle_call_tool(self, tool_name, arguments):
        """Handle CallTool request."""
        from mcp.types import TextContent
        
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
                return [TextContent(type="text", text=f"Unknown tool: {tool_name}")]
            
            # Convert result to JSON string
            result_json = json.dumps(result, indent=2)
            
            return [TextContent(type="text", text=result_json)]
        except Exception as e:
            logger.exception(f"Error calling tool {tool_name}")
            return [TextContent(type="text", text=f"Error: {str(e)}")]
    
    async def _handle_list_resources(self):
        """Handle ListResources request."""
        from mcp.types import Resource
        
        return [
            Resource(
                uri="mcp://documents/list",
                name="Document List",
                mimeType="application/json",
                description="List of all available documents"
            )
        ]
    
    async def _handle_list_resource_templates(self):
        """Handle ListResourceTemplates request."""
        from mcp.types import ResourceTemplate
        
        return [
            ResourceTemplate(
                uriTemplate="mcp://web-search/{query}",
                name="Web Search",
                mimeType="application/json",
                description="Search the web for a query"
            ),
            ResourceTemplate(
                uriTemplate="mcp://documents/{document_id}",
                name="Document",
                mimeType="application/json",
                description="Get a document by ID"
            ),
            ResourceTemplate(
                uriTemplate="mcp://documents/search/{query}",
                name="Document Search",
                mimeType="application/json",
                description="Search documents for a query"
            )
        ]
    
    async def _handle_read_resource(self, uri):
        """Handle ReadResource request."""
        try:
            # Static resources
            if uri == "mcp://documents/list":
                result = self.document_resource.list_documents()
                return [{
                    "uri": uri,
                    "mime_type": "application/json",
                    "content": json.dumps(result, indent=2)
                }]
            
            # Web search resource template
            web_search_match = uri.startswith("mcp://web-search/")
            if web_search_match:
                query = uri[len("mcp://web-search/"):]
                result = self.web_search_resource.search(query)
                return [{
                    "uri": uri,
                    "mime_type": "application/json",
                    "content": json.dumps(result, indent=2)
                }]
            
            # Document resource template
            document_match = uri.startswith("mcp://documents/")
            if document_match and not uri.startswith("mcp://documents/search/"):
                document_id = uri[len("mcp://documents/"):]
                result = self.document_resource.get_document(document_id)
                return [{
                    "uri": uri,
                    "mime_type": "application/json",
                    "content": json.dumps(result, indent=2)
                }]
            
            # Document search resource template
            document_search_match = uri.startswith("mcp://documents/search/")
            if document_search_match:
                query = uri[len("mcp://documents/search/"):]
                result = self.document_resource.search_documents(query)
                return [{
                    "uri": uri,
                    "mime_type": "application/json",
                    "content": json.dumps(result, indent=2)
                }]
            
            return [{
                "uri": uri,
                "mime_type": "text/plain",
                "content": f"Unknown resource URI: {uri}"
            }]
        except Exception as e:
            logger.exception(f"Error reading resource {uri}")
            return [{
                "uri": uri,
                "mime_type": "text/plain",
                "content": f"Error reading resource: {str(e)}"
            }]

    async def run(self):
        """Run the MCP server."""
        async with stdio_server() as (read_stream, write_stream):
            # The error shows run() needs read_stream, write_stream, and initialization_options
            # Let's provide empty dict as default initialization_options
            initialization_options = {}
            await self.server.run(read_stream, write_stream, initialization_options)
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