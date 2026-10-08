import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { NOME_APP } from "@/lib/marca";
import "./globals.css";

const titulo = Playfair_Display({
  variable: "--fonte-titulo",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
