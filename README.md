# desafio_teste_batalha_naval

Lógica do jogo **Batalha Naval** em JavaScript (Node.js, CommonJS), acompanhada de casos de teste automatizados com **Jest**.

## Colaborador

- Gustavo de Almeida Gomes

## Especificação do desafio

Enunciado do professor, com especificação de **Cayque**:

> **Batalha Naval (by Cayque)**
>
> - casos de teste para testar tabuleiro 10 x 10;
> - 1 Porta-aviões (ocupa 5 casas)
> - 1 Encouraçado (ocupa 4 casas)
> - 1 Submarino (ocupa 3 casas)
> - 1 Destroier ou Hidroavião (ocupa 2 casas)
> - casos de teste em Javascript para testar Javascript;

O projeto implementa **apenas a lógica do jogo**, sem interface: não tem tela nem linha de comando.

## Regras implementadas

As regras marcadas como **decisão adotada** não estão no enunciado. Elas foram escolhidas para tornar o jogo completo e testável.

### Tabuleiro e coordenadas

- O tabuleiro tem 10 × 10 casas.
- **Decisão adotada:** a coordenada é um objeto `{ linha, coluna }` com inteiros de 0 a 9. Não há notação do tipo "A5", porque não há interface.
- Coordenada que não é objeto, ou cuja linha ou coluna não é inteira → `TypeError`.
- Linha ou coluna fora de 0 a 9 → `RangeError`.

### Frota

| Navio | Casas |
|---|---|
| Porta-aviões | 5 |
| Encouraçado | 4 |
| Submarino | 3 |
| Destroier ou Hidroavião | 2 |

- A frota tem os 4 navios, um de cada tipo, num total de 14 casas.
- **Decisão adotada:** "Destroier ou Hidroavião" é **um único navio de 2 casas**, e os dois nomes são tratados como sinônimos. O hidroavião em formato de T da versão clássica não foi implementado, porque o enunciado diz que o navio ocupa 2 casas.

### Posicionamento

- **Decisão adotada:** o navio fica só na horizontal (cresce para a direita a partir da origem) ou na vertical (cresce para baixo). A diagonal não existe e gera `RangeError`.
- Um tipo de navio desconhecido gera `RangeError`.
- Um navio que sai do tabuleiro é proibido (`ErroDeRegra`).
- Um navio sobre outro é proibido (`ErroDeRegra`).
- **Decisão adotada:** navios encostados lado a lado são **permitidos**. Só a sobreposição é proibida.
- **Decisão adotada:** cada tipo só pode ser posicionado uma vez. Com a frota completa, qualquer novo navio é recusado como repetido. Um navio posicionado não pode ser movido nem removido.
- As regras são conferidas nesta ordem: tipo repetido, navio fora do tabuleiro, sobreposição.

### Posicionamento aleatório

- **Decisão adotada:** os navios são sorteados do maior para o menor. Para cada um, são listadas **todas** as posições válidas (primeiro as horizontais, depois as verticais, linha por linha) e o gerador escolhe uma pelo índice `floor(número × quantidade)`. O resultado é sempre válido e o algoritmo não tem laço de "tentar de novo", que poderia travar com um gerador fixo.
- O gerador é chamado uma vez por navio, quatro vezes no total.
- Um gerador que não é função, ou que devolve algo que não é número → `TypeError`. Um valor fora de `[0, 1)`, incluindo `NaN` → `RangeError`.

### Tiros

- O resultado é `AGUA`, `ACERTO` ou `AFUNDOU`. **Decisão adotada:** quando o resultado é `AFUNDOU`, ele também informa qual navio afundou.
- Atirar antes de a frota estar completa é proibido (`ErroDeRegra`).
- **Decisão adotada:** atirar de novo numa casa que já recebeu tiro é proibido (`ErroDeRegra`). Nada muda e a vez não passa.
- **Decisão adotada:** o adversário vê cada casa como `DESCONHECIDA`, `AGUA`, `ACERTO` ou `AFUNDADO`. Navios que ainda não levaram tiro nunca aparecem. Quando um navio afunda, todas as suas casas passam de `ACERTO` para `AFUNDADO`.

### Partida

- **Decisão adotada:** a partida tem dois jogadores (`PRIMEIRO` e `SEGUNDO`), cada um com o próprio tabuleiro. O primeiro jogador começa.
- **Decisão adotada:** a vez **alterna a cada tiro**, inclusive depois de acerto ou de afundar um navio. A variante "acertou, joga de novo" não foi implementada.
- Atirar fora da vez é proibido (`ErroDeRegra`). Um jogador desconhecido gera `RangeError`.
- Vence quem afundar o último navio do adversário. **Decisão adotada:** a partida termina nesse mesmo tiro, então **não existe empate**.
- **Decisão adotada:** depois do fim, nenhum tiro é aceito, nem do vencedor nem do perdedor (`ErroDeRegra`). As consultas continuam disponíveis. Com a partida encerrada, `jogadorDaVez` passa a ser `null`.
- O posicionamento de cada jogador vem de uma função injetada, que é chamada duas vezes, sem argumentos, na criação da partida. O que ela devolve é validado e copiado para o tabuleiro interno da partida.
- **Decisão adotada:** quem bloqueia ações depois do fim é a partida. O tabuleiro, sozinho, não conhece o conceito de fim de jogo.

### Ordem das validações

Primeiro os argumentos (`TypeError`/`RangeError`), depois as regras (`ErroDeRegra`) e só então a mutação. Uma ação recusada nunca deixa o estado pela metade.

## Estrutura de pastas

```
src/
  constantes.js               tamanho do tabuleiro, frota e valores enumerados congelados
  erros.js                    ErroDeRegra
  coordenada.js               validação de coordenada e orientação, cálculo das casas de um navio
  navio.js                    navio com tipo, casas, acertos e afundamento
  tabuleiro.js                posicionamento, tiros, visão do adversário e estado da frota
  posicionamentoAleatorio.js  sorteio da frota com gerador de números injetável
  partida.js                  dois jogadores, turnos, vitória e fim de jogo
tests/
  constantes.test.js
  erros.test.js
  coordenada.test.js
  navio.test.js
  tabuleiro.test.js
  posicionamentoAleatorio.test.js
  partida.test.js
  helpers/
    frotas.js                 frotas e sequências de tiros montadas à mão, e criarTabuleiroComFrota
    geradores.js              geradores de números previsíveis e inválidos
```

## Como rodar

```bash
npm install
npm test
npm run test:coverage
```

Versões usadas: Node.js 26.1.0, npm 11.13.0 e Jest 30.5.2.

Resultado atual: **7 suítes, 224 testes, todos passando**, com **100%** de cobertura de instruções, branches, funções e linhas em `src/`.

## Como funcionam os casos de teste

### Determinismo

Nenhum teste depende de sorte. A aleatoriedade é sempre injetada: `gerarPosicionamentoAleatorio(gerarNumeroAleatorio = Math.random)` e `new Partida(gerarPosicionamento = gerarPosicionamentoAleatorio)`. Os cenários ficam em `tests/helpers/`, são congelados com `Object.freeze` e têm nomes que dizem o resultado esperado.

| Cenário | Configuração | Para que serve |
|---|---|---|
| `FROTA_DEITADA_NAS_QUATRO_PRIMEIRAS_LINHAS` | os quatro navios na horizontal, da linha 0 à 3, a partir da coluna 0 | frota padrão dos testes; prova que navios encostados são permitidos |
| `FROTA_EM_PE_ENCOSTADA_NAS_BORDAS_DE_BAIXO_E_DA_DIREITA` | os quatro navios na vertical, terminando na linha 9 | prova que um navio que termina exatamente na borda cabe; é também o resultado esperado do gerador "última opção" |
| `FROTA_SEM_O_DESTROIER` | só três navios | frota incompleta: proíbe tiros e é recusada pela partida |
| `FROTA_COM_SUBMARINO_SOBRE_O_PORTA_AVIOES` | submarino vertical cruzando o porta-aviões | posicionamento injetado inválido |
| `TIROS_QUE_AFUNDAM_A_FROTA_DEITADA_NA_ORDEM_...` | as 14 casas da frota deitada, navio por navio | sequência de vitória; testa a ordem dos afundamentos |
| `TIROS_QUE_SO_ACERTAM_AGUA_NA_FROTA_DEITADA` | 20 casas das linhas 8 e 9 | jogador que nunca acerta |
| `GERADOR_QUE_SEMPRE_ESCOLHE_A_PRIMEIRA_POSICAO_VALIDA` | devolve `0` | posicionamento exato e conhecido |
| `GERADOR_QUE_SEMPRE_ESCOLHE_A_ULTIMA_POSICAO_VALIDA` | devolve `1 - Number.EPSILON` | borda superior do intervalo `[0, 1)` |
| `criarGeradorQueRepeteASequencia(SEQUENCIA_QUALQUER_DE_SORTEIOS)` | repete `[0.42, 0.07, 0.93, 0.5]` | prova que a mesma sequência reproduz o mesmo resultado |
| `GERADOR_QUE_DEVOLVE_UM`, `_NEGATIVO`, `_NAN`, `_TEXTO` | valores proibidos | validação do retorno da dependência injetada |

Outros recursos usados:
- `jest.fn` prova quantas vezes, quando e com quais argumentos as dependências injetadas são chamadas: 4 sorteios por posicionamento e 2 posicionamentos por partida, só na criação.
- O caminho **sem injeção** (`Math.random`) também é testado, com 25 sorteios. Esses testes verificam só o que as regras garantem: 4 navios, cada tipo uma vez, 14 casas distintas, tudo dentro do tabuleiro.
- `test.each` é usado nas tabelas de regras, como limites, orientações, tipos e argumentos inválidos.
- Depois de toda ação recusada, o teste confere que o estado continua igual. Na partida, isso é feito com uma "fotografia" do estado, da vez, do vencedor e das visões.

### Categorias de erro

| Categoria | Quando | Exemplos |
|---|---|---|
| `TypeError` / `RangeError` | argumento com tipo errado ou valor fora do permitido | coordenada `'A1'` ou `{ linha: 1.5 }` (`TypeError`); `{ linha: 10, coluna: 0 }`, orientação `'DIAGONAL'`, tipo `'CANOA'`, jogador `'TERCEIRO'`, gerador que devolve `1` (`RangeError`) |
| `ErroDeRegra` | o argumento é válido, mas a jogada viola uma regra | navio fora do tabuleiro ou sobreposto, navio repetido, tiro antes da frota completa, tiro repetido, tiro fora da vez, tiro depois do fim |

Os testes usam `toThrow(new ErroDeRegra('mensagem'))`. No Jest 30.5.2, esse matcher confere a **classe e a mensagem**: isso foi verificado na prática, com um teste mínimo, antes de ser adotado.

### Testes por arquivo

| Arquivo | Nº de testes | O que verifica |
|---|---|---|
| `constantes.test.js` | 19 | tamanho 10, nome e tamanho de cada navio, total de 14 casas, valores enumerados e congelamento |
| `erros.test.js` | 2 | `ErroDeRegra` é um `Error`, tem nome próprio e não se confunde com `TypeError`/`RangeError` |
| `coordenada.test.js` | 40 | bordas e cantos, coordenadas inválidas por tipo e por faixa, orientações, cálculo das casas na horizontal e na vertical |
| `navio.test.js` | 30 | criação de cada tipo, argumentos inválidos e sua ordem, acertos, afundamento em qualquer ordem, encapsulamento |
| `tabuleiro.test.js` | 52 | posicionamento (borda, fora do tabuleiro, sobreposição, repetição, ordem das regras), tiros (água, acerto, afundou, repetido, antes da frota completa), visão do adversário, encapsulamento |
| `posicionamentoAleatorio.test.js` | 39 | resultados exatos com geradores previsíveis, reprodutibilidade, chamadas ao gerador, 25 sorteios sem injeção, geradores inválidos |
| `partida.test.js` | 42 | início, validação e cópia do posicionamento injetado, turnos, tiro fora da vez e repetido, argumentos inválidos, visões, vitória de cada jogador, bloqueio depois do fim, encapsulamento |
| **Total** | **224** | |
