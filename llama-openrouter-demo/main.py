import os
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

def calculate_mortgage(principal: float, interest_rate: float, years: int) -> str:
    """
    Calculate monthly mortgage payment.
    
    Args:
        principal: The loan amount in dollars
        interest_rate: Annual interest rate (as a percentage, e.g., 5.5 for 5.5%)
        years: Loan term in years
        
    Returns:
        A string with the monthly payment amount
    """
    monthly_rate = interest_rate / 100 / 12
    num_payments = years * 12
    monthly_payment = principal * (monthly_rate * (1 + monthly_rate) ** num_payments) / ((1 + monthly_rate) ** num_payments - 1)
    return f"For a ${principal:,.2f} loan with {interest_rate}% interest over {years} years, the monthly payment would be ${monthly_payment:,.2f}"

def get_stock_price(ticker: str) -> str:
    """
    Get the current stock price for a given ticker symbol.
    
    Args:
        ticker: The stock ticker symbol (e.g., AAPL for Apple)
        
    Returns:
        A string with the current stock price
    """
    # This is a mock function - in a real application, you would call a stock API
    mock_prices = {
        "AAPL": 182.63,
        "MSFT": 425.22,
        "GOOGL": 147.91,
        "AMZN": 178.75,
        "META": 485.58,
    }
    price = mock_prices.get(ticker.upper(), 100.00)
    return f"The current stock price for {ticker.upper()} is ${price:.2f}"

# Create function tools from our functions
weather_tool = FunctionTool.from_defaults(fn=search_weather)
mortgage_tool = FunctionTool.from_defaults(fn=calculate_mortgage)
stock_tool = FunctionTool.from_defaults(fn=get_stock_price)

# Initialize the OpenRouter LLM
# Using a model that supports function calling
llm = OpenRouter(
    api_key=api_key,
    model="anthropic/claude-3-opus-20240229",  # You can change to another model that supports function calling
)

# Set the LLM as the default for llama-index
Settings.llm = llm
Settings.chunk_size = 512

# Create a ReAct agent with our tools
agent = ReActAgent.from_tools(
    [weather_tool, mortgage_tool, stock_tool],
    llm=llm,
    verbose=True,
)

def main():
    print("Welcome to the llama-index + OpenRouter Function Calling Demo!")
    print("This demo shows how to use llama-index with OpenRouter to create a function calling agent.")
    print("The agent can call the following functions:")
    print("  - search_weather(location)")
    print("  - calculate_mortgage(principal, interest_rate, years)")
    print("  - get_stock_price(ticker)")
    print("\nYou can ask questions like:")
    print("  - What's the weather in San Francisco?")
    print("  - Calculate mortgage payment for a $500,000 loan at 4.5% for 30 years")
    print("  - What's the current stock price of AAPL?")
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