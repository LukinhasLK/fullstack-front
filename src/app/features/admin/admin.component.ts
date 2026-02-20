import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../core/services/pedido.service';
import { ProdutoService, CategoriaService } from '../../core/services/produto.service';
import { AuthService } from '../../core/services/auth.service';
import { Pedido, Produto, Categoria, ProdutoRequest } from '../../core/models/models';

type Tab = 'pedidos' | 'produtos';
type StatusPedido = 'PENDENTE' | 'CONFIRMADO' | 'EM_PREPARO' | 'SAIU_PARA_ENTREGA' | 'ENTREGUE' | 'CANCELADO';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="admin-layout">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon"><span class="material-icons-round">delivery_dining</span></div>
          <div>
            <strong>DeliveryApp</strong>
            <span>Painel Admin</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <button class="nav-item" [class.active]="tab === 'pedidos'" (click)="tab = 'pedidos'">
            <span class="material-icons-round">receipt_long</span>
            Pedidos
            <span class="nav-badge" *ngIf="pedidosPendentes > 0">{{ pedidosPendentes }}</span>
          </button>
          <button class="nav-item" [class.active]="tab === 'produtos'" (click)="tab = 'produtos'">
            <span class="material-icons-round">fastfood</span>
            Produtos
          </button>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/home" class="nav-item">
            <span class="material-icons-round">storefront</span>
            Ver loja
          </a>
          <button class="nav-item logout" (click)="logout()">
            <span class="material-icons-round">logout</span>
            Sair
          </button>
        </div>
      </aside>

      <!-- MAIN -->
      <main class="admin-main">
        <!-- HEADER -->
        <header class="admin-header">
          <div>
            <h1>{{ tab === 'pedidos' ? 'Pedidos' : 'Produtos' }}</h1>
            <p>{{ tab === 'pedidos' ? 'Gerencie todos os pedidos em tempo real' : 'Gerencie o cardápio do restaurante' }}</p>
          </div>
          <div class="header-info">
            <span class="admin-label">Admin</span>
            <div class="admin-avatar">{{ adminInitial }}</div>
          </div>
        </header>

        <!-- STATS (só pedidos) -->
        <div class="stats-row" *ngIf="tab === 'pedidos'">
          <div class="stat-card" *ngFor="let s of stats">
            <div class="stat-icon" [style.background]="s.bg">
              <span class="material-icons-round" [style.color]="s.color">{{ s.icon }}</span>
            </div>
            <div>
              <div class="stat-num">{{ s.value }}</div>
              <div class="stat-label">{{ s.label }}</div>
            </div>
          </div>
        </div>

        <!-- PEDIDOS TAB -->
        <section class="content-section" *ngIf="tab === 'pedidos'">
          <!-- Filtro de status -->
          <div class="filter-row">
            <button
              class="filter-chip"
              [class.active]="statusFiltro === s"
              *ngFor="let s of statusList"
              (click)="statusFiltro = s; filtrarPedidos()"
            >{{ s === 'TODOS' ? 'Todos' : statusLabel(s) }}</button>
          </div>

          <div class="loading-spinner" *ngIf="loadingPedidos"></div>

          <div class="empty-state" *ngIf="!loadingPedidos && pedidosFiltrados.length === 0">
            <span class="material-icons-round">receipt_long</span>
            <h3>Nenhum pedido encontrado</h3>
            <p>Não há pedidos com este status</p>
          </div>

          <div class="pedidos-list" *ngIf="!loadingPedidos">
            <div class="pedido-card" *ngFor="let p of pedidosFiltrados">
              <div class="pedido-header">
                <div>
                  <span class="pedido-id">#{{ p.id }}</span>
                  <strong class="pedido-cliente">{{ p.usuario?.nome || 'Cliente' }}</strong>
                </div>
                <div class="pedido-header-right">
                  <span class="status-badge" [class]="'status-' + p.status">{{ statusLabel(p.status) }}</span>
                  <span class="pedido-data">{{ p.dataCriacao | date:'dd/MM HH:mm' }}</span>
                </div>
              </div>

              <div class="pedido-itens">
                <span *ngFor="let item of p.itens; let last = last">
                  {{ item.quantidade }}x {{ item.produto?.nome }}{{ last ? '' : ',' }}
                </span>
              </div>

              <div class="pedido-footer">
                <div class="pedido-endereco">
                  <span class="material-icons-round">location_on</span>
                  {{ p.endereco ? (p.endereco.rua + ', ' + p.endereco.numero) : 'Sem endereço' }}
                </div>
                <div class="pedido-footer-right">
                  <strong class="pedido-total">{{ p.total | currency:'BRL':'symbol':'1.2-2' }}</strong>
                  <select
                    class="status-select"
                    [value]="p.status"
                    (change)="atualizarStatus(p, $any($event.target).value)"
                    *ngIf="p.status !== 'ENTREGUE' && p.status !== 'CANCELADO'"
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="CONFIRMADO">Confirmado</option>
                    <option value="EM_PREPARO">Em preparo</option>
                    <option value="SAIU_PARA_ENTREGA">Saiu para entrega</option>
                    <option value="ENTREGUE">Entregue</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- PRODUTOS TAB -->
        <section class="content-section" *ngIf="tab === 'produtos'">
          <div class="section-actions">
            <h2 class="section-h2">Cardápio ({{ produtos.length }} itens)</h2>
            <button class="btn btn-primary btn-sm" (click)="abrirModal()">
              <span class="material-icons-round">add</span>
              Novo produto
            </button>
          </div>

          <div class="loading-spinner" *ngIf="loadingProdutos"></div>

          <div class="produtos-table" *ngIf="!loadingProdutos && produtos.length > 0">
            <div class="table-header">
              <span>Produto</span>
              <span>Categoria</span>
              <span>Preço</span>
              <span>Status</span>
              <span>Ações</span>
            </div>
            <div class="table-row" *ngFor="let p of produtos">
              <div class="produto-info">
                <div class="produto-thumb">
                  <img *ngIf="p.imagemUrl" [src]="p.imagemUrl" [alt]="p.nome"/>
                  <span class="material-icons-round" *ngIf="!p.imagemUrl">fastfood</span>
                </div>
                <div>
                  <strong>{{ p.nome }}</strong>
                  <span>{{ p.descricao | slice:0:50 }}{{ (p.descricao.length ?? 0) > 50 ? '...' : '' }}</span>
                </div>
              </div>
              <span class="tag tag-gray">{{ p.categoria?.nome }}</span>
              <strong class="preco-col">{{ p.preco | currency:'BRL':'symbol':'1.2-2' }}</strong>
              <span class="tag" [class]="p.disponivel ? 'tag-green' : 'tag-gray'">
                {{ p.disponivel ? 'Disponível' : 'Indisponível' }}
              </span>
              <div class="row-actions">
                <button class="icon-btn edit" (click)="editarProduto(p)" title="Editar">
                  <span class="material-icons-round">edit</span>
                </button>
                <button class="icon-btn delete" (click)="deletarProduto(p.id)" title="Excluir">
                  <span class="material-icons-round">delete_outline</span>
                </button>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="!loadingProdutos && produtos.length === 0">
            <span class="material-icons-round">fastfood</span>
            <h3>Nenhum produto cadastrado</h3>
            <p>Adicione o primeiro item ao cardápio</p>
            <button class="btn btn-primary" (click)="abrirModal()">Adicionar produto</button>
          </div>
        </section>
      </main>
    </div>

    <!-- MODAL PRODUTO -->
    <div class="modal-overlay" *ngIf="modalOpen" (click)="fecharModal()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editando ? 'Editar produto' : 'Novo produto' }}</h3>
          <button class="close-btn" (click)="fecharModal()">
            <span class="material-icons-round">close</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Nome do produto</label>
            <div class="input-wrap no-icon"><input type="text" [(ngModel)]="formProduto.nome" placeholder="Ex: Pizza Margherita"/></div>
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <div class="input-wrap no-icon"><textarea [(ngModel)]="formProduto.descricao" placeholder="Descreva o produto..." rows="3"></textarea></div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Preço (R$)</label>
              <div class="input-wrap no-icon"><input type="number" [(ngModel)]="formProduto.preco" placeholder="0,00" step="0.01"/></div>
            </div>
            <div class="form-group">
              <label>Categoria</label>
              <div class="input-wrap no-icon">
                <select [(ngModel)]="formProduto.categoriaId">
                  <option [ngValue]="null">Sem categoria</option>
                  <option *ngFor="let cat of categorias" [ngValue]="cat.id">{{ cat.nome }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>URL da imagem (opcional)</label>
            <div class="input-wrap no-icon"><input type="url" [(ngModel)]="formProduto.imagemUrl" placeholder="https://..."/></div>
          </div>
          <div class="toggle-group">
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="formProduto.disponivel"/>
              <span class="toggle-switch"></span>
              Produto disponível
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="fecharModal()">Cancelar</button>
          <button class="btn btn-primary" (click)="salvarProduto()" [disabled]="loadingSave">
            <span class="material-icons-round" *ngIf="!loadingSave">save</span>
            <div class="btn-spinner" *ngIf="loadingSave"></div>
            {{ loadingSave ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; }

    /* SIDEBAR */
    .sidebar {
      width: 240px; flex-shrink: 0;
      background: #1a1a1a;
      display: flex; flex-direction: column;
      position: sticky; top: 0; height: 100vh;
      @media (max-width: 768px) { display: none; }
    }

    .sidebar-brand {
      display: flex; align-items: center; gap: 12px;
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      color: white;
      strong { display: block; font-size: 0.95rem; }
      span { font-size: 0.75rem; opacity: 0.5; }
    }

    .brand-icon {
      width: 40px; height: 40px;
      background: var(--primary);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      .material-icons-round { font-size: 22px; color: white; }
    }

    .sidebar-nav {
      flex: 1; padding: 16px 12px;
      display: flex; flex-direction: column; gap: 4px;
    }

    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      color: rgba(255,255,255,0.6);
      font-size: 0.9rem; font-weight: 500;
      background: none; border: none; cursor: pointer;
      width: 100%; text-align: left;
      transition: var(--transition);
      text-decoration: none;
      .material-icons-round { font-size: 20px; }
      &:hover { color: white; background: rgba(255,255,255,0.08); }
      &.active { color: white; background: var(--primary); }
    }

    .nav-badge {
      margin-left: auto;
      background: var(--primary-light);
      color: white;
      border-radius: 100px;
      padding: 1px 7px;
      font-size: 0.72rem; font-weight: 700;
      .nav-item.active & { background: rgba(255,255,255,0.3); }
    }

    .sidebar-footer {
      padding: 16px 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex; flex-direction: column; gap: 4px;
    }

    .logout { color: rgba(255,100,100,0.7) !important; &:hover { color: #ff6b6b !important; } }

    /* MAIN */
    .admin-main { flex: 1; background: var(--bg-secondary); overflow-y: auto; }

    .admin-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 28px 32px 24px;
      background: white; border-bottom: 1px solid var(--border);
      h1 { font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; margin-bottom: 4px; }
      p { color: var(--text-secondary); font-size: 0.88rem; }
    }

    .header-info { display: flex; align-items: center; gap: 12px; }
    .admin-label {
      background: var(--primary-soft); color: var(--primary);
      padding: 4px 10px; border-radius: 100px;
      font-size: 0.78rem; font-weight: 600;
    }
    .admin-avatar {
      width: 40px; height: 40px;
      background: var(--primary); color: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-display); font-weight: 700;
    }

    /* STATS */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      padding: 24px 32px;
    }

    .stat-card {
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      padding: 16px 20px;
      display: flex; align-items: center; gap: 14px;
    }

    .stat-icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      .material-icons-round { font-size: 24px; }
    }

    .stat-num { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; }
    .stat-label { font-size: 0.78rem; color: var(--text-secondary); }

    /* CONTENT */
    .content-section { padding: 0 32px 32px; }

    /* PEDIDOS */
    .filter-row {
      display: flex; flex-wrap: wrap; gap: 8px;
      margin-bottom: 20px; padding-top: 4px;
    }

    .filter-chip {
      padding: 6px 14px;
      border: 1.5px solid var(--border);
      border-radius: 100px;
      background: white; font-size: 0.82rem; font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer; transition: var(--transition);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary); border-color: var(--primary); color: white; }
    }

    .pedidos-list { display: flex; flex-direction: column; gap: 12px; }

    .pedido-card {
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      overflow: hidden;
      transition: var(--transition);
      &:hover { box-shadow: var(--shadow-sm); }
    }

    .pedido-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 18px;
      border-bottom: 1px solid var(--border);
    }

    .pedido-id {
      font-size: 0.75rem; font-weight: 600;
      color: var(--text-muted); margin-right: 8px;
    }
    .pedido-cliente { font-size: 0.95rem; }
    .pedido-header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .pedido-data { font-size: 0.75rem; color: var(--text-muted); }

    .status-badge {
      padding: 3px 10px; border-radius: 100px;
      font-size: 0.72rem; font-weight: 600;
      &.status-PENDENTE { background: #FFF8E1; color: #F59E0B; }
      &.status-CONFIRMADO { background: #E0F0FF; color: #2563EB; }
      &.status-PREPARANDO { background: #FFF0E6; color: var(--primary); }
      &.status-EM_ENTREGA { background: #E8F4FD; color: #0891B2; }
      &.status-ENTREGUE { background: #E8F8F0; color: #059669; }
      &.status-CANCELADO { background: #FFF5F5; color: #DC2626; }
    }

    .pedido-itens {
      padding: 10px 18px;
      font-size: 0.85rem; color: var(--text-secondary);
      border-bottom: 1px solid var(--border);
    }

    .pedido-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 18px;
      flex-wrap: wrap; gap: 8px;
    }

    .pedido-endereco {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.82rem; color: var(--text-secondary);
      .material-icons-round { font-size: 16px; color: var(--primary); }
    }

    .pedido-footer-right { display: flex; align-items: center; gap: 12px; }
    .pedido-total { font-family: var(--font-display); font-size: 1rem; color: var(--primary); }

    .status-select {
      padding: 6px 12px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      font-family: var(--font-body); font-size: 0.82rem;
      background: white; cursor: pointer;
      &:focus { outline: none; border-color: var(--primary); }
    }

    /* PRODUTOS TABLE */
    .section-actions {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px; padding-top: 4px;
    }
    .section-h2 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }

    .produtos-table {
      background: white;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 100px;
      padding: 12px 18px;
      background: var(--surface);
      font-size: 0.78rem; font-weight: 600;
      color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 100px;
      padding: 14px 18px;
      border-top: 1px solid var(--border);
      align-items: center;
      transition: var(--transition);
      &:hover { background: var(--surface); }
    }

    .produto-info { display: flex; align-items: center; gap: 12px; }
    .produto-thumb {
      width: 44px; height: 44px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: var(--surface);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      img { width: 100%; height: 100%; object-fit: cover; }
      .material-icons-round { font-size: 22px; color: var(--border); }
    }
    .produto-info div { display: flex; flex-direction: column; gap: 2px; }
    .produto-info strong { font-size: 0.9rem; }
    .produto-info span { font-size: 0.78rem; color: var(--text-secondary); }

    .preco-col { font-family: var(--font-display); color: var(--primary); }

    .row-actions { display: flex; gap: 4px; }
    .icon-btn {
      width: 32px; height: 32px;
      border-radius: 50%; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: var(--transition);
      .material-icons-round { font-size: 17px; }
      &.edit { background: var(--surface); color: var(--text-secondary); &:hover { background: #E0F0FF; color: #2563EB; } }
      &.delete { background: var(--surface); color: var(--text-secondary); &:hover { background: #FFF5F5; color: #DC2626; } }
    }

    /* MODAL */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      z-index: 200; padding: 24px;
      animation: fadeIn 0.2s ease;
      backdrop-filter: blur(4px);
    }

    .modal-card {
      background: white;
      border-radius: var(--radius-xl);
      width: 100%; max-width: 520px;
      box-shadow: var(--shadow-lg);
      animation: fadeIn 0.2s ease;
    }

    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      h3 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
    }

    .close-btn {
      width: 32px; height: 32px;
      border-radius: 50%; background: var(--surface);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-secondary); cursor: pointer; border: none;
      &:hover { color: var(--text); }
      .material-icons-round { font-size: 18px; }
    }

    .modal-body {
      padding: 24px;
      display: flex; flex-direction: column; gap: 16px;
    }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .input-wrap.no-icon {
      input, select, textarea {
        width: 100%;
        padding: 11px 14px;
        border: 1.5px solid var(--border);
        border-radius: var(--radius-md);
        font-family: var(--font-body); font-size: 0.9rem;
        background: var(--bg-secondary); color: var(--text);
        transition: var(--transition);
        &:focus { border-color: var(--primary); background: white; outline: none; box-shadow: 0 0 0 3px rgba(255,107,0,0.1); }
      }
      textarea { resize: none; }
    }

    label { font-size: 0.83rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; display: block; }

    .toggle-group { display: flex; }
    .toggle-label {
      display: flex; align-items: center; gap: 10px;
      cursor: pointer; font-size: 0.9rem; color: var(--text);
      input[type=checkbox] { display: none; }
    }
    .toggle-switch {
      width: 44px; height: 24px;
      background: var(--border);
      border-radius: 100px;
      position: relative;
      transition: var(--transition);
      flex-shrink: 0;
      &::after {
        content: ''; position: absolute;
        width: 18px; height: 18px;
        background: white; border-radius: 50%;
        top: 3px; left: 3px;
        transition: var(--transition);
        box-shadow: var(--shadow-sm);
      }
    }
    .toggle-label input:checked ~ .toggle-switch {
      background: var(--primary);
      &::after { left: 23px; }
    }

    .modal-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 16px 24px;
      border-top: 1px solid var(--border);
    }

    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
  `]
})
export class AdminComponent implements OnInit {
  tab: Tab = 'pedidos';
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  produtos: Produto[] = [];
  loadingPedidos = true;
  loadingProdutos = true;
  loadingSave = false;
  statusFiltro = 'TODOS';
  statusList = ['TODOS', 'PENDENTE', 'CONFIRMADO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO'];
  modalOpen = false;
  editando = false;
  editId: number | null = null;

  formProduto: Partial<ProdutoRequest> = this.resetForm();
  categorias: Categoria[] = [];

  stats: any[] = [];

  constructor(
    private pedidoService: PedidoService,
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private authService: AuthService
  ) {}

  get pedidosPendentes(): number {
    return this.pedidos.filter(p => p.status === 'PENDENTE').length;
  }

  get adminInitial(): string {
    return this.authService.getUser()?.nome?.charAt(0).toUpperCase() || 'A';
  }

  ngOnInit(): void {
    this.carregarPedidos();
    this.carregarProdutos();
    this.categoriaService.listar().subscribe(cats => this.categorias = cats);
  }

  carregarPedidos(): void {
    this.pedidoService.listarTodos().subscribe({
      next: (p) => {
        this.pedidos = p;
        this.filtrarPedidos();
        this.calcularStats();
        this.loadingPedidos = false;
      },
      error: () => this.loadingPedidos = false
    });
  }

  carregarProdutos(): void {
    this.produtoService.listarTodos().subscribe({
      next: (p) => { this.produtos = p; this.loadingProdutos = false; },
      error: () => this.loadingProdutos = false
    });
  }

  filtrarPedidos(): void {
    this.pedidosFiltrados = this.statusFiltro === 'TODOS'
      ? this.pedidos
      : this.pedidos.filter(p => p.status === this.statusFiltro);
  }

  calcularStats(): void {
    const total = this.pedidos.length;
    const pendentes = this.pedidos.filter(p => p.status === 'PENDENTE').length;
    const entregues = this.pedidos.filter(p => p.status === 'ENTREGUE').length;
    const receita = this.pedidos.filter(p => p.status === 'ENTREGUE').reduce((a, p) => a + p.total, 0);
    this.stats = [
      { icon: 'receipt_long', label: 'Total de pedidos', value: total, bg: '#FFF0E6', color: 'var(--primary)' },
      { icon: 'schedule', label: 'Pendentes', value: pendentes, bg: '#FFF8E1', color: '#F59E0B' },
      { icon: 'check_circle', label: 'Entregues', value: entregues, bg: '#E8F8F0', color: '#059669' },
      { icon: 'payments', label: 'Receita', value: `R$ ${receita.toFixed(2)}`, bg: '#EEF2FF', color: '#4F46E5' }
    ];
  }

  atualizarStatus(pedido: Pedido, status: string): void {
    this.pedidoService.atualizarStatus(pedido.id, status).subscribe({
      next: (p) => { pedido.status = p.status; this.calcularStats(); }
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      'PENDENTE': 'Pendente', 'CONFIRMADO': 'Confirmado',
      'EM_PREPARO': 'Em preparo', 'SAIU_PARA_ENTREGA': 'Saiu para entrega',
      'ENTREGUE': 'Entregue', 'CANCELADO': 'Cancelado'
    };
    return map[status] || status;
  }

  abrirModal(): void {
    this.editando = false;
    this.editId = null;
    this.formProduto = this.resetForm();
    this.modalOpen = true;
  }

  editarProduto(p: Produto): void {
    this.editando = true;
    this.editId = p.id;
    this.formProduto = {
      nome: p.nome,
      descricao: p.descricao,
      preco: p.preco,
      imagemUrl: p.imagemUrl,
      disponivel: p.disponivel,
      categoriaId: p.categoria?.id ?? null
    };
    this.modalOpen = true;
  }

  fecharModal(): void { this.modalOpen = false; }

  salvarProduto(): void {
    if (!this.formProduto.nome || !this.formProduto.preco) return;
    this.loadingSave = true;
    const obs = this.editando && this.editId
      ? this.produtoService.atualizar(this.editId, this.formProduto as ProdutoRequest)
      : this.produtoService.criar(this.formProduto as ProdutoRequest);
    obs.subscribe({
      next: () => { this.loadingSave = false; this.fecharModal(); this.carregarProdutos(); },
      error: () => { this.loadingSave = false; }
    });
  }

  deletarProduto(id: number): void {
    if (!confirm('Deseja excluir este produto?')) return;
    this.produtoService.deletar(id).subscribe({ next: () => this.carregarProdutos() });
  }

  resetForm(): Partial<ProdutoRequest> {
    return { nome: '', descricao: '', preco: 0, categoriaId: null, disponivel: true, imagemUrl: '' };
  }

  logout(): void { this.authService.logout(); }
}
