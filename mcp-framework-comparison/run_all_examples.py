#!/usr/bin/env python3
"""
Script to run all framework examples.

This script runs all the framework integration examples sequentially.
"""

import logging
import os
import sys
import time

# Add the current directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import example modules
from examples.llama_index_integration.main import run_llama_index_example
from examples.langchain_integration.main import run_langchain_example
from examples.smolagents_integration.main import run_smolagents_example
from examples.autogen_integration.main import run_autogen_example

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)


def run_example(name, func):
    """
    Run an example and measure its execution time.
    
    Args:
        name: Example name
        func: Example function
    """
    logger.info(f"Running {name} example...")
    
    start_time = time.time()
    
    try:
        func()
        end_time = time.time()
        logger.info(f"{name} example completed in {end_time - start_time:.2f} seconds")
    except Exception as e:
        logger.exception(f"Error running {name} example")


def main():
    """Run all examples."""
    logger.info("Running all framework examples...")
    
    # Run LlamaIndex example
    run_example("LlamaIndex", run_llama_index_example)
    
    # Run LangChain example
    run_example("LangChain", run_langchain_example)
    
    # Run SmolaGents example
    run_example("SmolaGents", run_smolagents_example)
    
    # Run AutoGen example
    run_example("AutoGen", run_autogen_example)
    
    logger.info("All examples completed")


if __name__ == "__main__":
    main()