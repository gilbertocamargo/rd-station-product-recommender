/**
 * Serviço de Recomendação
 *
 * Lógica de negócio para recomendar produtos com base nas preferências
 * e funcionalidades selecionadas pelo usuário no formulário.
 *
 * Algoritmo de pontuação — O(n × p):
 *   Cada produto recebe 1 ponto por preferência selecionada que ele contenha,
 *   e 1 ponto por funcionalidade selecionada que ele contenha.
 *   O produto com maior pontuação vence. Em empate, o último da lista vence.
 */

// Modos de recomendação aceitos pelo serviço
const RECOMMENDATION_MODES = {
  SINGLE: 'SingleProduct',
  MULTIPLE: 'MultipleProducts',
};

/**
 * Calcula a pontuação de um produto com base nas seleções do usuário.
 * Cada preferência ou funcionalidade que o produto contém soma 1 ponto.
 *
 * @param {Object}   product              - Produto a avaliar
 * @param {string[]} selectedPreferences  - Preferências escolhidas pelo usuário
 * @param {string[]} selectedFeatures     - Funcionalidades escolhidas pelo usuário
 * @returns {number} Pontuação total do produto
 */
function calcularPontuacao(product, selectedPreferences = [], selectedFeatures = []) {
  const pontosDePreferencia = selectedPreferences.filter((pref) =>
    product.preferences?.includes(pref)
  ).length;

  const pontosDeFuncionalidade = selectedFeatures.filter((feat) =>
    product.features?.includes(feat)
  ).length;

  return pontosDePreferencia + pontosDeFuncionalidade;
}

/**
 * Pontua todos os produtos e preserva o índice original para desempate.
 * Retorna novos objetos via spread — não modifica os produtos originais.
 *
 * @param {Object[]} products            - Lista de produtos da API
 * @param {string[]} selectedPreferences
 * @param {string[]} selectedFeatures
 * @returns {Object[]} Produtos com `score` e `indiceOriginal` adicionados
 */
function pontuarProdutos(products, selectedPreferences, selectedFeatures) {
  return products.map((product, indiceOriginal) => ({
    ...product,
    score: calcularPontuacao(product, selectedPreferences, selectedFeatures),
    indiceOriginal,
  }));
}

/**
 * Retorna o único produto com maior pontuação.
 *
 * Regra de empate: o ÚLTIMO produto da lista original vence.
 * Implementação: reduceRight percorre de trás para frente; a condição > (estritamente maior)
 * só substitui o acumulador quando encontra pontuação superior — em empate o acumulador
 * (que já é o de maior índice, por ter sido encontrado primeiro no reduceRight) permanece.
 *
 * @param {Object[]} produtosPontuados
 * @returns {Object[]} Array com um único produto (interface consistente com MultipleProducts)
 */
function selecionarMelhorProduto(produtosPontuados) {
  const melhor = produtosPontuados.reduceRight((melhorAtual, produto) =>
    produto.score > melhorAtual.score ? produto : melhorAtual
  );

  return [melhor];
}

/**
 * Retorna todos os produtos com pontuação maior que zero,
 * ordenados por score decrescente.
 * Em empate de score, o produto com maior índice original (último na lista) aparece primeiro,
 * mantendo o mesmo critério de desempate do modo SingleProduct.
 *
 * @param {Object[]} produtosPontuados
 * @returns {Object[]} Lista de produtos relevantes ordenada
 */
function selecionarMelhorProdutos(produtosPontuados) {
  return produtosPontuados
    .filter((product) => product.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Em empate, maior índice original (último na lista) vem primeiro
      return b.indiceOriginal - a.indiceOriginal;
    });
}

/**
 * Função principal do serviço. Orquestra pontuação e seleção conforme o modo.
 *
 * @param {Object}   formData                        - Dados do formulário submetido
 * @param {string[]} formData.selectedPreferences
 * @param {string[]} formData.selectedFeatures
 * @param {string}   formData.selectedRecommendationType - 'SingleProduct' | 'MultipleProducts'
 * @param {Object[]} products                        - Produtos disponíveis vindos da API
 * @returns {Object[]} Lista de produtos recomendados
 */
const getRecommendations = (
  formData = { selectedPreferences: [], selectedFeatures: [] },
  products = []
) => {
  const {
    selectedPreferences = [],
    selectedFeatures = [],
    selectedRecommendationType,
  } = formData;

  const produtosPontuados = pontuarProdutos(products, selectedPreferences, selectedFeatures);

  if (selectedRecommendationType === RECOMMENDATION_MODES.SINGLE) {
    return selecionarMelhorProduto(produtosPontuados);
  }

  if (selectedRecommendationType === RECOMMENDATION_MODES.MULTIPLE) {
    return selecionarMelhorProdutos(produtosPontuados);
  }

  // Modo não reconhecido — retorna lista vazia para não quebrar o componente
  return [];
};

export default { getRecommendations };
