# Llama-Index with OpenRouter Function Calling Demo

This is a simple demo showing how to use llama-index with OpenRouter to create a function calling agent.

## Features

- Uses llama-index with OpenRouter for LLM access
- Implements a ReActAgent that can call functions based on user queries
- Includes example functions for weather lookup, mortgage calculation, and stock price checking

## Setup

1. Clone this repository
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Create a `.env` file based on the `.env.example` file:
   ```
   cp .env.example .env
   ```
4. Add your OpenRouter API key to the `.env` file:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```
   You can get an API key from [OpenRouter](https://openrouter.ai/)

## Usage

Run the demo with:

```
python main.py
```

You can ask questions like:
- "What's the weather in San Francisco?"
- "Calculate mortgage payment for a $500,000 loan at 4.5% for 30 years"
- "What's the current stock price of AAPL?"

## How It Works

1. The demo creates function tools from Python functions using llama-index's `FunctionTool`
2. It initializes an OpenRouter LLM client with a model that supports function calling
3. A ReActAgent is created with the tools and LLM
4. User queries are processed by the agent, which decides which functions to call based on the query

## Customization

You can modify the `main.py` file to:
- Add your own functions
- Change the OpenRouter model
- Adjust the agent's behavior

## Notes

- The example functions are mocks - in a real application, you would call actual APIs
- Make sure to use an OpenRouter model that supports function calling