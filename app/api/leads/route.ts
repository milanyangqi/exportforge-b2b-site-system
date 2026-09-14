import { NextResponse } from "next/server";
import { readAdminState, writeAdminState } from "@/lib/server/admin-store";
import type { LeadPayload } from "@/types/site";
const limits = {
  fullName: 120,
  company: 120,
  productType: 120,
  quantity: 120,
  email: 254,
  whatsapp: 80,
  destination: 120,
  workpieceMaterial: 120,
  length: 80,
  diameter: 80,
  tipType: 80,
  packaging: 120,
  message: 4000,
  sourcePath: 500,
} as const;
export async function POST(request: Request) {
  let input: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 16000)
      return NextResponse.json(
        { error: "Enquiry is too long." },
        { status: 413 },
      );
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new Error();
    input = parsed;
  } catch {
    return NextResponse.json({ error: "Invalid enquiry." }, { status: 400 });
  }
  const payload: Record<string, string> = {};
  for (const [key, max] of Object.entries(limits)) {
    const value = input[key];
    if (
      value !== undefined &&
      (typeof value !== "string" || value.length > max)
    )
      return NextResponse.json(
        { error: "Invalid enquiry field." },
        { status: 400 },
      );
    payload[key] = (typeof value === "string" ? value : "").trim();
  }
  if (
    !payload.fullName ||
    !payload.productType ||
    !payload.quantity ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)
  )
    return NextResponse.json(
      { error: "Missing required RFQ fields." },
      { status: 400 },
    );
  const lead = {
    ...(payload as unknown as LeadPayload),
    locale: input.locale === "zh" ? ("zh" as const) : ("en" as const),
    id: crypto.randomUUID(),
    status: "new" as const,
    createdAt: new Date().toISOString(),
  };
  try {
    const state = await readAdminState();
    await writeAdminState({ ...state, leads: [lead, ...state.leads] });
    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to save enquiry. Please retry." },
      { status: 503 },
    );
  }
}
