"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";

export type EstadoEntrar = { erro?: string; aviso?: string };

export async function entrar(_estado: EstadoEntrar, form: FormData): Promise<EstadoEntrar> {
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");
  const modo = form.get("modo") === "criar" ? "criar" : "entrar";
  if (!email || senha.length < 6) {
    return { erro: "Informe seu e-mail e uma senha com pelo menos 6 caracteres." };
  }

  const supabase = await criarClienteServidor();

  if (modo === "criar") {
    const origem = (await headers()).get("origin") ?? "";
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { emailRedirectTo: `${origem}/auth/confirmar` },
    });
    if (error) return { erro: "Não consegui criar a conta. Confira o e-mail e tente de novo." };
    if (!data.session) {
      return { aviso: "Conta criada! Confirme pelo link que enviamos para o seu e-mail." };
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) return { erro: "E-mail ou senha incorretos." };
  }

  redirect("/criar");
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/");
}
