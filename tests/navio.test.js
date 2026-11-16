const { TIPO_DE_NAVIO, ORIENTACAO } = require('../src/constantes');
const { Navio, validarTipoDeNavio } = require('../src/navio');

const ORIGEM = Object.freeze({ linha: 2, coluna: 3 });

describe('validarTipoDeNavio', () => {
  test.each(Object.values(TIPO_DE_NAVIO))('aceita o tipo %s', (tipo) => {
    expect(() => validarTipoDeNavio(tipo)).not.toThrow();
  });

  test.each([
    ['CRUZADOR', 'Tipo de navio desconhecido: CRUZADOR'],
    ['porta_avioes', 'Tipo de navio desconhecido: porta_avioes'],
    ['toString', 'Tipo de navio desconhecido: toString'],
    [undefined, 'Tipo de navio desconhecido: undefined'],
  ])('recusa o tipo %p com RangeError', (tipo, mensagem) => {
    expect(() => validarTipoDeNavio(tipo)).toThrow(new RangeError(mensagem));
  });
});

describe('Navio', () => {
  describe('criação', () => {
    test.each([
      [TIPO_DE_NAVIO.PORTA_AVIOES, 'Porta-aviões', 5],
      [TIPO_DE_NAVIO.ENCOURACADO, 'Encouraçado', 4],
      [TIPO_DE_NAVIO.SUBMARINO, 'Submarino', 3],
      [TIPO_DE_NAVIO.DESTROIER, 'Destroier ou Hidroavião', 2],
    ])('o %s se chama "%s" e ocupa %i casas', (tipo, nome, tamanho) => {
      const navio = new Navio(tipo, ORIGEM, ORIENTACAO.HORIZONTAL);

      expect(navio.tipo).toBe(tipo);
      expect(navio.nome).toBe(nome);
      expect(navio.tamanho).toBe(tamanho);
      expect(navio.casas).toHaveLength(tamanho);
    });

    test('um submarino horizontal ocupa três casas seguidas na mesma linha', () => {
      const navio = new Navio(TIPO_DE_NAVIO.SUBMARINO, ORIGEM, ORIENTACAO.HORIZONTAL);

      expect(navio.casas).toEqual([
        { linha: 2, coluna: 3 },
        { linha: 2, coluna: 4 },
        { linha: 2, coluna: 5 },
      ]);
    });

    test('um destroier vertical ocupa duas casas seguidas na mesma coluna', () => {
      const navio = new Navio(TIPO_DE_NAVIO.DESTROIER, ORIGEM, ORIENTACAO.VERTICAL);

      expect(navio.casas).toEqual([
        { linha: 2, coluna: 3 },
        { linha: 3, coluna: 3 },
      ]);
    });

    test('um navio recém-criado não está afundado', () => {
      expect(new Navio(TIPO_DE_NAVIO.DESTROIER, ORIGEM, ORIENTACAO.VERTICAL).afundado).toBe(false);
    });

    test('alterar a origem depois de criar o navio não move o navio', () => {
      const origem = { linha: 2, coluna: 3 };
      const navio = new Navio(TIPO_DE_NAVIO.DESTROIER, origem, ORIENTACAO.HORIZONTAL);

      origem.linha = 9;

      expect(navio.casas[0]).toEqual({ linha: 2, coluna: 3 });
    });
  });

  describe('argumentos inválidos', () => {
    test('tipo desconhecido é RangeError', () => {
      expect(() => new Navio('CANOA', ORIGEM, ORIENTACAO.HORIZONTAL))
        .toThrow(new RangeError('Tipo de navio desconhecido: CANOA'));
    });

    test('origem que não é objeto é TypeError', () => {
      expect(() => new Navio(TIPO_DE_NAVIO.SUBMARINO, null, ORIENTACAO.HORIZONTAL))
        .toThrow(new TypeError('A coordenada precisa ser um objeto { linha, coluna }'));
    });

    test('origem fora do tabuleiro é RangeError', () => {
      expect(() => new Navio(TIPO_DE_NAVIO.SUBMARINO, { linha: 10, coluna: 0 }, ORIENTACAO.HORIZONTAL))
        .toThrow(new RangeError('A linha e a coluna precisam estar entre 0 e 9'));
    });

    test('orientação diagonal é RangeError', () => {
      expect(() => new Navio(TIPO_DE_NAVIO.SUBMARINO, ORIGEM, 'DIAGONAL'))
        .toThrow(new RangeError('Orientação desconhecida: DIAGONAL'));
    });

    test('o tipo é validado antes da origem e da orientação', () => {
      expect(() => new Navio('CANOA', null, 'DIAGONAL'))
        .toThrow(new RangeError('Tipo de navio desconhecido: CANOA'));
    });
  });

  describe('acertos', () => {
    test('ocupa responde se a casa pertence ao navio', () => {
      const navio = new Navio(TIPO_DE_NAVIO.DESTROIER, ORIGEM, ORIENTACAO.HORIZONTAL);

      expect(navio.ocupa({ linha: 2, coluna: 4 })).toBe(true);
      expect(navio.ocupa({ linha: 2, coluna: 5 })).toBe(false);
    });

    test('acertar só parte das casas não afunda o navio', () => {
      const navio = new Navio(TIPO_DE_NAVIO.SUBMARINO, ORIGEM, ORIENTACAO.HORIZONTAL);

      navio.registrarAcerto({ linha: 2, coluna: 3 });
      navio.registrarAcerto({ linha: 2, coluna: 5 });

      expect(navio.afundado).toBe(false);
    });

    test('acertar todas as casas, em qualquer ordem, afunda o navio', () => {
      const navio = new Navio(TIPO_DE_NAVIO.SUBMARINO, ORIGEM, ORIENTACAO.VERTICAL);

      navio.registrarAcerto({ linha: 4, coluna: 3 });
      navio.registrarAcerto({ linha: 2, coluna: 3 });
      navio.registrarAcerto({ linha: 3, coluna: 3 });

      expect(navio.afundado).toBe(true);
    });

    test('acertar duas vezes a mesma casa conta como um único acerto', () => {
      const navio = new Navio(TIPO_DE_NAVIO.DESTROIER, ORIGEM, ORIENTACAO.HORIZONTAL);

      navio.registrarAcerto({ linha: 2, coluna: 3 });
      navio.registrarAcerto({ linha: 2, coluna: 3 });

      expect(navio.afundado).toBe(false);
    });

    test('registrar acerto em casa que não é do navio é RangeError e não muda nada', () => {
      const navio = new Navio(TIPO_DE_NAVIO.DESTROIER, ORIGEM, ORIENTACAO.HORIZONTAL);
      navio.registrarAcerto({ linha: 2, coluna: 3 });

      expect(() => navio.registrarAcerto({ linha: 0, coluna: 0 }))
        .toThrow(new RangeError('A coordenada não pertence a este navio'));
      expect(navio.afundado).toBe(false);
    });

    test('registrar acerto com coordenada inválida é TypeError', () => {
      const navio = new Navio(TIPO_DE_NAVIO.DESTROIER, ORIGEM, ORIENTACAO.HORIZONTAL);

      expect(() => navio.registrarAcerto({ linha: '2', coluna: 3 }))
        .toThrow(new TypeError('A linha e a coluna precisam ser números inteiros'));
    });
  });

  describe('encapsulamento', () => {
    test('alterar as casas devolvidas não altera o navio', () => {
      const navio = new Navio(TIPO_DE_NAVIO.DESTROIER, ORIGEM, ORIENTACAO.HORIZONTAL);

      const casas = navio.casas;
      casas[0].linha = 9;
      casas.pop();

      expect(navio.casas).toEqual([
        { linha: 2, coluna: 3 },
        { linha: 2, coluna: 4 },
      ]);
    });

    test('cada consulta devolve uma lista nova', () => {
      const navio = new Navio(TIPO_DE_NAVIO.DESTROIER, ORIGEM, ORIENTACAO.HORIZONTAL);

      expect(navio.casas).not.toBe(navio.casas);
    });

    test('o estado interno não aparece como propriedade pública', () => {
      const navio = new Navio(TIPO_DE_NAVIO.DESTROIER, ORIGEM, ORIENTACAO.HORIZONTAL);

      expect(Object.keys(navio)).toEqual([]);
    });
  });
});
