const { TIPO_DE_NAVIO, ORIENTACAO } = require('../src/constantes');
const { gerarPosicionamentoAleatorio } = require('../src/posicionamentoAleatorio');
const { criarTabuleiroComFrota, FROTA_EM_PE_ENCOSTADA_NAS_BORDAS_DE_BAIXO_E_DA_DIREITA } = require('./helpers/frotas');
const {
  GERADOR_QUE_SEMPRE_ESCOLHE_A_PRIMEIRA_POSICAO_VALIDA,
  GERADOR_QUE_SEMPRE_ESCOLHE_A_ULTIMA_POSICAO_VALIDA,
  criarGeradorQueRepeteASequencia,
  SEQUENCIA_QUALQUER_DE_SORTEIOS,
  GERADOR_QUE_DEVOLVE_UM,
  GERADOR_QUE_DEVOLVE_NEGATIVO,
  GERADOR_QUE_DEVOLVE_NAN,
  GERADOR_QUE_DEVOLVE_TEXTO,
} = require('./helpers/geradores');

const { HORIZONTAL, VERTICAL } = ORIENTACAO;
const { PORTA_AVIOES, ENCOURACADO, SUBMARINO, DESTROIER } = TIPO_DE_NAVIO;
const QUANTIDADE_DE_SORTEIOS_SEM_INJECAO = 25;

describe('gerarPosicionamentoAleatorio', () => {
  describe('com gerador previsível', () => {
    test('escolhendo sempre a primeira opção, os navios ocupam as primeiras casas livres na horizontal', () => {
      expect(gerarPosicionamentoAleatorio(GERADOR_QUE_SEMPRE_ESCOLHE_A_PRIMEIRA_POSICAO_VALIDA)).toEqual([
        { tipo: PORTA_AVIOES, origem: { linha: 0, coluna: 0 }, orientacao: HORIZONTAL },
        { tipo: ENCOURACADO, origem: { linha: 0, coluna: 5 }, orientacao: HORIZONTAL },
        { tipo: SUBMARINO, origem: { linha: 1, coluna: 0 }, orientacao: HORIZONTAL },
        { tipo: DESTROIER, origem: { linha: 1, coluna: 3 }, orientacao: HORIZONTAL },
      ]);
    });

    test('escolhendo sempre a última opção, os navios ficam em pé encostados nas bordas de baixo e da direita', () => {
      expect(gerarPosicionamentoAleatorio(GERADOR_QUE_SEMPRE_ESCOLHE_A_ULTIMA_POSICAO_VALIDA))
        .toEqual(FROTA_EM_PE_ENCOSTADA_NAS_BORDAS_DE_BAIXO_E_DA_DIREITA);
    });

    test('o sorteio do meio das 120 posições do porta-aviões é a primeira posição vertical', () => {
      const gerador = jest.fn()
        .mockReturnValueOnce(0.5)
        .mockReturnValue(0);

      const [portaAvioes] = gerarPosicionamentoAleatorio(gerador);

      expect(portaAvioes).toEqual({ tipo: PORTA_AVIOES, origem: { linha: 0, coluna: 0 }, orientacao: VERTICAL });
    });

    test('os navios são sorteados do maior para o menor, uma chamada ao gerador por navio', () => {
      const gerador = jest.fn(GERADOR_QUE_SEMPRE_ESCOLHE_A_PRIMEIRA_POSICAO_VALIDA);

      const posicionamento = gerarPosicionamentoAleatorio(gerador);

      expect(gerador).toHaveBeenCalledTimes(4);
      expect(gerador).toHaveBeenCalledWith();
      expect(posicionamento.map((navio) => navio.tipo)).toEqual([PORTA_AVIOES, ENCOURACADO, SUBMARINO, DESTROIER]);
    });

    test('a mesma sequência de sorteios reproduz exatamente o mesmo posicionamento', () => {
      const primeiro = gerarPosicionamentoAleatorio(criarGeradorQueRepeteASequencia(SEQUENCIA_QUALQUER_DE_SORTEIOS));
      const segundo = gerarPosicionamentoAleatorio(criarGeradorQueRepeteASequencia(SEQUENCIA_QUALQUER_DE_SORTEIOS));

      expect(segundo).toEqual(primeiro);
    });

    test('o posicionamento sorteado é aceito por um tabuleiro e completa a frota', () => {
      const posicionamento = gerarPosicionamentoAleatorio(criarGeradorQueRepeteASequencia(SEQUENCIA_QUALQUER_DE_SORTEIOS));

      expect(criarTabuleiroComFrota(posicionamento).frotaCompleta).toBe(true);
    });
  });

  describe('sem injeção (Math.random)', () => {
    test.each(Array.from({ length: QUANTIDADE_DE_SORTEIOS_SEM_INJECAO }, (_sorteio, indice) => indice + 1))(
      'o sorteio %i posiciona os quatro navios, cada um uma vez, sem sobreposição e dentro do tabuleiro',
      () => {
        const posicionamento = gerarPosicionamentoAleatorio();
        const casasOcupadas = criarTabuleiroComFrota(posicionamento)
          .consultarNavios()
          .flatMap((navio) => navio.casas)
          .map(({ linha, coluna }) => `${linha},${coluna}`);

        expect(posicionamento.map((navio) => navio.tipo).sort()).toEqual(Object.values(TIPO_DE_NAVIO).sort());
        expect(new Set(casasOcupadas).size).toBe(14);
      },
    );
  });

  describe('gerador inválido', () => {
    test.each([
      ['um número', 0.5],
      ['nulo', null],
      ['um texto', 'aleatorio'],
    ])('um gerador que é %s, e não uma função, é TypeError', (_descricao, gerador) => {
      expect(() => gerarPosicionamentoAleatorio(gerador))
        .toThrow(new TypeError('O gerador de números aleatórios precisa ser uma função'));
    });

    test.each([
      ['exatamente 1', GERADOR_QUE_DEVOLVE_UM],
      ['um negativo', GERADOR_QUE_DEVOLVE_NEGATIVO],
      ['NaN', GERADOR_QUE_DEVOLVE_NAN],
    ])('um gerador que devolve %s está fora de [0, 1) e é RangeError', (_descricao, gerador) => {
      expect(() => gerarPosicionamentoAleatorio(gerador))
        .toThrow(new RangeError('O gerador de números aleatórios precisa devolver um valor no intervalo [0, 1)'));
    });

    test('um gerador que devolve texto é TypeError', () => {
      expect(() => gerarPosicionamentoAleatorio(GERADOR_QUE_DEVOLVE_TEXTO))
        .toThrow(new TypeError('O gerador de números aleatórios precisa devolver um número'));
    });

    test('um gerador que falha no terceiro navio interrompe o sorteio sem devolver posicionamento parcial', () => {
      const gerador = jest.fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1);

      expect(() => gerarPosicionamentoAleatorio(gerador)).toThrow(RangeError);
      expect(gerador).toHaveBeenCalledTimes(3);
    });
  });
});
