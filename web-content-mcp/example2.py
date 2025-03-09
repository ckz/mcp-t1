import asyncio
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination
from autogen_core import CancellationToken
from autogen_ext.tools.mcp import StdioServerParams, mcp_server_tools
from autogen_agentchat.ui import Console
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

async def main():
    # Setup the MCP fetch server parameters
    fetch_mcp_server = StdioServerParams(command="node", args=["./build/index.js"])
    
    # Get the fetch tool from the MCP server
    tools = await mcp_server_tools(fetch_mcp_server)
    
    # Create fetch agent with the MCP fetch tool
    fetch_agent = AssistantAgent(
        name="content_fetcher",
        model_client=OpenAIChatCompletionClient(model="gpt-4o"),
        tools=tools,
        system_message="你是一个网页内容获取助手。使用fetch工具获取网页内容。"
    )
    
    # Create rewriter Agent
    rewriter_agent = AssistantAgent(
        name="content_rewriter",
        model_client=OpenAIChatCompletionClient(model="gpt-4o"),
        system_message="""你是一个内容改写专家。将提供给你的网页内容改写为科技资讯风格的文章。
        科技资讯风格特点：
        1. 标题简洁醒目
        2. 开头直接点明主题
        3. 内容客观准确但生动有趣
        4. 使用专业术语但解释清晰
        5. 段落简短，重点突出
        
        当你完成改写后，回复TERMINATE。"""
    )
    
    # Set up termination condition and team
    termination = TextMentionTermination("TERMINATE")
    team = RoundRobinGroupChat([fetch_agent, rewriter_agent], termination_condition=termination)
    
    task = "获取https://www.aivi.fyi/llms/introduce-Claude-3.7-Sonnet的内容，然后将其改写为科技资讯风格的文章"
    
    # 显示对话过程
    stream = team.run_stream(task=task, cancellation_token=CancellationToken())
    await Console(stream)
    
    # 获取最终结果（使用单独的run调用）
    result = await team.run(task=task, cancellation_token=CancellationToken())
    
    print("\n最终改写结果：\n")
    print(result.messages[-1].content)
    
    return result

# 在Python脚本中运行异步代码的正确方式
if __name__ == "__main__":
    asyncio.run(main())