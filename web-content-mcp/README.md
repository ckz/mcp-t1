# Web Content MCP

This project demonstrates how to use the Model Context Protocol (MCP) with AutoGen to create a workflow that:

1. Fetches web content from a URL
2. Rewrites the content in a tech news style
3. Optionally writes the rewritten content to a file

## Project Structure

- `web_content_mcp/server.py`: TypeScript implementation of the MCP server for fetching web content
- `example1.py`: Basic example of fetching and rewriting content
- `example2.py`: Example with UI console to display the conversation
- `example3.py`: Extended example that also writes the rewritten content to a file

## Setup

### Prerequisites

- Node.js and npm
- Python 3.10+
- OpenAI API key

### Installation

1. Clone the repository
2. Install the Node.js dependencies:
   ```
   npm install
   ```
3. Build the TypeScript MCP server:
   ```
   npm run build
   ```
4. Install the Python dependencies:
   ```
   pip install -r requirements.txt
   ```
5. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

### Example 1: Basic Fetch and Rewrite

```
python example1.py
```

This example fetches content from a URL and rewrites it in a tech news style.

### Example 2: With UI Console

```
python example2.py
```

This example adds a UI console to display the conversation between the agents.

### Example 3: With File Writing

```
python example3.py
```

This example adds a third agent that writes the rewritten content to a file.

## How It Works

The project uses AutoGen to create a team of agents that work together to accomplish a task:

1. The `content_fetcher` agent uses the MCP fetch tool to retrieve web content
2. The `content_rewriter` agent rewrites the content in a tech news style
3. (In Example 3) The `content_writer` agent writes the rewritten content to a file

The agents communicate with each other in a round-robin fashion, with each agent performing its specific task.

## MCP Servers

The project uses two MCP servers:

1. A custom MCP server for fetching web content (implemented in TypeScript)
2. The standard MCP filesystem server for writing files (used in Example 3)

## License

MIT