---
title: 'Sample: Making releases safe to roll back'
question: 'Tell me about a time something went wrong and what you changed afterwards.'
role: 'datum-tymex-platform-engineer'
competencies: ['failure', 'ownership']
date: 2023-05-01
metrics:
  - label: 'teams covered'
    value: '10+'
featured: false
sample: true
---

This is an illustrative sample story with placeholder details. Replace it with your own.

## Situation

Serverless releases for many global teams were hard to undo when something went wrong in production.

## Task

Make releases repeatable and make rollback a normal, rehearsed step.

## Action

I built CI/CD pipelines with AWS CodePipeline and used CloudFormation templates to standardise environments, release workflows and rollback readiness.

## Result

Teams released and rolled back the same way every time. Illustrative number: 10+ teams covered.
