import type { ProductCategory } from '@/types/site';
export const catalogTypes: Record<string, { zh: string; en: string }> = {
  'hair-bow': { zh: '蝴蝶结', en: 'Hair bows' },
  'hair-clip': { zh: '发夹', en: 'Hair clips' },
  'claw-clip': { zh: '抓夹', en: 'Claw clips' },
  'scrunchie': { zh: '发圈', en: 'Scrunchies' },
  'hair-pin': { zh: '发簪', en: 'Hair pins' }
};
export function isPublishedProduct(product: ProductCategory) { return product.status !== 'draft' && product.status !== 'trash'; }
export function isCollection(product: ProductCategory) { return product.kind === 'collection'; }
