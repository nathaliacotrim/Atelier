import { notFound } from "next/navigation";
import { exigirUsuaria } from "@/lib/dados";
import type { Conversa, Mensagem, Perfil } from "@/lib/tipos";
import { ChatConteudo } from "./chat-conteudo";
import { excluirConteudo } from "../../acoes";

// Página por usuária: renderiza a cada pedido.
export const instant = false;

export default async function PaginaConteudo({ params }: PageProps<"/conteudos/[id]">) {
  const { id } = await params;
  const { supabase } = await exigirUsuaria();

  const { data: conversa } = await supabase.from("conversas").select("*").eq("id", id).maybeSingle();
  if (!conversa) notFound();

  const [{ data: mensagens }, { data: perfil }] = await Promise.all([
    supabase.from("mensagens").select("*").eq("conversa_id", id).order("criado_em"),
    supabase.from("perfis").select("*").eq("id", conversa.perfil_id).single(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <ChatConteudo
        conversa={conversa as Conversa}
        mensagensIniciais={(mensagens ?? []) as Mensagem[]}
        perfil={perfil as Perfil}
      />
      <form action={excluirConteudo} className="mt-16 border-t border-linha pt-6">
        <input type="hidden" name="id" value={id} />
        <button className="text-sm text-cinza hover:text-red-700">Excluir este conteúdo</button>
      </form>
    </div>
  );
}
