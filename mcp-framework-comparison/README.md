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
├── README_zh.md                  # Chinese documentation
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

### Knowledge Base Tool
- Structured knowledge base with information about AI frameworks
- Direct framework information retrieval with detailed formatting
- Recursive search through nested data structures
- Query matching for framework names and variations
- Information includes descriptions, features, use cases, and GitHub links

### Data Analysis Tool
- Statistical analysis capabilities
- Summary statistics generation
- Data filtering with multiple operators
- Correlation analysis with interpretation
- Support for various data types

### Document Processing
- Document content extraction and indexing
- Entity extraction from text
- Text summarization
- Keyword extraction with frequency analysis
- Document search with relevance scoring

### Web Search Resource
- Mock web search functionality
- Structured search results with titles, URLs, and snippets
- Framework-specific search results
- Query-based result filtering

## Framework Integrations

### LlamaIndex Integration
- Custom retrievers for knowledge base and documents
- Document indexing with metadata support
- Relevance scoring based on content matching
- Integration with LlamaIndex's node system
- Support for both direct retrieval and search

### LangChain Integration
- Custom tools for accessing MCP functionality
- Integration with LangChain's agent system
- Memory management for conversation history
- Tool chaining capabilities
- Error handling and response formatting

### SmolaGents Integration
- Lightweight tool wrappers
- Direct function calling interface
- Simple planning capabilities
- Integration with Hugging Face ecosystem
- Efficient tool orchestration

### AutoGen Integration
- Multi-agent conversation support
- Function registration system
- Human-in-the-loop capabilities
- Complex reasoning workflows
- Agent delegation patterns

## Comparison Metrics

The project evaluates each framework on:

| Framework  | Integration Approach | Code Complexity | Performance | Flexibility | Error Handling | Documentation |
|------------|---------------------|-----------------|-------------|-------------|----------------|---------------|
| LlamaIndex | Custom retrievers   | Medium         | Excellent   | High        | Built-in      | Comprehensive |
| LangChain  | Tool wrappers      | Low            | Good        | High        | Tool-level    | Extensive     |
| SmolaGents | Function calls     | Low            | Good        | Medium      | Basic         | Growing       |
| AutoGen    | Multi-agent        | Medium-High    | Excellent   | Very High   | Comprehensive | Good          |

## Getting Started

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the MCP server:
   ```
   python3 run_server.py
   ```

3. Run the web demo to compare all framework integrations:
   ```
   python3 demo/web_app.py
   ```
   This will start a Flask web server at http://localhost:5000 where you can compare the different framework integrations.

4. Run individual examples:
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

5. Run all examples sequentially:
   ```
   python3 run_all_examples.py
   ```

## Requirements

- Python 3.9+
- Dependencies listed in requirements.txt

## Recent Updates

### 2025-03-15
- **Improve MCP retrievers for LlamaIndex integration**
  - Enhanced knowledge base search with recursive value searching
  - Added direct framework info retrieval with better formatting
  - Improved document retrieval scoring and preview formatting
  - Fixed query matching for LlamaIndex-related searches

- **Update SmolaGents MCP integration**
  - Improved query string handling
  - Enhanced document search functionality
  - Better tool orchestration

- **Enhance LangChain integration**
  - Added proper memory configuration
  - Improved agent error handling
  - Enhanced tool response formatting
  - Switched to Tool factory pattern
  - Added better framework-specific query handling

- **Fix bugs and improve documentation**
  - Updated package dependencies
  - Fixed import paths
  - Resolved recursion issues
  - Improved error handling
  - Enhanced code documentation
  - Added Chinese documentation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE file for details.