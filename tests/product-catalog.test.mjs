import assert from "node:assert/strict";
import test from "node:test";
import { catalogImage, homeProducts, publishedProducts } from "../lib/product-catalog.ts";

const categorySlugs = [
  "food-tin-packaging",
  "gift-tin-packaging",
  "tea-coffee-tins",
  "custom-tin-box-manufacturing"
];

const categories = categorySlugs.map((slug, index) => ({
  id: `category-${index}`,
  slug,
  name: { en: slug, zh: slug },
  summary: { en: "", zh: "" },
  applications: { en: [], zh: [] },
  specs: [],
  themeFit: []
}));

function article(slug, category, overrides = {}) {
  return {
    id: slug,
    slug,
    title: { en: slug, zh: slug },
    excerpt: { en: `${slug} excerpt`, zh: `${slug} excerpt` },
    body: { en: "", zh: "" },
    category,
    status: "published",
    publishedAt: "2026-09-01T00:00:00.000Z",
    ...overrides
  };
}

test("publishedProducts keeps only live product articles and normalizes category ids", () => {
  const records = [
    article("live", categories[0].id),
    article("draft", categories[0].slug, { status: "draft" }),
    article("trash", categories[0].slug, { status: "trash" }),
    article("deleted", categories[0].slug, { deletedAt: "2026-09-02T00:00:00.000Z" }),
    article("knowledge", "uncategorized"),
    article("live-copy", categories[0].slug, { id: "live" })
  ];

  const result = publishedProducts(records, categories);
  assert.equal(result.length, 1);
  assert.equal(result[0].slug, "live");
  assert.equal(result[0].category, categories[0].slug);
});

test("homeProducts selects the latest three from each preferred category", () => {
  const records = categorySlugs.flatMap((category, categoryIndex) =>
    Array.from({ length: 4 }, (_, itemIndex) => article(
      `${categoryIndex}-${itemIndex}`,
      category,
      { publishedAt: `2026-09-${String(10 + itemIndex).padStart(2, "0")}T00:00:00.000Z` }
    ))
  );

  const result = homeProducts(records, categories);
  assert.equal(result.length, 12);
  for (const category of categorySlugs) {
    assert.equal(result.filter(item => item.category === category).length, 3);
  }
  assert.ok(!result.some(item => item.slug.endsWith("-0")));
});

test("homeProducts fills category shortages without duplicates and stops at twelve", () => {
  const records = [
    ...Array.from({ length: 6 }, (_, index) => article(`food-${index}`, categorySlugs[0], { publishedAt: `2026-09-${20 - index}T00:00:00.000Z` })),
    ...Array.from({ length: 4 }, (_, index) => article(`gift-${index}`, categorySlugs[1])),
    article("tea-only", categorySlugs[2]),
    article("custom-only", categorySlugs[3])
  ];

  const result = homeProducts(records, categories);
  assert.equal(result.length, 12);
  assert.equal(new Set(result.map(item => item.id || item.slug)).size, 12);
  assert.ok(result.some(item => item.slug === "food-5"));
});

test("catalogImage prefers a safe cover then falls back to the localized Markdown image", () => {
  const record = article("image", categorySlugs[0], {
    coverImageUrl: "javascript:alert(1)",
    body: {
      en: "![English](/api/files/en-image.jpg)",
      zh: "![中文](https://cdn.example.com/zh-image.jpg)"
    }
  });

  assert.equal(catalogImage(record, "zh"), "https://cdn.example.com/zh-image.jpg");
  assert.equal(catalogImage({ ...record, coverImageUrl: "/api/files/cover.jpg" }, "en"), "/api/files/cover.jpg");
});

test("catalog selection is recalculated when an article is published or withdrawn", () => {
  const record = article("mutable", categorySlugs[0], { status: "draft" });
  assert.equal(publishedProducts([record], categories).length, 0);
  record.status = "published";
  assert.equal(publishedProducts([record], categories).length, 1);
  record.status = "trash";
  assert.equal(publishedProducts([record], categories).length, 0);
});
