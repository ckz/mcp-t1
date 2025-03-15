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

2. Run the web demo to compare all framework integrations:
   ```
   python3 demo/web_app.py
   ```
   This will start a Flask web server at http://localhost:5000 where you can compare the different framework integrations.

3. Alternatively, run individual examples:
   ```
   # Run the LlamaIndex integration example
   python3 examples/llama_index_integration/main.py
   
   # Run the LangChain integration example
   python3 examples/langchain_integration/main.py
   
   # Run the SmolaGents integration example
   python3 examples/smolagents_integration/main.py
   
   # Run the AutoGen integration example
   python3 examples/autogen_integration/main.py
   ```

4. Run all examples sequentially:
   ```
   python3 run_all_examples.py
   ```

## Known Issues

- The MCP server implementation has compatibility issues with the latest version of the MCP package, resulting in the following error:
  ```
  ImportError: cannot import name 'StdioServerTransport' from 'mcp.server.stdio'
  ```
  This is likely due to API changes in the MCP package. A potential fix would be to update the import statements in `mcp_server/server.py` to match the current MCP package API.

- As a workaround, the examples are designed to simulate MCP functionality without requiring a separate MCP server process.

## Requirements

- Python 3.9+
- Dependencies listed in requirements.txt

## Changelog

### 2025-03-15
- **Update SmolaGents MCP integration example and consolidate gitignore files**
  - Improved SmolaGents integration by converting query strings to lowercase for better matching
  - Consolidated gitignore files for better project organization
  - Enhanced document search functionality in the chain tools example

- **Fix memory configuration in LangChain example**
  - Added input_key parameter to ConversationBufferMemory for proper memory handling

- **Fix LangChain agent initialization to handle parsing errors**
  - Added handle_parsing_errors=True to agent initialization to improve error handling

- **Fix bugs in MCP framework comparison project**
  - Fixed package name in requirements.txt from 'modelcontextprotocol' to 'mcp'
  - Updated import paths in server.py to use the correct package name
  - Fixed duplicate function definition in llama_index_integration/main.py
  - Corrected syntax errors in langchain_integration/main.py
  - Resolved recursion issues in autogen_integration/main.py
  - Fixed syntax error in resources.py by replacing multiline string
  - Added required '_call' method to MockLLM class in langchain_integration/main.py
  - Fixed Pydantic field issues in tool classes

- **Initial project creation**
  - Added MCP framework comparison project with LlamaIndex, LangChain, SmolaGents, and AutoGen integrations