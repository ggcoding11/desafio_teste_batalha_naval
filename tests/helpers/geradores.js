const MAIOR_VALOR_ABAIXO_DE_UM = 1 - Number.EPSILON;

const GERADOR_QUE_SEMPRE_ESCOLHE_A_PRIMEIRA_POSICAO_VALIDA = () => 0;

const GERADOR_QUE_SEMPRE_ESCOLHE_A_ULTIMA_POSICAO_VALIDA = () => MAIOR_VALOR_ABAIXO_DE_UM;

function criarGeradorQueRepeteASequencia(sequencia) {
  let proximoIndice = 0;
  return () => {
    const numero = sequencia[proximoIndice % sequencia.length];
    proximoIndice += 1;
    return numero;
  };
}

const SEQUENCIA_QUALQUER_DE_SORTEIOS = Object.freeze([0.42, 0.07, 0.93, 0.5]);

const GERADOR_QUE_DEVOLVE_UM = () => 1;
const GERADOR_QUE_DEVOLVE_NEGATIVO = () => -0.1;
const GERADOR_QUE_DEVOLVE_NAN = () => NaN;
const GERADOR_QUE_DEVOLVE_TEXTO = () => '0.5';

module.exports = {
  GERADOR_QUE_SEMPRE_ESCOLHE_A_PRIMEIRA_POSICAO_VALIDA,
  GERADOR_QUE_SEMPRE_ESCOLHE_A_ULTIMA_POSICAO_VALIDA,
  criarGeradorQueRepeteASequencia,
  SEQUENCIA_QUALQUER_DE_SORTEIOS,
  GERADOR_QUE_DEVOLVE_UM,
  GERADOR_QUE_DEVOLVE_NEGATIVO,
  GERADOR_QUE_DEVOLVE_NAN,
  GERADOR_QUE_DEVOLVE_TEXTO,
};
