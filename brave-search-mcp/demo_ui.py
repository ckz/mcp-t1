"""
Demo UI for Brave Search MCP

This module implements a demo UI for the Brave Search MCP server and clients
using IPython widgets.
"""

from IPython.display import HTML, display
import ipywidgets as widgets
from langchain_client import run_langchain_demo
from autogen_client import run_autogen_demo

def create_demo_ui():
    """
    Create and display a demo UI for the Brave Search MCP server and clients.
    """
    # Create demo UI components
    demo_type = widgets.RadioButtons(
        options=['LangChain', 'AutoGen'],
        description='Demo Type:',
        disabled=False
    )

    query_input = widgets.Text(
        value='What are the latest developments in quantum computing?',
        placeholder='Enter your search query',
        description='Query:',
        disabled=False
    )

    run_button = widgets.Button(
        description='Run Demo',
        disabled=False,
        button_style='success',
        tooltip='Click to run the selected demo with your query'
    )

    output = widgets.Output()

    def on_button_click(b):
        """Button click handler."""
        with output:
            output.clear_output()
            print(f"Running {demo_type.value} demo with query: {query_input.value}")
            if demo_type.value == 'LangChain':
                result = run_langchain_demo(query_input.value)
                print(f"\nResult: {result}")
            else:
                run_autogen_demo(query_input.value)

    run_button.on_click(on_button_click)

    # Display the UI
    display(demo_type, query_input, run_button, output)

if __name__ == "__main__":
    create_demo_ui()