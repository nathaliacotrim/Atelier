import Link from "next/link";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import { NOME_APP } from "@/lib/marca";

// Página por usuária: renderiza a cada pedido.
export const instant = false;

const RECURSOS = [
  ["Briefing da marca", "A IA aprende seu nicho, público, produtos e tom de voz."],
  ["Roteiros prontos", "Reels, carrosséis e stories pensados para crescer, engajar ou vender."],
  ["Chat para ajustar", "Peça mudanças e refine o conteúdo em tempo real."],
  ["Arte do carrossel", "Slides prontos para postar, com as cores da sua marca."],
  ["Memória", "Quanto mais você usa, mais o conteúdo soa como você."],
  ["Vários perfis", "Cada conta com seu público, produtos e tom separados."],
];

export default async function Inicio() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/criar");

  return (
    <main className="mx-auto flex max-w-5xl flex-col px-6 py-16">
      <p className="font-serif text-2xl italic text-vinho">{NOME_APP}</p>
      <h1 className="mt-10 max-w-2xl font-serif text-5xl leading-tight sm:text-6xl">
        Conteúdo para Instagram com <em className="text-vinho">a voz da sua marca</em>.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-cinza">
        Do briefing ao post pronto: roteiro, legenda e arte, feitos por uma IA que conhece o seu
        negócio.
      </p>
      <div className="mt-10">
        <Link
          href="/entrar"
          className="inline-block rounded-full bg-vinho px-8 py-3 font-medium text-creme hover:bg-vinho-escuro"
        >
          Começar agora
        </Link>
      </div>
      <ul className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {RECURSOS.map(([nome, descricao]) => (
          <li key={nome} className="rounded-2xl border border-linha bg-white/60 p-6">
            <p className="font-serif text-xl text-vinho">{nome}</p>
            <p className="mt-2 text-sm leading-relaxed text-cinza">{descricao}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
