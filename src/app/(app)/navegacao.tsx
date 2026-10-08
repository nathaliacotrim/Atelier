"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/criar", nome: "Criar" },
  { href: "/historico", nome: "Histórico" },
  { href: "/memoria", nome: "Memória da IA" },
  { href: "/perfis", nome: "Perfis" },
];

export function Navegacao() {
  const caminho = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {ITENS.map((item) => {
        const ativo = caminho.startsWith(item.href) || (item.href === "/criar" && caminho.startsWith("/conteudos"));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm ${ativo ? "bg-vinho text-creme" : "text-tinta hover:bg-bege/60"}`}
          >
            {item.nome}
          </Link>
        );
      })}
    </nav>
  );
}
