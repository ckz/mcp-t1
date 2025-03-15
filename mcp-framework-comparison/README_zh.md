# MCP 框架比较

本项目展示了模型上下文协议（Model Context Protocol, MCP）服务器与四个流行的 AI 框架的集成：

1. **LlamaIndex** - 一个用于 LLM 应用程序的数据框架，用于摄取、结构化和访问私有或特定领域的数据
2. **LangChain** - 一个由语言模型驱动的应用程序开发框架
3. **SmolaGents**（Hugging Face）- 一个用于构建 AI 代理的轻量级代理框架
4. **AutoGen**（Microsoft）- 一个用于构建具有多个代理的 LLM 应用程序的框架

## 项目结构

```
mcp-framework-comparison/
├── README.md                     # 项目文档（英文）
├── README_zh.md                  # 项目文档（中文）
├── requirements.txt              # Python 依赖
├── mcp_server/                   # 核心 MCP 服务器实现
│   ├── __init__.py
│   ├── server.py                 # 主要 MCP 服务器代码
│   ├── tools.py                  # 工具定义
│   └── resources.py              # 资源定义
├── examples/                     # 各框架的示例实现
│   ├── llama_index_integration/  # LlamaIndex 集成示例
│   ├── langchain_integration/    # LangChain 集成示例
│   ├── smolagents_integration/   # SmolaGents 集成示例
│   └── autogen_integration/      # AutoGen 集成示例
└── demo/                         # 演示应用
    ├── web_app.py                # 用于比较框架的 Web 界面
    └── templates/                # Web 界面的 HTML 模板
```

## 核心功能

该项目实现了一个通用的 MCP 服务器，提供以下功能：

### 知识库工具
- 包含 AI 框架信息的结构化知识库
- 具有详细格式化的直接框架信息检索
- 嵌套数据结构的递归搜索
- 框架名称及其变体的查询匹配
- 信息包括描述、特性、用例和 GitHub 链接

### 数据分析工具
- 统计分析功能
- 生成汇总统计
- 具有多种运算符的数据过滤
- 相关性分析及解释
- 支持各种数据类型

### 文档处理
- 文档内容提取和索引
- 从文本中提取实体
- 文本摘要
- 关键词提取及频率分析
- 具有相关性评分的文档搜索

### Web 搜索资源
- 模拟 Web 搜索功能
- 包含标题、URL 和摘要的结构化搜索结果
- 特定框架的搜索结果
- 基于查询的结果过滤

## 框架集成

### LlamaIndex 集成
- 用于知识库和文档的自定义检索器
- 支持元数据的文档索引
- 基于内容匹配的相关性评分
- 与 LlamaIndex 的节点系统集成
- 支持直接检索和搜索

### LangChain 集成
- 用于访问 MCP 功能的自定义工具
- 与 LangChain 的代理系统集成
- 对话历史的内存管理
- 工具链接功能
- 错误处理和响应格式化

### SmolaGents 集成
- 轻量级工具包装器
- 直接函数调用接口
- 简单的规划功能
- 与 Hugging Face 生态系统集成
- 高效的工具编排

### AutoGen 集成
- 多代理对话支持
- 函数注册系统
- 人机交互功能
- 复杂推理工作流
- 代理委派模式

## 比较指标

项目对每个框架进行以下方面的评估：

| 框架      | 集成方式   | 代码复杂度 | 性能     | 灵活性   | 错误处理   | 文档     |
|-----------|------------|------------|----------|----------|------------|----------|
| LlamaIndex | 自定义检索器 | 中等     | 优秀     | 高       | 内置       | 全面     |
| LangChain  | 工具包装器 | 低        | 良好     | 高       | 工具级     | 详尽     |
| SmolaGents | 函数调用   | 低        | 良好     | 中等     | 基础       | 增长中   |
| AutoGen    | 多代理     | 中高      | 优秀     | 非常高   | 全面       | 良好     |

## 快速开始

1. 安装依赖：
   ```
   pip install -r requirements.txt
   ```

2. 运行 MCP 服务器：
   ```
   python3 run_server.py
   ```

3. 运行 Web 演示以比较所有框架集成：
   ```
   python3 demo/web_app.py
   ```
   这将在 http://localhost:5000 启动一个 Flask Web 服务器，您可以在此比较不同的框架集成。

4. 运行单个示例：
   ```
   # 运行 LlamaIndex 集成示例
   python3 examples/llama_index_integration/main.py
   
   # 运行 LangChain 集成示例
   python3 examples/langchain_integration/main.py
   
   # 运行 SmolaGents 集成示例
   python3 examples/smolagents_integration/main.py
   
   # 运行 AutoGen 集成示例
   python3 examples/autogen_integration/main.py
   ```

5. 按顺序运行所有示例：
   ```
   python3 run_all_examples.py
   ```

## 要求

- Python 3.9+
- requirements.txt 中列出的依赖项

## 最近更新

### 2025-03-15
- **改进 LlamaIndex 集成的 MCP 检索器**
  - 增强了具有递归值搜索的知识库搜索
  - 添加了具有更好格式化的直接框架信息检索
  - 改进了文档检索评分和预览格式化
  - 修复了 LlamaIndex 相关搜索的查询匹配

- **更新 SmolaGents MCP 集成**
  - 改进了查询字符串处理
  - 增强了文档搜索功能
  - 更好的工具编排

- **增强 LangChain 集成**
  - 添加了适当的内存配置
  - 改进了代理错误处理
  - 增强了工具响应格式化
  - 切换到工具工厂模式
  - 添加了更好的框架特定查询处理

- **修复错误并改进文档**
  - 更新了包依赖
  - 修复了导入路径
  - 解决了递归问题
  - 改进了错误处理
  - 增强了代码文档
  - 添加了中文文档

## 贡献

欢迎贡献！请随时提交 Pull Request。对于重大更改，请先开启一个 issue 来讨论您想要更改的内容。

## 许可证

本项目采用 MIT 许可证 - 有关详细信息，请参阅 LICENSE 文件。