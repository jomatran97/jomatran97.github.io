export const competencies = {
  leadership: { en: 'Leadership', vi: 'Lãnh đạo' },
  ownership: { en: 'Ownership', vi: 'Làm chủ' },
  conflict: { en: 'Conflict', vi: 'Xử lý xung đột' },
  failure: { en: 'Failure', vi: 'Thất bại' },
  collaboration: { en: 'Collaboration', vi: 'Hợp tác' },
  influence: { en: 'Influence', vi: 'Ảnh hưởng' },
  delivery: { en: 'Delivery', vi: 'Bàn giao' },
  ambiguity: { en: 'Ambiguity', vi: 'Mơ hồ' },
  'customer-focus': { en: 'Customer focus', vi: 'Hướng đến khách hàng' },
  'technical-depth': { en: 'Technical depth', vi: 'Chiều sâu kỹ thuật' },
  mentoring: { en: 'Mentoring', vi: 'Kèm cặp' },
  prioritisation: { en: 'Prioritisation', vi: 'Ưu tiên' },
} as const;

export type Competency = keyof typeof competencies;
export const competencyKeys = Object.keys(competencies) as [Competency, ...Competency[]];
