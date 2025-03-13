import os
from typing import List, Dict, Any
from dotenv import load_dotenv
from llama_index.llms.openrouter import OpenRouter
from llama_index.core import Settings, VectorStoreIndex, Document
from llama_index.core.tools import FunctionTool, QueryEngineTool
from llama_index.core.agent import ReActAgent
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

# Load environment variables
load_dotenv()

# Get API key from environment
api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    raise ValueError("OPENROUTER_API_KEY environment variable is not set")

# Initialize the OpenRouter LLM
llm = OpenRouter(
    api_key=api_key,
    model="anthropic/claude-3-opus-20240229",  # You can change to another model that supports function calling
)

# Set up a local embedding model
embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

# Set the LLM and embedding model as the defaults for llama-index
Settings.llm = llm
Settings.embed_model = embed_model
Settings.chunk_size = 512

# Define some example functions that our agent can call
def search_weather(location: str) -> str:
    """
    Search for the current weather in a given location.
    
    Args:
        location: The city or location to get weather for
        
    Returns:
        A string describing the weather
    """
    # This is a mock function - in a real application, you would call a weather API
    return f"The weather in {location} is currently sunny with a temperature of 72°F."

# Create function tools from our functions
weather_tool = FunctionTool.from_defaults(fn=search_weather)

# Create some sample documents for our knowledge base
documents = [
    Document(text="Python is a high-level, interpreted programming language known for its readability and versatility. It was created by Guido van Rossum and first released in 1991."),
    Document(text="JavaScript is a programming language that is one of the core technologies of the World Wide Web. It was created by Brendan Eich in 1995 while he was working at Netscape Communications Corporation."),
    Document(text="Rust is a multi-paradigm, general-purpose programming language designed for performance and safety, especially safe concurrency. It was created at Mozilla Research by Graydon Hoare in 2010."),
    Document(text="TypeScript is a programming language developed and maintained by Microsoft. It is a strict syntactical superset of JavaScript and adds optional static typing to the language. It was designed by Anders Hejlsberg in 2012."),
]

# Create a vector index from our documents
index = VectorStoreIndex.from_documents(documents)

# Create a query engine from the index
query_engine = index.as_query_engine()

# Create a query engine tool
query_tool = QueryEngineTool.from_defaults(
    query_engine=query_engine,
    name="programming_language_kb",
    description="Useful for answering questions about programming languages like Python, JavaScript, Rust, and TypeScript.",
)

# Create a ReAct agent with our tools
agent = ReActAgent.from_tools(
    [weather_tool, query_tool],
    llm=llm,
    verbose=True,
)

def main():
    print("Welcome to the Advanced llama-index + OpenRouter Demo!")
    print("This demo shows how to combine function calling with document retrieval.")
    print("The agent can:")
    print("  - Answer questions about programming languages using a knowledge base")
    print("  - Get weather information for a location")
    print("\nYou can ask questions like:")
    print("  - When was Python created?")
    print("  - Who created JavaScript?")
    print("  - What's the weather in Tokyo?")
    print("  - Tell me about Rust programming language")
    print("\nType 'exit' to quit.")
    
    while True:
        user_input = input("\nEnter your question: ")
        if user_input.lower() == "exit":
            break
        
        # Get response from the agent
        response = agent.chat(user_input)
        print(f"\nAgent response: {response}")

if __name__ == "__main__":
    main()