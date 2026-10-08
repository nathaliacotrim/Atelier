"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { COOKIE_PERFIL, exigirPerfil, exigirUsuaria } from "@/lib/dados";
import { pedidoInicial } from "@/lib/ia";
import { FORMATOS, OBJETIVOS, type Formato, type Objetivo } from "@/lib/tipos";

const CAMPOS_PERFIL = [
  "arroba",
  "nome",
  "nicho",
  "publico",
  "produtos",
  "tom_de_voz",
  "objetivos",
  "referencias",
  "cor_primaria",
  "cor_secundaria",
] as const;

function lerPerfil(form: FormData) {
  const dados = Object.fromEntries(
    CAMPOS_PERFIL.map((campo) => [campo, String(form.get(campo) ?? "").trim()]),
  ) as Record<(typeof CAMPOS_PERFIL)[number], string>;
  if (dados.arroba && !dados.arroba.startsWith("@")) dados.arroba = `@${dados.arroba}`;
  if (!/^#[0-9a-fA-F]{6}$/.test(dados.cor_primaria)) dados.cor_primaria = "#5C0F14";
  if (!/^#[0-9a-fA-F]{6}$/.test(dados.cor_secundaria)) dados.cor_secundaria = "#F3E6D6";
  return dados;
}

export type EstadoPerfil = { erro?: string };

export async function salvarPerfil(_estado: EstadoPerfil, form: FormData): Promise<EstadoPerfil> {
  const { supabase, user } = await exigirUsuaria();
  const dados = lerPerfil(form);
  if (!dados.arroba || !dados.nome) return { erro: "Preencha o @ e o nome da marca." };

  const id = String(form.get("id") ?? "");
  if (id) {
    const { error } = await supabase.from("perfis").update(dados).eq("id", id);
    if (error) return { erro: "Não consegui salvar. Tente de novo." };
  } else {
    const { data, error } = await supabase
      .from("perfis")
      .insert({ ...dados, user_id: user.id })
      .select("id")
      .single();
    if (error || !data) return { erro: "Não consegui salvar. Tente de novo." };
    (await cookies()).set(COOKIE_PERFIL, data.id, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }

  revalidatePath("/", "layout");
  redirect(id ? "/perfis" : "/criar");
}

export async function excluirPerfil(form: FormData) {
  const { supabase } = await exigirUsuaria();
  await supabase.from("perfis").delete().eq("id", String(form.get("id")));
  revalidatePath("/", "layout");
  redirect("/perfis");
}

export async function trocarPerfil(form: FormData) {
  await exigirUsuaria();
  (await cookies()).set(COOKIE_PERFIL, String(form.get("perfil_id")), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}

export async function criarConteudo(form: FormData) {
  const { supabase, user } = await exigirUsuaria();
  const perfil = await exigirPerfil();

  const formato = String(form.get("formato")) as Formato;
  const objetivo = String(form.get("objetivo")) as Objetivo;
  const tema = String(form.get("tema") ?? "").trim();
  if (!FORMATOS.some((f) => f.valor === formato) || !OBJETIVOS.some((o) => o.valor === objetivo)) {
    redirect("/criar");
  }

  const nome = FORMATOS.find((f) => f.valor === formato)!.nome;
  const { data: conversa } = await supabase
    .from("conversas")
    .insert({
      user_id: user.id,
      perfil_id: perfil.id,
      titulo: tema ? tema.slice(0, 120) : `${nome} sem tema definido`,
      formato,
      objetivo,
      tema,
    })
    .select("id")
    .single();
  if (!conversa) redirect("/criar");

  await supabase.from("mensagens").insert({
    user_id: user.id,
    conversa_id: conversa.id,
    papel: "user",
    conteudo: pedidoInicial(formato, objetivo, tema),
  });

  redirect(`/conteudos/${conversa.id}`);
}

export async function excluirConteudo(form: FormData) {
  const { supabase } = await exigirUsuaria();
  await supabase.from("conversas").delete().eq("id", String(form.get("id")));
  revalidatePath("/historico");
  redirect("/historico");
}

export async function adicionarMemoria(form: FormData) {
  const { supabase, user } = await exigirUsuaria();
  const perfil = await exigirPerfil();
  const texto = String(form.get("texto") ?? "").trim();
  if (texto) {
    await supabase
      .from("memorias")
      .insert({ user_id: user.id, perfil_id: perfil.id, texto, origem: "manual" });
  }
  revalidatePath("/memoria");
}

export async function excluirMemoria(form: FormData) {
  const { supabase } = await exigirUsuaria();
  await supabase.from("memorias").delete().eq("id", String(form.get("id")));
  revalidatePath("/memoria");
}
