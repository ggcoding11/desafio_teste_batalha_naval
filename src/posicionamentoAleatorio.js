const { TAMANHO_DO_TABULEIRO, ESPECIFICACAO_DOS_NAVIOS, ORIENTACAO } = require('./constantes');
const { Tabuleiro } = require('./tabuleiro');

const TIPOS_DO_MAIOR_PARA_O_MENOR = Object.freeze(
  Object.keys(ESPECIFICACAO_DOS_NAVIOS)
    .sort((primeiro, segundo) => ESPECIFICACAO_DOS_NAVIOS[segundo].tamanho - ESPECIFICACAO_DOS_NAVIOS[primeiro].tamanho),
);

function listarPosicoesValidas(tabuleiro, tipo) {
  const posicoesValidas = [];
  for (const orientacao of Object.values(ORIENTACAO)) {
    for (let linha = 0; linha < TAMANHO_DO_TABULEIRO; linha += 1) {
      for (let coluna = 0; coluna < TAMANHO_DO_TABULEIRO; coluna += 1) {
        const origem = { linha, coluna };
        if (tabuleiro.podePosicionarNavio(tipo, origem, orientacao)) {
          posicoesValidas.push({ origem, orientacao });
        }
      }
    }
  }
  return posicoesValidas;
}

function sortearIndice(quantidadeDeOpcoes, gerarNumeroAleatorio) {
  const numeroSorteado = gerarNumeroAleatorio();
  if (typeof numeroSorteado !== 'number') {
    throw new TypeError('O gerador de números aleatórios precisa devolver um número');
  }
  if (!(numeroSorteado >= 0 && numeroSorteado < 1)) {
    throw new RangeError('O gerador de números aleatórios precisa devolver um valor no intervalo [0, 1)');
  }
  return Math.floor(numeroSorteado * quantidadeDeOpcoes);
}

function gerarPosicionamentoAleatorio(gerarNumeroAleatorio = Math.random) {
  if (typeof gerarNumeroAleatorio !== 'function') {
    throw new TypeError('O gerador de números aleatórios precisa ser uma função');
  }

  const tabuleiro = new Tabuleiro();
  const posicionamento = [];
  for (const tipo of TIPOS_DO_MAIOR_PARA_O_MENOR) {
    const posicoesValidas = listarPosicoesValidas(tabuleiro, tipo);
    const { origem, orientacao } = posicoesValidas[sortearIndice(posicoesValidas.length, gerarNumeroAleatorio)];
    tabuleiro.posicionarNavio(tipo, origem, orientacao);
    posicionamento.push({ tipo, origem, orientacao });
  }
  return posicionamento;
}

module.exports = { gerarPosicionamentoAleatorio };
