---
title: 'Mẫu: Xây dựng workflow lập trình dùng agent'
question: 'Hãy kể về một lần bạn làm việc với yêu cầu chưa rõ ràng.'
competencies: ['ambiguity', 'ownership', 'technical-depth']
date: 2025-11-01
metrics:
  - label: 'flow chuyên biệt'
    value: '11'
featured: true
sample: true
---

Đây là câu chuyện mẫu mang tính minh họa với chi tiết giả định. Hãy thay bằng thông tin của bạn.

## Bối cảnh

Tôi muốn các AI coding agent làm việc trên các tác vụ thật mà không cần giám sát liên tục, nhưng chưa có cách nào được thiết lập sẵn để điều phối nhiều mô hình một cách an toàn.

## Nhiệm vụ

Thiết kế một hệ thống điều phối Claude, Gemini và Codex qua các bước khám phá, lập kế hoạch, gỡ lỗi, triển khai, kiểm chứng và audit.

## Hành động

Tôi xây dựng hệ thống dùng một orchestrator duy nhất với 11 flow chuyên biệt, các quality gate, vòng lặp audit và các guard cho secret, ranh giới sandbox và hành động rủi ro.

## Kết quả

Các agent có thể tiếp tục ngữ cảnh, tránh làm lại việc không cần thiết và thực hiện thay đổi dưới các kiểm tra do máy thực thi.
