import type { NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";
import { gerarArte } from "@/lib/ia";

export const maxDuration = 120;

/** Gera os slides do carrossel a partir da última versão escrita pela IA. */
export async function POST(_request: NextRequest, ctx: RouteContext<"/api/conversas/[id]/arte">) {
  const { id } = await ctx.params;
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ erro: "Faça login de novo." }, { status: 401 });

  const { data: ultima } = await supabase
    .from("mensagens")
    .select("conteudo")
    .eq("conversa_id", id)
    .eq("papel", "assistant")
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!ultima) return Response.json({ erro: "Crie o carrossel primeiro." }, { status: 400 });

  try {
    const arte = await gerarArte(ultima.conteudo);
    if (!arte || arte.slides.length === 0) {
      return Response.json({ erro: "Não consegui montar os slides. Tente de novo." }, { status: 502 });
    }
    await supabase.from("conversas").update({ arte }).eq("id", id);
    return Response.json({ arte });
  } catch (erro) {
    console.error("Falha ao gerar arte", erro);
    return Response.json({ erro: "Deu um erro ao falar com a IA. Tente de novo." }, { status: 502 });
  }
}
