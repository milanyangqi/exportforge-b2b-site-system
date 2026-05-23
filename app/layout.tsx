import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "ExportForge | Multilingual B2B Export Site System",
  description: "A customizable B2B export independent site system with multilingual SEO, RFQ leads, themes, RBAC, and AI content draft workflows."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
