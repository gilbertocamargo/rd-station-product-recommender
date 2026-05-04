# Teste Técnico — Recomendador de Produtos RD Station

Solução para o desafio técnico de desenvolvedor front-end na RD Station.

**Repositório:** https://github.com/gilbertocamargo/rd-station-product-recommender

---

## Pré-requisitos

- **Node.js** `>= 18.3.0`
- **Yarn** `>= 1.x`

Para gerenciar versões do Node:

```bash
# Com nvm
nvm install 18.3 && nvm use 18.3

# Com n
n 18.3
```

---

## Instalação e Execução

```bash
# 1. Instalar dependências (monorepo + frontend + backend)
./install.sh

# 2. Iniciar frontend e backend simultaneamente
yarn start
```

| Endereço | Serviço |
|---|---|
| `http://localhost:3000` | Frontend React |
| `http://localhost:3001` | Backend json-server |

### Scripts disponíveis

| Script | Descrição |
|---|---|
| `yarn start` | Frontend + backend simultaneamente |
| `yarn start:frontend` | Apenas o frontend |
| `yarn start:backend` | Apenas o backend |
| `yarn dev` | Alias para `yarn start` |

### Testes

```bash
cd frontend
yarn test
```

---

## O que foi implementado

O projeto base já fornecia toda a estrutura (hooks, componentes, serviço de produtos). Os três arquivos indicados no escopo foram implementados:

### `recommendation.service.js`

Lógica central de recomendação com algoritmo de pontuação aditiva **O(n × p)**:

- Cada produto recebe 1 ponto por preferência selecionada que ele contenha, e 1 ponto por funcionalidade selecionada que ele contenha.
- **`SingleProduct`**: retorna o produto de maior score. Em empate, o **último da lista** vence — implementado com `reduceRight` e comparação estritamente maior (`>`): o acumulador só é substituído quando há score superior; em empate, permanece o elemento de maior índice.
- **`MultipleProducts`**: retorna todos os produtos com score > 0, ordenados por score decrescente. Em empate, o de maior índice original aparece primeiro — critério consistente com o modo `SingleProduct`.
- Imutabilidade garantida: os produtos originais não são modificados (spread `{ ...product, score, indiceOriginal }`).

### `Form.js`

Adicionada a prop `onRecommendationsChange`. Ao submeter o formulário, as recomendações calculadas são passadas para o componente pai via essa prop.

### `App.js`

Conecta `Form` ao `RecommendationList` via estado `recommendations`. Passa `setRecommendations` como `onRecommendationsChange` ao `Form`.

---

## Critérios de aceite

| # | Critério | Status |
|---|---|---|
| 1 | Receber preferências e funcionalidades via formulário | ✅ |
| 2 | Retornar recomendações baseadas nas seleções | ✅ |
| 3 | Modo `SingleProduct`: retornar apenas um produto | ✅ |
| 4 | Modo `MultipleProducts`: retornar lista de produtos | ✅ |
| 5 | Em empate, retornar o último produto da lista | ✅ |
| 6 | Lidar com diferentes tipos de preferências e funcionalidades | ✅ |
| 7 | Serviço modular e facilmente extensível | ✅ |

---

## Testes

Os 4 testes originais do projeto foram preservados sem modificação. Foram adicionados 9 testes cobrindo:

- `MultipleProducts` sem correspondências → lista vazia
- Imutabilidade dos produtos originais
- Recomendação apenas por funcionalidades
- Recomendação apenas por preferências
- Modo de recomendação não reconhecido → lista vazia
- Ordenação por score decrescente no modo `MultipleProducts`
- Tie-breaking no modo `MultipleProducts`
- Lista de produtos vazia
- `formData` sem campos opcionais

---

## Autor

Gilberto Camargo
