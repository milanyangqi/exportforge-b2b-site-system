import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/puck-public.css";
import "@/styles/public-site.css";
import "@/styles/active-template.css";
import "@/styles/product-catalog.css";

export const metadata: Metadata = {
  title: "Xiyida Packaging | Custom Tin Box Packaging Manufacturer",
  description: "Xiyida Packaging manufactures custom tin boxes for food, gifts, cosmetics, tea, coffee, candles, and export-ready packaging programs.",
  robots: {
    index: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true",
    follow: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
