const {
  TIPO_DE_NAVIO,
  ORIENTACAO,
  RESULTADO_DO_TIRO,
  ESTADO_DA_CASA,
} = require('../src/constantes');
const { Tabuleiro } = require('../src/tabuleiro');
const { ErroDeRegra } = require('../src/erros');
const {
  criarTabuleiroComFrota,
  FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS,
  FROTA_EM_PE_ENCOSTADA_NAS_BORDAS_DE_BAIXO_E_DA_DIREITA,
  FROTA_SEM_O_DESTROIER,
  TIROS_QUE_AFUNDAM_A_FROTA_DEITADA_NA_ORDEM_PORTA_AVIOES_ENCOURACADO_SUBMARINO_DESTROIER,
  TIROS_QUE_SO_ACERTAM_AGUA_NA_FROTA_DEITADA,
} = require('./helpers/frotas');

const { HORIZONTAL, VERTICAL } = ORIENTACAO;
const { PORTA_AVIOES, ENCOURACADO, SUBMARINO, DESTROIER } = TIPO_DE_NAVIO;

function contarCasas(visao, estado) {
  return visao.flat().filter((estadoDaCasa) => estadoDaCasa === estado).length;
}

function atirarEmTodas(tabuleiro, coordenadas) {
  return coordenadas.map((coordenada) => tabuleiro.receberTiro(coordenada));
}

describe('Tabuleiro', () => {
  describe('tabuleiro novo', () => {
    test('começa sem navios e com a frota incompleta', () => {
      const tabuleiro = new Tabuleiro();

      expect(tabuleiro.consultarNavios()).toEqual([]);
      expect(tabuleiro.frotaCompleta).toBe(false);
      expect(tabuleiro.todosOsNaviosAfundados).toBe(false);
    });

    test('o adversário vê as 100 casas de um tabuleiro 10x10 como desconhecidas', () => {
      const visao = new Tabuleiro().consultarVisaoDoAdversario();

      expect(visao).toHaveLength(10);
      visao.forEach((linha) => expect(linha).toHaveLength(10));
      expect(contarCasas(visao, ESTADO_DA_CASA.DESCONHECIDA)).toBe(100);
    });
  });

  describe('posicionamento', () => {
    test('posiciona a frota inteira e passa a ter a frota completa', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);

      expect(tabuleiro.frotaCompleta).toBe(true);
      expect(tabuleiro.consultarNavios().map((navio) => navio.tipo))
        .toEqual([PORTA_AVIOES, ENCOURACADO, SUBMARINO, DESTROIER]);
    });

    test('três navios ainda não formam a frota completa', () => {
      expect(criarTabuleiroComFrota(FROTA_SEM_O_DESTROIER).frotaCompleta).toBe(false);
    });

    test('navios encostados lado a lado são permitidos', () => {
      const casasOcupadas = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS)
        .consultarNavios()
        .flatMap((navio) => navio.casas);

      expect(casasOcupadas).toHaveLength(14);
    });

    test('navios que terminam exatamente na última linha e na última coluna cabem', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_EM_PE_ENCOSTADA_NAS_BORDAS_DE_BAIXO_E_DA_DIREITA);

      expect(tabuleiro.frotaCompleta).toBe(true);
      expect(tabuleiro.consultarNavios()[0].casas.at(-1)).toEqual({ linha: 9, coluna: 9 });
    });

    test.each([
      [PORTA_AVIOES, { linha: 0, coluna: 6 }, HORIZONTAL, 'O Porta-aviões não cabe no tabuleiro nessa posição'],
      [PORTA_AVIOES, { linha: 6, coluna: 0 }, VERTICAL, 'O Porta-aviões não cabe no tabuleiro nessa posição'],
      [ENCOURACADO, { linha: 9, coluna: 7 }, HORIZONTAL, 'O Encouraçado não cabe no tabuleiro nessa posição'],
      [SUBMARINO, { linha: 8, coluna: 9 }, VERTICAL, 'O Submarino não cabe no tabuleiro nessa posição'],
      [DESTROIER, { linha: 9, coluna: 9 }, HORIZONTAL, 'O Destroier ou Hidroavião não cabe no tabuleiro nessa posição'],
      [DESTROIER, { linha: 9, coluna: 9 }, VERTICAL, 'O Destroier ou Hidroavião não cabe no tabuleiro nessa posição'],
    ])('o %s a partir de %p na %s sai do tabuleiro e é proibido', (tipo, origem, orientacao, mensagem) => {
      const tabuleiro = new Tabuleiro();

      expect(() => tabuleiro.posicionarNavio(tipo, origem, orientacao)).toThrow(new ErroDeRegra(mensagem));
      expect(tabuleiro.consultarNavios()).toEqual([]);
    });

    test.each([
      ['cruzando na vertical', SUBMARINO, { linha: 0, coluna: 2 }, VERTICAL],
      ['na mesma linha', DESTROIER, { linha: 0, coluna: 4 }, HORIZONTAL],
      ['começando na mesma casa', ENCOURACADO, { linha: 0, coluna: 0 }, VERTICAL],
    ])('um navio %s sobre o porta-aviões é proibido e não muda nada', (_descricao, tipo, origem, orientacao) => {
      const tabuleiro = new Tabuleiro();
      tabuleiro.posicionarNavio(PORTA_AVIOES, { linha: 0, coluna: 0 }, HORIZONTAL);

      expect(() => tabuleiro.posicionarNavio(tipo, origem, orientacao))
        .toThrow(ErroDeRegra);
      expect(tabuleiro.consultarNavios()).toHaveLength(1);
    });

    test('a sobreposição é informada com o nome do navio que seria posicionado', () => {
      const tabuleiro = new Tabuleiro();
      tabuleiro.posicionarNavio(PORTA_AVIOES, { linha: 0, coluna: 0 }, HORIZONTAL);

      expect(() => tabuleiro.posicionarNavio(SUBMARINO, { linha: 0, coluna: 2 }, VERTICAL))
        .toThrow(new ErroDeRegra('O Submarino ficaria sobre outro navio'));
    });

    test('posicionar o mesmo tipo de navio duas vezes é proibido e não muda nada', () => {
      const tabuleiro = new Tabuleiro();
      tabuleiro.posicionarNavio(SUBMARINO, { linha: 0, coluna: 0 }, HORIZONTAL);

      expect(() => tabuleiro.posicionarNavio(SUBMARINO, { linha: 5, coluna: 5 }, HORIZONTAL))
        .toThrow(new ErroDeRegra('O Submarino já foi posicionado'));
      expect(tabuleiro.consultarNavios()).toHaveLength(1);
    });

    test('com a frota completa, qualquer novo navio é recusado por ser repetido', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);

      expect(() => tabuleiro.posicionarNavio(DESTROIER, { linha: 9, coluna: 0 }, HORIZONTAL))
        .toThrow(new ErroDeRegra('O Destroier ou Hidroavião já foi posicionado'));
    });

    test('a repetição é conferida antes de o navio sair do tabuleiro', () => {
      const tabuleiro = new Tabuleiro();
      tabuleiro.posicionarNavio(DESTROIER, { linha: 0, coluna: 0 }, HORIZONTAL);

      expect(() => tabuleiro.posicionarNavio(DESTROIER, { linha: 9, coluna: 9 }, HORIZONTAL))
        .toThrow(new ErroDeRegra('O Destroier ou Hidroavião já foi posicionado'));
    });

    test.each([
      ['tipo desconhecido', 'CANOA', { linha: 0, coluna: 0 }, HORIZONTAL, new RangeError('Tipo de navio desconhecido: CANOA')],
      ['origem fora do tabuleiro', SUBMARINO, { linha: -1, coluna: 0 }, HORIZONTAL, new RangeError('A linha e a coluna precisam estar entre 0 e 9')],
      ['origem que não é inteira', SUBMARINO, { linha: 0.5, coluna: 0 }, HORIZONTAL, new TypeError('A linha e a coluna precisam ser números inteiros')],
      ['orientação desconhecida', SUBMARINO, { linha: 0, coluna: 0 }, 'DIAGONAL', new RangeError('Orientação desconhecida: DIAGONAL')],
    ])('%s é erro de argumento e não posiciona nada', (_descricao, tipo, origem, orientacao, erroEsperado) => {
      const tabuleiro = new Tabuleiro();

      expect(() => tabuleiro.posicionarNavio(tipo, origem, orientacao)).toThrow(erroEsperado);
      expect(tabuleiro.consultarNavios()).toEqual([]);
    });

    test('o argumento inválido é recusado antes da regra de repetição', () => {
      const tabuleiro = new Tabuleiro();
      tabuleiro.posicionarNavio(SUBMARINO, { linha: 0, coluna: 0 }, HORIZONTAL);

      expect(() => tabuleiro.posicionarNavio(SUBMARINO, { linha: 0, coluna: 0 }, 'DIAGONAL'))
        .toThrow(new RangeError('Orientação desconhecida: DIAGONAL'));
    });
  });

  describe('podePosicionarNavio', () => {
    test('responde se o navio caberia sem mudar o tabuleiro', () => {
      const tabuleiro = new Tabuleiro();
      tabuleiro.posicionarNavio(PORTA_AVIOES, { linha: 0, coluna: 0 }, HORIZONTAL);

      expect(tabuleiro.podePosicionarNavio(SUBMARINO, { linha: 1, coluna: 0 }, HORIZONTAL)).toBe(true);
      expect(tabuleiro.podePosicionarNavio(SUBMARINO, { linha: 0, coluna: 2 }, VERTICAL)).toBe(false);
      expect(tabuleiro.podePosicionarNavio(SUBMARINO, { linha: 0, coluna: 8 }, HORIZONTAL)).toBe(false);
      expect(tabuleiro.podePosicionarNavio(PORTA_AVIOES, { linha: 5, coluna: 0 }, HORIZONTAL)).toBe(false);
      expect(tabuleiro.consultarNavios()).toHaveLength(1);
    });

    test('argumento inválido continua sendo erro, e não uma resposta falsa', () => {
      expect(() => new Tabuleiro().podePosicionarNavio('CANOA', { linha: 0, coluna: 0 }, HORIZONTAL))
        .toThrow(new RangeError('Tipo de navio desconhecido: CANOA'));
    });
  });

  describe('tiros', () => {
    test('tiro em casa vazia é água', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);

      expect(tabuleiro.receberTiro({ linha: 9, coluna: 9 }))
        .toEqual({ resultado: RESULTADO_DO_TIRO.AGUA, navioAfundado: null });
    });

    test('tiro em parte de um navio é acerto', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);

      expect(tabuleiro.receberTiro({ linha: 0, coluna: 4 }))
        .toEqual({ resultado: RESULTADO_DO_TIRO.ACERTO, navioAfundado: null });
    });

    test('o tiro na última casa intacta de um navio afunda e informa qual navio foi', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);
      tabuleiro.receberTiro({ linha: 3, coluna: 1 });

      expect(tabuleiro.receberTiro({ linha: 3, coluna: 0 }))
        .toEqual({ resultado: RESULTADO_DO_TIRO.AFUNDOU, navioAfundado: DESTROIER });
    });

    test('afundar a frota na ordem dá quatro resultados de afundado, um por navio', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);

      const resultados = atirarEmTodas(
        tabuleiro,
        TIROS_QUE_AFUNDAM_A_FROTA_DEITADA_NA_ORDEM_PORTA_AVIOES_ENCOURACADO_SUBMARINO_DESTROIER,
      );

      expect(resultados.filter(({ resultado }) => resultado === RESULTADO_DO_TIRO.ACERTO)).toHaveLength(10);
      expect(resultados.map(({ navioAfundado }) => navioAfundado).filter(Boolean))
        .toEqual([PORTA_AVIOES, ENCOURACADO, SUBMARINO, DESTROIER]);
    });

    test('a frota só está toda afundada depois do último tiro', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);
      const tiros = TIROS_QUE_AFUNDAM_A_FROTA_DEITADA_NA_ORDEM_PORTA_AVIOES_ENCOURACADO_SUBMARINO_DESTROIER;

      atirarEmTodas(tabuleiro, tiros.slice(0, -1));
      expect(tabuleiro.todosOsNaviosAfundados).toBe(false);

      tabuleiro.receberTiro(tiros.at(-1));
      expect(tabuleiro.todosOsNaviosAfundados).toBe(true);
    });

    test('tiros só na água nunca afundam a frota', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);

      const resultados = atirarEmTodas(tabuleiro, TIROS_QUE_SO_ACERTAM_AGUA_NA_FROTA_DEITADA);

      expect(resultados.every(({ resultado }) => resultado === RESULTADO_DO_TIRO.AGUA)).toBe(true);
      expect(tabuleiro.todosOsNaviosAfundados).toBe(false);
    });

    test.each([
      [{ linha: 0, coluna: 0 }],
      [{ linha: 0, coluna: 9 }],
      [{ linha: 9, coluna: 0 }],
      [{ linha: 9, coluna: 9 }],
    ])('os cantos %p podem ser alvejados', (canto) => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);

      expect(() => tabuleiro.receberTiro(canto)).not.toThrow();
    });

    test.each([
      ['acertou água', { linha: 9, coluna: 9 }],
      ['acertou navio', { linha: 0, coluna: 0 }],
    ])('atirar de novo numa casa que já %s é proibido e não muda nada', (_descricao, casa) => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);
      tabuleiro.receberTiro(casa);
      const visaoAntes = tabuleiro.consultarVisaoDoAdversario();
      const naviosAntes = tabuleiro.consultarNavios();

      expect(() => tabuleiro.receberTiro(casa)).toThrow(new ErroDeRegra('Essa casa já recebeu um tiro'));
      expect(tabuleiro.consultarVisaoDoAdversario()).toEqual(visaoAntes);
      expect(tabuleiro.consultarNavios()).toEqual(naviosAntes);
    });

    test('atirar antes de a frota estar completa é proibido e não marca a casa', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_SEM_O_DESTROIER);

      expect(() => tabuleiro.receberTiro({ linha: 9, coluna: 9 }))
        .toThrow(new ErroDeRegra('A frota precisa estar completa antes do primeiro tiro'));
      expect(contarCasas(tabuleiro.consultarVisaoDoAdversario(), ESTADO_DA_CASA.DESCONHECIDA)).toBe(100);
    });

    test.each([
      [{ linha: 10, coluna: 0 }, new RangeError('A linha e a coluna precisam estar entre 0 e 9')],
      [{ linha: 0, coluna: -1 }, new RangeError('A linha e a coluna precisam estar entre 0 e 9')],
      [{ linha: '0', coluna: 0 }, new TypeError('A linha e a coluna precisam ser números inteiros')],
      [null, new TypeError('A coordenada precisa ser um objeto { linha, coluna }')],
    ])('tiro com coordenada inválida %p é erro de argumento', (coordenada, erroEsperado) => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);

      expect(() => tabuleiro.receberTiro(coordenada)).toThrow(erroEsperado);
    });

    test('a coordenada inválida é recusada antes da regra de frota completa', () => {
      expect(() => new Tabuleiro().receberTiro({ linha: 10, coluna: 0 }))
        .toThrow(new RangeError('A linha e a coluna precisam estar entre 0 e 9'));
    });
  });

  describe('visão do adversário', () => {
    test('mostra água, acerto e afundado só nas casas que receberam tiro', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);
      tabuleiro.receberTiro({ linha: 9, coluna: 9 });
      tabuleiro.receberTiro({ linha: 0, coluna: 0 });
      tabuleiro.receberTiro({ linha: 3, coluna: 0 });
      tabuleiro.receberTiro({ linha: 3, coluna: 1 });

      const visao = tabuleiro.consultarVisaoDoAdversario();

      expect(visao[9][9]).toBe(ESTADO_DA_CASA.AGUA);
      expect(visao[0][0]).toBe(ESTADO_DA_CASA.ACERTO);
      expect(visao[3][0]).toBe(ESTADO_DA_CASA.AFUNDADO);
      expect(visao[3][1]).toBe(ESTADO_DA_CASA.AFUNDADO);
      expect(contarCasas(visao, ESTADO_DA_CASA.DESCONHECIDA)).toBe(96);
    });

    test('casas de navio que ainda não levaram tiro continuam desconhecidas', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);
      tabuleiro.receberTiro({ linha: 0, coluna: 0 });

      const visao = tabuleiro.consultarVisaoDoAdversario();

      expect(visao[0].slice(1, 5)).toEqual(Array(4).fill(ESTADO_DA_CASA.DESCONHECIDA));
    });

    test('quando o navio afunda, todas as suas casas passam de acerto para afundado', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);
      tabuleiro.receberTiro({ linha: 2, coluna: 0 });
      tabuleiro.receberTiro({ linha: 2, coluna: 1 });
      expect(tabuleiro.consultarVisaoDoAdversario()[2].slice(0, 3))
        .toEqual([ESTADO_DA_CASA.ACERTO, ESTADO_DA_CASA.ACERTO, ESTADO_DA_CASA.DESCONHECIDA]);

      tabuleiro.receberTiro({ linha: 2, coluna: 2 });

      expect(tabuleiro.consultarVisaoDoAdversario()[2].slice(0, 3))
        .toEqual(Array(3).fill(ESTADO_DA_CASA.AFUNDADO));
    });
  });

  describe('consultarNavios', () => {
    test('informa tipo, casas e se cada navio afundou', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);
      tabuleiro.receberTiro({ linha: 3, coluna: 0 });
      tabuleiro.receberTiro({ linha: 3, coluna: 1 });

      expect(tabuleiro.consultarNavios()[3]).toEqual({
        tipo: DESTROIER,
        casas: [{ linha: 3, coluna: 0 }, { linha: 3, coluna: 1 }],
        afundado: true,
      });
      expect(tabuleiro.consultarNavios()[0].afundado).toBe(false);
    });
  });

  describe('encapsulamento', () => {
    test('alterar a lista de navios devolvida não altera o tabuleiro', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);

      const navios = tabuleiro.consultarNavios();
      navios[0].casas[0].linha = 9;
      navios[0].afundado = true;
      navios.pop();

      expect(tabuleiro.consultarNavios()).toHaveLength(4);
      expect(tabuleiro.consultarNavios()[0].casas[0]).toEqual({ linha: 0, coluna: 0 });
      expect(tabuleiro.consultarNavios()[0].afundado).toBe(false);
    });

    test('alterar a visão devolvida não altera o tabuleiro', () => {
      const tabuleiro = criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS);

      const visao = tabuleiro.consultarVisaoDoAdversario();
      visao[0][0] = ESTADO_DA_CASA.AFUNDADO;

      expect(tabuleiro.consultarVisaoDoAdversario()[0][0]).toBe(ESTADO_DA_CASA.DESCONHECIDA);
    });

    test('alterar a origem depois de posicionar não move o navio', () => {
      const tabuleiro = new Tabuleiro();
      const origem = { linha: 0, coluna: 0 };
      tabuleiro.posicionarNavio(DESTROIER, origem, HORIZONTAL);

      origem.linha = 5;

      expect(tabuleiro.consultarNavios()[0].casas[0]).toEqual({ linha: 0, coluna: 0 });
    });

    test('o estado interno não aparece como propriedade pública', () => {
      expect(Object.keys(criarTabuleiroComFrota(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS))).toEqual([]);
    });
  });
});
