const { TAMANHO_DO_TABULEIRO, ORIENTACAO } = require('./constantes');

const DESLOCAMENTO_POR_ORIENTACAO = Object.freeze({
  [ORIENTACAO.HORIZONTAL]: Object.freeze({ linha: 0, coluna: 1 }),
  [ORIENTACAO.VERTICAL]: Object.freeze({ linha: 1, coluna: 0 }),
});

function estaDentroDoTabuleiro({ linha, coluna }) {
  return linha >= 0 && linha < TAMANHO_DO_TABULEIRO && coluna >= 0 && coluna < TAMANHO_DO_TABULEIRO;
}

function validarCoordenada(coordenada) {
  if (typeof coordenada !== 'object' || coordenada === null) {
    throw new TypeError('A coordenada precisa ser um objeto { linha, coluna }');
  }
  const { linha, coluna } = coordenada;
  if (!Number.isInteger(linha) || !Number.isInteger(coluna)) {
    throw new TypeError('A linha e a coluna precisam ser números inteiros');
  }
  if (!estaDentroDoTabuleiro({ linha, coluna })) {
    throw new RangeError(`A linha e a coluna precisam estar entre 0 e ${TAMANHO_DO_TABULEIRO - 1}`);
  }
  return { linha, coluna };
}

function validarOrientacao(orientacao) {
  if (!Object.values(ORIENTACAO).includes(orientacao)) {
    throw new RangeError(`Orientação desconhecida: ${String(orientacao)}`);
  }
}

function saoCoordenadasIguais(primeira, segunda) {
  return primeira.linha === segunda.linha && primeira.coluna === segunda.coluna;
}

function calcularCasasDoNavio(origem, orientacao, tamanho) {
  const deslocamento = DESLOCAMENTO_POR_ORIENTACAO[orientacao];
  return Array.from({ length: tamanho }, (_casa, indice) => ({
    linha: origem.linha + deslocamento.linha * indice,
    coluna: origem.coluna + deslocamento.coluna * indice,
  }));
}

module.exports = {
  estaDentroDoTabuleiro,
  validarCoordenada,
  validarOrientacao,
  saoCoordenadasIguais,
  calcularCasasDoNavio,
};
