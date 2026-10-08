import Link from "next/link";
import { NOME_APP } from "@/lib/marca";
import { FormularioEntrar } from "./formulario";

export default function Entrar() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-serif text-3xl italic text-vinho">
          {NOME_APP}
        </Link>
        <p className="mt-2 mb-8 text-cinza">Entre para criar seus conteúdos.</p>
        <FormularioEntrar />
      </div>
    </main>
  );
}
