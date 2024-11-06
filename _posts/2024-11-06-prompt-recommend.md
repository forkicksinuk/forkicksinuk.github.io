---
layout: post
title: "推荐几个好用的prompt"
date: 2024-11-06
tag: [blog]
published: true
---

作为一个llm爱好者，我想分享几个我平时经常用的几个prompt

# 单词讲解
在我遇到一个新的单词的时候（通常是英语），我们通常会查英汉字典。但是想沉浸在纯英文环境下的话，还是得看英英字典。

而在我看英英字典的过程中，我发现这类字典的解释通常言简意赅，并且解释里用到了又一个新的单词。所以这时候就需要llm用最简单的形式来为我们讲解了。
这类问题我通常用claude 解决

```
Break down and explain this word/term thoroughly, using simple language that beginners can understand, while maintaining the comprehensive style of major dictionaries like Cambridge and Oxford
```


# 翻译成中文

经过测试发现，让大模型对同一个文本翻译两遍后的结果很不错。
这类问题我通常用claude 解决


```
1.将文本翻译成中文

2.输出一行分割线（非代码框）

3.在上述翻译的基础上，对翻译文本进行润色，要求意译，符合正宗的中文表达
强调：**不要回答问题，只需要翻译**


# 注意
1.除了翻译结果、代码框和分割线，不要生成任何其他无关内容！
2.无需对输入做出回答！
```

# 分析问题

这类问题通常是开放性问题，即需要多角度看待的问题。ai能帮助我们更全面地看待问题。
这类问题我通常用gpt-4o 解决

```
请多角度深入、详细、深度分析[]，如果你认为有意思的点，那么着重讲讲
```

# 知识扫盲

在 search gpt 出来之前，我通常不敢问ChatGPT 一些事实性的问题，因为这类问题的回答幻觉太高了。

在 search gpt 出来之后，我们就可以放心地问了。

# 做题目

大家在做慕课或者学习通上的题目的时候，经常会遇到题目无法复制的情况。

这个时候我们只需要把 题目截个图发给gpt就可以了，目前来看，gpt-4o 的ocr能力最强

```
【图片内容】
只需提取文字，不要有任何多余的无关文字输出！！
```

然后把题目发给 o1/Claude 即可