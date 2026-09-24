import type { ProductCategory } from '@/types/site';
export const catalogTypes: Record<string, { zh: string; en: string }> = {
  'makeup-brush': { zh: '化妆刷', en: 'Makeup brushes' },
  'sponge-puff': { zh: '美妆蛋与粉扑', en: 'Sponges & puffs' },
  'lash-tool': { zh: '睫毛工具', en: 'Lash tools' },
  'gift-set': { zh: '礼盒套装', en: 'Gift sets' }
};
export function isPublishedProduct(product: ProductCategory) { return product.status !== 'draft' && product.status !== 'trash'; }
export function isCollection(product: ProductCategory) { return product.kind === 'collection'; }
