import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/puck-public.css";
import "@/styles/public-site.css";
import "@/styles/active-template.css";

export const metadata: Metadata = {
  title: "CedarOrigin | Botanical Home Fragrance Collections",
  description: "Explore CedarOrigin reed diffusers, scented candles, room sprays and home fragrance collection concepts.",
  robots: {
    index: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true",
    follow: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
