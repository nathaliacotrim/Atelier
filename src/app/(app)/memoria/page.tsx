import { exigirPerfil, exigirUsuaria } from "@/lib/dados";
import type { Memoria } from "@/lib/tipos";
import { adicionarMemoria, excluirMemoria } from "../acoes";

// Página por usuária: renderiza a cada pedido.
export const instant = false;

export default async function PaginaMemoria() {
  const { supabase } = await exigirUsuaria();
  const perfil = await exigirPerfil();
  const { data } = await supabase
    .from("memorias")
    .select("*")
    .eq("perfil_id", perfil.id)
    .order("criado_em", { ascending: false });
  const memorias = (data ?? []) as Memoria[];

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-4xl font-semibold">Memória da IA</h1>
      <p className="mt-2 text-cinza">O que a IA aprendeu sobre {perfil.arroba} e as suas preferências.</p>

      <div className="mt-6 rounded-2xl bg-bege/50 p-4 text-sm leading-relaxed">
        <strong className="font-medium">Como funciona:</strong> a cada conversa, a IA analisa suas correções,
        preferências e estilo, e guarda o que for útil para os próximos conteúdos. Quanto mais você usa,
        mais ela acerta. Você pode apagar o que não fizer sentido ou ensinar algo direto aqui.
      </div>

      <form action={adicionarMemoria} className="mt-6 flex gap-2">
        <input
          name="texto"
          required
          placeholder="Ex: nunca usar a palavra 'dieta', prefira 'alimentação'"
          className="flex-1 rounded-2xl border border-linha bg-white px-4 py-3 outline-none focus:border-vinho"
        />
        <button className="rounded-2xl bg-vinho px-5 text-sm font-medium text-creme hover:bg-vinho-escuro">
          Ensinar
        </button>
      </form>

      <ul className="mt-6 space-y-2">
        {memorias.map((m) => (
          <li key={m.id} className="flex items-start gap-3 rounded-2xl border border-linha bg-white/70 p-4">
            <span className="flex-1 text-sm leading-relaxed">{m.texto}</span>
            <span className="shrink-0 text-xs text-cinza">{m.origem === "manual" ? "você" : "IA"}</span>
            <form action={excluirMemoria}>
              <input type="hidden" name="id" value={m.id} />
              <button className="text-xs text-cinza hover:text-red-700" aria-label="Apagar memória">
                Apagar
              </button>
            </form>
          </li>
        ))}
      </ul>
      {memorias.length === 0 && (
        <p className="mt-12 text-center text-cinza">
          Nenhuma memória ainda. A IA ainda não aprendeu nada sobre você; converse com ela.
        </p>
      )}
    </div>
  );
}
