import { NextResponse } from "next/server";
import { readAdminState } from "@/lib/server/admin-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readAdminState();

  return NextResponse.json({
    contactChannels: state.contactChannels,
    enabledLocales: state.enabledLocales,
    navigation: state.navigation,
    siteTitle: state.siteSettings.title
  }, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
