---
title: "SmartGuard"
subtitle: "LLM Input/Output Firewall"
tech: ["Python", "Streamlit"]
category: "Security"
date: 2025-05-01
summary: "Lightweight, CPU-friendly classifier that detects jailbreak attempts, PII extraction, toxic content, and prompt injection in LLM pipelines - with a real-time Streamlit dashboard."
---

SmartGuard is a firewall layer for LLM applications, designed to run without GPU infrastructure.

## What it does

- Classifies both inputs and outputs to catch jailbreak attempts, PII extraction requests, toxic content, and prompt injection patterns
- Configurable per-category thresholds to tune sensitivity without retraining
- Real-time Streamlit dashboard showing verdicts, accuracy, recall, and false positive rates

## Testing

Built a red-team suite of 45 curated prompts benchmarked against baseline keyword filters, with P95 inference latency tracked to keep the classifier production-realistic.
