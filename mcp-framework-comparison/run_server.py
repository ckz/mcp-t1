#!/usr/bin/env python3
"""
Script to run the MCP server.

This script starts the MCP server and keeps it running until interrupted.
"""

import asyncio
import logging
import os
import sys

# Add the current directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from mcp_server.server import MCPServer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)


async def main():
    """Run the MCP server."""
    logger.info("Starting MCP server...")
    
    server = MCPServer()
    
    try:
        await server.run()
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.exception("Error running server")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())