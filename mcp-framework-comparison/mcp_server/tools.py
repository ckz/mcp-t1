"""
Tools implementation for the MCP server.

This module defines the tools that the MCP server provides to clients.
Each tool represents a specific capability that can be invoked by clients.
"""

import json
import logging
from typing import Any, Dict, List, Optional, Union
import pandas as pd
import numpy as np
from datetime import datetime

logger = logging.getLogger(__name__)

# Sample knowledge base for demonstration purposes
KNOWLEDGE_BASE = {
    "ai_frameworks": {
        "llama_index": {
            "description": "A data framework for LLM applications to ingest, structure, and access private or domain-specific data",
            "github": "https://github.com/jerryjliu/llama_index",
            "key_features": ["Data connectors", "Data indexing", "Query engine", "Vector stores"],
            "use_cases": ["RAG applications", "Knowledge bases", "Chatbots", "Document Q&A"]
        },
        "langchain": {
            "description": "A framework for developing applications powered by language models",
            "github": "https://github.com/langchain-ai/langchain",
            "key_features": ["Chains", "Agents", "Memory", "Callbacks"],
            "use_cases": ["Document analysis", "Chatbots", "Data extraction", "Code generation"]
        },
        "smolagents": {
            "description": "A lightweight agent framework for building AI agents from Hugging Face",
            "github": "https://github.com/huggingface/smolagents",
            "key_features": ["Lightweight design", "Tool use", "Planning", "HF integration"],
            "use_cases": ["Simple agents", "Tool orchestration", "Task automation"]
        },
        "autogen": {
            "description": "A framework for building LLM applications with multiple agents from Microsoft",
            "github": "https://github.com/microsoft/autogen",
            "key_features": ["Multi-agent conversations", "Human-in-the-loop", "Tool use", "Memory"],
            "use_cases": ["Complex reasoning", "Code generation", "Research", "Problem solving"]
        }
    },
    "mcp": {
        "description": "Model Context Protocol (MCP) is a protocol for LLMs to access external tools and resources",
        "specification": "https://github.com/model-context-protocol/model-context-protocol",
        "components": ["Server", "Client", "Transport", "Tools", "Resources"],
        "benefits": ["Standardized interface", "Tool access", "Resource access", "Extensibility"]
    }
}

# Sample dataset for data analysis
def generate_sample_data() -> pd.DataFrame:
    """Generate a sample dataset for demonstration purposes."""
    np.random.seed(42)
    dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='D')
    
    data = {
        'date': dates,
        'temperature': np.random.normal(15, 5, len(dates)),
        'humidity': np.random.normal(60, 10, len(dates)),
        'wind_speed': np.random.normal(10, 3, len(dates)),
        'precipitation': np.random.exponential(1, len(dates)),
        'air_quality_index': np.random.randint(0, 300, len(dates))
    }
    
    return pd.DataFrame(data)

SAMPLE_DATA = generate_sample_data()

class KnowledgeBaseTool:
    """Tool for accessing the knowledge base."""
    
    @staticmethod
    def get_info(topic: str, subtopic: Optional[str] = None) -> Dict[str, Any]:
        """
        Get information from the knowledge base.
        
        Args:
            topic: The main topic to retrieve information about
            subtopic: Optional subtopic for more specific information
            
        Returns:
            Dictionary containing the requested information
        """
        if topic not in KNOWLEDGE_BASE:
            return {"error": f"Topic '{topic}' not found in knowledge base"}
        
        if subtopic and subtopic in KNOWLEDGE_BASE[topic]:
            return {subtopic: KNOWLEDGE_BASE[topic][subtopic]}
        
        return KNOWLEDGE_BASE[topic]
    
    @staticmethod
    def list_topics() -> List[str]:
        """
        List all available topics in the knowledge base.
        
        Returns:
            List of available topics
        """
        return list(KNOWLEDGE_BASE.keys())
    
    @staticmethod
    def search(query: str) -> Dict[str, Any]:
        """
        Search the knowledge base for a query.
        
        Args:
            query: The search query
            
        Returns:
            Dictionary containing search results
        """
        results = {}
        query = query.lower()
        
        def search_value(value: Any, query: str) -> bool:
            """Helper function to search through values recursively."""
            if isinstance(value, str):
                return query in value.lower()
            elif isinstance(value, list):
                return any(search_value(item, query) for item in value)
            elif isinstance(value, dict):
                return any(search_value(v, query) for v in value.values())
            return False
        
        for topic, topic_data in KNOWLEDGE_BASE.items():
            if isinstance(topic_data, dict):
                # For ai_frameworks, search through each framework
                if topic == "ai_frameworks":
                    matching_frameworks = {}
                    for framework, framework_data in topic_data.items():
                        # Check framework name
                        if query in framework.lower():
                            matching_frameworks[framework] = framework_data
                            continue
                            
                        # Check framework data
                        if search_value(framework_data, query):
                            matching_frameworks[framework] = framework_data
                    
                    if matching_frameworks:
                        results["ai_frameworks"] = matching_frameworks
                else:
                    # For other topics, check if any value matches
                    if search_value(topic_data, query):
                        results[topic] = topic_data
        
        return results


class DataAnalysisTool:
    """Tool for analyzing and visualizing data."""
    
    @staticmethod
    def get_summary_statistics(column: Optional[str] = None) -> Dict[str, Any]:
        """
        Get summary statistics for the dataset.
        
        Args:
            column: Optional column name to get statistics for
            
        Returns:
            Dictionary containing summary statistics
        """
        if column and column not in SAMPLE_DATA.columns:
            return {"error": f"Column '{column}' not found in dataset"}
        
        if column:
            return {
                "count": int(SAMPLE_DATA[column].count()),
                "mean": float(SAMPLE_DATA[column].mean()),
                "std": float(SAMPLE_DATA[column].std()),
                "min": float(SAMPLE_DATA[column].min()),
                "25%": float(SAMPLE_DATA[column].quantile(0.25)),
                "50%": float(SAMPLE_DATA[column].quantile(0.5)),
                "75%": float(SAMPLE_DATA[column].quantile(0.75)),
                "max": float(SAMPLE_DATA[column].max())
            }
        
        # Return summary for all numeric columns
        numeric_cols = SAMPLE_DATA.select_dtypes(include=['number']).columns
        result = {}
        
        for col in numeric_cols:
            result[col] = {
                "count": int(SAMPLE_DATA[col].count()),
                "mean": float(SAMPLE_DATA[col].mean()),
                "std": float(SAMPLE_DATA[col].std()),
                "min": float(SAMPLE_DATA[col].min()),
                "max": float(SAMPLE_DATA[col].max())
            }
            
        return result
    
    @staticmethod
    def filter_data(column: str, operator: str, value: Union[str, int, float]) -> Dict[str, Any]:
        """
        Filter the dataset based on a condition.
        
        Args:
            column: Column name to filter on
            operator: Comparison operator ('eq', 'gt', 'lt', 'gte', 'lte', 'contains')
            value: Value to compare against
            
        Returns:
            Dictionary containing filtered data statistics
        """
        if column not in SAMPLE_DATA.columns:
            return {"error": f"Column '{column}' not found in dataset"}
        
        operators = {
            "eq": lambda x, y: x == y,
            "gt": lambda x, y: x > y,
            "lt": lambda x, y: x < y,
            "gte": lambda x, y: x >= y,
            "lte": lambda x, y: x <= y,
            "contains": lambda x, y: y in str(x)
        }
        
        if operator not in operators:
            return {"error": f"Operator '{operator}' not supported"}
        
        try:
            filtered_data = SAMPLE_DATA[operators[operator](SAMPLE_DATA[column], value)]
            
            return {
                "count": len(filtered_data),
                "columns": list(filtered_data.columns),
                "sample": filtered_data.head(5).to_dict(orient="records"),
                "summary": {
                    col: {
                        "mean": float(filtered_data[col].mean()) if pd.api.types.is_numeric_dtype(filtered_data[col]) else None,
                        "min": float(filtered_data[col].min()) if pd.api.types.is_numeric_dtype(filtered_data[col]) else None,
                        "max": float(filtered_data[col].max()) if pd.api.types.is_numeric_dtype(filtered_data[col]) else None
                    } for col in filtered_data.select_dtypes(include=['number']).columns
                }
            }
        except Exception as e:
            return {"error": f"Error filtering data: {str(e)}"}
    
    @staticmethod
    def get_correlation(column1: str, column2: str) -> Dict[str, Any]:
        """
        Calculate correlation between two columns.
        
        Args:
            column1: First column name
            column2: Second column name
            
        Returns:
            Dictionary containing correlation information
        """
        if column1 not in SAMPLE_DATA.columns:
            return {"error": f"Column '{column1}' not found in dataset"}
        
        if column2 not in SAMPLE_DATA.columns:
            return {"error": f"Column '{column2}' not found in dataset"}
        
        try:
            correlation = SAMPLE_DATA[column1].corr(SAMPLE_DATA[column2])
            
            return {
                "correlation": float(correlation),
                "interpretation": interpret_correlation(correlation)
            }
        except Exception as e:
            return {"error": f"Error calculating correlation: {str(e)}"}


class DocumentProcessingTool:
    """Tool for processing and extracting information from documents."""
    
    @staticmethod
    def extract_entities(text: str) -> Dict[str, Any]:
        """
        Extract entities from text.
        
        Args:
            text: The text to extract entities from
            
        Returns:
            Dictionary containing extracted entities
        """
        # This is a simplified implementation for demonstration purposes
        entities = {
            "people": [],
            "organizations": [],
            "locations": [],
            "dates": [],
            "misc": []
        }
        
        # Simple pattern matching for demonstration
        words = text.split()
        
        for word in words:
            word = word.strip(".,!?():;\"'")
            
            # Check for capitalized words (potential named entities)
            if word and word[0].isupper() and len(word) > 1:
                if word in ["January", "February", "March", "April", "May", "June", 
                           "July", "August", "September", "October", "November", "December"]:
                    entities["dates"].append(word)
                elif word in ["Microsoft", "Google", "Apple", "Amazon", "Facebook", "OpenAI", "Anthropic"]:
                    entities["organizations"].append(word)
                elif word in ["USA", "UK", "China", "India", "Russia", "Germany", "France", "Japan"]:
                    entities["locations"].append(word)
                else:
                    # Simple heuristic: words ending with common name suffixes
                    if any(word.endswith(suffix) for suffix in ["son", "man", "berg", "ton"]):
                        entities["people"].append(word)
                    else:
                        entities["misc"].append(word)
        
        # Remove duplicates
        for category in entities:
            entities[category] = list(set(entities[category]))
            
        return entities
    
    @staticmethod
    def summarize(text: str, max_length: int = 100) -> Dict[str, Any]:
        """
        Generate a summary of the text.
        
        Args:
            text: The text to summarize
            max_length: Maximum length of the summary
            
        Returns:
            Dictionary containing the summary
        """
        # This is a simplified implementation for demonstration purposes
        words = text.split()
        
        if len(words) <= max_length:
            return {"summary": text}
        
        # Extract first and last sentences as a simple summary
        sentences = text.split('.')
        if len(sentences) >= 3:
            summary = f"{sentences[0].strip()}. {sentences[1].strip()}."
        else:
            # Just take the first few words
            summary = ' '.join(words[:max_length]) + "..."
            
        return {"summary": summary}
    
    @staticmethod
    def extract_keywords(text: str, max_keywords: int = 5) -> Dict[str, Any]:
        """
        Extract keywords from text.
        
        Args:
            text: The text to extract keywords from
            max_keywords: Maximum number of keywords to extract
            
        Returns:
            Dictionary containing extracted keywords
        """
        # This is a simplified implementation for demonstration purposes
        common_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "about", "as"}
        words = text.lower().split()
        
        # Remove punctuation
        words = [word.strip(".,!?():;\"'") for word in words]
        
        # Filter out common words and short words
        filtered_words = [word for word in words if word not in common_words and len(word) > 3]
        
        # Count word frequencies
        word_counts = {}
        for word in filtered_words:
            if word in word_counts:
                word_counts[word] += 1
            else:
                word_counts[word] = 1
        
        # Sort by frequency
        sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
        
        # Return top keywords
        keywords = sorted_words[:max_keywords]
        
        return {
            "keywords": [{"word": word, "frequency": freq} for word, freq in keywords]
        }


# Helper functions
def interpret_correlation(correlation: float) -> str:
    """Interpret a correlation coefficient."""
    abs_corr = abs(correlation)
    
    if abs_corr < 0.1:
        strength = "negligible"
    elif abs_corr < 0.3:
        strength = "weak"
    elif abs_corr < 0.5:
        strength = "moderate"
    elif abs_corr < 0.7:
        strength = "strong"
    else:
        strength = "very strong"
        
    direction = "positive" if correlation >= 0 else "negative"
    
    return f"A {strength} {direction} correlation"