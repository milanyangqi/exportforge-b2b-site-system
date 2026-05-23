import { articles, contactChannels, productCategories, siteSettings } from "@/data/site";
import type { AdminState } from "@/types/site";

type KvNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

type CloudflareContext = {
  env?: {
    EXPORTFORGE_KV?: KvNamespace;
  };
};

const stateKey = "admin-state";

export function createDefaultAdminState(): AdminState {
  return {
    products: productCategories,
    articles,
    leads: [],
    contactChannels,
    activeTheme: "industrial",
    users: [
      {
        id: "u-super-admin",
        name: "System Admin",
        email: process.env.INITIAL_ADMIN_EMAIL ?? "admin@example.com",
        role: "super-admin",
        active: true,
        jobTitle: "Owner"
      },
      {
        id: "u-sales",
        name: "Sales Manager",
        email: "sales@example.com",
        role: "sales",
        active: true,
        jobTitle: "Sales"
      }
    ],
    aiSettings: {
      provider: process.env.AI_PROVIDER ?? "openai-compatible",
      model: process.env.AI_MODEL ?? "gpt-4.1-mini",
      baseUrl: process.env.AI_BASE_URL ?? "",
      defaultLocale: "en",
      brandVoice: "Clear, technical, buyer-focused B2B export copy.",
      targetMarkets: ["Southeast Asia", "MENA", "Europe", "North America"],
      requiredKeywords: ["OEM", "RFQ", "factory direct", "quality inspection"],
      blockedWords: [],
      enabled: Boolean(process.env.AI_API_KEY)
    },
    updatedAt: new Date().toISOString()
  };
}

function mergeContactChannels(existingChannels = contactChannels) {
  const existingIds = new Set(existingChannels.map((channel) => channel.id));
  const missingDefaultChannels = contactChannels.filter((channel) => !existingIds.has(channel.id));

  return [...existingChannels, ...missingDefaultChannels];
}

async function getCloudflareKv() {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const context = await getCloudflareContext({ async: true }) as CloudflareContext;
    return context.env?.EXPORTFORGE_KV ?? null;
  } catch {
    return null;
  }
}

async function readLocalStateFile() {
  const [{ readFile }, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:path")
  ]);
  const statePath = path.join(process.cwd(), ".data", "admin-state.json");
  return readFile(statePath, "utf8");
}

async function writeLocalStateFile(value: string) {
  const [{ mkdir, writeFile }, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:path")
  ]);
  const dataDir = path.join(process.cwd(), ".data");
  const statePath = path.join(dataDir, "admin-state.json");

  await mkdir(dataDir, { recursive: true });
  await writeFile(statePath, value, "utf8");
}

function normalizeAdminState(parsed: AdminState): AdminState {
  return {
    ...parsed,
    products: (parsed.products ?? productCategories).map((product, index) => ({
      ...product,
      id: product.id ?? `product-${index}-${product.slug}`
    })),
    articles: (parsed.articles ?? articles).map((article) => ({
      ...article,
      id: article.id ?? `article-${article.slug}`,
      status: article.status ?? "published",
      featuredOnHome: article.featuredOnHome ?? true,
      publishedAt: article.publishedAt ?? parsed.updatedAt
    })),
    leads: parsed.leads ?? [],
    contactChannels: mergeContactChannels(parsed.contactChannels),
    users: parsed.users ?? createDefaultAdminState().users,
    activeTheme: parsed.activeTheme ?? "industrial",
    aiSettings: parsed.aiSettings ?? createDefaultAdminState().aiSettings,
    updatedAt: parsed.updatedAt ?? new Date().toISOString()
  };
}

export async function readAdminState(): Promise<AdminState> {
  try {
    const kv = await getCloudflareKv();
    const raw = kv ? await kv.get(stateKey) : await readLocalStateFile();
    if (!raw) throw new Error("Missing admin state");
    const parsed = JSON.parse(raw) as AdminState;
    return normalizeAdminState(parsed);
  } catch {
    const fallback = createDefaultAdminState();
    await writeAdminState(fallback);
    return fallback;
  }
}

export function sanitizeAdminState(state: AdminState): AdminState {
  return {
    ...state,
    users: state.users.map(({ passwordHash: _passwordHash, ...user }) => user)
  };
}

export function preserveUserPasswordHashes(nextState: AdminState, existingState: AdminState): AdminState {
  return {
    ...nextState,
    users: nextState.users.map((user) => {
      const existing = existingState.users.find((item) => item.id === user.id || item.email.toLowerCase() === user.email.toLowerCase());
      return {
        ...user,
        passwordHash: user.passwordHash ?? existing?.passwordHash
      };
    })
  };
}

export async function writeAdminState(state: AdminState): Promise<AdminState> {
  const nextState = { ...state, updatedAt: new Date().toISOString() };
  const serialized = JSON.stringify(nextState, null, 2);
  const kv = await getCloudflareKv();

  if (kv) {
    await kv.put(stateKey, serialized);
  } else {
    await writeLocalStateFile(serialized);
  }

  return nextState;
}
