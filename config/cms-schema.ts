export const cmsCollections = [
  {
    slug: "product-categories",
    purpose: "Localized product category pages with SEO and RFQ conversion blocks.",
    localizedFields: ["name", "summary", "applications", "seoTitle", "seoDescription"],
    extensibleFields: ["specs", "materials", "certifications", "moq", "packaging", "industryAttributes"]
  },
  {
    slug: "products",
    purpose: "Optional SKU/detail layer for customers that need deeper catalog pages.",
    localizedFields: ["name", "description", "applications", "seoTitle", "seoDescription"],
    extensibleFields: ["dimensions", "coating", "material", "downloads", "customFields"]
  },
  {
    slug: "articles",
    purpose: "SEO articles, buying guides, application notes, and solution content.",
    localizedFields: ["title", "excerpt", "body", "seoTitle", "seoDescription"]
  },
  {
    slug: "leads",
    purpose: "RFQ submissions with source, locale, status, assignment, and export history.",
    workflow: ["new", "contacted", "quoted", "closed", "spam"]
  },
  {
    slug: "contact-channels",
    purpose: "Configurable phone, WhatsApp, email, WeChat, Messenger, LinkedIn, Skype, and RFQ links."
  },
  {
    slug: "themes",
    purpose: "Industry themes and template presets independent from content data."
  },
  {
    slug: "ai-drafts",
    purpose: "Generated content drafts that require manual review before publication."
  }
] as const;
