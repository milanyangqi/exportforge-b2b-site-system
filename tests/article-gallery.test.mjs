import assert from 'node:assert/strict';
import test from 'node:test';
import { articleGallery } from '../lib/article-gallery.ts';
test('gallery retains photo order, deduplicates cover and handles old uploads', () => {
  const body = '![Cover](/api/files/cover)\n\n![Detail](/api/product-images/detail.jpg)\n\n[Download file: side.JPG](/api/files/side)\n\n[Specification.pdf](/api/files/pdf)';
  assert.deepEqual(articleGallery('/api/files/cover', body, 'Tin', 'en').map(x=>x.url), ['/api/files/cover','/api/product-images/detail.jpg','/api/files/side']);
});
test('gallery ignores unsafe URLs and fenced examples, and provides English alt text', () => {
  const body = '![中文](https://example.com/tin.jpg)\n```md\n![Example](/example.jpg)\n```\n![Unsafe](javascript:alert)\n![Detail](</detail.jpg> "Detail view")';
  const photos = articleGallery(undefined, body, 'Gift tin', 'en');
  assert.deepEqual(photos.map(x=>x.url), ['https://example.com/tin.jpg','/detail.jpg']);
  assert.equal(photos[0].label, 'Gift tin — 1');
});
