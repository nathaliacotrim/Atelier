import Link from "next/link";
import { listarPerfis } from "@/lib/dados";

// Página por usuária: renderiza a cada pedido.
export const instant = false;

export default async function Perfis() {
  const perfis = await listarPerfis();
  return (
    <div className="max-w-3xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Perfis</h1>
          <p className="mt-2 text-cinza">Cada conta tem seu nicho, público, produtos e tom de voz.</p>
        </div>
        <Link
          href="/perfis/novo"
          className="shrink-0 rounded-full bg-vinho px-6 py-2.5 text-sm font-medium text-creme hover:bg-vinho-escuro"
        >
          Nova conta
        </Link>
      </div>
      <ul className="mt-8 space-y-3">
        {perfis.map((p) => (
          <li key={p.id}>
            <Link
              href={`/perfis/${p.id}`}
              className="flex items-center gap-4 rounded-2xl border border-linha bg-white/70 p-5 hover:border-vinho"
            >
              <span
                className="h-10 w-10 shrink-0 rounded-full border border-linha"
                style={{ background: `linear-gradient(135deg, ${p.cor_primaria} 50%, ${p.cor_secundaria} 50%)` }}
              />
              <span className="min-w-0">
                <span className="block font-medium text-vinho">{p.arroba}</span>
                <span className="block truncate text-sm text-cinza">{p.nicho || p.nome}</span>
              </span>
            </Link>
          </li>
        ))}
        {perfis.length === 0 && <p className="text-cinza">Nenhum perfil ainda.</p>}
      </ul>
    </div>
  );
}
