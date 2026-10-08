import Link from "next/link";
import { exigirPerfil, exigirUsuaria } from "@/lib/dados";
import { FORMATOS, OBJETIVOS, nomeFormato, nomeObjetivo, type Conversa } from "@/lib/tipos";

// Página por usuária: renderiza a cada pedido.
export const instant = false;

export default async function Historico({ searchParams }: PageProps<"/historico">) {
  const filtros = await searchParams;
  const busca = typeof filtros.q === "string" ? filtros.q.trim() : "";
  const formato = typeof filtros.formato === "string" ? filtros.formato : "";
  const objetivo = typeof filtros.objetivo === "string" ? filtros.objetivo : "";

  const { supabase } = await exigirUsuaria();
  const perfil = await exigirPerfil();

  let consulta = supabase
    .from("conversas")
    .select("*")
    .eq("perfil_id", perfil.id)
    .order("atualizado_em", { ascending: false })
    .limit(100);
  if (busca) consulta = consulta.ilike("titulo", `%${busca.replace(/[%_]/g, "")}%`);
  if (FORMATOS.some((f) => f.valor === formato)) consulta = consulta.eq("formato", formato);
  if (OBJETIVOS.some((o) => o.valor === objetivo)) consulta = consulta.eq("objetivo", objetivo);
  const { data } = await consulta;
  const conversas = (data ?? []) as Conversa[];

  const link = (mudar: Record<string, string>) => {
    const p = new URLSearchParams({ q: busca, formato, objetivo, ...mudar });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    const s = p.toString();
    return s ? `/historico?${s}` : "/historico";
  };

  const chips = [
    ...FORMATOS.map((f) => ({ chave: "formato", valor: f.valor, nome: f.nome, ativo: formato === f.valor })),
    ...OBJETIVOS.map((o) => ({ chave: "objetivo", valor: o.valor, nome: o.nome, ativo: objetivo === o.valor })),
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-4xl font-semibold">Histórico de conteúdos</h1>
      <p className="mt-2 text-cinza">Tudo o que você criou para {perfil.arroba}.</p>

      <form action="/historico" className="mt-8">
        {formato && <input type="hidden" name="formato" value={formato} />}
        {objetivo && <input type="hidden" name="objetivo" value={objetivo} />}
        <input
          name="q"
          defaultValue={busca}
          placeholder="Buscar conteúdos..."
          className="w-full rounded-2xl border border-linha bg-white px-4 py-3 outline-none focus:border-vinho"
        />
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((c) => (
          <Link
            key={c.valor}
            href={link({ [c.chave]: c.ativo ? "" : c.valor })}
            className={`rounded-full border px-3 py-1 text-xs ${c.ativo ? "border-vinho bg-vinho text-creme" : "border-linha bg-white text-cinza hover:border-vinho"}`}
          >
            {c.nome}
          </Link>
        ))}
      </div>

      <ul className="mt-8 space-y-3">
        {conversas.map((c) => (
          <li key={c.id}>
            <Link
              href={`/conteudos/${c.id}`}
              className="block rounded-2xl border border-linha bg-white/70 p-5 hover:border-vinho"
            >
              <span className="block font-medium">{c.titulo}</span>
              <span className="mt-1 block text-xs text-cinza">
                {nomeFormato(c.formato)} · {nomeObjetivo(c.objetivo)} ·{" "}
                {new Date(c.atualizado_em).toLocaleDateString("pt-BR")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {conversas.length === 0 && (
        <div className="mt-16 text-center">
          <p className="font-medium">Nenhum conteúdo ainda</p>
          <p className="mt-1 text-sm text-cinza">Comece criando seu primeiro conteúdo.</p>
          <Link
            href="/criar"
            className="mt-4 inline-block rounded-full bg-vinho px-6 py-2.5 text-sm font-medium text-creme"
          >
            Criar conteúdo
          </Link>
        </div>
      )}
    </div>
  );
}
