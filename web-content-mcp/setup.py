from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="web-content-mcp",
    version="0.1.0",
    author="Your Name",
    author_email="your.email@example.com",
    description="A package for fetching and processing web content using MCP",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/web-content-mcp",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.10",
    install_requires=[
        "requests",
        "python-dotenv",
        "flask",
        "autogen-ext",
        "autogen-agentchat",
        "autogen-core",
        "ipywidgets",
    ],
)