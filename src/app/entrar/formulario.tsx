"use client";

import { useActionState, useState } from "react";
import { entrar, type EstadoEntrar } from "./acoes";

export function FormularioEntrar() {
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [estado, acao, enviando] = useActionState<EstadoEntrar, FormData>(entrar, {});

  return (
    <form action={acao} className="space-y-4">
      <input type="hidden" name="modo" value={modo} />
      <div className="flex rounded-full bg-bege/60 p-1 text-sm">
        {(["entrar", "criar"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModo(m)}
            className={`flex-1 rounded-full py-2 ${modo === m ? "bg-white font-medium text-vinho shadow-sm" : "text-cinza"}`}
          >
            {m === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="text-sm text-cinza">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-xl border border-linha bg-white px-4 py-3 outline-none focus:border-vinho"
        />
      </label>
      <label className="block">
        <span className="text-sm text-cinza">Senha</span>
        <input
          name="senha"
          type="password"
          required
          minLength={6}
          autoComplete={modo === "criar" ? "new-password" : "current-password"}
          className="mt-1 w-full rounded-xl border border-linha bg-white px-4 py-3 outline-none focus:border-vinho"
        />
      </label>
      {estado.erro && <p className="text-sm text-red-700">{estado.erro}</p>}
      {estado.aviso && <p className="text-sm text-vinho">{estado.aviso}</p>}
      <button
        disabled={enviando}
        className="w-full rounded-full bg-vinho py-3 font-medium text-creme hover:bg-vinho-escuro disabled:opacity-60"
      >
        {enviando ? "Aguarde..." : modo === "entrar" ? "Entrar" : "Criar conta"}
      </button>
    </form>
  );
}
