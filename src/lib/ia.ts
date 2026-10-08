import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { Arte, Formato, Memoria, Mensagem, Objetivo, Perfil } from "@/lib/tipos";
import { nomeFormato, nomeObjetivo } from "@/lib/tipos";

export const MODELO = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";

// Se a IA recusar um pedido, a API refaz no modelo de reserva recomendado.
export const FALLBACK: { betas: Anthropic.Beta.AnthropicBeta[]; fallbacks: "default" } = {
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
};

export const ia = new Anthropic();

/**
 * Instruções fixas + perfil da marca + memória. Fica no system para ser
 * reaproveitado (cache) entre as mensagens da mesma conversa.
 */
export function montarSistema(perfil: Perfil, memorias: Memoria[]) {
  const linhas = [
    "Você é a estrategista de conteúdo da plataforma. Escreve conteúdo para Instagram em português do Brasil, para criadores individuais e prestadores de serviço.",
    "Escreva como a própria marca escreveria: use o tom de voz e o vocabulário do perfil abaixo, fale com o público descrito e conecte o conteúdo aos produtos quando o objetivo for vendas.",
    "Entregue conteúdo pronto para usar, em markdown simples, com títulos curtos para cada parte. Nada de explicar o que vai fazer antes; comece pelo conteúdo.",
    "Quando a pessoa pedir ajustes, devolva a versão completa revisada, não só o trecho alterado, a menos que ela peça só um trecho.",
    "",
    "## Perfil da marca",
    `Nome: ${perfil.nome}`,
    `Instagram: ${perfil.arroba}`,
    `Nicho: ${perfil.nicho || "não informado"}`,
    `Público: ${perfil.publico || "não informado"}`,
    `Produtos e serviços: ${perfil.produtos || "não informado"}`,
    `Tom de voz: ${perfil.tom_de_voz || "não informado"}`,
    `Objetivos com o Instagram: ${perfil.objetivos || "não informado"}`,
    `Referências de que gosta: ${perfil.referencias || "não informado"}`,
  ];

  if (memorias.length > 0) {
    linhas.push(
      "",
      "## O que você já aprendeu sobre essa marca",
      "Siga estas preferências, que vieram de conversas anteriores:",
      ...memorias.map((m) => `- ${m.texto}`),
    );
  }

  return linhas.join("\n");
}

const ESTRUTURA: Record<Formato, string> = {
  reels:
    "Entregue: 3 opções de gancho para os primeiros 3 segundos, o roteiro falado cena a cena (com o que aparece na tela e o texto na tela), a chamada para ação, a legenda do post e até 5 hashtags.",
  carrossel:
    "Entregue: o título da capa, o texto de cada slide (entre 6 e 10 slides, frases curtas que cabem numa imagem), o slide final com chamada para ação, a legenda do post e até 5 hashtags.",
  stories:
    "Entregue: uma sequência de 4 a 8 stories, cada um com o texto na tela, a sugestão de imagem ou vídeo e o recurso interativo (enquete, caixinha, link, figurinha), terminando na chamada para ação.",
};

/** Primeiro pedido de uma conversa nova, montado a partir do formulário "O que vamos criar?". */
export function pedidoInicial(formato: Formato, objetivo: Objetivo, tema: string) {
  return [
    `Crie um conteúdo de ${nomeFormato(formato)} com objetivo de ${nomeObjetivo(objetivo).toLowerCase()}.`,
    tema.trim()
      ? `Tema: ${tema.trim()}`
      : "Tema: escolha você o tema mais estratégico para o perfil agora e diga qual escolheu numa linha no início.",
    ESTRUTURA[formato],
  ].join("\n");
}

export function paraMensagensApi(mensagens: Mensagem[]): Anthropic.Beta.BetaMessageParam[] {
  return mensagens.map((m) => ({ role: m.papel, content: m.conteudo }));
}

const NovasMemorias = z.object({
  memorias: z
    .array(z.string())
    .describe("Preferências novas e duradouras, uma frase curta cada. Lista vazia se não houver."),
});

/**
 * Lê a última troca da conversa e devolve preferências novas da marca
 * (correções, gostos, coisas a evitar) que ainda não estão na memória.
 */
export async function extrairMemorias(
  existentes: Memoria[],
  pedido: string,
  resposta: string,
): Promise<string[]> {
  const resultado = await ia.beta.messages.parse({
    model: MODELO,
    max_tokens: 2000,
    ...FALLBACK,
    output_config: { effort: "low", format: betaZodOutputFormat(NovasMemorias) },
    system:
      "Você mantém a memória de uma IA que escreve conteúdo para uma marca. Identifique só preferências duradouras que a pessoa revelou (tom, palavras a usar ou evitar, formatos, público, estilo). Ignore pedidos pontuais sobre um único post. Não repita o que já está na memória.",
    messages: [
      {
        role: "user",
        content: [
          "Memória atual:",
          existentes.length ? existentes.map((m) => `- ${m.texto}`).join("\n") : "(vazia)",
          "",
          "Mensagem da pessoa:",
          pedido,
          "",
          "Resposta da IA:",
          resposta,
        ].join("\n"),
      },
    ],
  });

  if (resultado.stop_reason === "refusal") return [];
  return resultado.parsed_output?.memorias.filter((m) => m.trim()) ?? [];
}

const ArteSchema = z.object({
  slides: z
    .array(
      z.object({
        titulo: z.string().describe("Frase principal do slide, curta e forte"),
        texto: z.string().describe("Texto de apoio do slide; vazio se o título bastar"),
      }),
    )
    .describe("Slides na ordem, do primeiro (capa) ao último (chamada para ação)"),
});

/** Transforma o carrossel escrito na conversa em slides para virar imagem. */
export async function gerarArte(conteudo: string): Promise<Arte | null> {
  const resultado = await ia.beta.messages.parse({
    model: MODELO,
    max_tokens: 8000,
    ...FALLBACK,
    output_config: { effort: "low", format: betaZodOutputFormat(ArteSchema) },
    system:
      "Você diagrama carrosséis de Instagram. Separe o carrossel em slides fiéis ao texto: o primeiro é a capa, o último é a chamada para ação. Cada título tem no máximo 12 palavras e cada texto de apoio no máximo 30. Não inclua legenda nem hashtags.",
    messages: [{ role: "user", content: conteudo }],
  });

  if (resultado.stop_reason === "refusal") return null;
  return resultado.parsed_output ?? null;
}
