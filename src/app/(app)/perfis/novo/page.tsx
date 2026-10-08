import { listarPerfis } from "@/lib/dados";
import { FormularioPerfil } from "../formulario-perfil";

// Página por usuária: renderiza a cada pedido.
export const instant = false;

export default async function NovoPerfil() {
  const perfis = await listarPerfis();
  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold">
        {perfis.length === 0 ? "Vamos conhecer a sua marca" : "Nova conta"}
      </h1>
      <p className="mt-2 mb-10 text-cinza">
        Preencha o briefing para começar a criar conteúdo. Dá para mudar tudo depois.
      </p>
      <FormularioPerfil />
    </div>
  );
}
