# AniDex

Projeto acadêmico para descobrir animes, montar uma lista pessoal, acompanhar progresso e compartilhar avaliações.

## Funcionalidades

- catálogo e busca de animes;
- detalhes, gêneros e episódios;
- lista pessoal com status de acompanhamento;
- progresso por episódio e minutagem;
- avaliações e comentários da comunidade;
- cadastro, login e verificação de e-mail;
- dashboard com estatísticas do usuário;
- exclusão de avaliações e da própria conta.

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Prisma 8
- Neon Postgres
- Neon Auth
- AniList, Jikan e Anivex

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Copie `.env.example` para `.env` e preencha as variáveis do Neon.

3. Emita e atualize o contrato do Prisma quando necessário:

```bash
npx prisma contract emit
npx prisma db update
```

4. Inicie o projeto:

```bash
npm run dev
```

A aplicação abre em `http://localhost:3000`.

## Estrutura principal

```text
app/        páginas, componentes e server actions
lib/        autenticação e utilitários compartilhados
src/prisma/ contrato e cliente do banco
migrations/ snapshots e referências de migração
```

