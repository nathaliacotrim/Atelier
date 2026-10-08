import { exigirPerfil } from "@/lib/dados";
import { FORMATOS, OBJETIVOS } from "@/lib/tipos";
import { criarConteudo } from "../acoes";
import { BotaoCriar } from "./botao-criar";

// Página por usuária: renderiza a cada pedido.
export const instant = false;

const ICONES: Record<string, string> = { reels: "▶", carrossel: "▦", stories: "▯" };

export default async function Criar() {
  const perfil = await exigirPerfil();

  return (
    <form action={criarConteudo} className="mx-auto max-w-3xl">
      <h1 className="text-center font-serif text-4xl">O que vamos criar?</h1>
      <p className="mt-2 text-center text-cinza">
        Para <span className="text-vinho">{perfil.arroba}</span>. Escolha o formato e o objetivo.
      </p>

      <fieldset className="mt-10">
        <legend className="mb-3 text-sm font-medium">Formato</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {FORMATOS.map((f, i) => (
            <label key={f.valor} className="cursor-pointer">
              <input type="radio" name="formato" value={f.valor} defaultChecked={i === 0} className="peer sr-only" />
              <span className="flex h-full flex-col items-center rounded-2xl border border-linha bg-white/70 p-5 text-center peer-checked:border-vinho peer-checked:bg-bege/40 peer-focus-visible:ring-2 peer-focus-visible:ring-vinho">
                <span className="text-2xl text-vinho">{ICONES[f.valor]}</span>
                <span className="mt-2 font-medium">{f.nome}</span>
                <span className="mt-1 text-xs leading-relaxed text-cinza">{f.descricao}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="mb-3 text-sm font-medium">Objetivo</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {OBJETIVOS.map((o, i) => (
            <label key={o.valor} className="cursor-pointer">
              <input type="radio" name="objetivo" value={o.valor} defaultChecked={i === 1} className="peer sr-only" />
              <span className="block h-full rounded-2xl border border-linha bg-white/70 p-4 peer-checked:border-vinho peer-checked:bg-bege/40 peer-focus-visible:ring-2 peer-focus-visible:ring-vinho">
                <span className="font-medium">{o.nome}</span>
                <span className="mt-1 block text-xs text-cinza">{o.descricao}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-8 block">
        <span className="text-sm font-medium">Tema (opcional)</span>
        <textarea
          name="tema"
          rows={3}
          placeholder="Ex: os 3 erros que fazem minhas clientes desistirem da dieta. Deixe vazio para a IA sugerir."
          className="mt-2 w-full rounded-2xl border border-linha bg-white px-4 py-3 outline-none focus:border-vinho"
        />
      </label>

      <div className="mt-8 text-center">
        <BotaoCriar />
      </div>
    </form>
  );
}
