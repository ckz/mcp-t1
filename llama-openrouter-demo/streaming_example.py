import os
import asyncio
from typing import List, Dict, Any
from dotenv import load_dotenv
from llama_index.llms.openrouter import OpenRouter
from llama_index.core import Settings
from llama_index.core.tools import FunctionTool
from llama_index.core.agent import ReActAgent

# Load environment variables
load_dotenv()

# Get API key from environment
api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    raise ValueError("OPENROUTER_API_KEY environment variable is not set")

# Define a simple function that our agent can call
def get_current_time() -> str:
    """
    Get the current time.
    
    Returns:
        A string with the current time
    """
    from datetime import datetime
    now = datetime.now()
    return f"The current time is {now.strftime('%H:%M:%S')} on {now.strftime('%Y-%m-%d')}"

# Create function tool from our function
time_tool = FunctionTool.from_defaults(fn=get_current_time)

# Initialize the OpenRouter LLM with streaming enabled
llm = OpenRouter(
    api_key=api_key,
    model="anthropic/claude-3-opus-20240229",  # You can change to another model that supports function calling
    streaming=True,
)

# Set the LLM as the default for llama-index
Settings.llm = llm
Settings.chunk_size = 512

# Create a ReAct agent with our tool
agent = ReActAgent.from_tools(
    [time_tool],
    llm=llm,
    verbose=True,
)

async def stream_response(response_generator):
    """Stream the response token by token."""
    async for token in response_generator:
        print(token, end="", flush=True)
    print()  # Print a newline at the end

async def main():
    print("Welcome to the Streaming llama-index + OpenRouter Demo!")
    print("This demo shows how to use streaming responses with OpenRouter.")
    print("The agent can call a function to get the current time.")
    print("\nYou can ask questions like:")
    print("  - What time is it now?")
    print("  - Can you tell me the current date and time?")
    print("\nType 'exit' to quit.")
    
    while True:
        user_input = input("\nEnter your question: ")
        if user_input.lower() == "exit":
            break
        
        print("\nAgent response: ", end="", flush=True)
        
        # Get streaming response from the agent
        response = await agent.astream_chat(user_input)
        
        # The StreamingAgentChatResponse doesn't support async for directly
        # We need to access its content property
        print(response.response, flush=True)

if __name__ == "__main__":
    asyncio.run(main())