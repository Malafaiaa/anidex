# Entregas acadêmicas — AniDex

As funcionalidades abaixo foram escolhidas para representar cada etapa acadêmica porque passam claramente pelas três camadas da aplicação: **Front-end, Back-end e Banco de Dados**.

## AC1 — Adicionar anime à Minha Lista

**Funcionalidade principal:** permitir que o usuário adicione um anime à sua lista pessoal.

- **Front-end:** botão e interface de inclusão do anime.
- **Back-end:** identifica o usuário autenticado, valida os dados e processa a inclusão.
- **Banco de Dados:** cria o vínculo entre usuário e anime em `UserAnime`.

## AC2 — Atualizar status e progresso

**Funcionalidade principal:** permitir que o usuário atualize o acompanhamento de um anime.

- **Front-end:** controles de status, episódio atual e minutagem.
- **Back-end:** valida os valores e processa a atualização.
- **Banco de Dados:** atualiza `UserAnime.status`, `progress` e `progressSeconds`.

## AC3 — Criar avaliação

**Funcionalidade principal:** permitir que o usuário avalie um anime com nota e comentário.

- **Front-end:** formulário de avaliação.
- **Back-end:** valida a avaliação e associa ao usuário autenticado e ao anime.
- **Banco de Dados:** persiste nota e comentário em `Review`.

## Prova — Dashboard do usuário

**Funcionalidade principal:** apresentar estatísticas personalizadas com base nos dados do usuário.

- **Front-end:** exibe cards, listas, distribuição por status, gêneros e progresso.
- **Back-end:** consulta, agrega e calcula os dados necessários para as estatísticas.
- **Banco de Dados:** utiliza informações de `UserAnime`, `Anime` e `Review`.

## Funcionalidades adicionais

A versão final do AniDex também inclui busca de animes, catálogo A–Z, paginação, detalhes, sinopse em português, episódios, cadastro, verificação por e-mail, login, logout, recuperação de senha, página de conta, exclusão de conta, remoção de anime da lista, edição e exclusão de avaliações, média da comunidade, gêneros favoritos, Continue assistindo, responsividade e integrações com AniList, Anivex e Jikan.

## Situação final

Todas as funcionalidades acima estão implementadas, testadas e fazem parte da versão final do AniDex publicada em produção.