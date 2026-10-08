import { notFound } from "next/navigation";
import { exigirUsuaria } from "@/lib/dados";
import type { Perfil } from "@/lib/tipos";
import { FormularioPerfil } from "../formulario-perfil";
import { excluirPerfil } from "../../acoes";

// Página por usuária: renderiza a cada pedido.
export const instant = false;

export default async function EditarPerfil({ params }: PageProps<"/perfis/[id]">) {
  const { id } = await params;
  const { supabase } = await exigirUsuaria();
  const { data } = await supabase.from("perfis").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const perfil = data as Perfil;

  return (
    <div>
      <h1 className="font-serif text-4xl">{perfil.arroba}</h1>
      <p className="mt-2 mb-10 text-cinza">Atualize o briefing desta conta.</p>
      <FormularioPerfil perfil={perfil} />
      <form action={excluirPerfil} className="mt-16 border-t border-linha pt-6">
        <input type="hidden" name="id" value={perfil.id} />
        <button className="text-sm text-red-700 hover:underline">
          Excluir este perfil e todos os conteúdos dele
        </button>
      </form>
    </div>
  );
}
