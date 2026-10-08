"use client";

import { useActionState, useState } from "react";
import { salvarPerfil, type EstadoPerfil } from "../acoes";
import type { Perfil } from "@/lib/tipos";

type Campo = {
  nome: keyof Perfil;
  rotulo: string;
  exemplo: string;
  longo?: boolean;
  obrigatorio?: boolean;
};

const ETAPAS: { titulo: string; descricao: string; campos: Campo[] }[] = [
  {
    titulo: "Nicho",
    descricao: "Quem é a marca e onde ela está.",
    campos: [
      { nome: "arroba", rotulo: "Qual o seu @ no Instagram?", exemplo: "@seuarroba", obrigatorio: true },
      { nome: "nome", rotulo: "Nome da marca ou seu nome", exemplo: "Ana Souza Nutrição", obrigatorio: true },
      { nome: "nicho", rotulo: "Nicho", exemplo: "Nutricionista para mulheres 30+", longo: true },
    ],
  },
  {
    titulo: "Público",
    descricao: "Para quem você fala.",
    campos: [
      {
        nome: "publico",
        rotulo: "Quem é o seu público?",
        exemplo: "Mulheres de 30 a 45 anos, que trabalham fora e querem emagrecer sem dieta radical",
        longo: true,
      },
    ],
  },
  {
    titulo: "Produtos",
    descricao: "O que você vende e o que quer com o Instagram.",
    campos: [
      {
        nome: "produtos",
        rotulo: "Produtos e serviços",
        exemplo: "Consulta online (R$ 250), plano de acompanhamento de 3 meses, e-book de receitas",
        longo: true,
      },
      {
        nome: "objetivos",
        rotulo: "Objetivos com o Instagram",
        exemplo: "Lotar a agenda de consultas e vender o acompanhamento",
        longo: true,
      },
    ],
  },
  {
    titulo: "Voz",
    descricao: "Como a marca fala e se parece.",
    campos: [
      {
        nome: "tom_de_voz",
        rotulo: "Tom de voz",
        exemplo: "Próxima e direta, como uma amiga que entende do assunto. Sem termos técnicos.",
        longo: true,
      },
      {
        nome: "referencias",
        rotulo: "Perfis ou posts que você admira (opcional)",
        exemplo: "@perfilx pelos carrosséis educativos",
        longo: true,
      },
    ],
  },
];

export function FormularioPerfil({ perfil }: { perfil?: Perfil }) {
  const [etapa, setEtapa] = useState(0);
  const [estado, acao, enviando] = useActionState<EstadoPerfil, FormData>(salvarPerfil, {});
  const ultima = etapa === ETAPAS.length - 1;

  return (
    <form action={acao} className="max-w-xl">
      {perfil && <input type="hidden" name="id" value={perfil.id} />}

      <ol className="mb-8 flex items-center gap-2">
        {ETAPAS.map((e, i) => (
          <li key={e.titulo} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => setEtapa(i)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${i === etapa ? "bg-vinho text-creme" : i < etapa ? "bg-bege text-vinho" : "border border-linha text-cinza"}`}
              aria-label={e.titulo}
            >
              {i + 1}
            </button>
            {i < ETAPAS.length - 1 && <span className="h-px flex-1 bg-linha" />}
          </li>
        ))}
      </ol>

      {ETAPAS.map((e, i) => (
        <fieldset key={e.titulo} hidden={i !== etapa} className="space-y-5">
          <div className="rounded-xl bg-bege/50 px-4 py-2 text-sm font-medium tracking-wide text-vinho uppercase">
            {e.titulo}
          </div>
          <p className="text-cinza">{e.descricao}</p>
          {e.campos.map((c) => (
            <label key={c.nome} className="block">
              <span className="text-sm font-medium">
                {c.rotulo}
                {c.obrigatorio && " *"}
              </span>
              {c.longo ? (
                <textarea
                  name={c.nome}
                  rows={3}
                  defaultValue={perfil ? String(perfil[c.nome]) : ""}
                  placeholder={`Ex: ${c.exemplo}`}
                  className="mt-1 w-full rounded-xl border border-linha bg-white px-4 py-3 outline-none focus:border-vinho"
                />
              ) : (
                <input
                  name={c.nome}
                  required={c.obrigatorio}
                  defaultValue={perfil ? String(perfil[c.nome]) : ""}
                  placeholder={`Ex: ${c.exemplo}`}
                  className="mt-1 w-full rounded-xl border border-linha bg-white px-4 py-3 outline-none focus:border-vinho"
                />
              )}
            </label>
          ))}
          {i === ETAPAS.length - 1 && (
            <div className="flex gap-6">
              <label className="block">
                <span className="text-sm font-medium">Cor principal</span>
                <input
                  type="color"
                  name="cor_primaria"
                  defaultValue={perfil?.cor_primaria ?? "#5C0F14"}
                  className="mt-1 block h-12 w-20 cursor-pointer rounded-lg border border-linha"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Cor de fundo</span>
                <input
                  type="color"
                  name="cor_secundaria"
                  defaultValue={perfil?.cor_secundaria ?? "#F3E6D6"}
                  className="mt-1 block h-12 w-20 cursor-pointer rounded-lg border border-linha"
                />
              </label>
              <p className="self-end pb-1 text-xs text-cinza">Usadas na arte dos carrosséis.</p>
            </div>
          )}
        </fieldset>
      ))}

      {estado.erro && <p className="mt-4 text-sm text-red-700">{estado.erro}</p>}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => setEtapa((e) => Math.max(0, e - 1))}
          className={`rounded-full px-6 py-3 text-cinza hover:text-vinho ${etapa === 0 ? "invisible" : ""}`}
        >
          Voltar
        </button>
        {ultima ? (
          <button
            disabled={enviando}
            className="rounded-full bg-vinho px-8 py-3 font-medium text-creme hover:bg-vinho-escuro disabled:opacity-60"
          >
            {enviando ? "Salvando..." : "Salvar perfil"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEtapa((e) => e + 1)}
            className="rounded-full bg-vinho px-8 py-3 font-medium text-creme hover:bg-vinho-escuro"
          >
            Continuar
          </button>
        )}
      </div>
    </form>
  );
}
