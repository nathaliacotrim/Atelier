"use client";

import Link from "next/link";
import { useRef } from "react";
import { trocarPerfil } from "./acoes";

type Item = { id: string; arroba: string; nicho: string };

export function SeletorPerfil({ perfis, ativoId }: { perfis: Item[]; ativoId: string }) {
  const form = useRef<HTMLFormElement>(null);
  return (
    <form ref={form} action={trocarPerfil} className="rounded-2xl border border-linha bg-creme p-3">
      <label className="text-xs text-cinza" htmlFor="perfil_id">
        Perfil
      </label>
      <select
        id="perfil_id"
        name="perfil_id"
        defaultValue={ativoId}
        onChange={() => form.current?.requestSubmit()}
        className="mt-1 w-full bg-transparent font-medium text-vinho outline-none"
      >
        {perfis.map((p) => (
          <option key={p.id} value={p.id}>
            {p.arroba}
            {p.nicho ? ` · ${p.nicho}` : ""}
          </option>
        ))}
      </select>
      <Link href="/perfis/novo" className="mt-2 block text-xs text-cinza hover:text-vinho">
        + Adicionar nova conta
      </Link>
    </form>
  );
}
