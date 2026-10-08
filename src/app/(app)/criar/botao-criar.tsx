"use client";

import { useFormStatus } from "react-dom";

export function BotaoCriar() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="rounded-full bg-vinho px-10 py-3.5 font-medium text-creme hover:bg-vinho-escuro disabled:opacity-60"
    >
      {pending ? "Preparando..." : "Criar conteúdo"}
    </button>
  );
}
