# [Orkut?](https://thyeris.github.io/github-user-explorer/) (ainda escolhendo um nome para o projeto...)

Um mini "buscador de usuários do GitHub" com a cara do Orkut antigo. Você digita
um usuário e o app mostra a foto, bio, repositórios públicos e seguidores dele,
consumindo a API pública do GitHub.

> Feito como projeto de estudo*

## Como rodar

Como apenas possui HTML/CSS/JS puro com módulos ES (`import`/`export`),
então dá pra abrir com qualquer servidor estático. Ex:

```bash
npx serve .
# ou
'Live Server (Extension)'
```

Só não abrir o `index.html` direto com duplo clique!

Para alterar o CSS, ele é gerado a partir do SASS (pasta `scss/`), então depois
de editar um `.scss` é preciso recompilar:

```bash
npx sass scss/main.scss css/main.css --watch
```

## Estrutura de pastas

```
index.html
css/            → CSS já compilado
scss/           → fonte do CSS, dividida em partials (base, layout, components)
js/
  app.js               → "tela": pega o que a API devolveu e escreve no DOM
  api/
    github.js          → configuração única do axios pra falar com o GitHub
  services/
    github.service.js         → funções de negócio (getUser, getRepos, getFollowers)
    search-history.service.js → histórico de buscas salvo no localStorage
assets/         → imagens e favicon
```

## Decisões técnicas

### `api/` e `services/` separados:

- **`api/github.js`** cuida só do "transporte": criar o cliente HTTP, definir
  `baseURL`, `timeout`, headers e o que fazer quando a resposta vem com erro.
- **`services/github.service.js`** as funções: `getUser`,
  `getRepos`, `getFollowers`. utilizam o `api/github.js`
  para pegar os dados do usuário".


### Por que centralizar a instância do axios?

Utilizar **um único cliente** (`githubApi`) criado em
`api/github.js` com `axios.create()`. Assim:

- **Não repete configuração**: `baseURL`, `timeout` e o header `Accept` ficam
  escritos uma vez só.
- **Tratamento de erro num lugar só**: com o *interceptor* de resposta
  (`githubApi.interceptors.response.use`) erros HTTP são transformados
  em algo que o resto do app entende, diferenciando o tipo de erro.

### Debounce na busca (400ms)

O evento `input` espera 400ms de silêncio antes de fazer a busca:

### `<template>` em vez de template engine

Cada "pedaço" de UI (card do usuário, card de repositórios, item do
histórico, estados de erro/loading) fica declarado como uma tag
`<template>` no próprio `index.html`. O `app.js` só clona (`cloneNode`) e
preenche os campos com `textContent`/atributos. Evitando depender de uma
lib de template só pra montar os cards, e mantém o HTML de cada componente
perto de onde ele é usado.

### Histórico de busca no `localStorage`

Como não possui backend, o histórico das últimas buscas é salvo direto no
`localStorage` do navegador (`search-history.service.js`), limitado às 5 mais
recentes e sem repetir o mesmo usuário duas vezes.

### CSS organizado em SASS (7-1 simplificado) + BEM

O CSS é dividido em partials (`base`, `layout`, `components`, `abstracts`)
seguindo uma versão do padrão 7-1, e as classes seguem BEM
(`.card__title`, `.followers-grid__item`, etc...)
