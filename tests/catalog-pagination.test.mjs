import assert from "node:assert/strict";
import test from "node:test";
import { catalogPageSize, parseCatalogPage } from "../lib/catalog-pagination.ts";

test("catalog pages clamp invalid and out-of-range requests", () => {
  assert.equal(catalogPageSize, 24);
  assert.equal(parseCatalogPage(undefined, 38), 1);
  assert.equal(parseCatalogPage("2", 38), 2);
  assert.equal(parseCatalogPage("99", 38), 2);
  assert.equal(parseCatalogPage("0", 38), 1);
  assert.equal(parseCatalogPage("2.5", 38), 1);
  assert.equal(parseCatalogPage(["2", "1"], 38), 2);
  assert.equal(parseCatalogPage("3", 0), 1);
});
