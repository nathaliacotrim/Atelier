import { after, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";
import { extrairMemorias, FALLBACK, ia, MODELO, montarSistema, paraMensagensApi } from "@/lib/ia";
import type { Memoria, Mensagem, Perfil } from "@/lib/tipos";

export const maxDuration = 300;

/**
 * Envia uma mensagem (opcional) e transmite a resposta da IA em texto puro.
 * Sem `texto`, só gera a resposta para a última mensagem já salva
 * (é assim que o primeiro conteúdo de uma conversa nova é criado).
 */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/conversas/[id]/mensagens">) {
  const { id } = await ctx.params;
  const { texto } = (await request.json().catch(() => ({}))) as { texto?: string };

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Faça login de novo.", { status: 401 });

  const { data: conversa } = await supabase
    .from("conversas")
    .select("id, perfil_id")
    .eq("id", id)
    .single();
  if (!conversa) return new Response("Conteúdo não encontrado.", { status: 404 });

  if (texto?.trim()) {
    await supabase
      .from("mensagens")
      .insert({ user_id: user.id, conversa_id: id, papel: "user", conteudo: texto.trim() });
  }

  const [{ data: perfil }, { data: memorias }, { data: mensagens }] = await Promise.all([
    supabase.from("perfis").select("*").eq("id", conversa.perfil_id).single(),
    supabase.from("memorias").select("*").eq("perfil_id", conversa.perfil_id).order("criado_em"),
    supabase.from("mensagens").select("*").eq("conversa_id", id).order("criado_em"),
  ]);

  const historico = (mensagens ?? []) as Mensagem[];
  const ultima = historico.at(-1);
  if (!perfil || !ultima || ultima.papel !== "user") {
    return new Response("Nada para responder.", { status: 400 });
  }

  // A memória é atualizada depois que a resposta termina, sem atrasar a tela.
  let terminou: (resposta: string | null) => void = () => {};
  const respostaFinal = new Promise<string | null>((resolve) => (terminou = resolve));
  after(async () => {
    const resposta = await respostaFinal;
    if (!resposta) return;
    try {
      const novas = await extrairMemorias((memorias ?? []) as Memoria[], ultima.conteudo, resposta);
      if (novas.length > 0) {
        await supabase.from("memorias").insert(
          novas.map((texto) => ({
            user_id: user.id,
            perfil_id: conversa.perfil_id,
            texto,
            origem: "ia",
          })),
        );
      }
    } catch (erro) {
      console.error("Falha ao atualizar a memória", erro);
    }
  });

  const encoder = new TextEncoder();
  const corpo = new ReadableStream<Uint8Array>({
    async start(controller) {
      let resposta = "";
      try {
        const stream = ia.beta.messages.stream({
          model: MODELO,
          max_tokens: 64000,
          ...FALLBACK,
          output_config: { effort: "medium" },
          system: [
            {
              type: "text",
              text: montarSistema(perfil as Perfil, (memorias ?? []) as Memoria[]),
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: paraMensagensApi(historico),
        });

        for await (const evento of stream) {
          if (evento.type === "content_block_delta" && evento.delta.type === "text_delta") {
            resposta += evento.delta.text;
            controller.enqueue(encoder.encode(evento.delta.text));
          }
        }

        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          // Recusa no meio da resposta: descarta o trecho parcial.
          resposta = "";
          controller.enqueue(
            encoder.encode("\n\n[A IA não conseguiu criar esse conteúdo. Tente reformular o pedido.]"),
          );
        }

        if (resposta) {
          await supabase
            .from("mensagens")
            .insert({ user_id: user.id, conversa_id: id, papel: "assistant", conteudo: resposta });
          await supabase
            .from("conversas")
            .update({ atualizado_em: new Date().toISOString() })
            .eq("id", id);
        }
        terminou(resposta || null);
        controller.close();
      } catch (erro) {
        console.error("Falha ao gerar conteúdo", erro);
        terminou(null);
        controller.enqueue(encoder.encode("\n\n[Deu um erro ao falar com a IA. Tente de novo.]"));
        controller.close();
      }
    },
  });

  return new Response(corpo, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
