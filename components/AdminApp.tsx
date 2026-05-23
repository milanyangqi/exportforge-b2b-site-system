"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { locales } from "@/config/locales";
import { themes } from "@/config/themes";
import type { AdminState, AdminUser, Article, ContactChannel, ContactChannelType, LeadStatus, LocaleCode, ProductCategory, RoleKey, SiteNavigationItem, ThemeKey } from "@/types/site";

type Tab = "overview" | "products" | "articles" | "leads" | "contacts" | "users" | "settings" | "themes" | "account" | "ai";
type ProductFormState = {
  zh: string;
  en: string;
  slug: string;
  parentId: string;
  summaryZh: string;
  summaryEn: string;
};
type ContactFormState = {
  type: ContactChannelType;
  zh: string;
  en: string;
  value: string;
  href: string;
  color: string;
};

const tabs: { key: Tab; label: string }[] = [
  { key: "overview", label: "总览" },
  { key: "products", label: "产品分类" },
  { key: "articles", label: "文章发布" },
  { key: "leads", label: "询盘" },
  { key: "contacts", label: "联系方式" },
  { key: "users", label: "用户权限" },
  { key: "settings", label: "前台设置" },
  { key: "themes", label: "主题" },
  { key: "account", label: "账号设置" },
  { key: "ai", label: "AI内容" }
];
const tabKeys = new Set<Tab>(tabs.map((item) => item.key));

const themeOptions: ThemeKey[] = ["industrial", "clean-export", "premium-brand", "equipment", "consumer-goods"];
const roleOptions: RoleKey[] = ["super-admin", "admin", "editor", "sales", "viewer"];
const leadStatuses: LeadStatus[] = ["new", "contacted", "quoted", "closed", "spam"];
const articleCategories: Article["category"][] = ["buying-guide", "application", "quality", "seo"];
const contactTypeOptions: ContactChannelType[] = [
  "phone",
  "whatsapp",
  "email",
  "wechat",
  "zalo",
  "line",
  "facebook",
  "instagram",
  "tiktok",
  "messenger",
  "linkedin",
  "skype",
  "rfq",
  "custom"
];
const contactTypePresets: Record<ContactChannelType, { en: string; zh: string; value: string; href: string; color: string }> = {
  phone: { en: "Phone", zh: "电话", value: "+86 188 0000 0000", href: "tel:+8618800000000", color: "#10b981" },
  whatsapp: { en: "WhatsApp", zh: "WhatsApp", value: "+86 188 0000 0000", href: "https://wa.me/8618800000000", color: "#25d366" },
  email: { en: "Email", zh: "邮箱", value: "sales@example.com", href: "mailto:sales@example.com", color: "#ff4f66" },
  wechat: { en: "WeChat", zh: "微信", value: "ExportFactory", href: "#wechat", color: "#23c80d" },
  zalo: { en: "Zalo", zh: "Zalo", value: "+84 900 000 000", href: "https://zalo.me/84900000000", color: "#0068ff" },
  line: { en: "Line", zh: "Line", value: "@exportforge", href: "https://line.me/R/ti/p/@exportforge", color: "#06c755" },
  facebook: { en: "Facebook", zh: "Facebook", value: "ExportForge", href: "https://facebook.com/exportforge", color: "#1877f2" },
  instagram: { en: "Instagram", zh: "Instagram", value: "@exportforge", href: "https://instagram.com/exportforge", color: "#e4405f" },
  tiktok: { en: "TikTok", zh: "TikTok", value: "@exportforge", href: "https://www.tiktok.com/@exportforge", color: "#111827" },
  messenger: { en: "Messenger", zh: "Messenger", value: "ExportForge", href: "https://m.me/exportforge", color: "#0084ff" },
  linkedin: { en: "LinkedIn", zh: "LinkedIn", value: "ExportForge", href: "https://www.linkedin.com/company/exportforge", color: "#0a66c2" },
  skype: { en: "Skype", zh: "Skype", value: "live:exportforge", href: "skype:live:exportforge?chat", color: "#00aff0" },
  rfq: { en: "RFQ", zh: "询盘", value: "Request quote", href: "#rfq", color: "#243b78" },
  custom: { en: "Custom", zh: "自定义", value: "", href: "", color: "#0b5f7d" }
};
const articleImportHeaders = [
  "slug",
  "category",
  "status",
  "featured_on_home",
  "title_zh",
  "title_en",
  "excerpt_zh",
  "excerpt_en",
  "body_zh",
  "body_en",
  "published_at"
] as const;
const truthyImportValues = new Set(["1", "true", "yes", "y", "是", "首页"]);
const falsyImportValues = new Set(["0", "false", "no", "n", "否"]);

const emptyProductForm: ProductFormState = {
  zh: "",
  en: "",
  slug: "",
  parentId: "",
  summaryZh: "",
  summaryEn: ""
};

function createContactForm(type: ContactChannelType = "custom"): ContactFormState {
  const preset = contactTypePresets[type];
  const shouldPrefill = type !== "custom";

  return {
    type,
    zh: shouldPrefill ? preset.zh : "",
    en: shouldPrefill ? preset.en : "",
    value: shouldPrefill ? preset.value : "",
    href: shouldPrefill ? preset.href : "",
    color: preset.color
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeCsvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildCsv(rows: string[][]) {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function normalizeArticleCategory(value: string): Article["category"] {
  return articleCategories.includes(value as Article["category"]) ? value as Article["category"] : "buying-guide";
}

function parseFeaturedOnHome(value: string) {
  const normalized = value.trim().toLowerCase();
  if (falsyImportValues.has(normalized)) return false;
  if (truthyImportValues.has(normalized)) return true;
  return true;
}

function normalizeCsvHeader(value: string) {
  return value.trim().replace(/^\uFEFF/, "").toLowerCase();
}

function rowToRecord(headers: string[], row: string[]) {
  return headers.reduce<Record<string, string>>((record, header, index) => {
    record[header] = row[index]?.trim() ?? "";
    return record;
  }, {});
}

function normalizeArticleStatus(value: string): Article["status"] {
  return value.trim().toLowerCase() === "published" ? "published" : "draft";
}

function productToForm(product: ProductCategory): ProductFormState {
  return {
    zh: product.name.zh ?? "",
    en: product.name.en,
    slug: product.slug,
    parentId: product.parentId ?? "",
    summaryZh: product.summary.zh ?? "",
    summaryEn: product.summary.en
  };
}

function emptyProduct(): ProductCategory {
  const id = `product-${Date.now()}`;
  return {
    id,
    slug: id,
    name: { en: "New Product Category", zh: "新产品品类" },
    summary: { en: "Describe this product category for overseas buyers.", zh: "填写面向海外买家的产品介绍。" },
    applications: { en: ["OEM", "Wholesale"] },
    specs: ["MOQ ready", "Custom packaging"],
    themeFit: ["industrial"]
  };
}

function applyThemeToDocument(themeKey: ThemeKey) {
  if (typeof document === "undefined") return;
  const theme = themes[themeKey] ?? themes.industrial;
  const root = document.documentElement;

  root.dataset.theme = theme.key;
  root.style.setProperty("--ink", theme.colors.ink);
  root.style.setProperty("--muted", theme.colors.muted);
  root.style.setProperty("--bg", theme.colors.background);
  root.style.setProperty("--panel", theme.colors.panel);
  root.style.setProperty("--primary", theme.colors.primary);
  root.style.setProperty("--accent", theme.colors.accent);
  root.style.setProperty("--line", theme.colors.line);
  root.style.setProperty("--radius", theme.radius);
}

function emptyArticle(): Article {
  const id = `article-${Date.now()}`;
  return {
    id,
    slug: id,
    title: { en: "New buying guide", zh: "新文章标题" },
    excerpt: { en: "Short summary shown on article cards and homepage.", zh: "这段摘要会显示在文章卡片和首页。" },
    body: { en: "Write the full article content here.", zh: "在这里填写文章正文。" },
    category: "buying-guide",
    status: "draft",
    featuredOnHome: true
  };
}

function emptyNavigationItem(order: number): SiteNavigationItem {
  const id = `nav-custom-${Date.now()}`;

  return {
    id,
    label: { en: "New Link", zh: "新导航" },
    href: "/",
    enabled: true,
    order
  };
}

function articleStatusLabel(article: Article) {
  if (article.status === "trash") return "回收站";
  if (article.status === "published") return "已发布";
  return "草稿";
}

function normalizeInitialTab(value?: string): Tab {
  return value && tabKeys.has(value as Tab) ? value as Tab : "overview";
}

export function AdminApp({ email, initialTab, locale }: { email: string; initialTab?: string; locale: LocaleCode }) {
  const [tab, setTab] = useState<Tab>(normalizeInitialTab(initialTab));
  const [state, setState] = useState<AdminState | null>(null);
  const [status, setStatus] = useState("加载后台数据...");
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [articleMode, setArticleMode] = useState<"list" | "editor">("list");
  const [articleQuery, setArticleQuery] = useState("");
  const [articleStatusFilter, setArticleStatusFilter] = useState<"all" | "published" | "draft" | "trash">("all");
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<Article["category"] | "all">("all");
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
  const [articleBulkAction, setArticleBulkAction] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productBulkAction, setProductBulkAction] = useState("");
  const [contactForm, setContactForm] = useState<ContactFormState>(() => createContactForm());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [accountPassword, setAccountPassword] = useState({ current: "", next: "", confirm: "" });
  const activeThemeKey = state?.activeTheme;

  useEffect(() => {
    fetch("/api/admin/state")
      .then((response) => {
        if (!response.ok) throw new Error("Unauthorized");
        return response.json();
      })
      .then((payload: AdminState) => {
        const sessionUser = payload.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? payload.users[0];
        setState(payload);
        setCurrentUserId(sessionUser?.id ?? null);
        applyThemeToDocument(payload.activeTheme);
        setStatus("已连接本地后台数据");
      })
      .catch(() => setStatus("后台会话失效，请重新登录"));
  }, [email]);

  useEffect(() => {
    if (activeThemeKey) applyThemeToDocument(activeThemeKey);
  }, [activeThemeKey]);

  const stats = useMemo(() => {
    if (!state) return null;
    return [
      ["产品品类", state.products.length],
      ["已发布文章", state.articles.filter((article) => article.status === "published").length],
      ["询盘", state.leads.length],
      ["联系渠道", state.contactChannels.filter((item) => item.enabled).length],
      ["后台用户", state.users.length]
    ];
  }, [state]);

  async function save(nextState = state) {
    if (!nextState) return;
    setStatus("保存中...");
    const response = await fetch("/api/admin/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextState)
    });
    if (!response.ok) {
      setStatus("保存失败：请检查登录状态");
      return;
    }
    const payload = (await response.json()) as AdminState;
    setState(payload);
    setStatus("已保存");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/zh/admin/login";
  }

  function resetProductForm() {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
  }

  function submitProductForm() {
    if (!state) return;
    const nameZh = productForm.zh.trim();
    const nameEn = productForm.en.trim() || nameZh || "New Category";
    const slug = slugify(productForm.slug || nameEn || nameZh) || `category-${Date.now()}`;
    const id = editingProductId ?? `product-${slug}-${Date.now()}`;
    const nextProduct: ProductCategory = {
      id,
      slug,
      name: { en: nameEn, zh: nameZh || nameEn },
      summary: {
        en: productForm.summaryEn.trim() || "Describe this category for overseas buyers.",
        zh: productForm.summaryZh.trim() || "填写分类描述。"
      },
      parentId: productForm.parentId || undefined,
      applications: { en: ["Export catalog"], zh: ["外贸目录"] },
      specs: [],
      themeFit: [state.activeTheme]
    };
    const exists = Boolean(editingProductId);
    const products = exists
      ? state.products.map((product) => ((product.id ?? product.slug) === editingProductId ? { ...product, ...nextProduct } : product))
      : [nextProduct, ...state.products];
    const nextState = { ...state, products };

    setState(nextState);
    resetProductForm();
    void save(nextState);
  }

  function editProduct(product: ProductCategory) {
    setEditingProductId(product.id ?? product.slug);
    setProductForm(productToForm(product));
  }

  function switchTheme(theme: ThemeKey) {
    if (!state) return;
    const nextState = { ...state, activeTheme: theme };

    applyThemeToDocument(theme);
    setState(nextState);
    setStatus(`已切换到 ${themes[theme].name}，正在保存...`);
    void save(nextState);
  }

  function updateContact(index: number, patch: Partial<ContactChannel>) {
    if (!state) return;
    const contactChannels = state.contactChannels.map((channel, current) => (current === index ? { ...channel, ...patch } : channel));
    setState({ ...state, contactChannels });
  }

  function selectContactFormType(type: ContactChannelType) {
    const preset = contactTypePresets[type];

    setContactForm((current) => ({
      ...current,
      type,
      zh: current.zh || (type === "custom" ? "" : preset.zh),
      en: current.en || (type === "custom" ? "" : preset.en),
      value: current.value || preset.value,
      href: current.href || preset.href,
      color: preset.color
    }));
  }

  function addContactChannel() {
    if (!state) return;
    const preset = contactTypePresets[contactForm.type];
    const labelZh = contactForm.zh.trim() || preset.zh;
    const labelEn = contactForm.en.trim() || labelZh || preset.en;
    const href = contactForm.href.trim() || preset.href;
    const value = contactForm.value.trim() || preset.value || href;

    if (!href) {
      setStatus("请填写联系方式链接");
      return;
    }

    const nextChannel: ContactChannel = {
      id: `contact-${slugify(labelEn || labelZh || contactForm.type)}-${Date.now()}`,
      type: contactForm.type,
      label: { en: labelEn, zh: labelZh || labelEn },
      value,
      href,
      color: contactForm.color || preset.color,
      enabled: true
    };
    const nextState = { ...state, contactChannels: [...state.contactChannels, nextChannel] };

    setState(nextState);
    setContactForm(createContactForm());
    void save(nextState);
  }

  function removeContactChannel(channelId: string) {
    if (!state) return;
    const nextState = {
      ...state,
      contactChannels: state.contactChannels.filter((channel) => channel.id !== channelId)
    };

    setState(nextState);
    void save(nextState);
  }

  function updateNavigationItem(itemId: string, patch: Partial<SiteNavigationItem>) {
    if (!state) return;
    setState({
      ...state,
      navigation: state.navigation.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
    });
  }

  function addNavigationItem() {
    if (!state) return;
    const nextOrder = Math.max(0, ...state.navigation.map((item) => item.order)) + 10;
    setState({
      ...state,
      navigation: [...state.navigation, emptyNavigationItem(nextOrder)]
    });
  }

  function removeNavigationItem(itemId: string) {
    if (!state) return;
    setState({
      ...state,
      navigation: state.navigation.filter((item) => item.id !== itemId)
    });
  }

  function toggleEnabledLocale(localeCode: LocaleCode, checked: boolean) {
    if (!state) return;
    const nextLocales = checked
      ? Array.from(new Set([...state.enabledLocales, localeCode]))
      : state.enabledLocales.filter((item) => item !== localeCode);

    if (nextLocales.length === 0) {
      setStatus("至少保留一个前台语言");
      return;
    }

    setState({ ...state, enabledLocales: nextLocales });
  }

  function uploadContactQr(index: number, file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("请选择二维码图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setStatus("二维码读取失败");
        return;
      }
      updateContact(index, { qrCodeUrl: reader.result });
      setStatus("二维码已添加，点击“保存联系方式”后生效");
    };
    reader.onerror = () => setStatus("二维码读取失败");
    reader.readAsDataURL(file);
  }

  function updateCurrentUser(patch: Partial<AdminUser>) {
    if (!state) return;
    const targetUser = state.users.find((user) => user.id === currentUserId) ?? state.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? state.users[0];
    if (!targetUser) return;

    setState({
      ...state,
      users: state.users.map((user) => (user.id === targetUser.id ? { ...user, ...patch } : user))
    });
  }

  function uploadAccountAvatar(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("请选择头像图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setStatus("头像读取失败");
        return;
      }
      updateCurrentUser({ avatarUrl: reader.result });
      setStatus("头像已更新，点击保存后生效");
    };
    reader.onerror = () => setStatus("头像读取失败");
    reader.readAsDataURL(file);
  }

  async function saveAccountSettings() {
    if (!state) return;
    const targetUser = state.users.find((user) => user.id === currentUserId) ?? state.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? state.users[0];
    if (!targetUser) return;

    if ((accountPassword.next || accountPassword.confirm) && accountPassword.next !== accountPassword.confirm) {
      setStatus("两次输入的新密码不一致");
      return;
    }

    setStatus("保存账号设置中...");
    const response = await fetch("/api/admin/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          name: targetUser.name,
          email: targetUser.email,
          jobTitle: targetUser.jobTitle,
          phone: targetUser.phone,
          avatarUrl: targetUser.avatarUrl
        },
        currentPassword: accountPassword.current,
        newPassword: accountPassword.next,
        confirmPassword: accountPassword.confirm
      })
    });
    const payload = await response.json() as { state?: AdminState; user?: AdminUser; error?: string };

    if (!response.ok || !payload.state) {
      setStatus(payload.error ?? "账号设置保存失败");
      return;
    }

    setState(payload.state);
    setCurrentUserId(payload.user?.id ?? targetUser.id);
    setAccountPassword({ current: "", next: "", confirm: "" });
    setStatus("账号设置已保存");
  }

  function updateArticle(index: number, patch: Partial<Article>) {
    if (!state) return;
    const articles = state.articles.map((article, current) => (current === index ? { ...article, ...patch } : article));
    setState({ ...state, articles });
  }

  function updateActiveArticle(patch: Partial<Article>) {
    if (!state) return;
    const targetId = activeArticleId ?? state.articles[0]?.id ?? state.articles[0]?.slug;
    if (!targetId) return;
    setState({
      ...state,
      articles: state.articles.map((article) => ((article.id ?? article.slug) === targetId ? { ...article, ...patch } : article))
    });
  }

  function commitArticle(index: number, patch: Partial<Article>) {
    if (!state) return;
    const nextState = {
      ...state,
      articles: state.articles.map((article, current) => (current === index ? { ...article, ...patch } : article))
    };
    setState(nextState);
    void save(nextState);
  }

  function moveActiveArticleToTrash() {
    if (!state || !activeArticle) return;
    const targetId = activeArticle.id ?? activeArticle.slug;
    const nextState = {
      ...state,
      articles: state.articles.map((article) => (
        (article.id ?? article.slug) === targetId
          ? { ...article, status: "trash" as const, featuredOnHome: false, deletedAt: new Date().toISOString() }
          : article
      ))
    };

    setState(nextState);
    setActiveArticleId(null);
    setArticleMode("list");
    setArticleStatusFilter("trash");
    void save(nextState);
  }

  function restoreActiveArticle() {
    if (!state || !activeArticle) return;
    const targetId = activeArticle.id ?? activeArticle.slug;
    const nextState = {
      ...state,
      articles: state.articles.map((article) => (
        (article.id ?? article.slug) === targetId
          ? { ...article, status: "draft" as const, deletedAt: undefined }
          : article
      ))
    };

    setState(nextState);
    setArticleStatusFilter("draft");
    void save(nextState);
  }

  function deleteActiveArticlePermanently() {
    if (!state || !activeArticle) return;
    const targetId = activeArticle.id ?? activeArticle.slug;
    const nextState = {
      ...state,
      articles: state.articles.filter((article) => (article.id ?? article.slug) !== targetId)
    };

    setState(nextState);
    setActiveArticleId(null);
    setArticleMode("list");
    setArticleStatusFilter("trash");
    void save(nextState);
  }

  function downloadArticleImportTemplate() {
    const rows = [
      [...articleImportHeaders],
      [
        "sample-buying-guide",
        "buying-guide",
        "published",
        "1",
        "批量导入示例文章",
        "Sample imported article",
        "用于文章卡片和首页的中文摘要。",
        "Short English excerpt for article cards and homepage.",
        "这里填写中文正文。可以包含换行、逗号和引号。",
        "Write the full English article content here.",
        new Date().toISOString()
      ]
    ];
    const blob = new Blob([`\uFEFF${buildCsv(rows)}`], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "article-import-template.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  function importArticlesFromCsv(file: File | null) {
    if (!state || !file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setStatus("文章导入失败：无法读取文件");
        return;
      }

      const rows = parseCsv(reader.result);
      if (rows.length < 2) {
        setStatus("文章导入失败：模板中没有文章数据");
        return;
      }

      const headers = rows[0].map(normalizeCsvHeader);
      const importedAt = Date.now();
      const existingSlugs = new Set(state.articles.map((article) => article.slug));
      const uniqueSlug = (value: string, index: number) => {
        const base = slugify(value) || `imported-article-${importedAt}-${index + 1}`;
        let candidate = base;
        let suffix = 2;

        while (existingSlugs.has(candidate)) {
          candidate = `${base}-${suffix}`;
          suffix += 1;
        }

        existingSlugs.add(candidate);
        return candidate;
      };
      const importedArticles = rows
        .slice(1)
        .filter((row) => row.some((value) => value.trim()))
        .map((row, index) => {
          const record = rowToRecord(headers, row);
          const titleZh = record.title_zh || record.title_en || "批量导入文章";
          const titleEn = record.title_en || record.title_zh || "Imported article";
          const excerptZh = record.excerpt_zh || record.excerpt_en || "填写文章摘要。";
          const excerptEn = record.excerpt_en || record.excerpt_zh || "Article summary.";
          const statusValue = normalizeArticleStatus(record.status || "draft");
          const publishedAt = statusValue === "published"
            ? record.published_at || new Date(importedAt + index).toISOString()
            : record.published_at || undefined;

          return {
            id: `article-import-${importedAt}-${index}`,
            slug: uniqueSlug(record.slug || titleEn || titleZh, index),
            title: { en: titleEn, zh: titleZh },
            excerpt: { en: excerptEn, zh: excerptZh },
            body: {
              en: record.body_en || record.body_zh || "",
              zh: record.body_zh || record.body_en || ""
            },
            category: normalizeArticleCategory(record.category || ""),
            status: statusValue,
            featuredOnHome: parseFeaturedOnHome(record.featured_on_home || ""),
            publishedAt
          } satisfies Article;
        });

      if (importedArticles.length === 0) {
        setStatus("文章导入失败：没有可导入的文章");
        return;
      }

      const nextState = { ...state, articles: [...importedArticles, ...state.articles] };
      setState(nextState);
      setArticleMode("list");
      setStatus(`已导入 ${importedArticles.length} 篇文章，正在保存...`);
      void save(nextState);
    };
    reader.onerror = () => setStatus("文章导入失败：无法读取文件");
    reader.readAsText(file);
  }

  function generateAiArticleDraft() {
    if (!state) return;
    const market = state.aiSettings.targetMarkets[0] ?? "Global";
    const keyword = state.aiSettings.requiredKeywords[0] ?? "B2B export";
    const created = new Date();
    const draft: Article = {
      id: `ai-article-${created.getTime()}`,
      slug: `ai-${market.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${created.getTime()}`,
      title: {
        en: `${market} buying guide for ${keyword}`,
        zh: `${market} 市场 ${keyword} 采购指南`
      },
      excerpt: {
        en: `AI draft for overseas buyers comparing supplier capability, product fit, RFQ details, and trust signals for ${market}.`,
        zh: `面向 ${market} 买家的 AI 草稿，覆盖供应商能力、产品匹配、询盘信息和信任背书。`
      },
      body: {
        en: [
          `This draft follows the brand voice: ${state.aiSettings.brandVoice}`,
          `For ${market} buyers, the page should explain product fit, quality control, packaging, MOQ, delivery terms, and fast RFQ response.`,
          `Recommended keywords: ${state.aiSettings.requiredKeywords.join(", ")}.`
        ].join("\n\n"),
        zh: [
          `这是一篇按品牌语气生成的草稿：${state.aiSettings.brandVoice}`,
          `面向 ${market} 买家，内容应说明产品匹配、质量控制、包装、MOQ、交付条款和快速报价响应。`,
          `建议关键词：${state.aiSettings.requiredKeywords.join("，")}。`
        ].join("\n\n")
      },
      category: "seo",
      status: "draft",
      featuredOnHome: true
    };
    setState({ ...state, articles: [draft, ...state.articles] });
    setActiveArticleId(draft.id ?? draft.slug);
    setArticleMode("editor");
    setTab("articles");
    setStatus("AI 草稿已生成，请审核后发布");
  }

  if (!state) {
    return (
      <main className="real-admin">
        <div className="admin-topbar"><strong>ExportForge Admin</strong><span>{status}</span></div>
      </main>
    );
  }

  const activeArticle = state.articles.find((article) => (article.id ?? article.slug) === activeArticleId)
    ?? state.articles.find((article) => article.status !== "trash")
    ?? state.articles[0];
  const activeArticleIndex = activeArticle ? state.articles.findIndex((article) => (article.id ?? article.slug) === (activeArticle.id ?? activeArticle.slug)) : -1;
  const filteredProducts = state.products.filter((product) => {
    const query = productQuery.trim().toLowerCase();
    if (!query) return true;
    return [
      product.name.zh,
      product.name.en,
      product.slug,
      product.summary.zh,
      product.summary.en
    ].filter(Boolean).some((value) => value?.toLowerCase().includes(query));
  });
  const visibleProductIds = filteredProducts.map((product) => product.id ?? product.slug);
  const allVisibleProductsSelected = visibleProductIds.length > 0 && visibleProductIds.every((id) => selectedProductIds.includes(id));

  function toggleVisibleProducts(checked: boolean) {
    setSelectedProductIds((current) => {
      if (checked) return Array.from(new Set([...current, ...visibleProductIds]));
      return current.filter((id) => !visibleProductIds.includes(id));
    });
  }

  function toggleProductSelection(productId: string, checked: boolean) {
    setSelectedProductIds((current) => {
      if (checked) return Array.from(new Set([...current, productId]));
      return current.filter((id) => id !== productId);
    });
  }

  function applyProductBulkAction() {
    if (!state || productBulkAction !== "delete" || selectedProductIds.length === 0) return;
    const selected = new Set(selectedProductIds);
    const nextState = {
      ...state,
      products: state.products.filter((product) => !selected.has(product.id ?? product.slug))
    };

    setState(nextState);
    setSelectedProductIds([]);
    setProductBulkAction("");
    void save(nextState);
  }
  const articleCounts = {
    all: state.articles.filter((article) => article.status !== "trash").length,
    published: state.articles.filter((article) => article.status === "published").length,
    draft: state.articles.filter((article) => article.status !== "published" && article.status !== "trash").length,
    trash: state.articles.filter((article) => article.status === "trash").length
  };
  const filteredArticles = state.articles.filter((article) => {
    const articleStatus = article.status ?? "published";
    const statusMatches = articleStatusFilter === "all"
      ? articleStatus !== "trash"
      : articleStatus === articleStatusFilter;
    const categoryMatches = articleCategoryFilter === "all" || article.category === articleCategoryFilter;
    const query = articleQuery.trim().toLowerCase();
    const queryMatches = !query || [
      article.title.zh,
      article.title.en,
      article.slug,
      article.excerpt.zh,
      article.excerpt.en
    ].filter(Boolean).some((value) => value?.toLowerCase().includes(query));

    return statusMatches && categoryMatches && queryMatches;
  });
  const visibleArticleIds = filteredArticles.map((article) => article.id ?? article.slug);
  const allVisibleArticlesSelected = visibleArticleIds.length > 0 && visibleArticleIds.every((id) => selectedArticleIds.includes(id));
  const sortedNavigation = [...state.navigation].sort((a, b) => a.order - b.order);

  function toggleVisibleArticles(checked: boolean) {
    setSelectedArticleIds((current) => {
      if (checked) return Array.from(new Set([...current, ...visibleArticleIds]));
      return current.filter((id) => !visibleArticleIds.includes(id));
    });
  }

  function toggleArticleSelection(articleId: string, checked: boolean) {
    setSelectedArticleIds((current) => {
      if (checked) return Array.from(new Set([...current, articleId]));
      return current.filter((id) => id !== articleId);
    });
  }

  function applyArticleBulkAction() {
    if (!state || !articleBulkAction || selectedArticleIds.length === 0) return;
    const selected = new Set(selectedArticleIds);
    const now = new Date().toISOString();
    const nextArticles = articleBulkAction === "delete"
      ? state.articles.filter((article) => !selected.has(article.id ?? article.slug))
      : state.articles.map((article) => {
        if (!selected.has(article.id ?? article.slug)) return article;
        if (articleBulkAction === "restore") return { ...article, status: "draft" as const, deletedAt: undefined };
        return { ...article, status: "trash" as const, featuredOnHome: false, deletedAt: now };
      });
    const nextState = { ...state, articles: nextArticles };

    setState(nextState);
    setSelectedArticleIds([]);
    setArticleBulkAction("");
    void save(nextState);
  }
  const currentUser = state.users.find((user) => user.id === currentUserId) ?? state.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? state.users[0];
  const currentUserName = currentUser?.name || "Admin";
  const currentEmail = currentUser?.email || email;
  const accountInitial = (currentUserName || email).slice(0, 1).toUpperCase();

  return (
    <main className="real-admin">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          {tabs.map((item) => (
            <button className={tab === item.key ? "active" : ""} key={item.key} onClick={() => setTab(item.key)} type="button">
              {item.label}
            </button>
          ))}
          <div className="admin-sidebar-footer">
            <Link className={tab === "account" ? "admin-account-trigger active" : "admin-account-trigger"} href={`/${locale}/admin?tab=account`}>
              <span className="admin-avatar">
                {currentUser?.avatarUrl ? <Image src={currentUser.avatarUrl} alt={currentUserName} width={36} height={36} unoptimized /> : accountInitial}
              </span>
              <span>
                <strong>账号</strong>
                <small>{currentUserName}</small>
              </span>
            </Link>
          </div>
        </aside>

        <section className="admin-workspace">
          {tab === "overview" ? (
            <>
              <h1>真实后台控制台</h1>
              <div className="admin-stat-grid">
                {stats?.map(([label, value]) => (
                  <div key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {tab === "products" ? (
            <>
              <div className="admin-section-title">
                <h1>分类目录</h1>
              </div>

              <div className="wp-taxonomy-screen">
                <aside className="wp-taxonomy-form">
                  <h2>{editingProductId ? "编辑分类" : "添加分类"}</h2>
                  <label>名称
                    <input
                      value={productForm.zh}
                      onChange={(event) => setProductForm({
                        ...productForm,
                        zh: event.target.value,
                        slug: productForm.slug || slugify(event.target.value)
                      })}
                    />
                    <small>名称是它在网站上的显示方式。</small>
                  </label>
                  <label>别名
                    <input value={productForm.slug} onChange={(event) => setProductForm({ ...productForm, slug: slugify(event.target.value) })} />
                    <small>用于 URL，例如 carbide-end-mills。</small>
                  </label>
                  <label>父级分类
                    <select value={productForm.parentId} onChange={(event) => setProductForm({ ...productForm, parentId: event.target.value })}>
                      <option value="">无</option>
                      {state.products
                        .filter((product) => (product.id ?? product.slug) !== editingProductId)
                        .map((product) => (
                          <option key={product.id ?? product.slug} value={product.id ?? product.slug}>{product.name.zh || product.name.en}</option>
                        ))}
                    </select>
                    <small>可用于目录分层，例如“刀具”下面再放“铣刀”。</small>
                  </label>
                  <label>描述
                    <textarea value={productForm.summaryZh} onChange={(event) => setProductForm({ ...productForm, summaryZh: event.target.value })} />
                    <small>部分主题会在分类卡片或产品页显示描述。</small>
                  </label>
                  <div className="wp-taxonomy-actions">
                    <button type="button" onClick={submitProductForm}>{editingProductId ? "更新分类" : "添加新分类"}</button>
                    {editingProductId ? <button type="button" onClick={resetProductForm}>取消编辑</button> : null}
                  </div>
                </aside>

                <section className="wp-taxonomy-list">
                  <div className="wp-list-toolbar taxonomy">
                    <select value={productBulkAction} onChange={(event) => setProductBulkAction(event.target.value)}>
                      <option value="">批量操作</option>
                      <option value="delete">删除</option>
                    </select>
                    <button type="button" onClick={applyProductBulkAction}>应用</button>
                    <input placeholder="搜索分类" value={productQuery} onChange={(event) => setProductQuery(event.target.value)} />
                  </div>
                  <div className="wp-article-table taxonomy-table" role="table" aria-label="产品分类列表">
                    <div className="wp-taxonomy-row header" role="row">
                      <span>
                        <input
                          type="checkbox"
                          aria-label="选择全部分类"
                          checked={allVisibleProductsSelected}
                          onChange={(event) => toggleVisibleProducts(event.target.checked)}
                        />
                      </span>
                      <strong>名称</strong>
                      <strong>描述</strong>
                      <strong>别名</strong>
                      <strong>父级</strong>
                      <strong>总数</strong>
                    </div>
                    {filteredProducts.map((product) => {
                      const productId = product.id ?? product.slug;
                      const parent = state.products.find((item) => (item.id ?? item.slug) === product.parentId);

                      return (
                        <div className="wp-taxonomy-row" role="row" key={productId}>
                          <span>
                            <input
                              type="checkbox"
                              aria-label={`选择 ${product.name.zh || product.name.en}`}
                              checked={selectedProductIds.includes(productId)}
                              onChange={(event) => toggleProductSelection(productId, event.target.checked)}
                            />
                          </span>
                          <button type="button" onClick={() => editProduct(product)}>
                            {product.name.zh || product.name.en}
                            <small>编辑</small>
                          </button>
                          <span>{product.summary.zh || product.summary.en || "-"}</span>
                          <span>{product.slug}</span>
                          <span>{parent ? parent.name.zh || parent.name.en : "-"}</span>
                          <span>0</span>
                          <div className="wp-row-actions">
                            <button type="button" onClick={() => editProduct(product)}>编辑</button>
                            <button
                              type="button"
                              onClick={() => {
                                const nextState = { ...state, products: state.products.filter((item) => (item.id ?? item.slug) !== productId) };
                                setState(nextState);
                                void save(nextState);
                              }}
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {filteredProducts.length === 0 ? <div className="wp-empty-row">没有找到分类。</div> : null}
                  </div>
                </section>
              </div>
            </>
          ) : null}

          {tab === "articles" ? (
            <>
              <div className="admin-section-title">
                <h1>{articleMode === "list" ? "文章" : "写文章"}</h1>
                <button
                  type="button"
                  onClick={() => {
                    const article = emptyArticle();
                    setState({ ...state, articles: [article, ...state.articles] });
                    setActiveArticleId(article.id ?? article.slug);
                    setArticleMode("editor");
                  }}
                >
                  写文章
                </button>
              </div>

              <div className="wp-screen-tabs">
                <button className={articleMode === "list" ? "active" : ""} type="button" onClick={() => setArticleMode("list")}>所有文章</button>
                <button className={articleMode === "editor" ? "active" : ""} type="button" onClick={() => setArticleMode("editor")}>写文章</button>
              </div>

              {articleMode === "list" ? (
                <div className="wp-list-screen">
                  <div className="article-import-panel">
                    <div>
                      <strong>批量导入文章</strong>
                      <span>下载 CSV 模板后填写标题、分类、状态和正文，导入后会自动保存到前台文章数据。</span>
                    </div>
                    <div className="article-import-actions">
                      <button type="button" onClick={downloadArticleImportTemplate}>
                        下载导入模板
                      </button>
                      <label className="article-import-upload">
                        导入 CSV
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          onChange={(event) => {
                            importArticlesFromCsv(event.currentTarget.files?.[0] ?? null);
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="wp-counts">
                    <button type="button" onClick={() => setArticleStatusFilter("all")}>全部 ({articleCounts.all})</button>
                    <button type="button" onClick={() => setArticleStatusFilter("published")}>已发布 ({articleCounts.published})</button>
                    <button type="button" onClick={() => setArticleStatusFilter("draft")}>草稿 ({articleCounts.draft})</button>
                    <button type="button" onClick={() => setArticleStatusFilter("trash")}>回收站 ({articleCounts.trash})</button>
                  </div>

                  <div className="wp-list-toolbar article-bulk-toolbar">
                    <select value={articleBulkAction} onChange={(event) => setArticleBulkAction(event.target.value)}>
                      <option value="">批量操作</option>
                      <option value="trash">移至回收站</option>
                      <option value="restore">恢复</option>
                      <option value="delete">永久删除</option>
                    </select>
                    <button type="button" disabled={!articleBulkAction || selectedArticleIds.length === 0} onClick={applyArticleBulkAction}>
                      应用
                    </button>
                    <span>{selectedArticleIds.length > 0 ? `已选择 ${selectedArticleIds.length} 篇文章` : "选择文章后可批量处理"}</span>
                  </div>

                  <div className="wp-list-toolbar">
                    <select value={articleStatusFilter} onChange={(event) => setArticleStatusFilter(event.target.value as "all" | "published" | "draft" | "trash")}>
                      <option value="all">全部状态</option>
                      <option value="published">已发布</option>
                      <option value="draft">草稿</option>
                      <option value="trash">回收站</option>
                    </select>
                    <select value={articleCategoryFilter} onChange={(event) => setArticleCategoryFilter(event.target.value as Article["category"] | "all")}>
                      <option value="all">所有分类</option>
                      {articleCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                    <input placeholder="搜索文章" value={articleQuery} onChange={(event) => setArticleQuery(event.target.value)} />
                  </div>

                  <div className="wp-article-table" role="table" aria-label="文章列表">
                    <div className="wp-article-row header" role="row">
                      <span>
                        <input
                          aria-label="选择全部文章"
                          checked={allVisibleArticlesSelected}
                          disabled={visibleArticleIds.length === 0}
                          onChange={(event) => toggleVisibleArticles(event.target.checked)}
                          type="checkbox"
                        />
                      </span>
                      <strong>标题</strong>
                      <strong>作者</strong>
                      <strong>分类目录</strong>
                      <strong>状态</strong>
                      <strong>日期</strong>
                    </div>
                    {filteredArticles.map((article) => {
                      const articleId = article.id ?? article.slug;

                      return (
                        <div className="wp-article-row" role="row" key={articleId}>
                          <span>
                            <input
                              aria-label={`选择 ${article.title.zh || article.title.en}`}
                              checked={selectedArticleIds.includes(articleId)}
                              onChange={(event) => toggleArticleSelection(articleId, event.target.checked)}
                              type="checkbox"
                            />
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveArticleId(articleId);
                              setArticleMode("editor");
                            }}
                          >
                            {article.title.zh || article.title.en || "未命名文章"}
                            <small>编辑 · {article.slug}</small>
                          </button>
                          <span>{currentEmail}</span>
                          <span>{article.category}</span>
                          <span>{articleStatusLabel(article)}{article.featuredOnHome && article.status !== "trash" ? " · 首页" : ""}</span>
                          <span>{article.status === "trash" ? (article.deletedAt ? new Date(article.deletedAt).toLocaleString() : "已移至回收站") : (article.publishedAt ? new Date(article.publishedAt).toLocaleString() : "尚未发布")}</span>
                        </div>
                      );
                    })}
                    {filteredArticles.length === 0 ? <div className="wp-empty-row">没有找到文章。</div> : null}
                  </div>
                </div>
              ) : null}

              {articleMode === "editor" ? (
                activeArticle && activeArticleIndex >= 0 ? (
                  <div className="wp-editor-screen">
                    <article className="wp-editor">
                      <input
                        className="wp-title-input"
                        placeholder="添加标题"
                        value={activeArticle.title.zh ?? ""}
                        onChange={(event) => updateActiveArticle({ title: { ...activeArticle.title, zh: event.target.value } })}
                      />
                      <label>正文<textarea className="wp-body" value={activeArticle.body?.zh ?? ""} onChange={(event) => updateActiveArticle({ body: { ...(activeArticle.body ?? { en: "" }), zh: event.target.value } })} /></label>
                      <label>摘要<textarea className="wp-excerpt" value={activeArticle.excerpt.zh ?? ""} onChange={(event) => updateActiveArticle({ excerpt: { ...activeArticle.excerpt, zh: event.target.value } })} /></label>
                      <details className="wp-language-panel">
                        <summary>英文内容</summary>
                        <label>英文标题<input value={activeArticle.title.en} onChange={(event) => updateActiveArticle({ title: { ...activeArticle.title, en: event.target.value } })} /></label>
                        <label>英文摘要<textarea value={activeArticle.excerpt.en} onChange={(event) => updateActiveArticle({ excerpt: { ...activeArticle.excerpt, en: event.target.value } })} /></label>
                        <label>英文正文<textarea value={activeArticle.body?.en ?? ""} onChange={(event) => updateActiveArticle({ body: { ...(activeArticle.body ?? { en: "" }), en: event.target.value } })} /></label>
                      </details>
                    </article>

                    <aside className="wp-editor-side">
                      <section className="wp-side-box">
                        <h2>发布</h2>
                        {activeArticle.status !== "trash" ? (
                          <label className="checkline"><input type="checkbox" checked={Boolean(activeArticle.featuredOnHome)} onChange={(event) => updateActiveArticle({ featuredOnHome: event.target.checked })} />同步到首页</label>
                        ) : null}
                        <span>状态：{articleStatusLabel(activeArticle)}</span>
                        <span>日期：{activeArticle.status === "trash" ? (activeArticle.deletedAt ? new Date(activeArticle.deletedAt).toLocaleString() : "已移至回收站") : (activeArticle.publishedAt ? new Date(activeArticle.publishedAt).toLocaleString() : "立即发布")}</span>
                        <div className="wp-publish-box">
                          {activeArticle.status === "trash" ? (
                            <>
                              <button type="button" onClick={restoreActiveArticle}>恢复文章</button>
                              <button type="button" onClick={deleteActiveArticlePermanently}>永久删除</button>
                            </>
                          ) : (
                            <>
                              <button type="button" onClick={() => save()}>保存草稿</button>
                              <button type="button" onClick={() => commitArticle(activeArticleIndex, { status: "published", featuredOnHome: true, publishedAt: new Date().toISOString(), deletedAt: undefined })}>发布</button>
                              <button type="button" onClick={moveActiveArticleToTrash}>移至回收站</button>
                            </>
                          )}
                        </div>
                      </section>

                      <section className="wp-side-box">
                        <h2>分类目录</h2>
                        <label>分类
                          <select value={activeArticle.category} onChange={(event) => updateActiveArticle({ category: event.target.value as Article["category"] })}>
                            {articleCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                          </select>
                        </label>
                      </section>

                      <section className="wp-side-box">
                        <h2>固定链接</h2>
                        <label>Slug<input value={activeArticle.slug} onChange={(event) => updateActiveArticle({ slug: event.target.value })} /></label>
                      </section>
                    </aside>
                  </div>
                ) : (
                  <div className="wp-editor empty">还没有文章，点击“写文章”开始。</div>
                )
              ) : null}
            </>
          ) : null}

          {tab === "leads" ? (
            <>
              <h1>询盘管理</h1>
              <div className="admin-table">
                {state.leads.length === 0 ? <p>暂无询盘。前台提交 RFQ 后会自动进入这里。</p> : null}
                {state.leads.map((lead) => (
                  <div className="admin-row" key={lead.id}>
                    <strong>{lead.productType}</strong>
                    <span>{lead.email}</span>
                    <span>{lead.destination || "No destination"}</span>
                    <select
                      value={lead.status}
                      onChange={(event) =>
                        setState({
                          ...state,
                          leads: state.leads.map((item) => item.id === lead.id ? { ...item, status: event.target.value as LeadStatus } : item)
                        })
                      }
                    >
                      {leadStatuses.map((statusOption) => <option key={statusOption}>{statusOption}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {tab === "contacts" ? (
            <>
              <div className="admin-section-title">
                <h1>社交媒体与联系浮窗</h1>
                <button type="button" onClick={() => save()}>
                  保存联系方式
                </button>
              </div>
              <div className="admin-form-list">
                {state.contactChannels.map((channel, index) => (
                  <article className="admin-edit-card compact contact-card" key={channel.id}>
                    <label>显示名称<input value={channel.label.zh ?? channel.label.en} onChange={(event) => updateContact(index, { label: { ...channel.label, zh: event.target.value } })} /></label>
                    <label>类型
                      <select value={channel.type} onChange={(event) => updateContact(index, { type: event.target.value as ContactChannelType })}>
                        {contactTypeOptions.map((type) => (
                          <option key={type} value={type}>{contactTypePresets[type].zh}</option>
                        ))}
                      </select>
                    </label>
                    <label>账号/号码<input value={channel.value ?? ""} onChange={(event) => updateContact(index, { value: event.target.value })} /></label>
                    <label>链接<input value={channel.href ?? ""} onChange={(event) => updateContact(index, { href: event.target.value })} /></label>
                    <label>颜色<input type="color" value={channel.color || contactTypePresets[channel.type].color} onChange={(event) => updateContact(index, { color: event.target.value })} /></label>
                    <label className="checkline"><input type="checkbox" checked={channel.enabled} onChange={(event) => updateContact(index, { enabled: event.target.checked })} />启用</label>
                    <button className="contact-delete-button" type="button" onClick={() => removeContactChannel(channel.id)}>删除</button>
                    <div className="contact-qr-manager">
                      <div>
                        <strong>二维码图片</strong>
                        <span>适合微信、WhatsApp、Zalo、Line、Facebook、Instagram、TikTok、Messenger 或任意扫码联系渠道。</span>
                      </div>
                      <label className="contact-qr-upload">
                        上传二维码
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            uploadContactQr(index, event.currentTarget.files?.[0] ?? null);
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                      {channel.qrCodeUrl ? (
                        <div className="contact-qr-preview">
                          <Image src={channel.qrCodeUrl} alt={`${channel.label.zh ?? channel.label.en} 二维码`} width={58} height={58} unoptimized />
                          <button type="button" onClick={() => updateContact(index, { qrCodeUrl: undefined })}>移除二维码</button>
                        </div>
                      ) : (
                        <span className="contact-qr-empty">未上传二维码</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              <section className="contact-create-panel">
                <div>
                  <strong>新增联系方式</strong>
                  <span>可新增 Zalo、Line、Facebook、Instagram、TikTok，或选择自定义渠道。</span>
                </div>
                <div className="contact-create-form">
                  <label>类型
                    <select value={contactForm.type} onChange={(event) => selectContactFormType(event.target.value as ContactChannelType)}>
                      {contactTypeOptions.map((type) => (
                        <option key={type} value={type}>{contactTypePresets[type].zh}</option>
                      ))}
                    </select>
                  </label>
                  <label>中文名称
                    <input value={contactForm.zh} onChange={(event) => setContactForm({ ...contactForm, zh: event.target.value })} />
                  </label>
                  <label>英文名称
                    <input value={contactForm.en} onChange={(event) => setContactForm({ ...contactForm, en: event.target.value })} />
                  </label>
                  <label>账号/号码
                    <input value={contactForm.value} onChange={(event) => setContactForm({ ...contactForm, value: event.target.value })} />
                  </label>
                  <label>链接
                    <input value={contactForm.href} onChange={(event) => setContactForm({ ...contactForm, href: event.target.value })} />
                  </label>
                  <label>颜色
                    <input type="color" value={contactForm.color} onChange={(event) => setContactForm({ ...contactForm, color: event.target.value })} />
                  </label>
                  <button type="button" onClick={addContactChannel}>新增联系方式</button>
                </div>
              </section>
            </>
          ) : null}

          {tab === "users" ? (
            <>
              <h1>多用户与权限</h1>
              <div className="admin-table">
                {state.users.map((user) => (
                  <div className="admin-row" key={user.id}>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <select
                      value={user.role}
                      onChange={(event) =>
                        setState({
                          ...state,
                          users: state.users.map((item) => item.id === user.id ? { ...item, role: event.target.value as RoleKey } : item)
                        })
                      }
                    >
                      {roleOptions.map((role) => <option key={role}>{role}</option>)}
                    </select>
                    <label className="checkline"><input type="checkbox" checked={user.active} onChange={(event) => setState({ ...state, users: state.users.map((item) => item.id === user.id ? { ...item, active: event.target.checked } : item) })} />启用</label>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {tab === "settings" ? (
            <>
              <div className="admin-section-title">
                <h1>前台设置</h1>
                <button type="button" onClick={() => save()}>
                  保存前台设置
                </button>
              </div>

              <section className="settings-panel">
                <div className="settings-panel-head">
                  <h2>前台可显示语言</h2>
                  <span>勾选后会出现在前台语言选择器中，URL 路由和 RTL 方向仍自动兼容。</span>
                </div>
                <div className="language-toggle-grid">
                  {locales.map((item) => {
                    const localeCode = item.code as LocaleCode;

                    return (
                      <label className="language-toggle" key={item.code}>
                        <input
                          type="checkbox"
                          checked={state.enabledLocales.includes(localeCode)}
                          onChange={(event) => toggleEnabledLocale(localeCode, event.target.checked)}
                        />
                        <span>
                          <strong>{item.nativeName}</strong>
                          <small>{item.label} · {item.region}</small>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section className="settings-panel">
                <div className="settings-panel-head with-action">
                  <div>
                    <h2>首页导航栏</h2>
                    <span>可设置前台 Header 显示的导航名称、链接、排序和是否启用。</span>
                  </div>
                  <button type="button" onClick={addNavigationItem}>新增导航</button>
                </div>
                <div className="navigation-settings-list">
                  {sortedNavigation.map((item) => (
                    <article className="admin-edit-card compact nav-settings-card" key={item.id}>
                      <label>中文名称
                        <input value={item.label.zh ?? item.label.en} onChange={(event) => updateNavigationItem(item.id, { label: { ...item.label, zh: event.target.value } })} />
                      </label>
                      <label>英文名称
                        <input value={item.label.en} onChange={(event) => updateNavigationItem(item.id, { label: { ...item.label, en: event.target.value } })} />
                      </label>
                      <label>链接
                        <input value={item.href} onChange={(event) => updateNavigationItem(item.id, { href: event.target.value })} />
                      </label>
                      <label>排序
                        <input type="number" value={item.order} onChange={(event) => updateNavigationItem(item.id, { order: Number(event.target.value) || 0 })} />
                      </label>
                      <label className="checkline"><input type="checkbox" checked={item.enabled} onChange={(event) => updateNavigationItem(item.id, { enabled: event.target.checked })} />显示</label>
                      <label className="checkline"><input type="checkbox" checked={Boolean(item.openInNewTab)} onChange={(event) => updateNavigationItem(item.id, { openInNewTab: event.target.checked })} />新窗口</label>
                      <button className="contact-delete-button" type="button" onClick={() => removeNavigationItem(item.id)}>删除</button>
                    </article>
                  ))}
                </div>
              </section>
            </>
          ) : null}

          {tab === "themes" ? (
            <>
              <h1>主题样式</h1>
              <p>点击主题后会立即预览并保存，前台刷新后同样生效。</p>
              <div className="theme-picker theme-picker-detailed">
                {themeOptions.map((theme) => (
                  <button
                    className={state.activeTheme === theme ? "active" : ""}
                    key={theme}
                    onClick={() => switchTheme(theme)}
                    type="button"
                    style={{
                      "--theme-primary": themes[theme].colors.primary,
                      "--theme-accent": themes[theme].colors.accent,
                      "--theme-bg": themes[theme].colors.background
                    } as React.CSSProperties}
                  >
                    <span className="theme-swatch" />
                    <strong>{themes[theme].name}</strong>
                    <small>{themes[theme].description}</small>
                  </button>
                ))}
              </div>
              <div className="theme-live-preview">
                <div>
                  <span className="eyebrow">Theme preview</span>
                  <h2>{themes[state.activeTheme].name}</h2>
                  <p>{themes[state.activeTheme].description}</p>
                </div>
                <div className="theme-preview-card">
                  <strong>RFQ Button</strong>
                  <span>Header, cards, buttons, forms and front page sections follow this theme.</span>
                  <button type="button">Primary action</button>
                </div>
              </div>
            </>
          ) : null}

          {tab === "account" ? (
            <>
              <h1>账号设置</h1>
              <div className="account-settings-grid">
                <section className="account-profile-card">
                  <div className="account-avatar-large">
                    {currentUser?.avatarUrl ? <Image src={currentUser.avatarUrl} alt={currentUserName} width={96} height={96} unoptimized /> : accountInitial}
                  </div>
                  <label>显示名称
                    <input value={currentUser?.name ?? ""} onChange={(event) => updateCurrentUser({ name: event.target.value })} />
                  </label>
                  <label>登录邮箱
                    <input type="email" value={currentUser?.email ?? ""} onChange={(event) => updateCurrentUser({ email: event.target.value })} />
                    <small>修改邮箱后，下次登录请使用新邮箱。</small>
                  </label>
                  <label>职位/备注
                    <input value={currentUser?.jobTitle ?? ""} onChange={(event) => updateCurrentUser({ jobTitle: event.target.value })} />
                  </label>
                  <label>联系电话
                    <input value={currentUser?.phone ?? ""} onChange={(event) => updateCurrentUser({ phone: event.target.value })} />
                  </label>
                  <label className="account-avatar-upload">
                    上传头像
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        uploadAccountAvatar(event.currentTarget.files?.[0] ?? null);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  {currentUser?.avatarUrl ? <button type="button" onClick={() => updateCurrentUser({ avatarUrl: undefined })}>移除头像</button> : null}
                </section>

                <section className="account-security-card">
                  <h2>账号与密码</h2>
                  <div className="account-info-list">
                    <div><span>后台名称</span><strong>ExportForge Admin</strong></div>
                    <div><span>登录邮箱</span><strong>{currentEmail}</strong></div>
                    <div><span>当前角色</span><strong>{currentUser?.role ?? "admin"}</strong></div>
                    <div><span>账号状态</span><strong>{currentUser?.active ? "启用" : "停用"}</strong></div>
                    <div><span>后台状态</span><strong>{status}</strong></div>
                    <div><span>更新时间</span><strong>{new Date(state.updatedAt).toLocaleString()}</strong></div>
                  </div>
                  <div className="account-password-form">
                    <label>当前密码
                      <input
                        type="password"
                        value={accountPassword.current}
                        onChange={(event) => setAccountPassword({ ...accountPassword, current: event.target.value })}
                      />
                      <small>修改邮箱或密码时必须填写当前密码。</small>
                    </label>
                    <label>新密码
                      <input
                        type="password"
                        value={accountPassword.next}
                        onChange={(event) => setAccountPassword({ ...accountPassword, next: event.target.value })}
                      />
                    </label>
                    <label>确认新密码
                      <input
                        type="password"
                        value={accountPassword.confirm}
                        onChange={(event) => setAccountPassword({ ...accountPassword, confirm: event.target.value })}
                      />
                      <small>不修改密码时留空。</small>
                    </label>
                  </div>
                  <div className="account-actions">
                    <button type="button" onClick={saveAccountSettings}>保存账号设置</button>
                    <button type="button" onClick={logout}>退出登录</button>
                  </div>
                </section>
              </div>
            </>
          ) : null}

          {tab === "ai" ? (
            <>
              <h1>AI 内容生成设置</h1>
              <div className="admin-edit-card">
                <label>供应商<input value={state.aiSettings.provider} onChange={(event) => setState({ ...state, aiSettings: { ...state.aiSettings, provider: event.target.value } })} /></label>
                <label>模型<input value={state.aiSettings.model} onChange={(event) => setState({ ...state, aiSettings: { ...state.aiSettings, model: event.target.value } })} /></label>
                <label className="wide">品牌语气<textarea value={state.aiSettings.brandVoice} onChange={(event) => setState({ ...state, aiSettings: { ...state.aiSettings, brandVoice: event.target.value } })} /></label>
                <label className="wide">目标市场<input value={state.aiSettings.targetMarkets.join(", ")} onChange={(event) => setState({ ...state, aiSettings: { ...state.aiSettings, targetMarkets: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) } })} /></label>
                <label className="wide">必须包含关键词<input value={state.aiSettings.requiredKeywords.join(", ")} onChange={(event) => setState({ ...state, aiSettings: { ...state.aiSettings, requiredKeywords: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) } })} /></label>
                <label className="checkline"><input type="checkbox" checked={state.aiSettings.enabled} onChange={(event) => setState({ ...state, aiSettings: { ...state.aiSettings, enabled: event.target.checked } })} />启用 AI 草稿入口</label>
                <button type="button" onClick={generateAiArticleDraft}>一键生成文章草稿</button>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
