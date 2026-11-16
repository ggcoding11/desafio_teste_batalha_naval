const { TIPO_DE_NAVIO, ORIENTACAO } = require('../../src/constantes');
const { Tabuleiro } = require('../../src/tabuleiro');

function criarTabuleiroComFrota(frota) {
  const tabuleiro = new Tabuleiro();
  frota.forEach(({ tipo, origem, orientacao }) => tabuleiro.posicionarNavio(tipo, origem, orientacao));
  return tabuleiro;
}

function navioDaFrota(tipo, linha, coluna, orientacao) {
  return Object.freeze({ tipo, origem: Object.freeze({ linha, coluna }), orientacao });
}

function casasDaLinha(linha, colunaInicial, colunaFinal) {
  return Array.from({ length: colunaFinal - colunaInicial + 1 }, (_casa, indice) =>
    Object.freeze({ linha, coluna: colunaInicial + indice }));
}

const FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS = Object.freeze([
  navioDaFrota(TIPO_DE_NAVIO.PORTA_AVIOES, 0, 0, ORIENTACAO.HORIZONTAL),
  navioDaFrota(TIPO_DE_NAVIO.ENCOURACADO, 1, 0, ORIENTACAO.HORIZONTAL),
  navioDaFrota(TIPO_DE_NAVIO.SUBMARINO, 2, 0, ORIENTACAO.HORIZONTAL),
  navioDaFrota(TIPO_DE_NAVIO.DESTROIER, 3, 0, ORIENTACAO.HORIZONTAL),
]);

const FROTA_EM_PE_ENCOSTADA_NAS_BORDAS_DE_BAIXO_E_DA_DIREITA = Object.freeze([
  navioDaFrota(TIPO_DE_NAVIO.PORTA_AVIOES, 5, 9, ORIENTACAO.VERTICAL),
  navioDaFrota(TIPO_DE_NAVIO.ENCOURACADO, 6, 8, ORIENTACAO.VERTICAL),
  navioDaFrota(TIPO_DE_NAVIO.SUBMARINO, 7, 7, ORIENTACAO.VERTICAL),
  navioDaFrota(TIPO_DE_NAVIO.DESTROIER, 8, 6, ORIENTACAO.VERTICAL),
]);

const FROTA_SEM_O_DESTROIER = Object.freeze(FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS.slice(0, 3));

const TIROS_QUE_AFUNDAM_A_FROTA_DEITADA_NA_ORDEM_PORTA_AVIOES_ENCOURACADO_SUBMARINO_DESTROIER = Object.freeze([
  ...casasDaLinha(0, 0, 4),
  ...casasDaLinha(1, 0, 3),
  ...casasDaLinha(2, 0, 2),
  ...casasDaLinha(3, 0, 1),
]);

const TIROS_QUE_SO_ACERTAM_AGUA_NA_FROTA_DEITADA = Object.freeze([
  ...casasDaLinha(9, 0, 9),
  ...casasDaLinha(8, 0, 9),
]);

module.exports = {
  criarTabuleiroComFrota,
  FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS,
  FROTA_EM_PE_ENCOSTADA_NAS_BORDAS_DE_BAIXO_E_DA_DIREITA,
  FROTA_SEM_O_DESTROIER,
  TIROS_QUE_AFUNDAM_A_FROTA_DEITADA_NA_ORDEM_PORTA_AVIOES_ENCOURACADO_SUBMARINO_DESTROIER,
  TIROS_QUE_SO_ACERTAM_AGUA_NA_FROTA_DEITADA,
};
