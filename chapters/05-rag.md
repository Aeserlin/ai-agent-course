## 本章导读

模型的知识停留在训练数据截止的那一天，也不知道你公司的内部文档。RAG（Retrieval-Augmented Generation，检索增强生成）就是给模型外挂一个“可查询的资料库”。它不改变模型参数，只在回答前把相关资料塞进上下文。

这一章要解决的是“答得准、答得有依据”。很多团队第一次做 RAG，demo 很惊艳，上线就翻车：问“报销上限多少”，模型答了一个看起来很合理但完全错误的数字；问一个文档里没有的问题，模型硬编；同一个问题换个说法，答案完全变样。这些问题里，**八成出在检索，两成出在提示词，模型本身很少是主因**。

学完这一章，你应该能做到：完整实现“切分 → 向量化 → 检索 → 拼接生成 → 重排与评估”五步链路；根据文档类型选择切分参数；实现向量 + 关键词的混合检索与 RRF 融合；用 Recall@K 与 MRR 量化检索质量；并且能按症状定位常见失败模式。

五个最常见的误区：

1. **以为换个更强的模型就能解决答错**。检索没命中，再强的模型也只能编。
2. **chunk 越小越精确**。切到 100 字，语义不完整，检索出一堆碎片，模型拼不起来。
3. **只做向量检索**。型号、错误码、人名这类精确匹配，向量反而不如关键词。
4. **`top_k` 越大越好**。塞 20 条进上下文，噪声稀释关键信息，成本和延迟都上升。
5. **凭感觉判断“变好了”**。没有评估集，每次调参都是在赌。

<div class="callout plain"><span class="tag">大白话</span>
<p>RAG 就是<b>开卷考试</b>。</p>
<p>闭卷（纯模型）时，模型只能靠记忆答题，记不清就编。开卷（RAG）时，先翻书找到相关那几页（检索），再照着答（生成）。</p>
<p>所以 RAG 效果好不好，<b>关键不在模型，而在“翻书翻得准不准”</b>。书翻错了，学霸也会答错。</p>
</div>

## 教学路径

<div class="callout path"><span class="tag">教学路径</span>
<ol class="path-steps">
<li><b>第 1 步（10 分钟）：</b>理解 RAG 解决什么、不能解决什么。<b>产出：</b>能说出三类适合与三类不适合的场景。</li>
<li><b>第 2 步（20 分钟）：</b>实现文档切分，理解 chunk 大小与重叠的取舍。<b>产出：</b><code>split_text()</code> 与切分样例。</li>
<li><b>第 3 步（20 分钟）：</b>调用 Embedding 接口生成向量并持久化。<b>产出：</b><code>vectors.npy</code> + <code>chunks.jsonl</code>。</li>
<li><b>第 4 步（20 分钟）：</b>实现余弦相似度检索与 <code>top_k</code>。<b>产出：</b>能返回相关片段的 <code>retrieve()</code>。</li>
<li><b>第 5 步（20 分钟）：</b>把检索结果拼进提示词，要求引用编号。<b>产出：</b>带 <code>[1]</code> 引用的回答。</li>
<li><b>第 6 步（20 分钟）：</b>加入关键词检索与 RRF 融合，做混合检索。<b>产出：</b>混合检索对比数据。</li>
<li><b>第 7 步（15 分钟）：</b>加一步重排，缩小候选集。<b>产出：</b>召回 20 条、精排取 3 条的链路。</li>
<li><b>第 8 步（20 分钟）：</b>建评估集，计算 Recall@K 与 MRR。<b>产出：</b>评估报告。</li>
<li><b>第 9 步（15 分钟）：</b>按“常见失败模式”表做一次排查演练。<b>产出：</b>排查清单与修复记录。</li>
</ol>
</div>

## 学习前准备

| 能力 | 最低要求 | 不达标会怎样 |
|-|-|-|
| Python 基础 | 列表、字典、文件读写、`try/except` | 读不了 jsonl，索引无法落盘 |
| 向量基础 | 知道 embedding 是定长浮点数组 | 不理解为什么要归一化、为什么用点积 |
| 相似度 | 知道余弦相似度取值在 -1 到 1 | 看到 0.72 不知道算高还是低 |
| 文本处理 | 会用正则按段落切分 | 切分只会按固定字数硬切，句子被拦腰截断 |
| 评估意识 | 知道要留一批带标准答案的问题 | 调参全凭感觉，无法判断是否退化 |

工具与材料清单：

| 材料 | 版本或要求 | 用途 |
|-|-|-|
| Python | 3.11 及以上 | 本章代码基线 |
| openai | 1.0 及以上 | Chat 与 Embeddings 接口 |
| numpy | 1.24 及以上 | 向量运算与排序 |
| python-dotenv | 任意近期版本 | 读取 `.env` |
| 一份真实文档 | 建议 1 万字以上，含标题与段落 | 切分与检索效果才有代表性 |
| 20 条问答对 | 每条标注正确片段所在文档 | 计算 Recall@K 与 MRR |

自测题：

| 题目 | 参考答案要点 |
|-|-|
| 为什么检索前要把向量归一化 | 归一化后向量点积等于余弦相似度，省去除法，且不同长度文本可比 |
| Recall@K 和 MRR 分别衡量什么 | Recall@K 衡量“正确片段有没有进前 K”，MRR 衡量“正确片段排得有多靠前” |
| 什么情况下向量检索一定不如关键词检索 | 精确匹配场景，如错误码 `E1024`、型号 `XPS-13`、人名、合同编号 |

## 核心概念

### 一、RAG 到底在解决什么

RAG 不是“让模型变聪明”，而是“让模型在回答前拿到证据”。它的能力边界很清楚：能解决知识时效、私有知识、答案可追溯；不能解决推理能力不足、指令理解错误、文档本身自相矛盾。

| 问题 | 纯模型 | 加 RAG |
|-|-|-|
| 内部文档问答 | 不知道，容易编 | 能引用原文 |
| 最新政策 | 知识过期 | 可实时更新 |
| 答案可追溯 | 无法验证 | 能给出出处 |
| 推理能力 | 取决于模型 | 仍然取决于模型，RAG 不背这个锅 |
| 文档冲突 | 无感知 | 会同时检索到冲突内容，需要额外处理 |

完整链路分两段：**离线索引**（切分、向量化、存储）和**在线服务**（检索、重排、拼接生成）。离线慢一点没关系，在线每一毫秒都影响体验。

| 步骤 | 做什么 | 关键参数 | 在本项目里的影子 |
|-|-|-|-|
| 切分 | 把长文档切成语义完整的块 | `chunk_size`、`overlap` | `split_text()` |
| 向量化 | 把块转成定长向量 | embedding 模型、维度 | `text-embedding-3-small` |
| 检索 | 按相似度取候选 | `recall_k`、相似度阈值 | 余弦相似度 + `argsort` |
| 拼接生成 | 把候选塞进提示词并约束引用 | `top_k`、提示词模板 | `[1] [2]` 编号 |
| 重排评估 | 精排候选、量化效果 | rerank 模型、Recall@K、MRR | `evaluate()` |

<div class="callout plain"><span class="tag">大白话</span>
<p>RAG 像<b>图书馆管理员</b>：你问一个问题，他先去书架上找最相关的几页（检索），再把这几页递给你（上下文），最后你根据这几页回答（生成）。</p>
<p>如果管理员找错了书，你再聪明也只能答错。所以优化 RAG，先优化“找书”，再优化“答题”。</p>
</div>

### 二、切分策略与参数取舍

切分是 RAG 里最容易被低估的一步。切错了，后面所有环节都在为它买单：块太大，噪声多；块太小，语义断；边界切在句子中间，答案被劈成两半。

| 策略 | 做法 | 优点 | 缺点 | 适用 |
|-|-|-|-|-|
| 固定窗口 | 每 N 字符切一刀，重叠 M 字符 | 实现最简单 | 容易切断句子与表格 | 快速验证 |
| 按段落 | 以空行分段，再合并到阈值 | 语义完整 | 段落极长时仍需二次切 | 大部分文档 |
| 按标题 | 以 Markdown 标题为界 | 结构清晰、可带标题上下文 | 依赖文档规范 | 手册、规范、Wiki |
| 语义切分 | 按句子向量相似度找断点 | 边界最自然 | 成本高、实现复杂 | 高价值知识库 |
| 父子块 | 子块检索、父块生成 | 检索精确、上下文完整 | 存储与实现更复杂 | 长文档问答 |

参数的经验起点：

| 参数 | 建议起点 | 太小的后果 | 太大的后果 |
|-|-|-|-|
| `chunk_size` | 300 到 500 字 | 语义碎片化，检索到半句话 | 噪声稀释，关键句被淹没 |
| `overlap` | 50 到 80 字（约 10% 到 15%） | 边界信息丢失 | 重复内容多，浪费 Token |
| `top_k` | 3 到 5 条 | 证据不足，容易说“不知道” | 噪声多、成本高、注意力分散 |
| `recall_k` | 20 到 50 条 | 重排没有足够候选 | 重排成本高、延迟上升 |

一个重要细节：**重叠不是越大越好**。重叠 50% 时，索引体积翻倍，检索结果大量重复，`top_k` 取 5 条可能只有 2 条不同内容。经验上 10% 到 15% 足够覆盖边界。

<div class="callout plain"><span class="tag">大白话</span>
<p>切分就像<b>把一本厚书拆成卡片</b>。卡片太大，一张写三章，找起来费劲；卡片太小，一句话被拆成三张，读起来断片。</p>
<p>重叠就是让相邻卡片“搭一点边”，防止关键句正好落在切口上。但搭太多，每张卡片内容都差不多，等于白做。</p>
</div>

### 三、检索：向量、关键词与混合

向量检索擅长“意思像”，关键词检索擅长“字一样”。真实业务里两者都需要的场景非常多，比如“E1024 报错怎么解决”：向量可能召回一堆“报错处理”的泛泛内容，关键词能精准命中 `E1024`。

| 方式 | 原理 | 强项 | 弱项 | 在本项目里的影子 |
|-|-|-|-|-|
| 向量检索 | 余弦相似度 | 同义改写、跨语言 | 精确编号、罕见词 | `vecs @ q_vec` |
| 关键词检索 | 词频 / BM25 / 字符重合 | 型号、错误码、人名 | 同义改写 | 字符二元组重合度 |
| 混合检索 | 两路召回后融合 | 兼顾语义与精确 | 需要调融合权重 | RRF 融合 |
| 重排 | 用小模型精排候选 | 提升前 3 条精度 | 多一次调用、延迟增加 | 取前 20 再排 |

混合检索最常用的融合算法是 RRF（Reciprocal Rank Fusion），只看排名不看分数，避免两路分数量纲不一致：

`score(d) = Σ 1 / (k + rank_i(d))`，`k` 通常取 60。

它解决了什么问题？向量分数量级在 0.6 到 0.9，关键词分数可能是 0 到 15，直接加权平均会被关键词吞掉。RRF 把两者都转成“第几名”，天然可比。

<div class="callout plain"><span class="tag">大白话</span>
<p>向量检索像<b>问一个懂语义的朋友</b>：“有没有讲‘无限循环’的资料？”他能给你找来写“死循环”的页面。</p>
<p>关键词检索像<b>用目录查书</b>：你要 <code>E1024</code>，它就精确找 <code>E1024</code>。两个朋友一起问，再按“两边都推荐”的程度排序，就是混合检索。</p>
</div>

### 四、召回评估：Recall@K 与 MRR

没有评估的调参都是玄学。RAG 的检索质量有两个最实用的指标：

| 指标 | 定义 | 直觉解释 | 目标值 |
|-|-|-|-|
| Recall@K | 前 K 条里包含正确片段的题目占比 | “该找到的，找到了没有” | 20 条候选时 0.85 以上 |
| MRR | 正确片段排名倒数的平均值 | “正确的那条排得多靠前” | 0.6 以上算可用 |
| Hit Rate@K | 至少命中一条的题目占比 | 与 Recall@K 类似，多答案时更宽松 | 0.9 以上 |
| nDCG@K | 考虑排序位置与相关度分级 | 多相关文档时更公平 | 视业务而定 |
| 回答准确率 | 最终答案与标准答案一致的比例 | 端到端效果 | 0.8 以上 |

一个容易混淆的点：**Recall@K 高不代表回答好**。候选里有正确片段，但它排第 19 位，而 `top_k` 只取 3 条，生成时根本看不到。所以要看两个数：Recall@20（检索能力）和 MRR（排序能力）。

<div class="callout plain"><span class="tag">大白话</span>
<p>Recall@K 是<b>“书有没有借到”</b>，MRR 是<b>“借到的书是不是第一本就对”</b>。</p>
<p>只借到没用，你还得翻得到。两个指标一起看，才知道是该扩大检索范围，还是该加个重排。</p>
</div>

## 实操一：索引构建

目标：把一份长文档切成块、向量化、落盘，供在线检索复用。先给一个最小基线，理解重叠的作用：

```python
def split_window(text: str, chunk_size: int = 400, overlap: int = 60) -> list[str]:
    """基线版：按固定字符窗口切分，用它能最快跑通整条链路"""
    chunks, start = [], 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk.strip())
        start = end - overlap          # 下一块回退 overlap 个字符，形成重叠
    return chunks
```

它的缺点是容易把一句话从中间切断。下面的版本先按段落合并，超长段落再硬切，实际项目里更稳。

```python
import json
import os
import re

import numpy as np
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=os.getenv("OPENAI_BASE_URL"))
EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")

def split_text(text: str, chunk_size: int = 400, overlap: int = 60) -> list[str]:
    """按段落合并，超长段落再硬切；比纯固定窗口更少切断句子"""
    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks: list[str] = []
    buf = ""
    for p in paras:
        if len(buf) + len(p) + 1 <= chunk_size:
            buf = (buf + "\n" + p) if buf else p
        else:
            if buf:
                chunks.append(buf)
            if len(p) > chunk_size:                  # 段落本身超长，硬切并加重叠
                start = 0
                while start < len(p):
                    chunks.append(p[start:start + chunk_size])
                    start += chunk_size - overlap
                buf = ""
            else:
                buf = p
    if buf:
        chunks.append(buf)
    return chunks

def embed(texts: list[str]) -> np.ndarray:
    """批量 embedding，每批 64 条，避免单次请求过大"""
    vectors: list[list[float]] = []
    for i in range(0, len(texts), 64):
        resp = client.embeddings.create(model=EMBED_MODEL, input=texts[i:i + 64])
        vectors.extend([d.embedding for d in resp.data])
    return np.array(vectors, dtype=np.float32)

def build_index(docs: dict[str, str], out_dir: str = "index") -> None:
    os.makedirs(out_dir, exist_ok=True)
    records: list[dict] = []
    for doc_id, text in docs.items():
        for i, chunk in enumerate(split_text(text)):
            records.append({"doc_id": doc_id, "chunk_id": f"{doc_id}#{i}", "text": chunk})

    vecs = embed([r["text"] for r in records])
    # L2 归一化：检索时点积即余弦，省一次除法
    vecs = vecs / (np.linalg.norm(vecs, axis=1, keepdims=True) + 1e-9)
    np.save(os.path.join(out_dir, "vectors.npy"), vecs)
    with open(os.path.join(out_dir, "chunks.jsonl"), "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"索引完成：{len(records)} 个块，维度 {vecs.shape[1]}")

if __name__ == "__main__":
    docs = {
        "agent_guide": "Agent 需要设置最大步数。\n\n建议 6 到 10 步，超过应拆分任务。\n\n工具失败要返回结构化错误。",
        "rag_guide": "切分参数建议 300 到 500 字。\n\n重叠建议 50 到 80 字。\n\n先用小评估集验证再调参。",
    }
    build_index(docs)
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `re.split(r"\n\s*\n")` | 按空行分段 | 段落是天然的语义边界，比固定字数靠谱 |
| `buf` 合并 | 把小段落合并到接近阈值 | 避免出现大量只有一句话的碎片块 |
| `chunk_size - overlap` | 超长段落的重叠切分 | 防止关键句正好落在切口上 |
| 每批 64 条 | 控制单次请求大小 | 一次传几百条容易超限或超时 |
| L2 归一化 | 检索时点积即余弦 | 少一次除法，数值更稳定 |
| `chunk_id` | 唯一标识片段 | 评估时需要按 id 判断是否命中 |
| `jsonl` 落盘 | 与向量一一对应 | 行号顺序必须和 `vectors.npy` 一致，否则会错位 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>向量与文本顺序错位</b>：<code>chunks.jsonl</code> 用追加写、<code>vectors.npy</code> 用覆盖写，重建索引后就对不上。要么全量重建，要么带版本号。</li>
<li><b>切分后不过滤空块</b>：空块也会占用向量位置，检索时返回空内容，模型以为“资料就是这样”。</li>
<li><b>换 embedding 模型不重建索引</b>：不同模型维度可能相同但语义空间不同，必须全量重建。</li>
<li><b>用字符数当 Token 数</b>：中文、英文、代码折算比例不同，预算会偏差 30% 以上。</li>
</ul>
</div>

## 实操二：混合检索、重排与生成

目标：向量召回 20 条 + 关键词召回 20 条，用 RRF 融合，取前 3 条拼进提示词，并要求模型标注引用。

```python
import json
import os

import numpy as np
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=os.getenv("OPENAI_BASE_URL"))
EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")
MODEL = os.getenv("MODEL_NAME", "gpt-4o-mini")

def load_index(index_dir: str = "index"):
    vecs = np.load(os.path.join(index_dir, "vectors.npy"))
    with open(os.path.join(index_dir, "chunks.jsonl"), encoding="utf-8") as f:
        records = [json.loads(line) for line in f if line.strip()]
    return vecs, records

def embed_one(text: str) -> np.ndarray:
    resp = client.embeddings.create(model=EMBED_MODEL, input=[text])
    v = np.array(resp.data[0].embedding, dtype=np.float32)
    return v / (np.linalg.norm(v) + 1e-9)

def bigrams(s: str) -> set[str]:
    return {s[i:i + 2] for i in range(len(s) - 1)}

def keyword_scores(query: str, texts: list[str]) -> np.ndarray:
    """字符二元组重合度，中文无需分词，够用的关键词基线"""
    q = bigrams(query)
    return np.array([len(q & bigrams(t)) / (len(q) + 1e-9) for t in texts], dtype=np.float32)

def rrf(rank_lists: list[list[int]], k: int = 60) -> list[tuple[int, float]]:
    """Reciprocal Rank Fusion：只看排名，规避两路分数量纲不一致"""
    scores: dict[int, float] = {}
    for ranks in rank_lists:
        for pos, idx in enumerate(ranks, start=1):
            scores[idx] = scores.get(idx, 0.0) + 1.0 / (k + pos)
    return sorted(scores.items(), key=lambda x: -x[1])

def retrieve(query: str, vecs, records, top_k: int = 3,
             recall_k: int = 20, hybrid: bool = True) -> list[dict]:
    qv = embed_one(query)
    vec_rank = np.argsort(-(vecs @ qv))[:recall_k].tolist()
    rank_lists = [vec_rank]
    if hybrid:
        kw = keyword_scores(query, [r["text"] for r in records])
        rank_lists.append(np.argsort(-kw)[:recall_k].tolist())
    fused = rrf(rank_lists)
    return [{**records[i], "score": round(s, 6)} for i, s in fused[:top_k]]

def rag_answer(question: str, vecs, records) -> str:
    contexts = retrieve(question, vecs, records, top_k=3)
    if not contexts:
        return "资料中没有相关信息。"
    context_block = "\n".join(f"[{i + 1}] {c['text']}" for i, c in enumerate(contexts))
    prompt = f"""你是严谨的问答助手。只依据下面资料回答，不要编造。
若资料不足以回答，直接说“资料中没有相关信息”，不要推测。

资料：
{context_block}

问题：{question}

要求：句末标注引用编号，例如 [1]；不要引用未提供的资料。"""
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "只依据给定资料作答，禁止编造。"},
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
    )
    return resp.choices[0].message.content or ""

if __name__ == "__main__":
    vecs, records = load_index()
    print(rag_answer("Agent 的最大步数建议设多少？", vecs, records))
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `embed_one` 归一化 | 查询向量与库同尺度 | 库已归一化，查询不归一化会导致相似度失真 |
| `bigrams` | 中文关键词基线 | 不依赖分词库，错误码、型号也能命中字符 |
| 两路各取 20 | 保证重排候选量 | 只取 3 条再融合，混合检索几乎没有收益 |
| `rrf` 的 `k=60` | 平滑排名权重 | 排名靠前差距被放大，靠后差距被压缩，经验值 |
| `fused[:top_k]` | 控制进入上下文的量 | 3 到 5 条足够，多了反而稀释注意力 |
| 引用编号 | 可追溯 | 用户能核对，评估时也能定位问题 |
| “资料不足就说不知道” | 抑制幻觉 | 没有这句，模型倾向用常识补全 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>混合检索直接加权平均分数</b>：余弦 0.8 加关键词 12 分，关键词完全主导。用 RRF 或先归一化。</li>
<li><b>召回 3 条也做混合</b>：候选太少，融合没有意义。先召回 20 条再融合。</li>
<li><b>提示词允许“根据你的知识补充”</b>：这一句会让引用变成装饰，幻觉率明显上升。</li>
<li><b>不打印 context 就调提示词</b>：答错时先看检索结果，确认资料里到底有没有答案。</li>
</ul>
</div>

## 实操三：召回评估

目标：用 20 条带标准答案的问题，量化 Recall@K 与 MRR。数据可以先用小样本，关键是要有、要固定、要能回归。

```python
EVAL_SET = [
    {"q": "最大步数建议设多少", "gold": "agent_guide#0"},
    {"q": "工具失败怎么处理", "gold": "agent_guide#2"},
    {"q": "切分参数怎么选", "gold": "rag_guide#0"},
    {"q": "重叠多少合适", "gold": "rag_guide#1"},
]

def evaluate(eval_set: list[dict], retrieve_fn, k: int = 3) -> dict:
    hit, rr = 0, 0.0
    for item in eval_set:
        ids = [r["chunk_id"] for r in retrieve_fn(item["q"], top_k=k)]
        if item["gold"] in ids:
            hit += 1
            rr += 1.0 / (ids.index(item["gold"]) + 1)   # 排名从 1 开始
        else:
            print("未命中：", item["q"], "=>", ids)
    n = max(len(eval_set), 1)
    return {"k": k, "recall_at_k": round(hit / n, 3), "mrr": round(rr / n, 3)}

if __name__ == "__main__":
    vecs, records = load_index()
    for k in (3, 5, 20):
        print(evaluate(EVAL_SET, lambda q, top_k: retrieve(q, vecs, records, top_k=top_k), k=k))
    # 期望：k 增大时 Recall 上升，MRR 基本不变；若 MRR 很低，说明排序有问题，优先加重排
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `retrieve_fn` 作为参数 | 让评估与检索解耦 | 换检索策略时不用改评估代码，保证同一把尺子 |
| `ids.index(gold) + 1` | 取命中排名 | MRR 的排名从 1 开始，用 0 会算出大于 1 的错误分数 |
| `hit / n` | Recall@K | 只统计“有没有进前 K”，不关心排第几 |
| `rr / n` | MRR | 未命中的题目贡献 0，但分母仍是全部题目，不能只除以命中数 |
| `for k in (3, 5, 20)` | 分层观察 | 三个 K 一起看，才能区分“召回不足”和“排序靠后” |
| `print("未命中", ...)` | 可诊断 | 只给一个总分无法定位问题，必须打印问题与候选 id |

指标怎么读：

| 现象 | 含义 | 下一步 |
|-|-|-|
| Recall@20 低（低于 0.85） | 检索阶段就没找到 | 调切分、换 embedding、加关键词混合 |
| Recall@20 高但 MRR 低（低于 0.5） | 找到了但排得靠后 | 加重排、调 RRF 权重、缩小 chunk |
| Recall@3 高但回答准确率低 | 检索对，生成错 | 改提示词、减少噪声、要求引用 |
| 所有指标都低 | 评估集或标注有问题 | 先人工核对 gold 片段是否正确 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>用自己编的问题做评估</b>：措辞与文档高度重合，Recall 虚高，换成真实口语化提问立刻掉 20 个点。</li>
<li><b>gold 标到文档而不是片段</b>：一篇文档切出 40 个块，命中任意块就算对，指标失去区分度。</li>
<li><b>只测 Recall 不测延迟</b>：召回从 20 提到 200，Recall 涨 2 个点，P95 延迟翻倍，体验反而变差。</li>
<li><b>改完参数不重跑基线</b>：没有固定基线，无法判断变好还是变差，最后只能靠感觉。</li>
</ul>
</div>

<div class="callout tip"><span class="tag">老师建议</span>
<p>评估集要从<b>真实用户问题</b>里采样，不要自己编。自己编的问题往往和文档用词高度一致，Recall 虚高，上线就崩。</p>
<p>20 条就能看出方向性差异；想要稳定对比，至少 100 条，并且每次改动都跑同一套。</p>
</div>

## 综合案例：内部文档问答上线

场景：公司有 300 篇产品文档，客服需要一个能引用出处的问答助手。

输入：用户问题 + 文档库；流程：离线建索引 → 在线混合召回 20 条 → 重排取 3 条 → 生成带引用答案 → 记录未命中问题；输出：答案 + 引用编号 + 置信提示；失败处理：检索为空或分数过低时明确说“资料中没有”，并进入人工队列。

输出示例：

```json
{"answer": "标准报销上限为每晚 600 元 [1]。", "citations": ["travel_policy#2"], "handoff": false}
```

```python
MIN_SCORE = 0.015      # RRF 融合分数的经验阈值，需按语料校准

def answer_with_guard(question: str, vecs, records) -> dict:
    contexts = retrieve(question, vecs, records, top_k=3)
    if not contexts or contexts[0]["score"] < MIN_SCORE:
        return {"answer": "资料中没有相关信息，已转人工。", "citations": [], "handoff": True}
    answer = rag_answer(question, vecs, records)
    citations = [c["chunk_id"] for c in contexts]
    if "资料中没有相关信息" in answer:
        return {"answer": answer, "citations": [], "handoff": True}
    return {"answer": answer, "citations": citations, "handoff": False}

if __name__ == "__main__":
    vecs, records = load_index()
    print(answer_with_guard("退款多久到账？", vecs, records))
```

失败处理按症状分流：

| 症状 | 根因 | 处理 |
|-|-|-|
| 答“资料中没有”，但文档确实有 | 切分切断了答案，或 embedding 语义不匹配 | 调大 chunk、加关键词混合、检查 gold 片段 |
| 答案引用了错误文档 | 检索命中相似但无关内容 | 加重排、提高阈值、缩窄文档范围 |
| 答案正确但没有引用 | 提示词约束不够 | 要求句末必须标号，并在后处理校验 |
| 同一问题两次答案不同 | 温度过高或上下文顺序不稳定 | `temperature` 降到 0 到 0.2，固定候选排序 |
| 表格/数字答错 | 切分破坏表格结构 | 表格单独成块，保留表头；数字类问题走结构化查询 |
| 多文档冲突 | 检索同时召回新旧版本 | 加版本号与生效时间，检索时过滤过期文档 |
| 延迟超过 3 秒 | 候选过多、重排太重 | 召回降到 10 到 20，重排只对前 10 条做 |
| 成本过高 | 上下文过长、`top_k` 太大 | 截断单块长度、`top_k` 降到 3 到 5、缓存高频问题 |

## 常见失败模式

| 失败模式 | 典型表现 | 排查顺序 | 修复手段 |
|-|-|-|-|
| 检索未命中 | 回答“不知道”，但文档里有 | 打印 top 20，人工看正确片段排第几 | 调切分、换 embedding、加关键词 |
| 语义漂移 | 问 A 答 B，主题相关但答非所问 | 看 query 与 chunk 的相似度分布 | 加查询改写、加重排、缩窄范围 |
| 块边界断裂 | 答案前半句在上一块，后半句在下一块 | 检查 gold 片段是否被切开 | 加重叠、按标题切、父子块 |
| 噪声淹没 | 检索到大量泛泛内容 | 看 `top_k` 与前 3 条相关性 | 降 `top_k`、提高阈值、精排 |
| 幻觉 | 资料没有却给出具体数字 | 核对答案每句是否有引用支撑 | 强化“只依据资料”约束、引用校验 |
| 版本冲突 | 新旧制度同时被检索 | 检查文档元数据 | 加版本过滤、失效时间 |
| 表格失真 | 数字串行、表头丢失 | 检查切分后表格是否完整 | 表格单独处理、转结构化 |
| 评估虚高 | 离线 0.95，上线 0.6 | 检查评估集是否来自真实问题 | 重建评估集，加入长尾与口语化问法 |

<div class="callout plain"><span class="tag">大白话</span>
<p>RAG 排查有一条铁律：<b>先看检索，再看生成</b>。把模型回答遮住，只看检索到的 3 条资料，问自己“仅凭这 3 条，人能答对吗”。</p>
<p>人答不对，是检索问题；人能答对而模型答错，才是提示词或模型问题。顺序反了，会在提示词上浪费一整天。</p>
</div>

## 疑难点分级

| 知识点 | 难度 | 典型卡点 | 破解方式 |
|-|-|-|-|
| 切分策略 | 中 | 答案被切断在块边界 | 加重叠；按段落/标题优先切 |
| chunk 参数取舍 | 中 | 不知道 300 还是 800 | 从 400 + 60 起步，用评估集对比 |
| 向量相似度 | 中 | 数学公式看不懂 | 记住：归一化后点积越大越相似 |
| 归一化遗漏 | 中 | 查询没归一化导致分数异常 | 查询与库统一 L2 归一化 |
| 索引一致性 | 高 | 换模型后没重建 | 索引带模型名与版本号，强制重建 |
| 检索不准 | 高 | 答非所问 | 看 context；加关键词混合或重排 |
| 精确匹配 | 高 | 错误码、型号搜不到 | 混合检索，关键词召回兜底 |
| RRF 融合 | 高 | 两路分数量纲不同 | 只用排名融合，`k` 取 60 |
| 重排 | 中 | 加了重排反而更慢更差 | 只对前 10 到 20 条重排，先离线验证 |
| 幻觉 | 高 | 资料没有却硬答 | 提示词明确“资料不足就说不知道”，并校验引用 |
| 引用失效 | 中 | 编号对不上原文 | 拼接时固定编号，后处理校验引用范围 |
| 多文档冲突 | 高 | 新旧制度同时召回 | 元数据加版本与生效时间，检索时过滤 |
| 表格与图片 | 高 | 表格被切碎、图片无文本 | 表格结构化、图片走 OCR 或单独索引 |
| 评估集构建 | 高 | 自己编题导致虚高 | 采样真实问题，标注 gold 片段 |
| Recall 与 MRR 解读 | 高 | 不知道先修哪 | Recall 低修检索，MRR 低修排序 |
| 延迟优化 | 中 | 上线后 3 秒以上 | 减少候选、缓存、并行召回 |

## 常见面试题

| 问题 | 考察点 | 答题要点 |
|-|-|-|
| RAG 和微调怎么选 | 方案选型 | 知识频繁更新、需要引用，用 RAG；风格与能力内化、标注数据充足，用微调；两者可叠加 |
| RAG 的主要瓶颈在哪 | 系统认知 | 八成在检索。检索没命中，生成再强也只能编；先量化 Recall@K 再谈模型 |
| chunk 大小怎么定 | 参数经验 | 从 300 到 500 字、重叠 10% 到 15% 起步；用评估集对比，不要凭感觉 |
| 为什么需要重叠 | 切分原理 | 防止关键句落在切口；重叠过大会造成索引膨胀与重复召回，10% 到 15% 足够 |
| 向量检索的局限 | 检索原理 | 对精确编号、罕见词、否定语义不敏感；需要关键词混合兜底 |
| 混合检索怎么融合 | 工程细节 | 常用 RRF，`score = Σ 1/(k+rank)`，`k` 取 60；避免直接加权不同量纲的分数 |
| Recall@K 和 MRR 区别 | 评估 | Recall@K 看有没有进前 K，MRR 看排第几；前者低修召回，后者低修排序 |
| Recall@20 是 0.9 但回答差，为什么 | 指标联动 | 候选有但 `top_k` 只取 3，正确片段排第 15；应加重排或提高 `top_k` |
| 如何抑制 RAG 幻觉 | 生成约束 | 提示词限定“只依据资料”、要求引用、资料不足明确说不知道、后处理校验引用 |
| 表格和图片怎么处理 | 复杂文档 | 表格保留表头单独成块或转结构化；图片走 OCR/多模态描述后入索引 |
| 文档更新怎么办 | 运维 | 增量索引 + 文档版本号；删除旧版本向量；定时重建避免漂移 |
| 如何降低 RAG 延迟 | 性能 | 召回 10 到 20、重排只做前 10、缓存高频问题、并行两路召回、流式输出 |
| 多轮对话下 RAG 怎么做 | 查询改写 | 先把“它”“这个”改写成独立问题，再检索；否则查询缺主语，召回质量骤降 |
| 如何评估端到端效果 | 评估体系 | 检索指标（Recall/MRR）+ 生成指标（准确率、引用正确率、拒答率）+ 人工抽检 |

## 动手练习

<div class="callout task"><span class="tag">动手练习</span>
<ol>
<li>（低）把 <code>chunk_size</code> 改成 100 和 800，分别测同一批问题的命中率。</li>
<li>（低）加一个“无关问题”，验证模型是否会老老实实说“资料中没有相关信息”。</li>
<li>（低）把 <code>top_k</code> 从 2 调到 5，观察答案质量与 Token 消耗的变化。</li>
<li>（中）把 <code>overlap</code> 设为 0、60、200，对比 Recall@5 与索引块数。</li>
<li>（中）打印每次检索的 top 20，人工标注正确片段排第几，找出最差的三条问题。</li>
<li>（中）实现关键词检索并单独评估，找出向量检索漏掉但关键词能命中的问题。</li>
<li>（中）实现 RRF 融合，对比“纯向量”“纯关键词”“混合”三种 Recall@5。</li>
<li>（中）加入相似度阈值，低于阈值直接拒答，统计拒答率与误拒率。</li>
<li>（中）把提示词里的引用要求去掉，对比幻觉率与用户信任度（人工抽检 20 条）。</li>
<li>（高）实现父子块：子块检索、父块生成，对比答案完整度。</li>
<li>（高）实现查询改写：把多轮里的“它”补全成完整问题，再检索。</li>
<li>（高）加一步重排（可用小模型或规则），对比 MRR 与 P95 延迟。</li>
<li>（高）构建 50 条真实问题的评估集，跑出基线，再逐项调参并记录变化。</li>
<li>（高）设计文档更新方案：增量索引、版本过滤、删除旧向量，并说明一致性如何保证。</li>
</ol>
</div>

## 本章小结

- RAG = 检索 + 生成，本质是开卷考试；效果上限由“检索准不准”决定，模型只是第二位。
- 链路分两段：离线索引（切分、向量化、存储）与在线服务（检索、重排、拼接生成）。
- 切分从 300 到 500 字、重叠 10% 到 15% 起步，按段落或标题切优于纯固定窗口。
- 只做向量检索会漏掉错误码、型号等精确匹配，混合检索 + RRF 是性价比最高的增强。
- 先召回 20 条再精排取 3 到 5 条，比直接召回 3 条效果稳定得多。
- 评估看两个数：Recall@K 判断“找没找到”，MRR 判断“排得靠不靠前”；Recall 低修检索，MRR 低修排序。
- 抑制幻觉靠三件事：提示词限定“只依据资料”、强制引用、资料不足明确拒答。
- 排查永远先看检索上下文，再看生成；顺序反了会浪费大量时间。

下一章，我们让多个 Agent 分工协作，处理单个 Agent 搞不定的复杂任务。
