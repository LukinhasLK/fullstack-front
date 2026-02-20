import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ItemCarrinho, Produto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private itensSubject = new BehaviorSubject<ItemCarrinho[]>([]);
  itens$ = this.itensSubject.asObservable();

  get itens(): ItemCarrinho[] {
    return this.itensSubject.value;
  }

  get total(): number {
    return this.itens.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0);
  }

  get totalItens(): number {
    return this.itens.reduce((acc, item) => acc + item.quantidade, 0);
  }

  adicionar(produto: Produto, quantidade = 1): void {
    const atual = [...this.itens];
    const idx = atual.findIndex(i => i.produto.id === produto.id);
    if (idx >= 0) {
      atual[idx] = { ...atual[idx], quantidade: atual[idx].quantidade + quantidade };
    } else {
      atual.push({ produto, quantidade });
    }
    this.itensSubject.next(atual);
  }

  remover(produtoId: number): void {
    this.itensSubject.next(this.itens.filter(i => i.produto.id !== produtoId));
  }

  alterarQuantidade(produtoId: number, quantidade: number): void {
    if (quantidade <= 0) {
      this.remover(produtoId);
      return;
    }
    this.itensSubject.next(
      this.itens.map(i => i.produto.id === produtoId ? { ...i, quantidade } : i)
    );
  }

  limpar(): void {
    this.itensSubject.next([]);
  }
}
