---
title: 深入理解 AI Agent 的六大执行模式
date: 2026-01-12
tag: AI
color: from-violet-500 via-purple-500 to-fuchsia-500
cover: images/posts/agent-patterns.svg
readTime: 12
---

AI Agent 正在重新定义人机交互的方式。本文将深入剖析 Agent 的六种核心执行模式，帮助你理解它们的工作原理和适用场景。

## 什么是 Agent？

Agent（智能体）是一个能够感知环境、做出决策并采取行动的自主系统。与传统的"输入-输出"模型不同，Agent 具备：

- **自主性**：能够独立完成复杂任务
- **规划能力**：将大任务分解为小步骤
- **工具使用**：调用外部 API、数据库等
- **记忆系统**：保持上下文和历史信息

## 六大执行模式

### 1. ReAct 模式（推理+行动）

ReAct 是最经典的 Agent 模式，交替进行"思考"和"行动"。

**执行流程：**
1. **Thought（思考）**：分析当前状态，决定下一步
2. **Action（行动）**：调用工具或执行操作
3. **Observation（观察）**：获取行动结果
4. 循环直到任务完成

```
用户：北京今天天气怎么样？

Thought: 我需要查询北京的天气信息
Action: call_weather_api("北京")
Observation: 晴，15°C，湿度 45%

Thought: 我已经获得了天气信息，可以回答用户
Answer: 北京今天天气晴朗，气温 15°C，湿度 45%
```

**适用场景**：需要多步推理的问答、信息检索任务

### 2. Plan-and-Execute 模式（规划执行）

先制定完整计划，再逐步执行。适合复杂的多步骤任务。

**执行流程：**
1. **Planning（规划）**：生成完整的任务计划
2. **Execution（执行）**：按顺序执行每个步骤
3. **Re-planning（重规划）**：根据执行结果调整计划

```
用户：帮我写一篇关于 Vue 4 的技术博客

Plan:
  1. 搜索 Vue 4 的新特性
  2. 整理核心变化点
  3. 编写代码示例
  4. 撰写文章结构
  5. 润色和优化

Execute Step 1: search("Vue 4 new features")
Execute Step 2: organize_notes(search_results)
...
```

**适用场景**：写作、项目开发、复杂分析任务

### 3. Self-Ask 模式（自问自答）

通过不断向自己提问来分解复杂问题。

**执行流程：**
1. 分析原始问题
2. 生成子问题
3. 回答子问题
4. 综合答案

```
用户：谁是现任美国总统的妻子的母校的创始人？

Follow-up: 谁是现任美国总统？
Answer: 乔·拜登

Follow-up: 乔·拜登的妻子是谁？
Answer: 吉尔·拜登

Follow-up: 吉尔·拜登的母校是哪里？
Answer: 特拉华大学

Follow-up: 特拉华大学的创始人是谁？
Answer: ...

Final Answer: ...
```

**适用场景**：多跳推理、知识图谱查询

### 4. Tool-Use 模式（工具调用）

Agent 作为"调度中心"，根据需求调用不同工具。

**核心组件：**
- **Tool Registry**：可用工具列表
- **Tool Selector**：选择合适的工具
- **Tool Executor**：执行工具调用
- **Result Parser**：解析返回结果

```
Available Tools:
  - calculator: 数学计算
  - search: 网络搜索
  - code_runner: 执行代码
  - image_gen: 生成图片

用户：计算 123 * 456 并画一个饼图

Step 1: calculator.compute("123 * 456") → 56088
Step 2: image_gen.pie_chart(data) → [图片]
```

**适用场景**：需要外部能力的任务（搜索、计算、代码执行）

### 5. Reflection 模式（反思优化）

Agent 对自己的输出进行评估和改进。

**执行流程：**
1. **Generate（生成）**：产出初始结果
2. **Critique（评估）**：分析结果的问题
3. **Revise（修正）**：根据反馈改进
4. 重复直到满意

```
Task: 写一段 Python 排序代码

Generation 1:
def sort(arr):
    return sorted(arr)

Critique: 代码过于简单，没有展示算法原理

Generation 2:
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

Critique: 好多了，但缺少注释和类型提示

Generation 3: [最终优化版本]
```

**适用场景**：代码生成、文章写作、创意任务

### 6. Multi-Agent 模式（多智能体协作）

多个专业化 Agent 协同工作，各司其职。

**常见架构：**
- **Supervisor（监督者）**：分配任务、协调工作
- **Worker Agents（工作者）**：执行具体任务
- **Critic Agent（评审者）**：质量把控

```
用户：开发一个待办事项应用

Supervisor: 分解任务并分配

→ Designer Agent: 设计 UI 界面
→ Frontend Agent: 编写前端代码  
→ Backend Agent: 开发后端 API
→ Tester Agent: 编写测试用例

Supervisor: 整合各部分，交付最终产品
```

**适用场景**：大型项目、需要多领域专业知识的任务

## 模式对比

| 模式 | 复杂度 | 适用场景 | 优点 | 缺点 |
|------|--------|----------|------|------|
| ReAct | 低 | 简单问答 | 直观、易实现 | 长任务易出错 |
| Plan-and-Execute | 中 | 多步骤任务 | 结构清晰 | 规划可能不准确 |
| Self-Ask | 中 | 复杂推理 | 逻辑清晰 | 子问题可能偏离 |
| Tool-Use | 中 | 需要外部能力 | 能力扩展性强 | 工具选择可能出错 |
| Reflection | 中 | 创作任务 | 输出质量高 | 耗时较长 |
| Multi-Agent | 高 | 大型项目 | 专业分工 | 协调成本高 |

## 如何选择？

1. **简单任务** → ReAct
2. **需要规划的复杂任务** → Plan-and-Execute
3. **多跳推理问题** → Self-Ask
4. **需要调用外部服务** → Tool-Use
5. **追求高质量输出** → Reflection
6. **大型协作项目** → Multi-Agent

## 实践建议

- **从简单开始**：先用 ReAct，遇到瓶颈再升级
- **组合使用**：实际项目中常常混合多种模式
- **关注可观测性**：记录每一步的决策过程，便于调试
- **设置边界**：限制最大步数，防止无限循环

## 总结

Agent 的执行模式决定了它如何思考和行动。理解这些模式，能帮助你：

- 为不同任务选择合适的架构
- 更好地调试和优化 Agent 行为
- 设计更强大的 AI 应用

未来，随着大模型能力的提升，Agent 将变得更加智能和自主。掌握这些基础模式，是构建下一代 AI 应用的关键。

---

*参考资料：ReAct 论文、LangChain 文档、AutoGPT 项目*
