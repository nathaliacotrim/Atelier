"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Arte, Conversa, Mensagem, Perfil } from "@/lib/tipos";
import { nomeFormato, nomeObjetivo } from "@/lib/tipos";
import { ArteCarrossel } from "./arte-carrossel";

type Item = { papel: "user" | "assistant"; conteudo: string };

const SUGESTOES = ["Deixe mais curto", "Mude o tom para mais divertido", "Crie outro gancho", "Foque mais em vendas"];

export function ChatConteudo({
  conversa,
  mensagensIniciais,
  perfil,
}: {
  conversa: Conversa;
  mensagensIniciais: Mensagem[];
  perfil: Perfil;
}) {
  // A primeira mensagem é o pedido montado pelo formulário; ela vira o cabeçalho.
  // Numa conversa recém-criada a última mensagem é desse pedido, ainda sem resposta.
  const pendente = mensagensIniciais.at(-1)?.papel === "user";
  const [itens, setItens] = useState<Item[]>(() => [
    ...mensagensIniciais.slice(1).map((m) => ({ papel: m.papel, conteudo: m.conteudo })),
    ...(pendente ? [{ papel: "assistant" as const, conteudo: "" }] : []),
  ]);
  const [gerando, setGerando] = useState(pendente);
  const [texto, setTexto] = useState("");
  const [arte, setArte] = useState<Arte | null>(conversa.arte);
  const [gerandoArte, setGerandoArte] = useState(false);
  const [erroArte, setErroArte] = useState("");
  const iniciou = useRef(false);
  const fim = useRef<HTMLDivElement>(null);

  /** Transmite a resposta da IA para dentro do último balão (já criado vazio). */
  const transmitir = useCallback(
    async (mensagem?: string) => {
      try {
        const resposta = await fetch(`/api/conversas/${conversa.id}/mensagens`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto: mensagem }),
        });
        if (!resposta.ok || !resposta.body) throw new Error(await resposta.text());

        const leitor = resposta.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await leitor.read();
          if (done) break;
          const trecho = decoder.decode(value, { stream: true });
          setItens((atual) => {
            const copia = [...atual];
            const ultima = copia[copia.length - 1];
            copia[copia.length - 1] = { ...ultima, conteudo: ultima.conteudo + trecho };
            return copia;
          });
        }
      } catch {
        setItens((atual) => {
          const copia = [...atual];
          copia[copia.length - 1] = {
            papel: "assistant",
            conteudo: "Deu um erro ao falar com a IA. Tente de novo.",
          };
          return copia;
        });
      } finally {
        setGerando(false);
      }
    },
    [conversa.id],
  );

  // Conversa recém-criada: gera o primeiro conteúdo sozinha.
  useEffect(() => {
    if (iniciou.current || !pendente) return;
    iniciou.current = true;
    void transmitir();
  }, [pendente, transmitir]);

  useEffect(() => {
    if (gerando) fim.current?.scrollIntoView({ block: "end" });
  }, [itens, gerando]);

  function enviar(mensagem: string) {
    const limpa = mensagem.trim();
    if (!limpa || gerando) return;
    setTexto("");
    setGerando(true);
    setItens((atual) => [
      ...atual,
      { papel: "user", conteudo: limpa },
      { papel: "assistant", conteudo: "" },
    ]);
    void transmitir(limpa);
  }

  async function criarArte() {
    setGerandoArte(true);
    setErroArte("");
    try {
      const resposta = await fetch(`/api/conversas/${conversa.id}/arte`, { method: "POST" });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro);
      setArte(dados.arte);
    } catch (erro) {
      setErroArte(erro instanceof Error && erro.message ? erro.message : "Não consegui gerar a arte.");
    } finally {
      setGerandoArte(false);
    }
  }

  const temResposta = itens.some((i) => i.papel === "assistant" && i.conteudo);

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-vinho px-3 py-1 text-creme">{nomeFormato(conversa.formato)}</span>
          <span className="rounded-full bg-bege px-3 py-1 text-vinho">{nomeObjetivo(conversa.objetivo)}</span>
          <span className="rounded-full border border-linha px-3 py-1 text-cinza">{perfil.arroba}</span>
        </div>
        <h1 className="mt-4 font-serif text-3xl">{conversa.tema || "Tema sugerido pela IA"}</h1>
      </header>

      <div className="space-y-6">
        {itens.map((item, i) =>
          item.papel === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-vinho px-4 py-3 text-creme">{item.conteudo}</p>
            </div>
          ) : (
            <article key={i} className="conteudo-ia rounded-2xl border border-linha bg-white p-6">
              {item.conteudo ? (
                <ReactMarkdown>{item.conteudo}</ReactMarkdown>
              ) : (
                <p className="animate-pulse text-cinza">Criando seu conteúdo...</p>
              )}
            </article>
          ),
        )}
        <div ref={fim} />
      </div>

      {conversa.formato === "carrossel" && temResposta && !gerando && (
        <section className="mt-10 rounded-2xl border border-linha bg-white/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl">Arte do carrossel</h2>
              <p className="text-sm text-cinza">Slides prontos para postar, com as cores do perfil.</p>
            </div>
            <button
              onClick={criarArte}
              disabled={gerandoArte}
              className="rounded-full bg-vinho px-6 py-2.5 text-sm font-medium text-creme hover:bg-vinho-escuro disabled:opacity-60"
            >
              {gerandoArte ? "Montando slides..." : arte ? "Refazer com a última versão" : "Gerar arte"}
            </button>
          </div>
          {erroArte && <p className="mt-4 text-sm text-red-700">{erroArte}</p>}
          {arte && <ArteCarrossel arte={arte} perfil={perfil} />}
        </section>
      )}

      <div className="sticky bottom-0 mt-10 bg-creme/95 pt-3 pb-4 backdrop-blur">
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGESTOES.map((s) => (
            <button
              key={s}
              onClick={() => enviar(s)}
              disabled={gerando}
              className="rounded-full border border-linha bg-white px-3 py-1.5 text-xs text-cinza hover:border-vinho hover:text-vinho disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviar(texto);
          }}
          className="flex items-end gap-2 rounded-2xl border border-linha bg-white p-2 focus-within:border-vinho"
        >
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar(texto);
              }
            }}
            rows={1}
            placeholder="Peça ajustes, teste ideias, mude o tom..."
            className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 outline-none"
          />
          <button
            disabled={gerando || !texto.trim()}
            className="rounded-xl bg-vinho px-4 py-2 text-sm font-medium text-creme disabled:opacity-40"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
