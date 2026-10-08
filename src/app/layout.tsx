import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { NOME_APP } from "@/lib/marca";
import "./globals.css";

const titulo = Cormorant_Garamond({
  variable: "--fonte-titulo",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const texto = Inter({
  variable: "--fonte-texto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: NOME_APP,
  description: "Crie conteúdo para Instagram com IA, com a voz da sua marca.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${texto.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
