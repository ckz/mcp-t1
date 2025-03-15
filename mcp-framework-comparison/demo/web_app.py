"""
Web application for comparing MCP framework integrations.

This module implements a Flask web application that demonstrates and compares
the different framework integrations with the MCP server.
"""

import json
import logging
import os
import sys
import time
from typing import Any, Dict, List, Optional

from flask import Flask, render_template, request, jsonify

# Add parent directory to path to import examples
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import example modules
from examples.llama_index_integration.main import run_llama_index_example
from examples.langchain_integration.main import run_mcp_examples
from examples.smolagents_integration.main import run_smolagents_example
from examples.autogen_integration.main import run_autogen_example

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, template_folder="templates")

# Store results for each framework
framework_results = {
    "llama_index": {"status": "Not run", "output": "", "time": 0},
    "langchain": {"status": "Not run", "output": "", "time": 0},
    "smolagents": {"status": "Not run", "output": "", "time": 0},
    "autogen": {"status": "Not run", "output": "", "time": 0}
}

# Framework descriptions
framework_descriptions = {
    "llama_index": {
        "name": "LlamaIndex",
        "description": "A data framework for LLM applications to ingest, structure, and access private or domain-specific data",
        "website": "https://www.llamaindex.ai/",
        "github": "https://github.com/jerryjliu/llama_index",
        "features": [
            "Data connectors for various sources",
            "Indexing and retrieval mechanisms",
            "Query engines for structured data access",
            "Integration with vector stores"
        ]
    },
    "langchain": {
        "name": "LangChain",
        "description": "A framework for developing applications powered by language models",
        "website": "https://www.langchain.com/",
        "github": "https://github.com/langchain-ai/langchain",
        "features": [
            "Chains for combining LLM calls with other components",
            "Agents for dynamic tool selection and use",
            "Memory for maintaining conversation state",
            "Callbacks for monitoring and logging"
        ]
    },
    "smolagents": {
        "name": "SmolaGents",
        "description": "A lightweight agent framework for building AI agents from Hugging Face",
        "website": "https://huggingface.co/blog/smolagents",
        "github": "https://github.com/huggingface/smolagents",
        "features": [
            "Lightweight design for simple agent creation",
            "Tool use capabilities",
            "Planning mechanisms",
            "Integration with Hugging Face ecosystem"
        ]
    },
    "autogen": {
        "name": "AutoGen",
        "description": "A framework for building LLM applications with multiple agents from Microsoft",
        "website": "https://microsoft.github.io/autogen/",
        "github": "https://github.com/microsoft/autogen",
        "features": [
            "Multi-agent conversations",
            "Human-in-the-loop capabilities",
            "Tool use for external actions",
            "Memory for maintaining context"
        ]
    }
}

# MCP integration comparison
integration_comparison = {
    "llama_index": {
        "integration_approach": "Custom retrievers that use MCP tools and resources",
        "code_complexity": "Medium",
        "performance": "Good for retrieval-focused applications",
        "flexibility": "High for data retrieval and indexing",
        "error_handling": "Built-in error handling in retrievers",
        "documentation": "Comprehensive with examples"
    },
    "langchain": {
        "integration_approach": "Custom tools that wrap MCP functionality",
        "code_complexity": "Low to Medium",
        "performance": "Good for agent-based applications",
        "flexibility": "High for chaining operations",
        "error_handling": "Tool-level error handling",
        "documentation": "Extensive with tutorials"
    },
    "smolagents": {
        "integration_approach": "Function-based tools that call MCP",
        "code_complexity": "Low",
        "performance": "Good for lightweight applications",
        "flexibility": "Medium",
        "error_handling": "Basic error handling",
        "documentation": "Limited but growing"
    },
    "autogen": {
        "integration_approach": "Function calling and multi-agent delegation",
        "code_complexity": "Medium to High",
        "performance": "Excellent for complex multi-agent systems",
        "flexibility": "Very high for agent interactions",
        "error_handling": "Comprehensive error handling",
        "documentation": "Good with examples"
    }
}


@app.route('/')
def index():
    """Render the index page."""
    return render_template(
        'index.html',
        framework_results=framework_results,
        framework_descriptions=framework_descriptions,
        integration_comparison=integration_comparison
    )

@app.route('/zh')
def integration_guide_zh():
    """Render the Chinese integration guide."""
    return render_template('mcp_integration_zh.html')


@app.route('/run/<framework>', methods=['POST'])
def run_framework(framework):
    """
    Run a framework example.
    
    Args:
        framework: Framework name
        
    Returns:
        JSON response with the result
    """
    if framework not in framework_results:
        return jsonify({"error": f"Unknown framework: {framework}"}), 400
    
    # Capture stdout to get the output
    import io
    import contextlib
    
    output = io.StringIO()
    
    try:
        with contextlib.redirect_stdout(output):
            start_time = time.time()
            
            if framework == "llama_index":
                run_llama_index_example()
            elif framework == "langchain":
                run_mcp_examples()
            elif framework == "smolagents":
                run_smolagents_example()
            elif framework == "autogen":
                run_autogen_example()
            
            end_time = time.time()
        
        # Update framework results
        framework_results[framework] = {
            "status": "Success",
            "output": output.getvalue(),
            "time": end_time - start_time
        }
        
        return jsonify(framework_results[framework])
    except Exception as e:
        logger.exception(f"Error running {framework} example")
        
        # Update framework results
        framework_results[framework] = {
            "status": "Error",
            "output": f"Error: {str(e)}\n\n{output.getvalue()}",
            "time": 0
        }
        
        return jsonify(framework_results[framework]), 500


@app.route('/run/server_status', methods=['GET'])
def check_server_status():
    """
    Check if the MCP server is running.
    
    Returns:
        JSON response with server status
    """
    try:
        # Import MCP client here to ensure it's loaded after server initialization
        from mcp_server.tools import KnowledgeBaseTool
        
        # Try to use a simple MCP tool to verify server is running
        tool = KnowledgeBaseTool()
        tool.get_info(topic="test")
        
        return jsonify({
            "running": True
        })
    except Exception as e:
        logger.exception("Error checking MCP server status")
        return jsonify({
            "running": False,
            "error": str(e)
        })

@app.route('/compare', methods=['GET'])
def compare_frameworks():
    """
    Compare the frameworks.
    
    Returns:
        JSON response with the comparison
    """
    return jsonify({
        "framework_descriptions": framework_descriptions,
        "integration_comparison": integration_comparison,
        "framework_results": framework_results
    })


def main():
    """Run the web application."""
    app.run(host='0.0.0.0', port=5000, debug=True)


if __name__ == "__main__":
    main()