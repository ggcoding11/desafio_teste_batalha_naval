const {
  TAMANHO_DO_TABULEIRO,
  ESPECIFICACAO_DOS_NAVIOS,
  RESULTADO_DO_TIRO,
  ESTADO_DA_CASA,
} = require('./constantes');
const { estaDentroDoTabuleiro, validarCoordenada } = require('./coordenada');
const { Navio } = require('./navio');
const { ErroDeRegra } = require('./erros');

const QUANTIDADE_DE_NAVIOS_NA_FROTA = Object.keys(ESPECIFICACAO_DOS_NAVIOS).length;

function criarMatrizDoTabuleiro(calcularValorDaCasa) {
  return Array.from({ length: TAMANHO_DO_TABULEIRO }, (_linha, linha) =>
    Array.from({ length: TAMANHO_DO_TABULEIRO }, (_coluna, coluna) => calcularValorDaCasa({ linha, coluna })));
}

class Tabuleiro {
  #navios = [];
  #casasAtingidas = criarMatrizDoTabuleiro(() => false);

  get frotaCompleta() {
    return this.#navios.length === QUANTIDADE_DE_NAVIOS_NA_FROTA;
  }

  get todosOsNaviosAfundados() {
    return this.frotaCompleta && this.#navios.every((navio) => navio.afundado);
  }

  podePosicionarNavio(tipo, origem, orientacao) {
    const navio = new Navio(tipo, origem, orientacao);
    return this.#encontrarViolacaoDePosicionamento(navio) === null;
  }

  posicionarNavio(tipo, origem, orientacao) {
    const navio = new Navio(tipo, origem, orientacao);
    const violacao = this.#encontrarViolacaoDePosicionamento(navio);
    if (violacao !== null) {
      throw new ErroDeRegra(violacao);
    }
    this.#navios.push(navio);
  }

  receberTiro(coordenada) {
    const alvo = validarCoordenada(coordenada);
    if (!this.frotaCompleta) {
      throw new ErroDeRegra('A frota precisa estar completa antes do primeiro tiro');
    }
    if (this.#casaJaAtingida(alvo)) {
      throw new ErroDeRegra('Essa casa já recebeu um tiro');
    }

    this.#casasAtingidas[alvo.linha][alvo.coluna] = true;
    const navioAtingido = this.#navioEm(alvo);
    if (navioAtingido === undefined) {
      return { resultado: RESULTADO_DO_TIRO.AGUA, navioAfundado: null };
    }
    navioAtingido.registrarAcerto(alvo);
    if (navioAtingido.afundado) {
      return { resultado: RESULTADO_DO_TIRO.AFUNDOU, navioAfundado: navioAtingido.tipo };
    }
    return { resultado: RESULTADO_DO_TIRO.ACERTO, navioAfundado: null };
  }

  consultarNavios() {
    return this.#navios.map((navio) => ({
      tipo: navio.tipo,
      casas: navio.casas,
      afundado: navio.afundado,
    }));
  }

  consultarVisaoDoAdversario() {
    return criarMatrizDoTabuleiro((coordenada) => this.#estadoVisivelDaCasa(coordenada));
  }

  #encontrarViolacaoDePosicionamento(navio) {
    if (this.#navios.some((posicionado) => posicionado.tipo === navio.tipo)) {
      return `O ${navio.nome} já foi posicionado`;
    }
    if (!navio.casas.every(estaDentroDoTabuleiro)) {
      return `O ${navio.nome} não cabe no tabuleiro nessa posição`;
    }
    if (navio.casas.some((casa) => this.#navioEm(casa) !== undefined)) {
      return `O ${navio.nome} ficaria sobre outro navio`;
    }
    return null;
  }

  #navioEm(coordenada) {
    return this.#navios.find((navio) => navio.ocupa(coordenada));
  }

  #casaJaAtingida({ linha, coluna }) {
    return this.#casasAtingidas[linha][coluna];
  }

  #estadoVisivelDaCasa(coordenada) {
    if (!this.#casaJaAtingida(coordenada)) {
      return ESTADO_DA_CASA.DESCONHECIDA;
    }
    const navio = this.#navioEm(coordenada);
    if (navio === undefined) {
      return ESTADO_DA_CASA.AGUA;
    }
    return navio.afundado ? ESTADO_DA_CASA.AFUNDADO : ESTADO_DA_CASA.ACERTO;
  }
}

module.exports = { Tabuleiro };
