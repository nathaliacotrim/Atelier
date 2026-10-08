export type Formato = "reels" | "carrossel" | "stories";
export type Objetivo = "crescimento" | "engajamento" | "vendas";

export const FORMATOS: { valor: Formato; nome: string; descricao: string }[] = [
  { valor: "reels", nome: "Reels", descricao: "Vídeo curto e dinâmico para o feed e a aba Reels" },
  { valor: "carrossel", nome: "Carrossel", descricao: "Sequência de slides para contar uma história" },
  { valor: "stories", nome: "Stories", descricao: "Sequência estratégica para engajar e converter" },
];

export const OBJETIVOS: { valor: Objetivo; nome: string; descricao: string }[] = [
  { valor: "crescimento", nome: "Crescimento", descricao: "Atrair seguidores novos" },
  { valor: "engajamento", nome: "Engajamento", descricao: "Gerar conversa, salvamentos e compartilhamentos" },
  { valor: "vendas", nome: "Vendas", descricao: "Levar o público a comprar ou chamar no direct" },
];

export type Perfil = {
  id: string;
  user_id: string;
  arroba: string;
  nome: string;
  nicho: string;
  publico: string;
  produtos: string;
  tom_de_voz: string;
  objetivos: string;
  referencias: string;
  cor_primaria: string;
  cor_secundaria: string;
  criado_em: string;
};

export type Slide = { titulo: string; texto: string };

export type Arte = { slides: Slide[] };

export type Conversa = {
  id: string;
  perfil_id: string;
  titulo: string;
  formato: Formato;
  objetivo: Objetivo;
  tema: string;
  arte: Arte | null;
  criado_em: string;
  atualizado_em: string;
};

export type Mensagem = {
  id: string;
  conversa_id: string;
  papel: "user" | "assistant";
  conteudo: string;
  criado_em: string;
};

export type Memoria = {
  id: string;
  perfil_id: string;
  texto: string;
  origem: "ia" | "manual";
  criado_em: string;
};

export function nomeFormato(f: Formato) {
  return FORMATOS.find((x) => x.valor === f)?.nome ?? f;
}

export function nomeObjetivo(o: Objetivo) {
  return OBJETIVOS.find((x) => x.valor === o)?.nome ?? o;
}
