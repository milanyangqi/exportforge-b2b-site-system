import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "KeyproTools | Carbide End Mills, Drill Bits, and OEM Cutting Tools",
  description: "KeyproTools supplies carbide end mills, drill bits, coatings, OEM laser marking, private-label packaging, and export-ready cutting tool programs."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
