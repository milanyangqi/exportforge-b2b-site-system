import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/puck-public.css";
import "@/styles/public-site.css";
import "@/styles/active-template.css";

export const metadata: Metadata = {
  title: "DawnOrigin | Beauty Tools & Custom Collections",
  description: "Explore makeup brushes, sponges, lash tools and gift sets for your next collection.",
  robots: {
    index: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true",
    follow: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
