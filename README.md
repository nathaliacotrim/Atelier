# Atelier

Plataforma de criação de conteúdo para Instagram com IA. "Atelier" é um nome provisório (fica em `src/lib/marca.ts`).

## O que tem

- **Login** com e-mail e senha (Supabase Auth).
- **Briefing da marca** em 4 etapas: nicho, público, produtos e voz, mais as cores usadas na arte.
- **Perfis múltiplos**: cada conta com seu briefing, memória e histórico; troca pelo seletor na lateral.
- **Criar conteúdo**: escolhe formato (Reels, Carrossel, Stories), objetivo (crescimento, engajamento, vendas) e tema opcional. A IA escreve o roteiro completo.
- **Chat de ajustes** na mesma tela, com sugestões rápidas.
- **Arte do carrossel**: a IA divide o carrossel em slides e o app gera as imagens 1080×1350 com as cores do perfil, para baixar uma a uma ou em .zip.
- **Memória da IA**: depois de cada resposta, a IA guarda preferências novas da marca; a pessoa vê, apaga ou ensina direto.
- **Histórico** com busca e filtros por formato e objetivo.

## Como rodar

1. Crie um projeto no [Supabase](https://supabase.com) e rode `supabase/migrations/0001_inicial.sql` no SQL Editor.
2. Copie `.env.example` para `.env.local` e preencha a URL e a chave pública do Supabase e a chave da API da Anthropic.
3. `npm install` e `npm run dev`, depois abra http://localhost:3000.

Para publicar na Vercel, importe o repositório e cadastre as mesmas variáveis de ambiente do `.env.local`. No Supabase, em Authentication → URL Configuration, coloque o endereço do site e `https://SEU-SITE/auth/confirmar` como URL de redirecionamento.

## Onde fica cada coisa

| Caminho | O quê |
| --- | --- |
| `src/lib/ia.ts` | Instruções da IA, pedido inicial por formato, extração de memória e de slides |
| `src/app/api/conversas/[id]/mensagens` | Gera e transmite a resposta da IA |
| `src/app/api/conversas/[id]/arte` | Gera os slides do carrossel |
| `src/app/(app)/` | Telas do app (criar, conteúdos, histórico, memória, perfis) |
| `src/app/globals.css` | Paleta (vinho e bege provisórios) |
| `supabase/migrations/` | Tabelas e regras de acesso do banco |
