class HeapMinimo {
  constructor(comparar) {
    this.comparar = comparar;
    this.itens = [];
  }

  tamanho() {
    return this.itens.length;
  }

  topo() {
    return this.itens[0];
  }

  inserir(valor) {
    this.itens.push(valor);
    this.subir(this.itens.length - 1);
  }

  remover() {
    if (this.itens.length === 0) return null;
    if (this.itens.length === 1) return this.itens.pop();

    const topo = this.itens[0];
    this.itens[0] = this.itens.pop();
    this.descer(0);
    return topo;
  }

  subir(indice) {
    let atual = indice;
    while (atual > 0) {
      const pai = Math.floor((atual - 1) / 2);
      if (this.comparar(this.itens[atual], this.itens[pai]) >= 0) break;
      [this.itens[atual], this.itens[pai]] = [
        this.itens[pai],
        this.itens[atual],
      ];
      atual = pai;
    }
  }

  descer(indice) {
    let atual = indice;
    while (true) {
      const esquerda = atual * 2 + 1;
      const direita = atual * 2 + 2;
      let menor = atual;

      if (
        esquerda < this.itens.length &&
        this.comparar(this.itens[esquerda], this.itens[menor]) < 0
      ) {
        menor = esquerda;
      }

      if (
        direita < this.itens.length &&
        this.comparar(this.itens[direita], this.itens[menor]) < 0
      ) {
        menor = direita;
      }

      if (menor === atual) break;
      [this.itens[atual], this.itens[menor]] = [
        this.itens[menor],
        this.itens[atual],
      ];
      atual = menor;
    }
  }
}

const atribuirSalas = (eventos) => {
  if (eventos.length === 0) {
    return { agendados: [], salas: [], totalSalas: 0 };
  }

  const ordenados = [...eventos].sort(
    (a, b) => a.start - b.start || a.end - b.end,
  );
  const salas = [];
  const heapMinimo = new HeapMinimo((a, b) => a.end - b.end);
  const agendados = [];
  let totalSalas = 0;

  for (const evento of ordenados) {
    if (heapMinimo.tamanho() > 0 && heapMinimo.topo().end <= evento.start) {
      const liberada = heapMinimo.remover();
      salas[liberada.salaId].events.push(evento);
      heapMinimo.inserir({ end: evento.end, salaId: liberada.salaId });
      agendados.push({ ...evento, salaId: liberada.salaId });
    } else {
      const salaId = totalSalas;
      totalSalas += 1;
      salas[salaId] = { id: salaId + 1, events: [evento] };
      heapMinimo.inserir({ end: evento.end, salaId });
      agendados.push({ ...evento, salaId });
    }
  }

  return { agendados, salas, totalSalas };
};

export { atribuirSalas };
