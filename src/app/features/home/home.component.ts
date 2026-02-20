import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CarrinhoService } from '../../core/services/carrinho.service';
import { ProdutoService } from '../../core/services/produto.service';
import { Produto } from '../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="app-layout">
      <!-- NAVBAR -->
      <header class="navbar">
        <div class="nav-inner container">
          <a class="nav-brand" routerLink="/home">
            <span class="material-icons-round">delivery_dining</span>
            <span class="brand-name">DeliveryApp</span>
          </a>

          <div class="search-wrap">
            <span class="material-icons-round">search</span>
            <input
              type="text"
              placeholder="Buscar pratos ou restaurantes..."
              [(ngModel)]="searchQuery"
              (input)="filtrar()"
            />
          </div>

          <div class="nav-actions">
            <a routerLink="/admin" class="btn btn-ghost btn-sm" *ngIf="isAdmin">
              <span class="material-icons-round">dashboard</span>
              Admin
            </a>
            <a routerLink="/carrinho" class="cart-btn">
              <span class="material-icons-round">shopping_bag</span>
              <span class="badge" *ngIf="totalItens > 0">{{ totalItens }}</span>
            </a>
            <div class="user-menu" (click)="toggleMenu()" [class.open]="menuOpen">
              <div class="avatar">{{ userInitial }}</div>
              <div class="dropdown" *ngIf="menuOpen">
                <div class="dropdown-info">
                  <strong>{{ userName }}</strong>
                  <span>{{ userEmail }}</span>
                </div>
                <hr>
                <button (click)="logout()">
                  <span class="material-icons-round">logout</span>
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- HERO -->
      <section class="hero container">
        <div class="hero-content">
          <div class="hero-tag"><span class="material-icons-round">local_fire_department</span> Mais pedidos hoje</div>
          <h1>O que você vai <span>pedir hoje?</span></h1>
          <p>Entrega rápida, comida gostosa. Simples assim.</p>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="num">30min</span><span class="label">Tempo médio</span></div>
          <div class="stat-div"></div>
          <div class="stat"><span class="num">4.8★</span><span class="label">Avaliação</span></div>
          <div class="stat-div"></div>
          <div class="stat"><span class="num">Grátis</span><span class="label">Primeira entrega</span></div>
        </div>
      </section>

      <!-- CATEGORIAS -->
      <section class="categorias container">
        <div class="categoria-list">
          <button
            class="cat-chip"
            [class.active]="categoriaSelecionada === cat"
            *ngFor="let cat of categorias"
            (click)="filtrarCategoria(cat)"
          >
            <span class="cat-icon">{{ catIcon(cat) }}</span>
            {{ cat }}
          </button>
        </div>
      </section>

      <!-- PRODUTOS -->
      <section class="produtos-section container">
        <div class="section-header">
          <h2>{{ categoriaSelecionada === 'Todos' ? 'Cardápio completo' : categoriaSelecionada }}</h2>
          <span class="count">{{ produtosFiltrados.length }} itens</span>
        </div>

        <div class="loading-spinner" *ngIf="loading"></div>

        <div class="empty-state" *ngIf="!loading && produtosFiltrados.length === 0">
          <span class="material-icons-round">search_off</span>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente buscar por outro termo ou categoria</p>
        </div>

        <div class="produtos-grid" *ngIf="!loading && produtosFiltrados.length > 0">
          <div class="produto-card" *ngFor="let p of produtosFiltrados">
            <div class="produto-img">
              <img *ngIf="p.imagemUrl" [src]="p.imagemUrl" [alt]="p.nome" loading="lazy"/>
              <div class="produto-img-placeholder" *ngIf="!p.imagemUrl">
                <span class="material-icons-round">fastfood</span>
              </div>
              <span class="tag tag-green disponivel" *ngIf="p.disponivel">
                <span class="material-icons-round">check_circle</span> Disponível
              </span>
              <span class="tag tag-gray disponivel" *ngIf="!p.disponivel">Indisponível</span>
              <span class="cat-tag">{{ p.categoria?.nome }}</span>
            </div>
            <div class="produto-body">
              <h3 class="produto-nome">{{ p.nome }}</h3>
              <p class="produto-desc">{{ p.descricao }}</p>
              <div class="produto-footer">
                <span class="produto-preco">{{ p.preco | currency:'BRL':'symbol':'1.2-2' }}</span>
                <button
                  class="btn btn-primary btn-sm add-btn"
                  [disabled]="!p.disponivel"
                  (click)="adicionarAoCarrinho(p)"
                >
                  <span class="material-icons-round">add</span>
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- TOAST -->
    <div class="toast" [class.show]="toastVisible">
      <span class="material-icons-round">check_circle</span>
      Item adicionado ao carrinho!
    </div>
  `,
  styles: [`
    .app-layout { min-height: 100vh; background: var(--bg-secondary); }

    /* NAVBAR */
    .navbar {
      position: sticky; top: 0; z-index: 100;
      background: white;
      border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }

    .nav-inner {
      display: flex; align-items: center; gap: 16px;
      height: 68px;
    }

    .nav-brand {
      display: flex; align-items: center; gap: 8px;
      color: var(--primary);
      font-family: var(--font-display);
      font-weight: 800; font-size: 1.2rem;
      flex-shrink: 0;
      .material-icons-round { font-size: 28px; }
    }

    .search-wrap {
      flex: 1; max-width: 480px;
      position: relative; display: flex; align-items: center;
      .material-icons-round {
        position: absolute; left: 14px; font-size: 20px;
        color: var(--text-muted); pointer-events: none;
      }
      input {
        width: 100%;
        padding: 10px 16px 10px 44px;
        border: 1.5px solid var(--border);
        border-radius: 100px;
        font-size: 0.9rem;
        background: var(--surface);
        transition: var(--transition);
        &::placeholder { color: var(--text-muted); }
        &:focus { border-color: var(--primary); background: white; outline: none; }
      }
    }

    .nav-actions {
      display: flex; align-items: center; gap: 8px;
      margin-left: auto;
    }

    .cart-btn {
      position: relative;
      display: flex; align-items: center; justify-content: center;
      width: 44px; height: 44px;
      border-radius: 50%;
      background: var(--primary-soft);
      color: var(--primary);
      transition: var(--transition);
      &:hover { background: var(--primary); color: white; }
      .material-icons-round { font-size: 22px; }
      .badge { position: absolute; top: 2px; right: 2px; font-size: 0.65rem; min-width: 18px; height: 18px; }
    }

    .user-menu {
      position: relative; cursor: pointer;
    }

    .avatar {
      width: 40px; height: 40px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-display);
      font-weight: 700; font-size: 1rem;
      transition: var(--transition);
      &:hover { transform: scale(1.05); }
    }

    .dropdown {
      position: absolute; top: calc(100% + 8px); right: 0;
      background: white; border-radius: var(--radius-md);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-md);
      min-width: 200px;
      animation: fadeIn 0.15s ease;
      overflow: hidden;
    }

    .dropdown-info {
      padding: 14px 16px;
      display: flex; flex-direction: column; gap: 2px;
      strong { font-size: 0.9rem; color: var(--text); }
      span { font-size: 0.8rem; color: var(--text-secondary); }
    }

    .dropdown hr { border: none; border-top: 1px solid var(--border); }

    .dropdown button {
      width: 100%;
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px;
      font-size: 0.9rem;
      color: var(--text);
      background: none; border: none; cursor: pointer;
      transition: var(--transition);
      &:hover { background: var(--surface); color: var(--primary); }
      .material-icons-round { font-size: 18px; }
    }

    /* HERO */
    .hero {
      padding: 48px 24px 32px;
      display: flex; justify-content: space-between;
      align-items: flex-end;
      @media (max-width: 600px) { flex-direction: column; align-items: flex-start; gap: 24px; }
    }

    .hero-tag {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--primary-soft);
      color: var(--primary);
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 0.82rem; font-weight: 600;
      margin-bottom: 16px;
      .material-icons-round { font-size: 16px; }
    }

    .hero-content h1 {
      font-family: var(--font-display);
      font-size: 2.4rem; font-weight: 800;
      line-height: 1.2; margin-bottom: 10px;
      span { color: var(--primary); }
    }

    .hero-content p { color: var(--text-secondary); font-size: 1rem; }

    .hero-stats {
      display: flex; align-items: center; gap: 24px;
      background: white; border-radius: var(--radius-lg);
      padding: 20px 28px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
    }

    .stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .stat .num { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; color: var(--primary); }
    .stat .label { font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; }
    .stat-div { width: 1px; height: 36px; background: var(--border); }

    /* CATEGORIAS */
    .categorias { padding: 0 24px 24px; }

    .categoria-list {
      display: flex; gap: 8px;
      overflow-x: auto; padding-bottom: 4px;
      &::-webkit-scrollbar { height: 0; }
    }

    .cat-chip {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px;
      border-radius: 100px;
      border: 1.5px solid var(--border);
      background: white;
      font-size: 0.88rem; font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      white-space: nowrap;
      transition: var(--transition);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary); border-color: var(--primary); color: white; }
      .cat-icon { font-size: 1rem; }
    }

    /* PRODUTOS */
    .produtos-section { padding: 0 24px 48px; }

    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px;
      h2 { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; }
      .count { font-size: 0.85rem; color: var(--text-secondary); }
    }

    .produtos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .produto-card {
      background: white;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      overflow: hidden;
      transition: var(--transition);
      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-3px);
      }
    }

    .produto-img {
      position: relative;
      height: 180px;
      background: var(--surface);
      overflow: hidden;

      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
      .produto-card:hover img { transform: scale(1.04); }
    }

    .produto-img-placeholder {
      height: 100%;
      display: flex; align-items: center; justify-content: center;
      .material-icons-round { font-size: 48px; color: var(--border); }
    }

    .disponivel {
      position: absolute; bottom: 8px; left: 8px;
      font-size: 0.72rem;
      .material-icons-round { font-size: 14px; }
    }

    .cat-tag {
      position: absolute; top: 8px; right: 8px;
      background: rgba(0,0,0,0.6);
      color: white;
      padding: 3px 10px;
      border-radius: 100px;
      font-size: 0.72rem;
      backdrop-filter: blur(4px);
    }

    .produto-body { padding: 16px; }

    .produto-nome {
      font-family: var(--font-display);
      font-size: 1rem; font-weight: 700;
      margin-bottom: 6px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .produto-desc {
      font-size: 0.82rem; color: var(--text-secondary);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 14px;
    }

    .produto-footer {
      display: flex; align-items: center; justify-content: space-between;
    }

    .produto-preco {
      font-family: var(--font-display);
      font-size: 1.2rem; font-weight: 700;
      color: var(--primary);
    }

    .add-btn {
      .material-icons-round { font-size: 16px; }
    }

    /* TOAST */
    .toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(80px);
      background: #1a1a1a; color: white;
      display: flex; align-items: center; gap: 8px;
      padding: 12px 20px;
      border-radius: 100px;
      font-size: 0.9rem; font-weight: 500;
      box-shadow: var(--shadow-lg);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s;
      opacity: 0; z-index: 999;
      .material-icons-round { font-size: 18px; color: #48bb78; }
      &.show { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
  `]
})
export class HomeComponent implements OnInit {
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  loading = true;
  searchQuery = '';
  categoriaSelecionada = 'Todos';
  categorias = ['Todos', 'Pizza', 'Hambúrguer', 'Japonês', 'Saudável', 'Sobremesas', 'Bebidas'];
  menuOpen = false;
  toastVisible = false;

  constructor(
    private produtoService: ProdutoService,
    private carrinhoService: CarrinhoService,
    private authService: AuthService,
    private router: Router
  ) {}

  get totalItens(): number { return this.carrinhoService.totalItens; }
  get isAdmin(): boolean { return this.authService.isAdmin(); }
  get userName(): string { return this.authService.getUser()?.nome || ''; }
  get userEmail(): string { return this.authService.getUser()?.email || ''; }
  get userInitial(): string { return this.userName.charAt(0).toUpperCase(); }

  ngOnInit(): void {
    this.produtoService.listar().subscribe({
      next: (p) => { this.produtos = p; this.produtosFiltrados = p; this.loading = false; },
      error: () => { this.loading = false; }
    });
    document.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('.user-menu')) this.menuOpen = false;
    });
  }

  filtrar(): void {
    this.aplicarFiltros();
  }

  filtrarCategoria(cat: string): void {
    this.categoriaSelecionada = cat;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let lista = this.produtos;
    if (this.categoriaSelecionada !== 'Todos') {
      lista = lista.filter(p => p.categoria?.nome === this.categoriaSelecionada);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      lista = lista.filter(p => p.nome.toLowerCase().includes(q) || p.descricao.toLowerCase().includes(q));
    }
    this.produtosFiltrados = lista;
  }

  adicionarAoCarrinho(produto: Produto): void {
    this.carrinhoService.adicionar(produto);
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 2500);
  }

  catIcon(cat: string): string {
    const icons: Record<string, string> = {
      'Todos': '🍽️', 'Pizza': '🍕', 'Hambúrguer': '🍔',
      'Japonês': '🍱', 'Saudável': '🥗', 'Sobremesas': '🍰', 'Bebidas': '🥤'
    };
    return icons[cat] || '🍴';
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  logout(): void { this.authService.logout(); }
}
