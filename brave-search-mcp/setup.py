from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="brave-search-mcp",
    version="0.1.0",
    author="",
    author_email="",
    description="A Model Context Protocol (MCP) server for Brave Search and clients",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=[
        "langchain",
        "langchain_openai",
        "autogen",
        "requests",
        "flask",
        "python-dotenv",
        "ipywidgets",
    ],
    entry_points={
        "console_scripts": [
            "brave-search-mcp=brave_search_mcp.main:main",
        ],
    },
)