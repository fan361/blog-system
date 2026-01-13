---
title: RAG 的八种实现模式：从基础到高级的检索增强生成
date: 2026-01-14
tag: AI
color: from-violet-500 to-purple-600
readTime: 8
---

RAG（Retrieval-Augmented Generation，检索增强生成）是当前 LLM 应用中最重要的技术之一。它通过检索外部知识来增强大模型的回答能力，解决了模型知识过时、幻觉等问题。

本文介绍 8 种常见的 RAG 实现模式，从简单到复杂，帮你选择最适合业务场景的方案。

<div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 20px 24px; border-radius: 12px; margin: 24px 0;">
  <p style="color: white; margin: 0; font-size: 15px;">💡 <strong>核心思想</strong>：RAG = 检索（Retrieval）+ 生成（Generation），先找到相关信息，再让 LLM 基于这些信息回答。</p>
</div>

## 1. Naive RAG（基础 RAG）

最简单的实现方式，也是入门首选。

**流程：**
1. 用户提问 → 向量化
2. 在向量库中检索 Top-K 相似文档
3. 将文档拼接到 Prompt 中
4. LLM 生成回答

<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
  <p style="margin: 0; color: #64748b; font-size: 14px;">
    <strong style="color: #334155;">适用场景：</strong>简单问答、文档检索、知识库查询<br>
    <strong style="color: #334155;">优点：</strong>实现简单，效果立竿见影<br>
    <strong style="color: #334155;">缺点：</strong>检索质量依赖 Embedding，无法处理复杂查询
  </p>
</div>

<iframe src="demos/naive-rag-flow.html" width="100%" height="750" style="border: none; border-radius: 12px; margin: 16px 0;"></iframe>

## 2. Query Rewriting（查询重写）

用户的原始问题往往不够精确，先让 LLM 重写查询，再去检索。

**流程：**
1. 用户提问 → LLM 重写为更精确的查询
2. 用重写后的查询检索
3. LLM 生成回答

```python
# 示例：查询重写
original_query = "苹果怎么样"
rewritten_query = llm.rewrite(original_query)
# -> "苹果公司 2024 年财报表现如何" 或 "苹果水果的营养价值"
```

## 3. HyDE（假设性文档嵌入）

让 LLM 先生成一个"假设性答案"，用这个答案去检索，而不是用问题本身。

**原理：** 问题和答案的语义空间不同，用"假设答案"检索往往能找到更相关的文档。

<div style="display: flex; gap: 12px; margin: 16px 0;">
  <div style="flex: 1; background: #fef3c7; border-radius: 8px; padding: 12px;">
    <p style="margin: 0; font-size: 13px; color: #92400e;"><strong>传统方式</strong><br>问题 → 检索</p>
  </div>
  <div style="flex: 1; background: #d1fae5; border-radius: 8px; padding: 12px;">
    <p style="margin: 0; font-size: 13px; color: #065f46;"><strong>HyDE</strong><br>问题 → 假设答案 → 检索</p>
  </div>
</div>

## 4. Multi-Query（多查询检索）

将一个问题拆分成多个子查询，分别检索后合并结果。

**流程：**
1. 用户提问 → LLM 生成 3-5 个相关子查询
2. 每个子查询独立检索
3. 合并去重所有检索结果
4. LLM 基于合并结果生成回答

```python
query = "比较 React 和 Vue 的优缺点"
sub_queries = [
    "React 框架的优点有哪些",
    "React 框架的缺点有哪些", 
    "Vue 框架的优点有哪些",
    "Vue 框架的缺点有哪些",
    "React 和 Vue 的性能对比"
]
```

## 5. Self-RAG（自反思 RAG）

让 LLM 自己判断：是否需要检索、检索结果是否相关、回答是否有依据。

**核心机制：**
- **Retrieve Token**：判断是否需要检索
- **Relevance Token**：判断检索结果是否相关
- **Support Token**：判断回答是否有文档支持
- **Critique Token**：评估回答质量

<div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
  <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>注意：</strong>Self-RAG 需要专门微调的模型，不能直接用通用 LLM 实现。</p>
</div>

## 6. Corrective RAG（纠错 RAG）

检索后先评估文档质量，对低质量结果进行补救。

**流程：**
1. 检索文档
2. 评估每个文档的相关性（Correct / Ambiguous / Incorrect）
3. 对于 Incorrect 的情况，触发 Web 搜索补充
4. 对于 Ambiguous 的情况，提取关键信息后重新检索
5. 综合所有信息生成回答

## 7. Graph RAG（图谱 RAG）

结合知识图谱进行检索，适合需要多跳推理的场景。

**优势：**
- 能处理实体关系查询（"张三的老板是谁的同学"）
- 支持多跳推理
- 结果可解释性强

<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
  <p style="margin: 0 0 8px 0; font-weight: bold; color: #166534;">Graph RAG 典型架构</p>
  <p style="margin: 0; color: #15803d; font-size: 14px;">
    文档 → 实体抽取 → 构建知识图谱 → 图检索 + 向量检索 → 融合结果 → LLM 生成
  </p>
</div>

## 8. Agentic RAG（智能体 RAG）

将 RAG 作为 Agent 的一个工具，由 Agent 自主决定何时检索、检索什么。

**特点：**
- RAG 只是 Agent 工具箱中的一个工具
- Agent 可以多轮检索、交叉验证
- 支持复杂的多步骤任务

```python
tools = [
    VectorSearchTool(),      # 向量检索
    WebSearchTool(),         # 网页搜索
    SQLQueryTool(),          # 数据库查询
    CalculatorTool(),        # 计算器
]

agent = Agent(llm=llm, tools=tools)
agent.run("分析我们公司上季度销售额下降的原因")
```

## 如何选择？

<div style="overflow-x: auto; margin: 20px 0;">
<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
  <thead>
    <tr style="background: #6366f1; color: white;">
      <th style="padding: 12px; text-align: left; border-radius: 8px 0 0 0;">模式</th>
      <th style="padding: 12px; text-align: left;">复杂度</th>
      <th style="padding: 12px; text-align: left;">适用场景</th>
      <th style="padding: 12px; text-align: left; border-radius: 0 8px 0 0;">推荐指数</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background: #f8fafc;">
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Naive RAG</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">⭐</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">简单问答、快速验证</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">入门首选</td>
    </tr>
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Query Rewriting</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">⭐⭐</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">用户查询模糊</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">性价比高</td>
    </tr>
    <tr style="background: #f8fafc;">
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">HyDE</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">⭐⭐</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">问答语义差距大</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">值得尝试</td>
    </tr>
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Multi-Query</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">⭐⭐</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">复杂/对比类问题</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">强烈推荐</td>
    </tr>
    <tr style="background: #f8fafc;">
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Self-RAG</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">⭐⭐⭐⭐</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">高质量要求</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">需要微调</td>
    </tr>
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Corrective RAG</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">⭐⭐⭐</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">知识库不完整</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">实用性强</td>
    </tr>
    <tr style="background: #f8fafc;">
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Graph RAG</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">⭐⭐⭐⭐</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">关系推理、多跳问答</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">特定场景</td>
    </tr>
    <tr>
      <td style="padding: 12px; border-radius: 0 0 8px 8px;">Agentic RAG</td>
      <td style="padding: 12px;">⭐⭐⭐⭐⭐</td>
      <td style="padding: 12px;">复杂任务、多工具协作</td>
      <td style="padding: 12px;">终极形态</td>
    </tr>
  </tbody>
</table>
</div>

## 总结

RAG 不是一种固定的技术，而是一个不断演进的范式。从最简单的 Naive RAG 到复杂的 Agentic RAG，核心目标都是：**让 LLM 能够利用外部知识，给出更准确、更可靠的回答**。

建议从 Naive RAG 开始，根据实际效果逐步引入 Query Rewriting、Multi-Query 等优化手段。如果业务场景复杂，再考虑 Graph RAG 或 Agentic RAG。
