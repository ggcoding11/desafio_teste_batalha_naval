const {
  TIPO_DE_NAVIO,
  ORIENTACAO,
  RESULTADO_DO_TIRO,
  ESTADO_DA_CASA,
  JOGADOR,
  ESTADO_DA_PARTIDA,
} = require('../src/constantes');
const { Partida } = require('../src/partida');
const { ErroDeRegra } = require('../src/erros');
const {
  FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS,
  FROTA_EM_PE_ENCOSTADA_NAS_BORDAS_DE_BAIXO_E_DA_DIREITA,
  FROTA_SEM_O_DESTROIER,
  FROTA_COM_SUBMARINO_SOBRE_O_PORTA_AVIOES,
  TIROS_QUE_AFUNDAM_A_FROTA_DEITADA_NA_ORDEM_PORTA_AVIOES_ENCOURACADO_SUBMARINO_DESTROIER,
  TIROS_QUE_SO_ACERTAM_AGUA_NA_FROTA_DEITADA,
} = require('./helpers/frotas');

const { PRIMEIRO, SEGUNDO } = JOGADOR;
const TIROS_QUE_AFUNDAM_TUDO = TIROS_QUE_AFUNDAM_A_FROTA_DEITADA_NA_ORDEM_PORTA_AVIOES_ENCOURACADO_SUBMARINO_DESTROIER;
const TIROS_NA_AGUA = TIROS_QUE_SO_ACERTAM_AGUA_NA_FROTA_DEITADA;

const GERAR_A_FROTA_DEITADA_PARA_OS_DOIS = () => FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS;

function criarPartidaComAFrotaDeitada() {
  return new Partida(GERAR_A_FROTA_DEITADA_PARA_OS_DOIS);
}

function jogarAlternando(partida, tirosDoPrimeiro, tirosDoSegundo) {
  const tirosRestantes = { [PRIMEIRO]: [...tirosDoPrimeiro], [SEGUNDO]: [...tirosDoSegundo] };
  while (partida.estado === ESTADO_DA_PARTIDA.EM_ANDAMENTO) {
    const jogador = partida.jogadorDaVez;
    partida.atirar(jogador, tirosRestantes[jogador].shift());
  }
}

function fotografar(partida) {
  return {
    estado: partida.estado,
    jogadorDaVez: partida.jogadorDaVez,
    vencedor: partida.vencedor,
    visaoDoPrimeiro: partida.consultarVisaoDoAdversario(PRIMEIRO),
    visaoDoSegundo: partida.consultarVisaoDoAdversario(SEGUNDO),
  };
}

describe('Partida', () => {
  describe('início', () => {
    test('começa em andamento, na vez do primeiro jogador e sem vencedor', () => {
      const partida = criarPartidaComAFrotaDeitada();

      expect(partida.estado).toBe(ESTADO_DA_PARTIDA.EM_ANDAMENTO);
      expect(partida.jogadorDaVez).toBe(PRIMEIRO);
      expect(partida.vencedor).toBeNull();
    });

    test('pede um posicionamento por jogador, sem argumentos, só na criação', () => {
      const gerarPosicionamento = jest.fn(GERAR_A_FROTA_DEITADA_PARA_OS_DOIS);

      const partida = new Partida(gerarPosicionamento);
      partida.atirar(PRIMEIRO, { linha: 9, coluna: 9 });

      expect(gerarPosicionamento).toHaveBeenCalledTimes(2);
      expect(gerarPosicionamento).toHaveBeenNthCalledWith(1);
      expect(gerarPosicionamento).toHaveBeenNthCalledWith(2);
    });

    test('o primeiro posicionamento gerado é do primeiro jogador e o segundo, do segundo jogador', () => {
      const gerarPosicionamento = jest.fn()
        .mockReturnValueOnce(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS)
        .mockReturnValueOnce(FROTA_EM_PE_ENCOSTADA_NAS_BORDAS_DE_BAIXO_E_DA_DIREITA);

      const partida = new Partida(gerarPosicionamento);

      expect(partida.consultarNaviosDe(PRIMEIRO)[0].casas[0]).toEqual({ linha: 0, coluna: 0 });
      expect(partida.consultarNaviosDe(SEGUNDO)[0].casas[0]).toEqual({ linha: 5, coluna: 9 });
    });

    test('sem injeção, sorteia uma frota completa para cada jogador', () => {
      const partida = new Partida();

      expect(partida.consultarNaviosDe(PRIMEIRO)).toHaveLength(4);
      expect(partida.consultarNaviosDe(SEGUNDO)).toHaveLength(4);
      expect(partida.jogadorDaVez).toBe(PRIMEIRO);
    });
  });

  describe('posicionamento injetado inválido', () => {
    test('um gerador que não é função é TypeError', () => {
      expect(() => new Partida(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS))
        .toThrow(new TypeError('O gerador de posicionamento precisa ser uma função'));
    });

    test.each([
      ['nada', undefined],
      ['um objeto', { tipo: TIPO_DE_NAVIO.SUBMARINO }],
      ['um texto', 'frota'],
    ])('um gerador que devolve %s em vez de uma lista é TypeError', (_descricao, retorno) => {
      expect(() => new Partida(() => retorno))
        .toThrow(new TypeError('O posicionamento gerado precisa ser uma lista de navios'));
    });

    test('um posicionamento com item que não é objeto é TypeError', () => {
      expect(() => new Partida(() => [...FROTA_SEM_O_DESTROIER, null]))
        .toThrow(new TypeError('Cada navio do posicionamento precisa ser um objeto { tipo, origem, orientacao }'));
    });

    test('um posicionamento com a frota incompleta é proibido', () => {
      expect(() => new Partida(() => FROTA_SEM_O_DESTROIER))
        .toThrow(new ErroDeRegra('O posicionamento gerado precisa ter a frota completa'));
    });

    test('um posicionamento vazio é proibido por não ter a frota completa', () => {
      expect(() => new Partida(() => []))
        .toThrow(new ErroDeRegra('O posicionamento gerado precisa ter a frota completa'));
    });

    test('um posicionamento com navios sobrepostos é proibido', () => {
      expect(() => new Partida(() => FROTA_COM_SUBMARINO_SOBRE_O_PORTA_AVIOES))
        .toThrow(new ErroDeRegra('O Submarino ficaria sobre outro navio'));
    });

    test('um posicionamento com navio repetido é proibido', () => {
      const frotaComDestroierRepetido = [
        ...FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS,
        { tipo: TIPO_DE_NAVIO.DESTROIER, origem: { linha: 9, coluna: 0 }, orientacao: ORIENTACAO.HORIZONTAL },
      ];

      expect(() => new Partida(() => frotaComDestroierRepetido))
        .toThrow(new ErroDeRegra('O Destroier ou Hidroavião já foi posicionado'));
    });

    test('o segundo posicionamento também é validado', () => {
      const gerarPosicionamento = jest.fn()
        .mockReturnValueOnce(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS)
        .mockReturnValueOnce(FROTA_SEM_O_DESTROIER);

      expect(() => new Partida(gerarPosicionamento))
        .toThrow(new ErroDeRegra('O posicionamento gerado precisa ter a frota completa'));
    });

    test('alterar o posicionamento devolvido depois de criar a partida não move os navios', () => {
      const posicionamento = [
        { tipo: TIPO_DE_NAVIO.PORTA_AVIOES, origem: { linha: 0, coluna: 0 }, orientacao: ORIENTACAO.HORIZONTAL },
        ...FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS.slice(1),
      ];
      const partida = new Partida(() => posicionamento);

      posicionamento[0].origem.linha = 9;
      posicionamento.pop();

      expect(partida.consultarNaviosDe(PRIMEIRO)).toHaveLength(4);
      expect(partida.consultarNaviosDe(PRIMEIRO)[0].casas[0]).toEqual({ linha: 0, coluna: 0 });
    });
  });

  describe('turnos', () => {
    test.each([
      ['água', { linha: 9, coluna: 9 }, RESULTADO_DO_TIRO.AGUA],
      ['acerto', { linha: 0, coluna: 0 }, RESULTADO_DO_TIRO.ACERTO],
    ])('depois de um tiro que dá %s, a vez passa para o adversário', (_descricao, alvo, resultadoEsperado) => {
      const partida = criarPartidaComAFrotaDeitada();

      expect(partida.atirar(PRIMEIRO, alvo).resultado).toBe(resultadoEsperado);
      expect(partida.jogadorDaVez).toBe(SEGUNDO);
    });

    test('depois de afundar um navio sem encerrar a partida, a vez também passa', () => {
      const partida = criarPartidaComAFrotaDeitada();
      partida.atirar(PRIMEIRO, { linha: 3, coluna: 0 });
      partida.atirar(SEGUNDO, { linha: 9, coluna: 9 });

      expect(partida.atirar(PRIMEIRO, { linha: 3, coluna: 1 }))
        .toEqual({ resultado: RESULTADO_DO_TIRO.AFUNDOU, navioAfundado: TIPO_DE_NAVIO.DESTROIER });
      expect(partida.jogadorDaVez).toBe(SEGUNDO);
    });

    test('a vez volta para o primeiro jogador depois do tiro do segundo', () => {
      const partida = criarPartidaComAFrotaDeitada();
      partida.atirar(PRIMEIRO, { linha: 9, coluna: 9 });
      partida.atirar(SEGUNDO, { linha: 9, coluna: 9 });

      expect(partida.jogadorDaVez).toBe(PRIMEIRO);
    });

    test.each([
      ['o segundo jogador atirar logo no início', [], SEGUNDO],
      ['o primeiro jogador atirar duas vezes seguidas', [[PRIMEIRO, { linha: 9, coluna: 9 }]], PRIMEIRO],
    ])('%s é proibido e não muda nada', (_descricao, tirosAnteriores, jogadorForaDaVez) => {
      const partida = criarPartidaComAFrotaDeitada();
      tirosAnteriores.forEach(([jogador, alvo]) => partida.atirar(jogador, alvo));
      const antes = fotografar(partida);

      expect(() => partida.atirar(jogadorForaDaVez, { linha: 0, coluna: 0 }))
        .toThrow(new ErroDeRegra('Não é a vez deste jogador'));
      expect(fotografar(partida)).toEqual(antes);
    });

    test('atirar de novo na mesma casa do adversário é proibido e a vez não passa', () => {
      const partida = criarPartidaComAFrotaDeitada();
      partida.atirar(PRIMEIRO, { linha: 0, coluna: 0 });
      partida.atirar(SEGUNDO, { linha: 9, coluna: 9 });
      const antes = fotografar(partida);

      expect(() => partida.atirar(PRIMEIRO, { linha: 0, coluna: 0 }))
        .toThrow(new ErroDeRegra('Essa casa já recebeu um tiro'));
      expect(fotografar(partida)).toEqual(antes);
      expect(partida.jogadorDaVez).toBe(PRIMEIRO);
    });

    test('a mesma casa pode ser alvejada uma vez em cada tabuleiro', () => {
      const partida = criarPartidaComAFrotaDeitada();
      partida.atirar(PRIMEIRO, { linha: 5, coluna: 5 });

      expect(() => partida.atirar(SEGUNDO, { linha: 5, coluna: 5 })).not.toThrow();
    });
  });

  describe('argumentos inválidos', () => {
    test.each([
      ['TERCEIRO'],
      ['primeiro'],
      [undefined],
    ])('o jogador %p não existe e é RangeError', (jogador) => {
      const partida = criarPartidaComAFrotaDeitada();

      expect(() => partida.atirar(jogador, { linha: 0, coluna: 0 }))
        .toThrow(new RangeError(`Jogador desconhecido: ${String(jogador)}`));
      expect(() => partida.consultarVisaoDoAdversario(jogador)).toThrow(RangeError);
      expect(() => partida.consultarNaviosDe(jogador)).toThrow(RangeError);
    });

    test.each([
      [{ linha: 10, coluna: 0 }, new RangeError('A linha e a coluna precisam estar entre 0 e 9')],
      [{ linha: 0, coluna: 2.5 }, new TypeError('A linha e a coluna precisam ser números inteiros')],
      ['A1', new TypeError('A coordenada precisa ser um objeto { linha, coluna }')],
    ])('o tiro em %p é erro de argumento e não muda nada', (coordenada, erroEsperado) => {
      const partida = criarPartidaComAFrotaDeitada();
      const antes = fotografar(partida);

      expect(() => partida.atirar(PRIMEIRO, coordenada)).toThrow(erroEsperado);
      expect(fotografar(partida)).toEqual(antes);
    });

    test('a coordenada inválida é recusada antes da regra de vez', () => {
      const partida = criarPartidaComAFrotaDeitada();

      expect(() => partida.atirar(SEGUNDO, { linha: -1, coluna: 0 }))
        .toThrow(new RangeError('A linha e a coluna precisam estar entre 0 e 9'));
    });
  });

  describe('visão do adversário', () => {
    test('cada jogador vê os próprios tiros no tabuleiro do adversário', () => {
      const partida = criarPartidaComAFrotaDeitada();
      partida.atirar(PRIMEIRO, { linha: 0, coluna: 0 });
      partida.atirar(SEGUNDO, { linha: 9, coluna: 9 });

      expect(partida.consultarVisaoDoAdversario(PRIMEIRO)[0][0]).toBe(ESTADO_DA_CASA.ACERTO);
      expect(partida.consultarVisaoDoAdversario(PRIMEIRO)[9][9]).toBe(ESTADO_DA_CASA.DESCONHECIDA);
      expect(partida.consultarVisaoDoAdversario(SEGUNDO)[9][9]).toBe(ESTADO_DA_CASA.AGUA);
      expect(partida.consultarVisaoDoAdversario(SEGUNDO)[0][0]).toBe(ESTADO_DA_CASA.DESCONHECIDA);
    });

    test('os navios do adversário que não levaram tiro nunca aparecem', () => {
      const partida = criarPartidaComAFrotaDeitada();

      const estadosVisiveis = new Set(partida.consultarVisaoDoAdversario(PRIMEIRO).flat());

      expect([...estadosVisiveis]).toEqual([ESTADO_DA_CASA.DESCONHECIDA]);
    });

    test('o tiro aparece nos navios de quem foi atingido', () => {
      const partida = criarPartidaComAFrotaDeitada();
      partida.atirar(PRIMEIRO, { linha: 3, coluna: 0 });
      partida.atirar(SEGUNDO, { linha: 9, coluna: 9 });
      partida.atirar(PRIMEIRO, { linha: 3, coluna: 1 });

      expect(partida.consultarNaviosDe(SEGUNDO)[3].afundado).toBe(true);
      expect(partida.consultarNaviosDe(PRIMEIRO)[3].afundado).toBe(false);
    });
  });

  describe('fim de jogo', () => {
    test('o primeiro jogador vence ao afundar o último navio do segundo', () => {
      const partida = criarPartidaComAFrotaDeitada();

      jogarAlternando(partida, TIROS_QUE_AFUNDAM_TUDO, TIROS_NA_AGUA);

      expect(partida.estado).toBe(ESTADO_DA_PARTIDA.ENCERRADA);
      expect(partida.vencedor).toBe(PRIMEIRO);
      expect(partida.jogadorDaVez).toBeNull();
    });

    test('o segundo jogador vence ao afundar o último navio do primeiro', () => {
      const partida = criarPartidaComAFrotaDeitada();

      jogarAlternando(partida, TIROS_NA_AGUA, TIROS_QUE_AFUNDAM_TUDO);

      expect(partida.vencedor).toBe(SEGUNDO);
    });

    test('o último tiro devolve o navio afundado e encerra a partida sem dar a vez ao adversário', () => {
      const partida = criarPartidaComAFrotaDeitada();
      const tirosAteOPenultimo = TIROS_QUE_AFUNDAM_TUDO.slice(0, -1);
      tirosAteOPenultimo.forEach((alvo, indice) => {
        partida.atirar(PRIMEIRO, alvo);
        partida.atirar(SEGUNDO, TIROS_NA_AGUA[indice]);
      });
      expect(partida.estado).toBe(ESTADO_DA_PARTIDA.EM_ANDAMENTO);

      expect(partida.atirar(PRIMEIRO, TIROS_QUE_AFUNDAM_TUDO.at(-1)))
        .toEqual({ resultado: RESULTADO_DO_TIRO.AFUNDOU, navioAfundado: TIPO_DE_NAVIO.DESTROIER });
      expect(partida.vencedor).toBe(PRIMEIRO);
      expect(partida.jogadorDaVez).toBeNull();
    });

    test.each([
      ['o vencedor', PRIMEIRO],
      ['o perdedor', SEGUNDO],
    ])('depois do fim, %s não pode mais atirar e nada muda', (_descricao, jogador) => {
      const partida = criarPartidaComAFrotaDeitada();
      jogarAlternando(partida, TIROS_QUE_AFUNDAM_TUDO, TIROS_NA_AGUA);
      const antes = fotografar(partida);

      expect(() => partida.atirar(jogador, { linha: 7, coluna: 7 }))
        .toThrow(new ErroDeRegra('A partida já terminou'));
      expect(fotografar(partida)).toEqual(antes);
    });

    test('mesmo encerrada, a partida ainda permite consultar as visões e os navios', () => {
      const partida = criarPartidaComAFrotaDeitada();
      jogarAlternando(partida, TIROS_QUE_AFUNDAM_TUDO, TIROS_NA_AGUA);

      expect(partida.consultarNaviosDe(SEGUNDO).every((navio) => navio.afundado)).toBe(true);
      expect(partida.consultarVisaoDoAdversario(PRIMEIRO)[0][0]).toBe(ESTADO_DA_CASA.AFUNDADO);
    });
  });

  describe('encapsulamento', () => {
    test('o estado interno não aparece como propriedade pública', () => {
      expect(Object.keys(criarPartidaComAFrotaDeitada())).toEqual([]);
    });

    test('alterar os navios ou a visão devolvidos não altera a partida', () => {
      const partida = criarPartidaComAFrotaDeitada();

      partida.consultarNaviosDe(PRIMEIRO).pop();
      partida.consultarVisaoDoAdversario(PRIMEIRO)[0][0] = ESTADO_DA_CASA.AFUNDADO;

      expect(partida.consultarNaviosDe(PRIMEIRO)).toHaveLength(4);
      expect(partida.consultarVisaoDoAdversario(PRIMEIRO)[0][0]).toBe(ESTADO_DA_CASA.DESCONHECIDA);
    });

    test('atribuir estado, vez ou vencedor de fora não altera a partida', () => {
      const partida = criarPartidaComAFrotaDeitada();
      const antes = fotografar(partida);

      partida.vencedor = SEGUNDO;
      partida.jogadorDaVez = SEGUNDO;
      partida.estado = ESTADO_DA_PARTIDA.ENCERRADA;

      expect(fotografar(partida)).toEqual(antes);
    });
  });
});
