---
title: 'Sample: Building an agentic coding workflow'
question: 'Tell me about a time you worked on something with unclear requirements.'
competencies: ['ambiguity', 'ownership', 'technical-depth']
date: 2025-11-01
metrics:
  - label: 'specialised flows'
    value: '11'
featured: true
sample: true
---

This is an illustrative sample story with placeholder details. Replace it with your own.

## Situation

I wanted AI coding agents to work on real tasks without constant supervision, but there was no established way to coordinate several models safely.

## Task

Design a system that coordinates Claude, Gemini and Codex across discovery, planning, debugging, implementation, verification and audit.

## Action

I built a single-orchestrator setup with 11 specialised flows, quality gates, audit loops and guards for secrets, sandbox boundaries and risky actions.

## Result

Agents could resume context, avoid redundant work and make changes under machine-enforced checks.
