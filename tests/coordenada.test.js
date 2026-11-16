const { ORIENTACAO } = require('../src/constantes');
const {
  estaDentroDoTabuleiro,
  validarCoordenada,
  validarOrientacao,
  saoCoordenadasIguais,
  calcularCasasDoNavio,
} = require('../src/coordenada');

describe('estaDentroDoTabuleiro', () => {
  test.each([
    [0, 0],
    [0, 9],
    [9, 0],
    [9, 9],
    [4, 5],
  ])('a casa (%i, %i) está dentro do tabuleiro 10x10', (linha, coluna) => {
    expect(estaDentroDoTabuleiro({ linha, coluna })).toBe(true);
  });

  test.each([
    [-1, 0],
    [0, -1],
    [10, 0],
    [0, 10],
    [10, 10],
  ])('a casa (%i, %i) está fora do tabuleiro 10x10', (linha, coluna) => {
    expect(estaDentroDoTabuleiro({ linha, coluna })).toBe(false);
  });
});

describe('validarCoordenada', () => {
  test('devolve uma cópia da coordenada válida, sem campos extras', () => {
    const recebida = { linha: 3, coluna: 7, extra: 'ignorado' };

    const validada = validarCoordenada(recebida);

    expect(validada).toEqual({ linha: 3, coluna: 7 });
    expect(validada).not.toBe(recebida);
  });

  test.each([
    [0, 0],
    [9, 9],
  ])('aceita a borda (%i, %i)', (linha, coluna) => {
    expect(validarCoordenada({ linha, coluna })).toEqual({ linha, coluna });
  });

  test.each([
    ['nula', null],
    ['indefinida', undefined],
    ['um texto', 'A1'],
    ['um número', 5],
  ])('uma coordenada %s é recusada com TypeError', (_descricao, coordenada) => {
    expect(() => validarCoordenada(coordenada))
      .toThrow(new TypeError('A coordenada precisa ser um objeto { linha, coluna }'));
  });

  test.each([
    ['sem linha', { coluna: 1 }],
    ['sem coluna', { linha: 1 }],
    ['com linha em texto', { linha: '1', coluna: 1 }],
    ['com coluna fracionária', { linha: 1, coluna: 1.5 }],
    ['com linha NaN', { linha: NaN, coluna: 1 }],
    ['com coluna infinita', { linha: 1, coluna: Infinity }],
  ])('uma coordenada %s é recusada com TypeError', (_descricao, coordenada) => {
    expect(() => validarCoordenada(coordenada))
      .toThrow(new TypeError('A linha e a coluna precisam ser números inteiros'));
  });

  test.each([
    [-1, 0],
    [0, -1],
    [10, 0],
    [0, 10],
  ])('a coordenada (%i, %i) fora do tabuleiro é recusada com RangeError', (linha, coluna) => {
    expect(() => validarCoordenada({ linha, coluna }))
      .toThrow(new RangeError('A linha e a coluna precisam estar entre 0 e 9'));
  });
});

describe('validarOrientacao', () => {
  test.each(Object.values(ORIENTACAO))('aceita a orientação %s', (orientacao) => {
    expect(() => validarOrientacao(orientacao)).not.toThrow();
  });

  test.each([
    ['DIAGONAL', 'Orientação desconhecida: DIAGONAL'],
    ['horizontal', 'Orientação desconhecida: horizontal'],
    [undefined, 'Orientação desconhecida: undefined'],
    [1, 'Orientação desconhecida: 1'],
  ])('recusa a orientação %p com RangeError', (orientacao, mensagem) => {
    expect(() => validarOrientacao(orientacao)).toThrow(new RangeError(mensagem));
  });
});

describe('saoCoordenadasIguais', () => {
  test('coordenadas com a mesma linha e coluna são iguais', () => {
    expect(saoCoordenadasIguais({ linha: 2, coluna: 3 }, { linha: 2, coluna: 3 })).toBe(true);
  });

  test.each([
    [{ linha: 2, coluna: 3 }, { linha: 3, coluna: 3 }],
    [{ linha: 2, coluna: 3 }, { linha: 2, coluna: 4 }],
    [{ linha: 2, coluna: 3 }, { linha: 3, coluna: 2 }],
  ])('%p e %p são diferentes', (primeira, segunda) => {
    expect(saoCoordenadasIguais(primeira, segunda)).toBe(false);
  });
});

describe('calcularCasasDoNavio', () => {
  test('na horizontal, o navio cresce para a direita a partir da origem', () => {
    expect(calcularCasasDoNavio({ linha: 4, coluna: 2 }, ORIENTACAO.HORIZONTAL, 3)).toEqual([
      { linha: 4, coluna: 2 },
      { linha: 4, coluna: 3 },
      { linha: 4, coluna: 4 },
    ]);
  });

  test('na vertical, o navio cresce para baixo a partir da origem', () => {
    expect(calcularCasasDoNavio({ linha: 4, coluna: 2 }, ORIENTACAO.VERTICAL, 3)).toEqual([
      { linha: 4, coluna: 2 },
      { linha: 5, coluna: 2 },
      { linha: 6, coluna: 2 },
    ]);
  });

  test('as casas calculadas podem passar da borda, quem barra é o tabuleiro', () => {
    const casas = calcularCasasDoNavio({ linha: 0, coluna: 8 }, ORIENTACAO.HORIZONTAL, 3);

    expect(casas[2]).toEqual({ linha: 0, coluna: 10 });
    expect(estaDentroDoTabuleiro(casas[2])).toBe(false);
  });
});
