import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Perfil } from "@/lib/tipos";

export const COOKIE_PERFIL = "perfil_ativo";

/** Usuária logada; manda para /entrar se não houver sessão. */
export async function exigirUsuaria() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  return { supabase, user };
}

export async function listarPerfis() {
  const { supabase } = await exigirUsuaria();
  const { data } = await supabase.from("perfis").select("*").order("criado_em");
  return (data ?? []) as Perfil[];
}

/** Perfil escolhido no seletor; cai no primeiro se o cookie estiver vazio ou velho. */
export async function perfilAtivo(): Promise<Perfil | null> {
  const perfis = await listarPerfis();
  if (perfis.length === 0) return null;
  const escolhido = (await cookies()).get(COOKIE_PERFIL)?.value;
  return perfis.find((p) => p.id === escolhido) ?? perfis[0];
}

/** Para páginas que só fazem sentido com um perfil: sem perfil, vai para o briefing. */
export async function exigirPerfil(): Promise<Perfil> {
  const perfil = await perfilAtivo();
  if (!perfil) redirect("/perfis/novo");
  return perfil;
}
