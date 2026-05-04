import recommendationService from './recommendation.service';
import mockProducts from '../mocks/mockProducts';

// ─── Testes originais do projeto (não modificados) ────────────────────────────

describe('recommendationService', () => {
  test('Retorna recomendação correta para SingleProduct com base nas preferências selecionadas', () => {
    const formData = {
      selectedPreferences: ['Integração com chatbots'],
      selectedFeatures: ['Chat ao vivo e mensagens automatizadas'],
      selectedRecommendationType: 'SingleProduct',
    };

    const recommendations = recommendationService.getRecommendations(
      formData,
      mockProducts
    );

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].name).toBe('RD Conversas');
  });

  test('Retorna recomendações corretas para MultipleProducts com base nas preferências selecionadas', () => {
    const formData = {
      selectedPreferences: [
        'Integração fácil com ferramentas de e-mail',
        'Personalização de funis de vendas',
        'Automação de marketing',
      ],
      selectedFeatures: [
        'Rastreamento de interações com clientes',
        'Rastreamento de comportamento do usuário',
      ],
      selectedRecommendationType: 'MultipleProducts',
    };

    const recommendations = recommendationService.getRecommendations(
      formData,
      mockProducts
    );

    expect(recommendations).toHaveLength(2);
    expect(recommendations.map((product) => product.name)).toEqual([
      'RD Station CRM',
      'RD Station Marketing',
    ]);
  });

  test('Retorna apenas um produto para SingleProduct com mais de um produto de match', () => {
    const formData = {
      selectedPreferences: [
        'Integração fácil com ferramentas de e-mail',
        'Automação de marketing',
      ],
      selectedFeatures: [
        'Rastreamento de interações com clientes',
        'Rastreamento de comportamento do usuário',
      ],
      selectedRecommendationType: 'SingleProduct',
    };

    const recommendations = recommendationService.getRecommendations(
      formData,
      mockProducts
    );

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].name).toBe('RD Station Marketing');
  });

  test('Retorna o último match em caso de empate para SingleProduct', () => {
    const formData = {
      selectedPreferences: ['Automação de marketing', 'Integração com chatbots'],
      selectedRecommendationType: 'SingleProduct',
    };

    const recommendations = recommendationService.getRecommendations(
      formData,
      mockProducts
    );

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].name).toBe('RD Conversas');
  });
});

// ─── Testes adicionais ────────────────────────────────────────────────────────

describe('recommendationService — casos adicionais', () => {
  test('Retorna lista vazia para MultipleProducts sem nenhuma correspondência', () => {
    const formData = {
      selectedPreferences: [],
      selectedFeatures: [],
      selectedRecommendationType: 'MultipleProducts',
    };

    const recommendations = recommendationService.getRecommendations(
      formData,
      mockProducts
    );

    // Sem preferências ou funcionalidades, nenhum produto pontua acima de zero
    expect(recommendations).toHaveLength(0);
  });

  test('Não modifica os produtos originais ao calcular pontuações', () => {
    const produtoOriginalSemScore = { ...mockProducts[0] };
    delete produtoOriginalSemScore.score;
    delete produtoOriginalSemScore.indiceOriginal;

    recommendationService.getRecommendations(
      { selectedPreferences: ['Automação de marketing'], selectedRecommendationType: 'SingleProduct' },
      mockProducts
    );

    // O objeto original não deve ter sido alterado
    expect(mockProducts[0].score).toBeUndefined();
    expect(mockProducts[0].indiceOriginal).toBeUndefined();
  });

  test('Retorna produto mesmo quando apenas funcionalidades são selecionadas', () => {
    const formData = {
      selectedPreferences: [],
      selectedFeatures: ['Gestão de leads e oportunidades'],
      selectedRecommendationType: 'SingleProduct',
    };

    const recommendations = recommendationService.getRecommendations(
      formData,
      mockProducts
    );

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].name).toBe('RD Station CRM');
  });

  test('Retorna produto mesmo quando apenas preferências são selecionadas', () => {
    const formData = {
      selectedPreferences: ['Análise preditiva de dados'],
      selectedFeatures: [],
      selectedRecommendationType: 'SingleProduct',
    };

    const recommendations = recommendationService.getRecommendations(
      formData,
      mockProducts
    );

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].name).toBe('RD Mentor AI');
  });

  test('Retorna lista vazia para modo de recomendação não reconhecido', () => {
    const formData = {
      selectedPreferences: ['Automação de marketing'],
      selectedRecommendationType: 'ModoInexistente',
    };

    const recommendations = recommendationService.getRecommendations(
      formData,
      mockProducts
    );

    expect(recommendations).toHaveLength(0);
  });

  test('MultipleProducts ordena por score decrescente', () => {
    const formData = {
      selectedPreferences: [
        'Integração fácil com ferramentas de e-mail', // CRM
        'Personalização de funis de vendas',           // CRM
        'Automação de marketing',                      // Marketing
      ],
      selectedFeatures: [],
      selectedRecommendationType: 'MultipleProducts',
    };

    const recommendations = recommendationService.getRecommendations(
      formData,
      mockProducts
    );

    // CRM tem score 2, Marketing tem score 1 — CRM deve vir primeiro
    expect(recommendations[0].name).toBe('RD Station CRM');
    expect(recommendations[0].score).toBeGreaterThanOrEqual(recommendations[1].score);
  });

  test('MultipleProducts em empate retorna o último produto da lista original primeiro', () => {
    // Marketing (idx 1) e Conversas (idx 2) têm score 1 cada
    // Conversas tem maior índice → deve aparecer primeiro no resultado
    const formData = {
      selectedPreferences: [
        'Automação de marketing',    // Marketing
        'Integração com chatbots',   // Conversas
      ],
      selectedFeatures: [],
      selectedRecommendationType: 'MultipleProducts',
    };

    const recommendations = recommendationService.getRecommendations(
      formData,
      mockProducts
    );

    expect(recommendations).toHaveLength(2);
    expect(recommendations[0].name).toBe('RD Conversas');
    expect(recommendations[1].name).toBe('RD Station Marketing');
  });

  test('Funciona corretamente com lista de produtos vazia', () => {
    const formData = {
      selectedPreferences: ['Automação de marketing'],
      selectedRecommendationType: 'MultipleProducts',
    };

    const recommendations = recommendationService.getRecommendations(formData, []);
    expect(recommendations).toHaveLength(0);
  });

  test('Funciona corretamente com formData sem campos opcionais', () => {
    expect(() => {
      recommendationService.getRecommendations({}, mockProducts);
    }).not.toThrow();
  });
});
