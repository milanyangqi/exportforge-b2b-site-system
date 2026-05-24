import { NextResponse } from "next/server";
import { readAdminState, writeAdminState } from "@/lib/server/admin-store";
import type { LeadPayload } from "@/types/site";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<LeadPayload>;

  if (!payload.fullName || !payload.productType || !payload.quantity || !payload.email || !emailPattern.test(payload.email)) {
    return NextResponse.json({ error: "Missing required RFQ fields." }, { status: 400 });
  }

  const lead = {
    id: crypto.randomUUID(),
    status: "new" as const,
    createdAt: new Date().toISOString(),
    fullName: payload.fullName,
    company: payload.company ?? "",
    productType: payload.productType,
    quantity: payload.quantity,
    email: payload.email,
    whatsapp: payload.whatsapp ?? "",
    destination: payload.destination ?? "",
    workpieceMaterial: payload.workpieceMaterial ?? "",
    message: payload.message ?? "",
    locale: payload.locale ?? "en",
    sourcePath: payload.sourcePath ?? ""
  };

  const state = await readAdminState();
  await writeAdminState({ ...state, leads: [lead, ...state.leads] });

  return NextResponse.json({
    ok: true,
    lead,
    integrations: {
      persistence: "Connect this handler to Payload/PostgreSQL Lead collection.",
      notification: "Send email via SMTP/Resend using LEAD_NOTIFY_EMAIL.",
      crm: "Optional CRM adapter can be added without changing the form."
    }
  });
}
