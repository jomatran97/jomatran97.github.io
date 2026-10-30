import { z } from 'astro/zod';

/** Home skill card: descriptions are 1-2 sentences, at most 200 characters (spec §4.1.1). */
export const SKILL_DESCRIPTION_MAX = 200;

export const skillSchema = z.object({
  group: z.string(),
  order: z.number().int(),
  description: z.string().max(SKILL_DESCRIPTION_MAX),
  icon: z.string(),
  size: z.enum(['1x1', '2x1', '2x2']),
  tint: z.enum(['mint', 'sky', 'butter']),
  items: z.array(z.object({ name: z.string(), children: z.array(z.string()).optional() })),
});
