import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarrinhoService } from '../../core/services/carrinho.service';
import { PedidoService } from '../../core/services/pedido.service';
import { ItemCarrinho } from '../../core/models/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="app-layout">
      <!-- NAVBAR -->
      <header class="navbar">
        <div class="nav-inner container">
          <a routerLink="/home" class="back-btn">
            <span class="material-icons-round">arrow_back</span>
          </a>
          <a class="nav-brand" routerLink="/home">
            <span class="material-icons-round">delivery_dining</span>
            <span>DeliveryApp</span>
          </a>
          <span class="nav-title">Meu Carrinho</span>
        </div>
      </header>

      <div class="cart-page container">
        <!-- VAZIO -->
        <div class="empty-state" *ngIf="itens.length === 0">
          <span class="material-icons-round">shopping_bag</span>
          <h3>Seu carrinho está vazio</h3>
          <p>Adicione itens do cardápio para fazer seu pedido</p>
          <a routerLink="/home" class="btn btn-primary">
            <span class="material-icons-round">restaurant_menu</span>
            Ver cardápio
          </a>
        </div>

        <!-- COM ITENS -->
        <div class="cart-layout" *ngIf="itens.length > 0">
          <!-- LISTA DE ITENS -->
          <section class="cart-items">
            <h2 class="section-title">
              <span class="material-icons-round">shopping_bag</span>
              Seus itens ({{ itens.length }})
            </h2>

            <div class="item-card" *ngFor="let item of itens">
              <div class="item-img">
                <img *ngIf="item.produto.imagemUrl" [src]="item.produto.imagemUrl" [alt]="item.produto.nome"/>
                <div class="img-placeholder" *ngIf="!item.produto.imagemUrl">
                  <span class="material-icons-round">fastfood</span>
                </div>
              </div>
              <div class="item-info">
                <h3>{{ item.produto.nome }}</h3>
                <span class="item-cat tag tag-gray">{{ item.produto.categoria?.nome }}</span>
                <p class="unit-price">{{ item.produto.preco | currency:'BRL':'symbol':'1.2-2' }} por unidade</p>
              </div>
              <div class="item-controls">
                <div class="qty-ctrl">
                  <button class="qty-btn" (click)="decrement(item)">
                    <span class="material-icons-round">{{ item.quantidade === 1 ? 'delete_outline' : 'remove' }}</span>
                  </button>
                  <span class="qty-val">{{ item.quantidade }}</span>
                  <button class="qty-btn" (click)="increment(item)">
                    <span class="material-icons-round">add</span>
                  </button>
                </div>
                <span class="item-subtotal">{{ item.produto.preco * item.quantidade | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </section>

          <!-- RESUMO -->
          <aside class="cart-summary">
            <div class="summary-card">
              <h2 class="section-title">
                <span class="material-icons-round">receipt_long</span>
                Resumo do pedido
              </h2>

              <div class="summary-row" *ngFor="let item of itens">
                <span>{{ item.quantidade }}x {{ item.produto.nome }}</span>
                <span>{{ item.produto.preco * item.quantidade | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>

              <hr class="divider"/>

              <div class="summary-row">
                <span>Subtotal</span>
                <span>{{ total | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Taxa de entrega</span>
                <span class="text-green">Grátis</span>
              </div>

              <hr class="divider"/>

              <div class="summary-total">
                <span>Total</span>
                <span class="total-value">{{ total | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>

              <!-- ENDEREÇO -->
              <div class="form-group" style="margin-top: 20px;">
                <label>
                  <span class="material-icons-round">location_on</span>
                  Endereço de entrega
                </label>
                <div class="input-wrap no-icon">
                  <textarea
                    [(ngModel)]="endereco"
                    placeholder="Rua, número, complemento, bairro..."
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <div class="form-group">
                <label>Observações (opcional)</label>
                <div class="input-wrap no-icon">
                  <textarea [(ngModel)]="observacao" placeholder="Sem cebola, bem passado..." rows="2"></textarea>
                </div>
              </div>

              <div class="error-banner" *ngIf="errorMsg">
                <span class="material-icons-round">error_outline</span>
                {{ errorMsg }}
              </div>

              <button
                class="btn btn-primary btn-lg confirm-btn"
                [disabled]="loading || !endereco.trim()"
                (click)="confirmarPedido()"
              >
                <span class="material-icons-round" *ngIf="!loading">check_circle</span>
                <div class="btn-spinner" *ngIf="loading"></div>
                {{ loading ? 'Confirmando...' : 'Confirmar pedido' }}
              </button>

              <button class="btn btn-ghost limpar-btn" (click)="limpar()">
                <span class="material-icons-round">delete_outline</span>
                Limpar carrinho
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>

    <!-- SUCCESS MODAL -->
    <div class="modal-overlay" *ngIf="pedidoConfirmado" (click)="irParaHome()">
      <div class="success-modal" (click)="$event.stopPropagation()">
        <div class="success-icon">
          <span class="material-icons-round">check_circle</span>
        </div>
        <h2>Pedido confirmado!</h2>
        <p>Seu pedido foi recebido e está sendo preparado. Em breve chegará até você.</p>
        <div class="pedido-info">
          <div class="info-item">
            <span class="material-icons-round">schedule</span>
            Estimativa: 30-45 min
          </div>
          <div class="info-item">
            <span class="material-icons-round">paid</span>
            Total: {{ total | currency:'BRL':'symbol':'1.2-2' }}
          </div>
        </div>
        <button class="btn btn-primary btn-lg" (click)="irParaHome()">
          <span class="material-icons-round">home</span>
          Voltar ao início
        </button>
      </div>
    </div>
  `,
  styles: [`
    .app-layout { min-height: 100vh; background: var(--bg-secondary); }

    .navbar {
      position: sticky; top: 0; z-index: 100;
      background: white; border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }

    .nav-inner {
      display: flex; align-items: center; gap: 12px;
      height: 68px;
    }

    .back-btn {
      display: flex; align-items: center; justify-content: center;
      width: 40px; height: 40px;
      border-radius: 50%;
      color: var(--text);
      transition: var(--transition);
      &:hover { background: var(--surface); color: var(--primary); }
      .material-icons-round { font-size: 22px; }
    }

    .nav-brand {
      display: flex; align-items: center; gap: 8px;
      color: var(--primary);
      font-family: var(--font-display); font-weight: 800;
      .material-icons-round { font-size: 26px; }
    }

    .nav-title {
      margin-left: auto;
      font-family: var(--font-display);
      font-size: 0.95rem; font-weight: 600;
      color: var(--text-secondary);
    }

    .cart-page { padding: 32px 24px 48px; }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 24px;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .section-title {
      display: flex; align-items: center; gap: 8px;
      font-family: var(--font-display);
      font-size: 1.2rem; font-weight: 700;
      margin-bottom: 20px;
      .material-icons-round { font-size: 22px; color: var(--primary); }
    }

    /* ITEMS */
    .cart-items { display: flex; flex-direction: column; gap: 4px; }

    .item-card {
      display: flex; align-items: center; gap: 16px;
      background: white; border-radius: var(--radius-md);
      border: 1px solid var(--border);
      padding: 16px;
      margin-bottom: 12px;
      transition: var(--transition);
      &:hover { box-shadow: var(--shadow-sm); }
    }

    .item-img {
      width: 80px; height: 80px;
      border-radius: var(--radius-sm);
      overflow: hidden; flex-shrink: 0;
      background: var(--surface);

      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .img-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      .material-icons-round { font-size: 32px; color: var(--border); }
    }

    .item-info { flex: 1; min-width: 0; }
    .item-info h3 {
      font-family: var(--font-display); font-size: 0.95rem; font-weight: 700;
      margin-bottom: 4px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .item-cat { margin-bottom: 6px; display: inline-block; }
    .unit-price { font-size: 0.82rem; color: var(--text-secondary); }

    .item-controls {
      display: flex; flex-direction: column;
      align-items: flex-end; gap: 8px;
    }

    .qty-ctrl {
      display: flex; align-items: center; gap: 4px;
      background: var(--surface);
      border-radius: 100px;
      padding: 4px;
    }

    .qty-btn {
      width: 30px; height: 30px;
      border-radius: 50%;
      border: none;
      background: white;
      color: var(--text);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: var(--transition);
      box-shadow: var(--shadow-sm);
      &:hover { color: var(--primary); }
      .material-icons-round { font-size: 16px; }
    }

    .qty-val { font-weight: 700; min-width: 24px; text-align: center; font-size: 0.95rem; }

    .item-subtotal {
      font-family: var(--font-display); font-weight: 700;
      color: var(--primary); font-size: 1rem;
    }

    /* SUMMARY */
    .summary-card {
      background: white;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      padding: 24px;
      position: sticky; top: 88px;
    }

    .summary-row {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.88rem; color: var(--text-secondary);
      padding: 6px 0;
      span:last-child { font-weight: 500; color: var(--text); }
    }

    .text-green { color: #1a9e5c !important; font-weight: 600 !important; }

    .divider { border: none; border-top: 1px solid var(--border); margin: 12px 0; }

    .summary-total {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 0;
      font-weight: 600; font-size: 1rem;
    }

    .total-value {
      font-family: var(--font-display);
      font-size: 1.4rem; font-weight: 800;
      color: var(--primary);
    }

    textarea {
      width: 100%;
      padding: 12px 16px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      font-size: 0.9rem;
      font-family: var(--font-body);
      background: var(--bg-secondary);
      color: var(--text);
      resize: none;
      transition: var(--transition);
      &::placeholder { color: var(--text-muted); }
      &:focus { border-color: var(--primary); background: white; outline: none; box-shadow: 0 0 0 3px rgba(255,107,0,0.1); }
    }

    label {
      font-size: 0.85rem; font-weight: 500; color: var(--text-secondary);
      display: flex; align-items: center; gap: 6px; margin-bottom: 6px;
      .material-icons-round { font-size: 16px; color: var(--primary); }
    }

    .error-banner {
      display: flex; align-items: center; gap: 8px;
      background: #fff5f5; border: 1px solid #fed7d7;
      color: #c53030; border-radius: var(--radius-md);
      padding: 10px 14px; font-size: 0.85rem;
      margin-top: 8px;
      .material-icons-round { font-size: 16px; }
    }

    .confirm-btn { width: 100%; margin-top: 16px; }
    .limpar-btn { width: 100%; margin-top: 8px; color: var(--text-secondary) !important; font-size: 0.85rem; }

    .btn-spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* EMPTY */
    .empty-state .btn { margin-top: 8px; }

    /* MODAL */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 200; padding: 24px;
      animation: fadeIn 0.2s ease;
      backdrop-filter: blur(4px);
    }

    .success-modal {
      background: white;
      border-radius: var(--radius-xl);
      padding: 48px 40px;
      max-width: 400px; width: 100%;
      text-align: center;
      box-shadow: var(--shadow-lg);
      animation: fadeIn 0.3s ease;
    }

    .success-icon {
      width: 80px; height: 80px;
      background: #E8F8F0;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
      .material-icons-round { font-size: 44px; color: #1a9e5c; }
    }

    .success-modal h2 {
      font-family: var(--font-display); font-size: 1.8rem; font-weight: 800;
      margin-bottom: 10px;
    }

    .success-modal p {
      color: var(--text-secondary); line-height: 1.6;
      margin-bottom: 24px;
    }

    .pedido-info {
      background: var(--surface);
      border-radius: var(--radius-md);
      padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      margin-bottom: 24px;
    }

    .info-item {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.9rem; color: var(--text-secondary);
      .material-icons-round { font-size: 18px; color: var(--primary); }
    }

    .success-modal .btn { width: 100%; }
  `]
})
export class CartComponent implements OnInit {
  itens: ItemCarrinho[] = [];
  endereco = '';
  observacao = '';
  loading = false;
  errorMsg = '';
  pedidoConfirmado = false;
  private _totalSnapshot = 0;

  constructor(
    private carrinhoService: CarrinhoService,
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  get total(): number { return this.pedidoConfirmado ? this._totalSnapshot : this.carrinhoService.total; }

  ngOnInit(): void {
    this.carrinhoService.itens$.subscribe(itens => this.itens = itens);
  }

  increment(item: ItemCarrinho): void {
    this.carrinhoService.alterarQuantidade(item.produto.id, item.quantidade + 1);
  }

  decrement(item: ItemCarrinho): void {
    this.carrinhoService.alterarQuantidade(item.produto.id, item.quantidade - 1);
  }

  limpar(): void { this.carrinhoService.limpar(); }

  confirmarPedido(): void {
    if (!this.endereco.trim()) return;
    this.loading = true;
    this.errorMsg = '';
    this._totalSnapshot = this.carrinhoService.total;
    const request = {
      enderecoId: null,
      itens: this.itens.map(i => ({ produtoId: i.produto.id, quantidade: i.quantidade }))
    };
    this.pedidoService.criar(request).subscribe({
      next: () => {
        this.loading = false;
        this.carrinhoService.limpar();
        this.pedidoConfirmado = true;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Erro ao confirmar pedido. Tente novamente.';
      }
    });
  }

  irParaHome(): void { this.router.navigate(['/home']); }
}
