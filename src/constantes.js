const TAMANHO_DO_TABULEIRO = 10;

const TIPO_DE_NAVIO = Object.freeze({
  PORTA_AVIOES: 'PORTA_AVIOES',
  ENCOURACADO: 'ENCOURACADO',
  SUBMARINO: 'SUBMARINO',
  DESTROIER: 'DESTROIER',
});

const ESPECIFICACAO_DOS_NAVIOS = Object.freeze({
  [TIPO_DE_NAVIO.PORTA_AVIOES]: Object.freeze({ nome: 'Porta-aviões', tamanho: 5 }),
  [TIPO_DE_NAVIO.ENCOURACADO]: Object.freeze({ nome: 'Encouraçado', tamanho: 4 }),
  [TIPO_DE_NAVIO.SUBMARINO]: Object.freeze({ nome: 'Submarino', tamanho: 3 }),
  [TIPO_DE_NAVIO.DESTROIER]: Object.freeze({ nome: 'Destroier ou Hidroavião', tamanho: 2 }),
});

const ORIENTACAO = Object.freeze({
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL',
});

const RESULTADO_DO_TIRO = Object.freeze({
  AGUA: 'AGUA',
  ACERTO: 'ACERTO',
  AFUNDOU: 'AFUNDOU',
});

const ESTADO_DA_CASA = Object.freeze({
  DESCONHECIDA: 'DESCONHECIDA',
  AGUA: 'AGUA',
  ACERTO: 'ACERTO',
  AFUNDADO: 'AFUNDADO',
});

const JOGADOR = Object.freeze({
  PRIMEIRO: 'PRIMEIRO',
  SEGUNDO: 'SEGUNDO',
});

const ESTADO_DA_PARTIDA = Object.freeze({
  EM_ANDAMENTO: 'EM_ANDAMENTO',
  ENCERRADA: 'ENCERRADA',
});

module.exports = {
  TAMANHO_DO_TABULEIRO,
  TIPO_DE_NAVIO,
  ESPECIFICACAO_DOS_NAVIOS,
  ORIENTACAO,
  RESULTADO_DO_TIRO,
  ESTADO_DA_CASA,
  JOGADOR,
  ESTADO_DA_PARTIDA,
};
