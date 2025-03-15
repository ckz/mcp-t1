# MCP Framework Comparison

This project demonstrates the integration of a Model Context Protocol (MCP) server with four popular AI frameworks:

1. **LlamaIndex** - A data framework for LLM applications to ingest, structure, and access private or domain-specific data
2. **LangChain** - A framework for developing applications powered by language models
3. **SmolaGents** (Hugging Face) - A lightweight agent framework for building AI agents
4. **AutoGen** (Microsoft) - A framework for building LLM applications with multiple agents

## Project Structure

```
mcp-framework-comparison/
├── README.md                     # Project documentation
├── requirements.txt              # Python dependencies
├── mcp_server/                   # Core MCP server implementation
│   ├── __init__.py
│   ├── server.py                 # Main MCP server code
│   ├── tools.py                  # Tool definitions
│   └── resources.py              # Resource definitions
├── examples/                     # Example implementations with each framework
│   ├── llama_index_integration/  # LlamaIndex integration example
│   ├── langchain_integration/    # LangChain integration example
│   ├── smolagents_integration/   # SmolaGents integration example
│   └── autogen_integration/      # AutoGen integration example
└── demo/                         # Demo applications
    ├── web_app.py                # Web interface for comparing frameworks
    └── templates/                # HTML templates for the web interface
```

## Core Functionality

The project implements a common MCP server that provides:

1. **Knowledge Base Tool** - Access to a structured knowledge base
2. **Data Analysis Tool** - Ability to analyze and visualize data
3. **Web Search Resource** - Access to web search results
4. **Document Processing** - Processing and extracting information from documents

Each framework integration demonstrates how to:
- Connect to the MCP server
- Use the provided tools and resources
- Handle responses and errors
- Implement framework-specific features

## Comparison Metrics

The project evaluates each framework on:
- Ease of integration with MCP
- Code complexity
- Performance
- Flexibility
- Error handling
- Documentation quality

## Getting Started

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Start the MCP server:
   ```
   python -m mcp_server.server
   ```

3. Run an example integration:
   ```
   python -m examples.llama_index_integration.main
   ```

4. Launch the comparison web app:
   ```
   python -m demo.web_app
   ```

## Requirements

- Python 3.9+
- Dependencies listed in requirements.txt