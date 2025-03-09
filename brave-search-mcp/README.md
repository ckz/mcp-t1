# Brave Search MCP Server and Client

This project implements a Model Context Protocol (MCP) server for Brave Search and clients that use this server to search the web and answer questions.

## Overview

The project consists of:

1. A Flask server that acts as an MCP server for Brave Search
2. A LangChain client that uses the MCP server
3. An AutoGen client that uses the MCP server
4. A demo UI for testing the clients

## Installation

### Option 1: Install from the directory

1. Clone this repository
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your API keys (you can copy `.env.example` and fill in your keys):

```bash
cp .env.example .env
```

Then edit the `.env` file to add your API keys:

```
BRAVE_SEARCH_API_KEY=your_brave_search_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### Option 2: Install as a package

You can also install the project as a package:

```bash
pip install -e .
```

## Usage

### Running the Server

To start the MCP server:

```bash
# Option 1: Using the run script
./run.py

# Option 2: Using the module
python -m brave_search_mcp.main

# Option 3: If installed as a package
brave-search-mcp
```

This will start the server on `http://127.0.0.1:8080` and run some tests to verify that it's working correctly.

### Using the LangChain Client

```python
# If installed as a package
from brave_search_mcp.langchain_client import run_langchain_demo

result = run_langchain_demo("What are the latest developments in quantum computing?")
print(result)
```

### Using the AutoGen Client

```python
# If installed as a package
from brave_search_mcp.autogen_client import run_autogen_demo

run_autogen_demo("What are the latest developments in quantum computing?")
```

### Using the Demo UI

In a Jupyter notebook or Google Colab:

```python
# If installed as a package
from brave_search_mcp.demo_ui import create_demo_ui

create_demo_ui()
```

## Google Colab Usage

This project includes a Jupyter notebook (`brave_search_demo.ipynb`) that can be used in Google Colab. The notebook includes all the code needed to run the server and clients in a single environment.

## Project Structure

```
brave-search-mcp/
├── brave_search_mcp/           # Package directory
│   ├── __init__.py             # Package initialization
│   ├── server.py               # Flask server implementation
│   ├── langchain_client.py     # LangChain client implementation
│   ├── autogen_client.py       # AutoGen client implementation
│   ├── demo_ui.py              # Demo UI implementation
│   └── main.py                 # Main script to run the server and tests
├── brave_search_demo.ipynb     # Jupyter notebook for Google Colab
├── run.py                      # Script to run the server
├── setup.py                    # Package setup script
├── requirements.txt            # Dependencies
├── .env.example                # Example environment file
├── .gitignore                  # Git ignore file
├── LICENSE                     # License file
└── README.md                   # This file
```

## Getting a Brave Search API Key

To use this project, you'll need a Brave Search API key:

1. Go to [https://brave.com/search/api/](https://brave.com/search/api/)
2. Sign up for an API key
3. Add the API key to your `.env` file

## License

This project is licensed under the MIT License - see the LICENSE file for details.