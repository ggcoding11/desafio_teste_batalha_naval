const { ESPECIFICACAO_DOS_NAVIOS } = require('./constantes');
const {
  validarCoordenada,
  validarOrientacao,
  saoCoordenadasIguais,
  calcularCasasDoNavio,
} = require('./coordenada');

function validarTipoDeNavio(tipo) {
  if (!Object.hasOwn(ESPECIFICACAO_DOS_NAVIOS, tipo)) {
    throw new RangeError(`Tipo de navio desconhecido: ${String(tipo)}`);
  }
}

class Navio {
  #tipo;
  #casas;
  #casasAtingidas;

  constructor(tipo, origem, orientacao) {
    validarTipoDeNavio(tipo);
    const origemValidada = validarCoordenada(origem);
    validarOrientacao(orientacao);

    this.#tipo = tipo;
    this.#casas = calcularCasasDoNavio(origemValidada, orientacao, this.tamanho);
    this.#casasAtingidas = this.#casas.map(() => false);
  }

  get tipo() {
    return this.#tipo;
  }

  get nome() {
    return ESPECIFICACAO_DOS_NAVIOS[this.#tipo].nome;
  }

  get tamanho() {
    return ESPECIFICACAO_DOS_NAVIOS[this.#tipo].tamanho;
  }

  get casas() {
    return this.#casas.map((casa) => ({ ...casa }));
  }

  get afundado() {
    return this.#casasAtingidas.every((atingida) => atingida);
  }

  ocupa(coordenada) {
    return this.#indiceDaCasa(coordenada) !== -1;
  }

  registrarAcerto(coordenada) {
    const indice = this.#indiceDaCasa(validarCoordenada(coordenada));
    if (indice === -1) {
      throw new RangeError('A coordenada não pertence a este navio');
    }
    this.#casasAtingidas[indice] = true;
  }

  #indiceDaCasa(coordenada) {
    return this.#casas.findIndex((casa) => saoCoordenadasIguais(casa, coordenada));
  }
}

module.exports = { Navio, validarTipoDeNavio };
