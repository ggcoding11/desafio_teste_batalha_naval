const { JOGADOR, ESTADO_DA_PARTIDA } = require('./constantes');
const { validarCoordenada } = require('./coordenada');
const { Tabuleiro } = require('./tabuleiro');
const { ErroDeRegra } = require('./erros');
const { gerarPosicionamentoAleatorio } = require('./posicionamentoAleatorio');

const ADVERSARIO = Object.freeze({
  [JOGADOR.PRIMEIRO]: JOGADOR.SEGUNDO,
  [JOGADOR.SEGUNDO]: JOGADOR.PRIMEIRO,
});

function validarJogador(jogador) {
  if (!Object.values(JOGADOR).includes(jogador)) {
    throw new RangeError(`Jogador desconhecido: ${String(jogador)}`);
  }
}

function validarNavioDoPosicionamento(navio) {
  if (typeof navio !== 'object' || navio === null) {
    throw new TypeError('Cada navio do posicionamento precisa ser um objeto { tipo, origem, orientacao }');
  }
}

function montarTabuleiro(posicionamento) {
  if (!Array.isArray(posicionamento)) {
    throw new TypeError('O posicionamento gerado precisa ser uma lista de navios');
  }
  const tabuleiro = new Tabuleiro();
  for (const navio of posicionamento) {
    validarNavioDoPosicionamento(navio);
    tabuleiro.posicionarNavio(navio.tipo, navio.origem, navio.orientacao);
  }
  if (!tabuleiro.frotaCompleta) {
    throw new ErroDeRegra('O posicionamento gerado precisa ter a frota completa');
  }
  return tabuleiro;
}

class Partida {
  #tabuleiros;
  #jogadorDaVez = JOGADOR.PRIMEIRO;
  #vencedor = null;

  constructor(gerarPosicionamento = gerarPosicionamentoAleatorio) {
    if (typeof gerarPosicionamento !== 'function') {
      throw new TypeError('O gerador de posicionamento precisa ser uma função');
    }
    const tabuleiroDoPrimeiro = montarTabuleiro(gerarPosicionamento());
    const tabuleiroDoSegundo = montarTabuleiro(gerarPosicionamento());

    this.#tabuleiros = Object.freeze({
      [JOGADOR.PRIMEIRO]: tabuleiroDoPrimeiro,
      [JOGADOR.SEGUNDO]: tabuleiroDoSegundo,
    });
  }

  get estado() {
    return this.#vencedor === null ? ESTADO_DA_PARTIDA.EM_ANDAMENTO : ESTADO_DA_PARTIDA.ENCERRADA;
  }

  get jogadorDaVez() {
    return this.estado === ESTADO_DA_PARTIDA.EM_ANDAMENTO ? this.#jogadorDaVez : null;
  }

  get vencedor() {
    return this.#vencedor;
  }

  atirar(jogador, coordenada) {
    validarJogador(jogador);
    const alvo = validarCoordenada(coordenada);
    if (this.estado === ESTADO_DA_PARTIDA.ENCERRADA) {
      throw new ErroDeRegra('A partida já terminou');
    }
    if (jogador !== this.#jogadorDaVez) {
      throw new ErroDeRegra('Não é a vez deste jogador');
    }

    const tabuleiroDoAdversario = this.#tabuleiros[ADVERSARIO[jogador]];
    const resultadoDoTiro = tabuleiroDoAdversario.receberTiro(alvo);
    if (tabuleiroDoAdversario.todosOsNaviosAfundados) {
      this.#vencedor = jogador;
    } else {
      this.#jogadorDaVez = ADVERSARIO[jogador];
    }
    return resultadoDoTiro;
  }

  consultarVisaoDoAdversario(jogador) {
    validarJogador(jogador);
    return this.#tabuleiros[ADVERSARIO[jogador]].consultarVisaoDoAdversario();
  }

  consultarNaviosDe(jogador) {
    validarJogador(jogador);
    return this.#tabuleiros[jogador].consultarNavios();
  }
}

module.exports = { Partida };
