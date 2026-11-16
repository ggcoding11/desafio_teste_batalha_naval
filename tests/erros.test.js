const { ErroDeRegra } = require('../src/erros');

describe('ErroDeRegra', () => {
  test('é um Error com nome próprio e a mensagem recebida', () => {
    const erro = new ErroDeRegra('jogada proibida');

    expect(erro).toBeInstanceOf(Error);
    expect(erro).toBeInstanceOf(ErroDeRegra);
    expect(erro.name).toBe('ErroDeRegra');
    expect(erro.message).toBe('jogada proibida');
  });

  test('não se confunde com os erros de argumento', () => {
    const erro = new ErroDeRegra('jogada proibida');

    expect(erro).not.toBeInstanceOf(TypeError);
    expect(erro).not.toBeInstanceOf(RangeError);
  });
});
