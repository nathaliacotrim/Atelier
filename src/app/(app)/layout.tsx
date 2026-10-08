import Link from "next/link";
import { listarPerfis, perfilAtivo } from "@/lib/dados";
import { NOME_APP } from "@/lib/marca";
import { sair } from "@/app/entrar/acoes";
import { SeletorPerfil } from "./seletor-perfil";
import { Navegacao } from "./navegacao";

// Página por usuária: renderiza a cada pedido.
export const instant = false;

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const [perfis, ativo] = await Promise.all([listarPerfis(), perfilAtivo()]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-b border-linha bg-white/70 p-5 md:sticky md:top-0 md:h-screen md:w-64 md:border-r md:border-b-0">
        <Link href="/criar" className="font-serif text-3xl italic text-vinho">
          {NOME_APP}
        </Link>
        {ativo && (
          <SeletorPerfil perfis={perfis.map((p) => ({ id: p.id, arroba: p.arroba, nicho: p.nicho }))} ativoId={ativo.id} />
        )}
        <Navegacao />
        <form action={sair} className="mt-auto hidden md:block">
          <button className="text-sm text-cinza hover:text-vinho">Sair</button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}
