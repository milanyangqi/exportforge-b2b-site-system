import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/puck-public.css";
import "@/styles/public-site.css";
import "@/styles/active-template.css";

export const metadata: Metadata = {
  title: "Rivermake | Handcrafted Textiles for Home",
  description: "Explore Rivermake crochet, knit and woven home textiles inspired by gardens and everyday living.",
  robots: {
    index: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true",
    follow: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
