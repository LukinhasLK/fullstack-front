


  import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Pedido {
  id: number;
  cliente: string;
  itens: string[];
  total: number;
  status: 'PENDENTE' | 'CONFIRMADO' | 'EM_PREPARO' | 'SAIU_PARA_ENTREGA' | 'ENTREGUE' | 'CANCELADO';
  hora: string;
}

interface Prato {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
  imagemUrl: string;
}

interface ProdutoEstoque {
  id: number;
  nome: string;
  quantidade: number;
  minimo: number;
  unidade: string;
}

@Component({
  selector: 'app-dashboard-cozinha',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="kitchen-layout">

      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <span class="material-icons-round">storefront</span>
          <span>Cozinha</span>
        </div>

        <nav class="sidebar-nav">
          <a class="nav-item" [class.active]="activeTab === 'pedidos'" (click)="activeTab = 'pedidos'">
            <span class="material-icons-round">receipt_long</span>
            <span>Pedidos</span>
            <div class="nav-badge" *ngIf="pendentes > 0">{{ pendentes }}</div>
          </a>
          <a class="nav-item" [class.active]="activeTab === 'dashboard'" (click)="activeTab = 'dashboard'">
            <span class="material-icons-round">bar_chart</span>
            <span>Dashboard</span>
          </a>
          <a class="nav-item" [class.active]="activeTab === 'estoque'" (click)="activeTab = 'estoque'">
            <span class="material-icons-round">inventory_2</span>
            <span>Estoque</span>
            <div class="nav-badge danger" *ngIf="estoqueBaixo > 0">{{ estoqueBaixo }}</div>
          </a>
          <a class="nav-item" [class.active]="activeTab === 'cardapio'" (click)="activeTab = 'cardapio'">
            <span class="material-icons-round">menu_book</span>
            <span>Cardápio</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a class="nav-item logout" routerLink="/cozinha/login">
            <span class="material-icons-round">logout</span>
            <span>Sair</span>
          </a>
        </div>
      </aside>

      <!-- CONTEÚDO -->
      <main class="main-content">

        <!-- ===== ABA: PEDIDOS ===== -->
        <div *ngIf="activeTab === 'pedidos'" class="fade-in">
          <div class="page-header">
            <div>
              <h1>Pedidos</h1>
              <p>{{ pedidos.length }} pedidos hoje</p>
            </div>
            <div class="header-actions">
              <div class="status-filter">
                <button
                  *ngFor="let s of statusFiltros"
                  class="filter-btn"
                  [class.active]="filtroStatus === s.value"
                  (click)="filtroStatus = s.value">
                  {{ s.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="pedidos-grid">
            <div
              class="pedido-card"
              *ngFor="let p of pedidosFiltrados"
              [class]="'status-' + p.status.toLowerCase()">

              <div class="pedido-header">
                <div class="pedido-id">#{{ p.id }}</div>
                <div class="pedido-hora">
                  <span class="material-icons-round">schedule</span> {{ p.hora }}
                </div>
              </div>

              <div class="pedido-cliente">
                <span class="material-icons-round">person</span>
                {{ p.cliente }}
              </div>

              <ul class="pedido-itens">
                <li *ngFor="let item of p.itens">{{ item }}</li>
              </ul>

              <div class="pedido-footer">
                <div class="pedido-total">R$ {{ p.total.toFixed(2) }}</div>
                <div class="status-tag" [class]="'tag-' + p.status.toLowerCase()">
                  {{ statusLabel(p.status) }}
                </div>
              </div>

              <div class="pedido-actions">
                <button
                  class="btn btn-primary btn-sm"
                  *ngIf="p.status === 'PENDENTE'"
                  (click)="atualizarStatus(p, 'CONFIRMADO')">
                  <span class="material-icons-round">check</span> Confirmar
                </button>
                <button
                  class="btn btn-primary btn-sm"
                  *ngIf="p.status === 'CONFIRMADO'"
                  (click)="atualizarStatus(p, 'EM_PREPARO')">
                  <span class="material-icons-round">soup_kitchen</span> Iniciar preparo
                </button>
                <button
                  class="btn btn-primary btn-sm"
                  *ngIf="p.status === 'EM_PREPARO'"
                  (click)="atualizarStatus(p, 'SAIU_PARA_ENTREGA')">
                  <span class="material-icons-round">delivery_dining</span> Enviar
                </button>
                <button
                  class="btn btn-outline btn-sm danger"
                  *ngIf="p.status === 'PENDENTE' || p.status === 'CONFIRMADO'"
                  (click)="atualizarStatus(p, 'CANCELADO')">
                  Cancelar
                </button>
                <button
                  class="icon-btn edit"
                  (click)="abrirEdicaoPedido(p)"
                  title="Editar pedido">
                  <span class="material-icons-round">edit</span>
                </button>
                <button
                  class="icon-btn delete"
                  (click)="abrirConfirmacaoDeletePedido(p)"
                  title="Excluir pedido">
                  <span class="material-icons-round">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== ABA: DASHBOARD ===== -->
        <div *ngIf="activeTab === 'dashboard'" class="fade-in">
          <div class="page-header">
            <div>
              <h1>Dashboard</h1>
              <p>Resumo de hoje</p>
            </div>
          </div>

          <!-- Métricas principais -->
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-icon orange">
                <span class="material-icons-round">attach_money</span>
              </div>
              <div class="metric-info">
                <div class="metric-value">R$ {{ totalVendas.toFixed(2) }}</div>
                <div class="metric-label">Total vendido hoje</div>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-icon green">
                <span class="material-icons-round">receipt_long</span>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ pedidosEntregues }}</div>
                <div class="metric-label">Pedidos entregues</div>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-icon blue">
                <span class="material-icons-round">pending</span>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ pendentes }}</div>
                <div class="metric-label">Pedidos pendentes</div>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-icon purple">
                <span class="material-icons-round">star</span>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ ticketMedio }}</div>
                <div class="metric-label">Ticket médio</div>
              </div>
            </div>
          </div>

          <!-- Produtos mais vendidos -->
          <div class="section-card">
            <h3>
              <span class="material-icons-round">trending_up</span>
              Produtos mais vendidos hoje
            </h3>

            <div class="ranking-list">
              <div class="ranking-item" *ngFor="let p of maisVendidos; let i = index">
                <div class="rank-num" [class.gold]="i===0" [class.silver]="i===1" [class.bronze]="i===2">
                  {{ i + 1 }}
                </div>
                <div class="rank-info">
                  <div class="rank-nome">{{ p.nome }}</div>
                  <div class="rank-bar-wrap">
                    <div class="rank-bar" [style.width]="(p.vendas / maisVendidos[0].vendas * 100) + '%'"></div>
                  </div>
                </div>
                <div class="rank-vendas">{{ p.vendas }} un.</div>
              </div>
            </div>
          </div>

          <!-- Status dos pedidos -->
          <div class="section-card">
            <h3>
              <span class="material-icons-round">donut_large</span>
              Status dos pedidos de hoje
            </h3>
            <div class="status-summary">
              <div class="status-item" *ngFor="let s of resumoStatus">
                <div class="status-circle" [class]="s.cor"></div>
                <span class="status-nome">{{ s.label }}</span>
                <span class="status-count">{{ s.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== ABA: ESTOQUE ===== -->
        <div *ngIf="activeTab === 'estoque'" class="fade-in">
          <div class="page-header">
            <div>
              <h1>Estoque</h1>
              <p>Controle de ingredientes e produtos</p>
            </div>
            <button class="btn btn-primary" (click)="mostrarModal = true">
              <span class="material-icons-round">add</span> Adicionar item
            </button>
          </div>

          <div class="estoque-table-wrap">
            <table class="estoque-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Mínimo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of estoque" [class.low]="item.quantidade <= item.minimo">
                  <td class="td-nome">{{ item.nome }}</td>
                  <td>{{ item.quantidade }} {{ item.unidade }}</td>
                  <td>{{ item.minimo }} {{ item.unidade }}</td>
                  <td>
                    <span class="estoque-tag" [class.ok]="item.quantidade > item.minimo" [class.baixo]="item.quantidade <= item.minimo">
                      <span class="material-icons-round">{{ item.quantidade > item.minimo ? 'check_circle' : 'warning' }}</span>
                      {{ item.quantidade > item.minimo ? 'OK' : 'Estoque baixo' }}
                    </span>
                  </td>
                  <td>
                    <div class="td-actions">
                      <button class="icon-btn" (click)="ajustarEstoque(item, 1)" title="Adicionar">
                        <span class="material-icons-round">add</span>
                      </button>
                      <button class="icon-btn danger" (click)="ajustarEstoque(item, -1)" title="Remover" [disabled]="item.quantidade <= 0">
                        <span class="material-icons-round">remove</span>
                      </button>
                      <button class="icon-btn edit" (click)="abrirEdicao(item)" title="Editar">
                        <span class="material-icons-round">edit</span>
                      </button>
                      <button class="icon-btn delete" (click)="abrirConfirmacaoDelete(item)" title="Excluir">
                        <span class="material-icons-round">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ===== ABA: CARDÁPIO ===== -->
        <div *ngIf="activeTab === 'cardapio'" class="fade-in">
          <div class="page-header">
            <div>
              <h1>Cardápio</h1>
              <p>{{ cardapio.length }} pratos cadastrados</p>
            </div>
            <button class="btn btn-primary" (click)="abrirModalNovoPrato()">
              <span class="material-icons-round">add</span> Novo prato
            </button>
          </div>

          <!-- Filtro de categoria -->
          <div class="status-filter" style="margin-bottom: 20px;">
            <button
              *ngFor="let c of categoriasCardapio"
              class="filter-btn"
              [class.active]="filtroCategoria === c"
              (click)="filtroCategoria = c">
              {{ c }}
            </button>
          </div>

          <!-- Grid de pratos -->
          <div class="cardapio-grid">
            <div class="prato-card" *ngFor="let p of cardapioFiltrado" [class.inativo]="!p.disponivel">

              <div class="prato-img-wrap">
                <img
                  *ngIf="p.imagemUrl"
                  [src]="p.imagemUrl"
                  [alt]="p.nome"
                  class="prato-img"
                  (error)="p.imagemUrl = ''" />
                <div class="prato-sem-foto" *ngIf="!p.imagemUrl">
                  <span class="material-icons-round">no_photography</span>
                  <span>Sem foto</span>
                </div>
                <div class="prato-disponivel-badge" [class.ativo]="p.disponivel" [class.inativo]="!p.disponivel">
                  <span class="material-icons-round">{{ p.disponivel ? 'check_circle' : 'cancel' }}</span>
                  {{ p.disponivel ? 'Disponível' : 'Indisponível' }}
                </div>
              </div>

              <div class="prato-body">
                <div class="prato-categoria">{{ p.categoria }}</div>
                <div class="prato-nome">{{ p.nome }}</div>
                <div class="prato-descricao">{{ p.descricao }}</div>
                <div class="prato-footer">
                  <div class="prato-preco">R$ {{ p.preco.toFixed(2) }}</div>
                  <div class="prato-actions">
                    <button class="icon-btn" (click)="toggleDisponivel(p)" [title]="p.disponivel ? 'Desativar' : 'Ativar'">
                      <span class="material-icons-round">{{ p.disponivel ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                    <button class="icon-btn edit" (click)="abrirEdicaoPrato(p)" title="Editar prato">
                      <span class="material-icons-round">edit</span>
                    </button>
                    <button class="icon-btn delete" (click)="abrirDeletePrato(p)" title="Excluir prato">
                      <span class="material-icons-round">delete</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div class="cardapio-vazio" *ngIf="cardapioFiltrado.length === 0">
              <span class="material-icons-round">restaurant_menu</span>
              <p>Nenhum prato encontrado nesta categoria.</p>
            </div>
          </div>
        </div>

      </main>
    </div>

    <!-- MODAL: ADICIONAR / EDITAR PRATO -->
    <div class="modal-overlay" *ngIf="mostrarModalPrato" (click)="fecharModalPrato()">
      <div class="modal-box" (click)="$event.stopPropagation()">

        <div class="modal-header">
          <h2>
            <span class="material-icons-round">{{ pratoEditando?.id ? 'edit' : 'add_circle' }}</span>
            {{ pratoEditando?.id ? 'Editar prato' : 'Novo prato' }}
          </h2>
          <button class="modal-close" (click)="fecharModalPrato()">
            <span class="material-icons-round">close</span>
          </button>
        </div>

        <!-- SUCESSO -->
        <div class="modal-sucesso fade-in" *ngIf="sucessoPrato">
          <div class="modal-sucesso-icone">
            <span class="material-icons-round">check</span>
          </div>
          <h3>{{ sucessoPratoMensagem }}</h3>
          <div class="modal-sucesso-prato" *ngIf="ultimoPratoSalvo">
            <div class="modal-sucesso-foto">
              <img *ngIf="ultimoPratoSalvo.imagemUrl" [src]="ultimoPratoSalvo.imagemUrl" alt="foto" />
              <span *ngIf="!ultimoPratoSalvo.imagemUrl" class="material-icons-round">restaurant</span>
            </div>
            <div class="modal-sucesso-info">
              <div class="modal-sucesso-nome">{{ ultimoPratoSalvo.nome }}</div>
              <div class="modal-sucesso-detalhes">
                <span class="sucesso-tag-cat">{{ ultimoPratoSalvo.categoria }}</span>
                <span class="sucesso-preco">R$ {{ ultimoPratoSalvo.preco.toFixed(2) }}</span>
              </div>
            </div>
          </div>
          <button class="btn btn-primary" style="width:100%" (click)="fecharModalPrato()">
            <span class="material-icons-round">check</span> Fechar
          </button>
        </div>

        <div class="modal-body" *ngIf="pratoEditando && !sucessoPrato">

          <div class="form-group">
            <label>Nome do prato *</label>
            <input type="text" [(ngModel)]="pratoEditando.nome" class="form-input"
              [class.input-error]="erroPratoNome" placeholder="Ex: Pizza Calabresa" />
            <span class="field-error" *ngIf="erroPratoNome">Informe o nome do prato</span>
          </div>

          <div class="form-group">
            <label>Descrição</label>
            <textarea [(ngModel)]="pratoEditando.descricao" class="form-input form-textarea"
              placeholder="Ingredientes, tamanho, observações..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Preço (R$) *</label>
              <input type="number" [(ngModel)]="pratoEditando.preco" class="form-input"
                [class.input-error]="erroPratoPreco" min="0" step="0.01" placeholder="0,00" />
              <span class="field-error" *ngIf="erroPratoPreco">Preço inválido</span>
            </div>
            <div class="form-group">
              <label>Categoria *</label>
              <select [(ngModel)]="pratoEditando.categoria" class="form-input form-select"
                [class.input-error]="erroPratoCategoria">
                <option value="">Selecione...</option>
                <option *ngFor="let c of categoriasDisponiveis" [value]="c">{{ c }}</option>
              </select>
              <span class="field-error" *ngIf="erroPratoCategoria">Selecione uma categoria</span>
            </div>
          </div>

          <div class="form-group">
            <label>Foto do prato</label>

            <!-- Seletor de modo -->
            <div class="foto-modo-tabs">
              <button type="button" class="foto-modo-tab" [class.active]="modoFoto === 'upload'" (click)="modoFoto = 'upload'">
                <span class="material-icons-round">upload</span> Upload
              </button>
              <button type="button" class="foto-modo-tab" [class.active]="modoFoto === 'url'" (click)="modoFoto = 'url'">
                <span class="material-icons-round">link</span> URL
              </button>
            </div>

            <!-- MODO: UPLOAD -->
            <ng-container *ngIf="modoFoto === 'upload'">
              <div class="prato-upload-area" (click)="pratoFotoInput.click()">
                <input #pratoFotoInput type="file" accept="image/*" class="prato-file-input" (change)="onFotoPratoSelecionada($event)" />
                <div class="prato-upload-preview" *ngIf="pratoEditando.imagemUrl">
                  <img [src]="pratoEditando.imagemUrl" alt="Foto do prato" class="prato-upload-img" />
                  <div class="prato-upload-overlay">
                    <span class="material-icons-round">photo_camera</span>
                    <span>Alterar foto</span>
                  </div>
                </div>
                <div class="prato-upload-placeholder" *ngIf="!pratoEditando.imagemUrl">
                  <span class="material-icons-round">add_photo_alternate</span>
                  <span class="prato-upload-txt">Clique para adicionar uma foto</span>
                  <span class="prato-upload-sub">PNG, JPG ou WEBP</span>
                </div>
              </div>
              <button type="button" class="prato-remover-foto" *ngIf="pratoEditando.imagemUrl" (click)="pratoEditando.imagemUrl = ''">
                <span class="material-icons-round">delete</span> Remover foto
              </button>
            </ng-container>

            <!-- MODO: URL -->
            <ng-container *ngIf="modoFoto === 'url'">
              <input
                type="text"
                [(ngModel)]="pratoEditando.imagemUrl"
                class="form-input"
                placeholder="https://exemplo.com/foto-do-prato.jpg" />
              <div class="url-preview-wrap" *ngIf="pratoEditando.imagemUrl">
                <img
                  [src]="pratoEditando.imagemUrl"
                  alt="Preview"
                  class="url-preview-img"
                  (error)="pratoEditando.imagemUrl = ''" />
              </div>
            </ng-container>

          </div>

          <div class="form-group">
            <label>Disponibilidade</label>
            <div class="toggle-wrap" (click)="pratoEditando.disponivel = !pratoEditando.disponivel">
              <div class="toggle" [class.on]="pratoEditando.disponivel">
                <div class="toggle-knob"></div>
              </div>
              <span>{{ pratoEditando.disponivel ? 'Disponível no cardápio' : 'Indisponível' }}</span>
            </div>
          </div>

        </div>

        <div class="modal-footer" *ngIf="!sucessoPrato">
          <button class="btn btn-outline" (click)="fecharModalPrato()">Cancelar</button>
          <button class="btn btn-primary" (click)="salvarPrato()">
            <span class="material-icons-round">save</span>
            {{ pratoEditando?.id ? 'Salvar' : 'Adicionar' }}
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL: CONFIRMAR EXCLUSÃO DE PRATO -->
    <div class="modal-overlay" *ngIf="mostrarDeletePrato" (click)="fecharDeletePrato()">
      <div class="modal-box modal-box-sm" (click)="$event.stopPropagation()">

        <div class="modal-header">
          <h2>
            <span class="material-icons-round delete-icon">delete_forever</span>
            Excluir prato
          </h2>
          <button class="modal-close" (click)="fecharDeletePrato()">
            <span class="material-icons-round">close</span>
          </button>
        </div>

        <div class="modal-body" *ngIf="pratoParaDeletar">
          <div class="delete-confirm-msg">
            <p>Tem certeza que deseja excluir o prato</p>
            <strong>"{{ pratoParaDeletar.nome }}"</strong>
            <p>do cardápio? Essa ação não pode ser desfeita.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" (click)="fecharDeletePrato()">Cancelar</button>
          <button class="btn btn-danger" (click)="confirmarDeletePrato()">
            <span class="material-icons-round">delete</span>
            Excluir
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL: EDITAR PEDIDO -->
    <div class="modal-overlay" *ngIf="mostrarModalEdicaoPedido" (click)="fecharEdicaoPedido()">
      <div class="modal-box" (click)="$event.stopPropagation()">

        <div class="modal-header">
          <h2>
            <span class="material-icons-round">edit</span>
            Editar pedido #{{ pedidoEditando?.id }}
          </h2>
          <button class="modal-close" (click)="fecharEdicaoPedido()">
            <span class="material-icons-round">close</span>
          </button>
        </div>

        <div class="modal-body" *ngIf="pedidoEditando">

          <div class="form-group">
            <label>Cliente</label>
            <input
              type="text"
              [(ngModel)]="pedidoEditando.cliente"
              class="form-input"
              [class.input-error]="erroEdicaoPedidoCliente"
              placeholder="Nome do cliente" />
            <span class="field-error" *ngIf="erroEdicaoPedidoCliente">Informe o nome do cliente</span>
          </div>

          <div class="form-group">
            <label>Itens do pedido</label>
            <div class="itens-list">
              <div class="item-row" *ngFor="let _ of pedidoEditando.itens; let i = index">
                <input
                  type="text"
                  [(ngModel)]="pedidoEditando.itens[i]"
                  class="form-input"
                  placeholder="Ex: 1x Pizza Calabresa" />
                <button class="icon-btn delete" (click)="removerItemPedido(i)" [disabled]="pedidoEditando.itens.length === 1" title="Remover item">
                  <span class="material-icons-round">remove</span>
                </button>
              </div>
            </div>
            <button class="btn-add-item" (click)="adicionarItemPedido()">
              <span class="material-icons-round">add</span> Adicionar item
            </button>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Total (R$)</label>
              <input
                type="number"
                [(ngModel)]="pedidoEditando.total"
                class="form-input"
                [class.input-error]="erroEdicaoPedidoTotal"
                min="0"
                step="0.01"
                placeholder="0,00" />
              <span class="field-error" *ngIf="erroEdicaoPedidoTotal">Total inválido</span>
            </div>
            <div class="form-group">
              <label>Hora</label>
              <input
                type="time"
                [(ngModel)]="pedidoEditando.hora"
                class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label>Status</label>
            <div class="status-options">
              <button
                *ngFor="let s of todosStatus"
                class="status-opt-btn"
                [class.selected]="pedidoEditando.status === s.value"
                [class]="'status-opt-btn ' + s.cor + (pedidoEditando.status === s.value ? ' selected' : '')"
                (click)="pedidoEditando.status = s.value">
                {{ s.label }}
              </button>
            </div>
          </div>

        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" (click)="fecharEdicaoPedido()">Cancelar</button>
          <button class="btn btn-primary" (click)="salvarEdicaoPedido()">
            <span class="material-icons-round">save</span>
            Salvar
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL: CONFIRMAR EXCLUSÃO DE PEDIDO -->
    <div class="modal-overlay" *ngIf="mostrarModalDeletePedido" (click)="fecharModalDeletePedido()">
      <div class="modal-box modal-box-sm" (click)="$event.stopPropagation()">

        <div class="modal-header">
          <h2>
            <span class="material-icons-round delete-icon">delete_forever</span>
            Excluir pedido
          </h2>
          <button class="modal-close" (click)="fecharModalDeletePedido()">
            <span class="material-icons-round">close</span>
          </button>
        </div>

        <div class="modal-body" *ngIf="pedidoParaDeletar">
          <div class="delete-confirm-msg">
            <p>Tem certeza que deseja excluir o pedido</p>
            <strong>#{{ pedidoParaDeletar.id }} — {{ pedidoParaDeletar.cliente }}</strong>
            <p>Essa ação não pode ser desfeita.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" (click)="fecharModalDeletePedido()">Cancelar</button>
          <button class="btn btn-danger" (click)="confirmarDeletePedido()">
            <span class="material-icons-round">delete</span>
            Excluir
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL: CONFIRMAR EXCLUSÃO -->
    <div class="modal-overlay" *ngIf="mostrarModalDelete" (click)="fecharModalDelete()">
      <div class="modal-box modal-box-sm" (click)="$event.stopPropagation()">

        <div class="modal-header">
          <h2>
            <span class="material-icons-round delete-icon">delete_forever</span>
            Excluir item
          </h2>
          <button class="modal-close" (click)="fecharModalDelete()">
            <span class="material-icons-round">close</span>
          </button>
        </div>

        <div class="modal-body" *ngIf="itemParaDeletar">
          <div class="delete-confirm-msg">
            <p>Tem certeza que deseja excluir o item</p>
            <strong>"{{ itemParaDeletar.nome }}"</strong>
            <p>do estoque? Essa ação não pode ser desfeita.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" (click)="fecharModalDelete()">Cancelar</button>
          <button class="btn btn-danger" (click)="confirmarDelete()">
            <span class="material-icons-round">delete</span>
            Excluir
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL: EDITAR ITEM DO ESTOQUE -->
    <div class="modal-overlay" *ngIf="mostrarModalEdicao" (click)="fecharModalEdicao()">
      <div class="modal-box" (click)="$event.stopPropagation()">

        <div class="modal-header">
          <h2>
            <span class="material-icons-round">edit</span>
            Editar item do estoque
          </h2>
          <button class="modal-close" (click)="fecharModalEdicao()">
            <span class="material-icons-round">close</span>
          </button>
        </div>

        <div class="modal-body" *ngIf="itemEditando">
          <div class="form-group">
            <label>Nome do produto *</label>
            <input
              type="text"
              [(ngModel)]="itemEditando.nome"
              placeholder="Ex: Tomate, Queijo prato..."
              class="form-input"
              [class.input-error]="erroEdicaoNome" />
            <span class="field-error" *ngIf="erroEdicaoNome">Informe o nome do produto</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Quantidade *</label>
              <input
                type="number"
                [(ngModel)]="itemEditando.quantidade"
                placeholder="0"
                min="0"
                class="form-input"
                [class.input-error]="erroEdicaoQuantidade" />
              <span class="field-error" *ngIf="erroEdicaoQuantidade">Quantidade inválida</span>
            </div>
            <div class="form-group">
              <label>Mínimo *</label>
              <input
                type="number"
                [(ngModel)]="itemEditando.minimo"
                placeholder="0"
                min="0"
                class="form-input"
                [class.input-error]="erroEdicaoMinimo" />
              <span class="field-error" *ngIf="erroEdicaoMinimo">Mínimo inválido</span>
            </div>
          </div>

          <div class="form-group">
            <label>Unidade *</label>
            <div class="unidade-options">
              <button
                *ngFor="let u of unidadesDisponiveis"
                class="unidade-btn"
                [class.selected]="itemEditando.unidade === u"
                (click)="itemEditando.unidade = u">
                {{ u }}
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" (click)="fecharModalEdicao()">Cancelar</button>
          <button class="btn btn-primary" (click)="salvarEdicao()">
            <span class="material-icons-round">save</span>
            Salvar
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL: ADICIONAR ITEM AO ESTOQUE -->
    <div class="modal-overlay" *ngIf="mostrarModal" (click)="fecharModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">

        <div class="modal-header">
          <h2>
            <span class="material-icons-round">inventory_2</span>
            Adicionar item ao estoque
          </h2>
          <button class="modal-close" (click)="fecharModal()">
            <span class="material-icons-round">close</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Nome do produto *</label>
            <input
              type="text"
              [(ngModel)]="novoItem.nome"
              placeholder="Ex: Tomate, Queijo prato..."
              class="form-input"
              [class.input-error]="erroNome" />
            <span class="field-error" *ngIf="erroNome">Informe o nome do produto</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Quantidade *</label>
              <input
                type="number"
                [(ngModel)]="novoItem.quantidade"
                placeholder="0"
                min="0"
                class="form-input"
                [class.input-error]="erroQuantidade" />
              <span class="field-error" *ngIf="erroQuantidade">Quantidade inválida</span>
            </div>
            <div class="form-group">
              <label>Mínimo *</label>
              <input
                type="number"
                [(ngModel)]="novoItem.minimo"
                placeholder="0"
                min="0"
                class="form-input"
                [class.input-error]="erroMinimo" />
              <span class="field-error" *ngIf="erroMinimo">Mínimo inválido</span>
            </div>
          </div>

          <div class="form-group">
            <label>Unidade *</label>
            <div class="unidade-options">
              <button
                *ngFor="let u of unidadesDisponiveis"
                class="unidade-btn"
                [class.selected]="novoItem.unidade === u"
                (click)="novoItem.unidade = u">
                {{ u }}
              </button>
            </div>
            <span class="field-error" *ngIf="erroUnidade">Selecione uma unidade</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" (click)="fecharModal()">Cancelar</button>
          <button class="btn btn-primary" (click)="salvarItem()">
            <span class="material-icons-round">add</span>
            Adicionar
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .kitchen-layout {
      display: flex; min-height: 100vh;
      background: var(--bg-secondary);
    }

    /* SIDEBAR */
    .sidebar {
      width: 220px; background: white;
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column;
      padding: 24px 0; position: sticky; top: 0; height: 100vh;
    }

    .sidebar-logo {
      display: flex; align-items: center; gap: 10px;
      padding: 0 20px 24px;
      font-family: var(--font-display); font-weight: 700; font-size: 1.15rem;
      color: var(--primary); border-bottom: 1px solid var(--border);
      margin-bottom: 12px;
      .material-icons-round { font-size: 26px; }
    }

    .sidebar-nav { flex: 1; padding: 0 12px; display: flex; flex-direction: column; gap: 4px; }

    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 11px 12px; border-radius: var(--radius-md);
      font-size: 0.9rem; font-weight: 500; color: var(--text-secondary);
      cursor: pointer; transition: var(--transition);
      text-decoration: none; position: relative;

      .material-icons-round { font-size: 20px; }

      &:hover { background: var(--surface); color: var(--text); }
      &.active { background: var(--primary-soft); color: var(--primary); font-weight: 600; }
      &.logout { color: #e53e3e; &:hover { background: #fff5f5; } }
    }

    .nav-badge {
      margin-left: auto;
      min-width: 20px; height: 20px; padding: 0 6px;
      background: var(--primary); color: white;
      border-radius: 100px; font-size: 0.72rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      &.danger { background: #e53e3e; }
    }

    .sidebar-footer { padding: 12px; border-top: 1px solid var(--border); margin-top: 8px; }

    /* MAIN */
    .main-content { flex: 1; padding: 32px; overflow-y: auto; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 28px;
      h1 { font-family: var(--font-display); font-size: 1.8rem; font-weight: 700; color: var(--text); }
      p { color: var(--text-secondary); font-size: 0.9rem; margin-top: 2px; }
    }

    /* FILTRO */
    .status-filter { display: flex; gap: 6px; flex-wrap: wrap; }

    .filter-btn {
      padding: 7px 14px; border-radius: 100px; border: 1.5px solid var(--border);
      background: white; font-size: 0.82rem; font-weight: 500; color: var(--text-secondary);
      cursor: pointer; transition: var(--transition);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary); border-color: var(--primary); color: white; }
    }

    /* PEDIDOS */
    .pedidos-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;
    }

    .pedido-card {
      background: white; border-radius: var(--radius-lg);
      border: 1.5px solid var(--border); padding: 20px;
      display: flex; flex-direction: column; gap: 12px;
      transition: var(--transition);

      &:hover { box-shadow: var(--shadow-md); }
      &.status-pendente { border-left: 4px solid #F6AD55; }
      &.status-confirmado { border-left: 4px solid #63B3ED; }
      &.status-em_preparo { border-left: 4px solid var(--primary); }
      &.status-saiu_para_entrega { border-left: 4px solid #9F7AEA; }
      &.status-entregue { border-left: 4px solid #68D391; }
      &.status-cancelado { border-left: 4px solid #FC8181; opacity: 0.7; }
    }

    .pedido-header {
      display: flex; justify-content: space-between; align-items: center;
    }

    .pedido-id { font-family: var(--font-display); font-weight: 700; font-size: 1rem; color: var(--text); }

    .pedido-hora {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.8rem; color: var(--text-muted);
      .material-icons-round { font-size: 14px; }
    }

    .pedido-cliente {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.88rem; color: var(--text-secondary); font-weight: 500;
      .material-icons-round { font-size: 16px; }
    }

    .pedido-itens {
      font-size: 0.85rem; color: var(--text); display: flex; flex-direction: column; gap: 2px;
      li::before { content: '• '; color: var(--primary); }
    }

    .pedido-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 8px; border-top: 1px solid var(--border);
    }

    .pedido-total { font-weight: 700; font-size: 1.05rem; color: var(--text); }

    .status-tag {
      padding: 4px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 600;
      &.tag-pendente { background: #FEFCBF; color: #975a16; }
      &.tag-confirmado { background: #EBF8FF; color: #2b6cb0; }
      &.tag-em_preparo { background: var(--primary-soft); color: var(--primary-dark); }
      &.tag-saiu_para_entrega { background: #FAF5FF; color: #6b46c1; }
      &.tag-entregue { background: #F0FFF4; color: #276749; }
      &.tag-cancelado { background: #fff5f5; color: #c53030; }
    }

    .pedido-actions { display: flex; gap: 8px; flex-wrap: wrap; }

    .btn-outline.danger {
      color: #e53e3e; border-color: #e53e3e;
      &:hover { background: #fff5f5; }
    }

    /* DASHBOARD */
    .metrics-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px; margin-bottom: 24px;
    }

    .metric-card {
      background: white; border-radius: var(--radius-lg);
      border: 1px solid var(--border); padding: 20px;
      display: flex; align-items: center; gap: 16px;
      transition: var(--transition);
      &:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
    }

    .metric-icon {
      width: 48px; height: 48px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      .material-icons-round { font-size: 24px; color: white; }
      &.orange { background: var(--primary); }
      &.green { background: #1a9e5c; }
      &.blue { background: #3182ce; }
      &.purple { background: #6b46c1; }
    }

    .metric-value { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .metric-label { font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px; }

    .section-card {
      background: white; border-radius: var(--radius-lg);
      border: 1px solid var(--border); padding: 24px; margin-bottom: 16px;

      h3 {
        font-family: var(--font-display); font-size: 1rem; font-weight: 700;
        color: var(--text); margin-bottom: 20px;
        display: flex; align-items: center; gap: 8px;
        .material-icons-round { font-size: 20px; color: var(--primary); }
      }
    }

    .ranking-list { display: flex; flex-direction: column; gap: 14px; }

    .ranking-item { display: flex; align-items: center; gap: 14px; }

    .rank-num {
      width: 28px; height: 28px; border-radius: 50%;
      background: var(--surface); color: var(--text-secondary);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.82rem; font-weight: 700; flex-shrink: 0;
      &.gold { background: #FFD700; color: #7d5800; }
      &.silver { background: #C0C0C0; color: #555; }
      &.bronze { background: #CD7F32; color: white; }
    }

    .rank-info { flex: 1; }
    .rank-nome { font-size: 0.9rem; font-weight: 500; margin-bottom: 4px; }
    .rank-bar-wrap { height: 6px; background: var(--surface); border-radius: 100px; overflow: hidden; }
    .rank-bar { height: 100%; background: var(--primary); border-radius: 100px; transition: width 0.6s ease; }
    .rank-vendas { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); white-space: nowrap; }

    .status-summary { display: flex; flex-direction: column; gap: 10px; }

    .status-item { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
    .status-circle { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .status-nome { flex: 1; color: var(--text-secondary); }
    .status-count { font-weight: 700; color: var(--text); }

    /* ESTOQUE */
    .estoque-table-wrap {
      background: white; border-radius: var(--radius-lg);
      border: 1px solid var(--border); overflow: hidden;
    }

    .estoque-table {
      width: 100%; border-collapse: collapse;

      th {
        padding: 14px 20px; text-align: left; font-size: 0.8rem;
        font-weight: 600; color: var(--text-secondary);
        background: var(--bg-secondary); border-bottom: 1px solid var(--border);
        text-transform: uppercase; letter-spacing: 0.05em;
      }

      td {
        padding: 14px 20px; font-size: 0.9rem; color: var(--text);
        border-bottom: 1px solid var(--border);
      }

      tr:last-child td { border-bottom: none; }
      tr.low td { background: #fff5f5; }
      tr:hover td { background: var(--bg-secondary); }
    }

    .td-nome { font-weight: 500; }

    .estoque-tag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: 100px; font-size: 0.78rem; font-weight: 600;
      .material-icons-round { font-size: 14px; }
      &.ok { background: #F0FFF4; color: #276749; }
      &.baixo { background: #fff5f5; color: #c53030; }
    }

    .td-actions { display: flex; gap: 6px; }

    .icon-btn {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      background: var(--surface); color: var(--text);
      display: flex; align-items: center; justify-content: center;
      border: none; cursor: pointer; transition: var(--transition);
      .material-icons-round { font-size: 18px; }
      &:hover { background: var(--primary); color: white; }
      &.danger:hover { background: #e53e3e; }
      &.edit:hover { background: #3182ce; color: white; }
      &.delete:hover { background: #e53e3e; color: white; }
      &:disabled { opacity: 0.4; cursor: not-allowed; &:hover { background: var(--surface); color: var(--text); } }
    }

    /* MODAL */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 16px;
      animation: fadeIn 0.15s ease;
    }

    .modal-box {
      background: white; border-radius: var(--radius-lg);
      width: 100%; max-width: 480px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      animation: slideUp 0.2s ease;
      overflow: hidden;
    }

    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid var(--border);

      h2 {
        display: flex; align-items: center; gap: 8px;
        font-family: var(--font-display); font-size: 1.05rem; font-weight: 700;
        color: var(--text);
        .material-icons-round { font-size: 20px; color: var(--primary); }
      }
    }

    .modal-close {
      width: 32px; height: 32px; border-radius: 50%;
      border: none; background: var(--surface); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-secondary); transition: var(--transition);
      .material-icons-round { font-size: 18px; }
      &:hover { background: #fee2e2; color: #e53e3e; }
    }

    .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .form-group { display: flex; flex-direction: column; gap: 6px; }

    .form-group label {
      font-size: 0.82rem; font-weight: 600;
      color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;
    }

    .form-input {
      padding: 10px 14px; border: 1.5px solid var(--border);
      border-radius: var(--radius-md); font-size: 0.9rem; color: var(--text);
      transition: var(--transition); outline: none; width: 100%; box-sizing: border-box;
      &:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(255,107,0,0.12); }
      &.input-error { border-color: #e53e3e; }
    }

    .field-error { font-size: 0.78rem; color: #e53e3e; margin-top: 2px; }

    .unidade-options { display: flex; gap: 8px; flex-wrap: wrap; }

    .unidade-btn {
      padding: 8px 16px; border-radius: var(--radius-md);
      border: 1.5px solid var(--border); background: white;
      font-size: 0.85rem; font-weight: 500; color: var(--text-secondary);
      cursor: pointer; transition: var(--transition);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.selected { background: var(--primary); border-color: var(--primary); color: white; font-weight: 600; }
    }

    .modal-footer {
      display: flex; justify-content: flex-end; gap: 10px;
      padding: 16px 24px; border-top: 1px solid var(--border);
      background: var(--bg-secondary);
    }

    /* CARDÁPIO */
    .cardapio-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;
    }

    .prato-card {
      background: white; border-radius: var(--radius-lg);
      border: 1.5px solid var(--border); overflow: hidden;
      transition: var(--transition);
      &:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
      &.inativo { opacity: 0.6; }
    }

    .prato-img-wrap { position: relative; height: 160px; background: var(--bg-secondary); overflow: hidden; }

    .prato-sem-foto {
      width: 100%; height: 100%;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
      color: var(--text-muted);
      .material-icons-round { font-size: 36px; opacity: 0.4; }
      span:last-child { font-size: 0.75rem; font-weight: 500; opacity: 0.6; }
    }

    .prato-img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .prato-disponivel-badge {
      position: absolute; top: 10px; right: 10px;
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: 100px;
      font-size: 0.75rem; font-weight: 600;
      .material-icons-round { font-size: 13px; }
      &.ativo { background: #F0FFF4; color: #276749; }
      &.inativo { background: #fff5f5; color: #c53030; }
    }

    .prato-body { padding: 16px; display: flex; flex-direction: column; gap: 6px; }

    .prato-categoria {
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.07em; color: var(--primary);
    }

    .prato-nome { font-weight: 700; font-size: 1rem; color: var(--text); }

    .prato-descricao {
      font-size: 0.83rem; color: var(--text-secondary); line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    .prato-footer {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 8px; padding-top: 12px; border-top: 1px solid var(--border);
    }

    .prato-preco { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--text); }

    .prato-actions { display: flex; gap: 6px; }

    .cardapio-vazio {
      grid-column: 1 / -1; text-align: center; padding: 60px 20px;
      color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 12px;
      .material-icons-round { font-size: 48px; opacity: 0.4; }
      p { font-size: 0.9rem; }
    }

    /* TOGGLE */
    .toggle-wrap {
      display: flex; align-items: center; gap: 12px;
      cursor: pointer; user-select: none;
      font-size: 0.9rem; color: var(--text-secondary);
    }

    .toggle {
      width: 44px; height: 24px; border-radius: 100px;
      background: var(--border); position: relative; transition: var(--transition);
      flex-shrink: 0;
      &.on { background: var(--primary); }
    }

    .toggle-knob {
      position: absolute; top: 3px; left: 3px;
      width: 18px; height: 18px; border-radius: 50%;
      background: white; transition: var(--transition);
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
      .toggle.on & { left: 23px; }
    }

    /* SUCESSO PRATO */
    .modal-sucesso {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; padding: 32px 24px; text-align: center;

      h3 { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; color: var(--text); margin: 0; }
    }

    .modal-sucesso-icone {
      width: 64px; height: 64px; border-radius: 50%;
      background: #F0FFF4; border: 3px solid #68D391;
      display: flex; align-items: center; justify-content: center;
      animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      .material-icons-round { font-size: 32px; color: #1a9e5c; }
    }

    .modal-sucesso-prato {
      display: flex; align-items: center; gap: 14px;
      background: var(--bg-secondary); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 14px 18px;
      width: 100%; text-align: left;
    }

    .modal-sucesso-foto {
      width: 52px; height: 52px; border-radius: var(--radius-md);
      background: white; border: 1.5px solid var(--border);
      overflow: hidden; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      img { width: 100%; height: 100%; object-fit: cover; }
      .material-icons-round { font-size: 24px; color: var(--text-muted); }
    }

    .modal-sucesso-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }

    .modal-sucesso-nome { font-weight: 700; font-size: 0.95rem; color: var(--text); }

    .modal-sucesso-detalhes { display: flex; align-items: center; gap: 8px; }

    .sucesso-tag-cat {
      padding: 2px 10px; border-radius: 100px;
      background: var(--primary-soft); color: var(--primary);
      font-size: 0.72rem; font-weight: 700;
    }

    .sucesso-preco { font-size: 0.9rem; font-weight: 700; color: var(--text); }

    /* TABS MODO FOTO */
    .foto-modo-tabs {
      display: flex; gap: 0; margin-bottom: 10px;
      border: 1.5px solid var(--border); border-radius: var(--radius-md);
      overflow: hidden;
    }

    .foto-modo-tab {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 8px 12px; border: none; background: white;
      font-size: 0.83rem; font-weight: 600; color: var(--text-secondary);
      cursor: pointer; transition: var(--transition);
      .material-icons-round { font-size: 16px; }
      &:first-child { border-right: 1.5px solid var(--border); }
      &:hover { background: var(--bg-secondary); }
      &.active { background: var(--primary-soft); color: var(--primary); }
    }

    .url-preview-wrap {
      margin-top: 10px; border-radius: var(--radius-md); overflow: hidden;
      border: 1.5px solid var(--border); height: 140px;
    }

    .url-preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }

    /* UPLOAD FOTO DO PRATO */
    .prato-file-input { display: none; }

    .prato-upload-area {
      border: 2px dashed var(--border); border-radius: var(--radius-md);
      overflow: hidden; cursor: pointer; transition: var(--transition);
      &:hover { border-color: var(--primary); }
    }

    .prato-upload-placeholder {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 6px;
      padding: 28px 16px; background: var(--bg-secondary);
      .material-icons-round { font-size: 36px; color: var(--text-muted); }
    }

    .prato-upload-txt { font-size: 0.88rem; font-weight: 600; color: var(--text-secondary); }
    .prato-upload-sub { font-size: 0.75rem; color: var(--text-muted); }

    .prato-upload-preview {
      position: relative; height: 160px;
      &:hover .prato-upload-overlay { opacity: 1; }
    }

    .prato-upload-img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .prato-upload-overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,0.45);
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 6px; opacity: 0; transition: var(--transition);
      color: white; font-size: 0.85rem; font-weight: 600;
      .material-icons-round { font-size: 28px; }
    }

    .prato-remover-foto {
      display: inline-flex; align-items: center; gap: 4px; margin-top: 8px;
      padding: 4px 10px; border-radius: var(--radius-sm);
      border: 1px solid #fed7d7; background: #fff5f5;
      color: #c53030; font-size: 0.78rem; font-weight: 600;
      cursor: pointer; transition: var(--transition);
      .material-icons-round { font-size: 14px; }
      &:hover { background: #fed7d7; }
    }

    /* FORM EXTRA */
    .form-textarea {
      resize: vertical; min-height: 80px; font-family: inherit; line-height: 1.5;
    }

    .form-select { cursor: pointer; }

    .modal-box-sm { max-width: 380px; }

    .itens-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }

    .item-row { display: flex; gap: 8px; align-items: center; }
    .item-row .form-input { flex: 1; }

    .btn-add-item {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: var(--radius-md);
      border: 1.5px dashed var(--border); background: transparent;
      font-size: 0.83rem; font-weight: 500; color: var(--text-secondary);
      cursor: pointer; transition: var(--transition);
      .material-icons-round { font-size: 16px; }
      &:hover { border-color: var(--primary); color: var(--primary); }
    }

    .status-options { display: flex; gap: 8px; flex-wrap: wrap; }

    .status-opt-btn {
      padding: 6px 14px; border-radius: 100px;
      border: 1.5px solid var(--border); background: white;
      font-size: 0.82rem; font-weight: 500; color: var(--text-secondary);
      cursor: pointer; transition: var(--transition);
      &:hover { border-color: var(--text-secondary); }
      &.selected { font-weight: 700; border-width: 2px; }
      &.amarelo.selected  { background: #FEFCBF; color: #975a16; border-color: #F6AD55; }
      &.azul.selected     { background: #EBF8FF; color: #2b6cb0; border-color: #63B3ED; }
      &.laranja.selected  { background: var(--primary-soft); color: var(--primary-dark); border-color: var(--primary); }
      &.roxo.selected     { background: #FAF5FF; color: #6b46c1; border-color: #9F7AEA; }
      &.verde.selected    { background: #F0FFF4; color: #276749; border-color: #68D391; }
      &.vermelho.selected { background: #fff5f5; color: #c53030; border-color: #FC8181; }
    }

    .delete-icon { color: #e53e3e !important; }

    .delete-confirm-msg {
      text-align: center; padding: 8px 0; display: flex; flex-direction: column;
      align-items: center; gap: 6px;
      p { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }
      strong { font-size: 1rem; color: var(--text); }
    }

    .btn-danger {
      padding: 10px 20px; border-radius: var(--radius-md);
      background: #e53e3e; color: white; border: none;
      font-size: 0.88rem; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; gap: 6px;
      transition: var(--transition);
      .material-icons-round { font-size: 18px; }
      &:hover { background: #c53030; }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class DashboardCozinhaComponent implements OnInit {
  activeTab = 'pedidos';
  filtroStatus = 'TODOS';
  mostrarModal = false;

  unidadesDisponiveis = ['kg', 'g', 'un', 'L', 'ml', 'cx', 'pct'];

  novoItem: ProdutoEstoque = { id: 0, nome: '', quantidade: 0, minimo: 0, unidade: 'kg' };

  erroNome = false;
  erroQuantidade = false;
  erroMinimo = false;
  erroUnidade = false;

  mostrarModalEdicao = false;
  itemEditando: ProdutoEstoque | null = null;
  itemEditandoOriginalId: number | null = null;

  erroEdicaoNome = false;
  erroEdicaoQuantidade = false;
  erroEdicaoMinimo = false;

  mostrarModalDelete = false;
  itemParaDeletar: ProdutoEstoque | null = null;

  mostrarModalDeletePedido = false;
  pedidoParaDeletar: Pedido | null = null;

  // CARDÁPIO
  filtroCategoria = 'Todos';
  categoriasCardapio = ['Todos', 'Pizza', 'Hambúrguer', 'Japonês', 'Saudável', 'Sobremesas', 'Bebidas'];
  categoriasDisponiveis = ['Pizza', 'Hambúrguer', 'Japonês', 'Saudável', 'Sobremesas', 'Bebidas'];

  cardapio: Prato[] = [
    { id: 1, nome: 'Pizza Calabresa', descricao: 'Molho de tomate, mussarela e calabresa fatiada. Borda recheada opcional.', preco: 45.90, categoria: 'Pizza', disponivel: true, imagemUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80' },
    { id: 2, nome: 'Pizza Mussarela', descricao: 'Molho de tomate artesanal, mussarela de búfala e manjericão fresco.', preco: 42.00, categoria: 'Pizza', disponivel: true, imagemUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80' },
    { id: 3, nome: 'X-Burguer Clássico', descricao: 'Pão brioche, blend 180g, queijo cheddar, alface, tomate e maionese artesanal.', preco: 32.00, categoria: 'Hambúrguer', disponivel: true, imagemUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
    { id: 4, nome: 'Combo Frango Grelhado', descricao: 'Frango grelhado temperado, arroz, feijão, salada e suco natural.', preco: 38.50, categoria: 'Saudável', disponivel: true, imagemUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80' },
    { id: 5, nome: 'Hot Roll Camarão', descricao: 'Sushi frito recheado com camarão, cream cheese e cebolinha.', preco: 29.90, categoria: 'Japonês', disponivel: false, imagemUrl: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80' },
    { id: 6, nome: 'Brownie com Sorvete', descricao: 'Brownie quentinho de chocolate 70% com bola de sorvete de creme.', preco: 18.00, categoria: 'Sobremesas', disponivel: true, imagemUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80' },
  ];

  mostrarModalPrato = false;
  pratoEditando: Prato | null = null;
  modoFoto: 'upload' | 'url' = 'upload';
  erroPratoNome = false;
  erroPratoPreco = false;
  erroPratoCategoria = false;
  sucessoPrato = false;
  sucessoPratoMensagem = '';
  ultimoPratoSalvo: Prato | null = null;

  mostrarDeletePrato = false;
  pratoParaDeletar: Prato | null = null;

  mostrarModalEdicaoPedido = false;
  pedidoEditando: Pedido | null = null;
  pedidoEditandoOriginalId: number | null = null;

  erroEdicaoPedidoCliente = false;
  erroEdicaoPedidoTotal = false;

  todosStatus: { label: string; value: Pedido['status']; cor: string }[] = [
    { label: 'Pendente',        value: 'PENDENTE',           cor: 'amarelo'  },
    { label: 'Confirmado',      value: 'CONFIRMADO',         cor: 'azul'     },
    { label: 'Em preparo',      value: 'EM_PREPARO',         cor: 'laranja'  },
    { label: 'Saiu p/ entrega', value: 'SAIU_PARA_ENTREGA',  cor: 'roxo'     },
    { label: 'Entregue',        value: 'ENTREGUE',           cor: 'verde'    },
    { label: 'Cancelado',       value: 'CANCELADO',          cor: 'vermelho' },
  ];

  statusFiltros = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Pendentes', value: 'PENDENTE' },
    { label: 'Em preparo', value: 'EM_PREPARO' },
    { label: 'Entregues', value: 'ENTREGUE' },
  ];

  // Dados mockados — serão substituídos pela API
  pedidos: Pedido[] = [
    { id: 1042, cliente: 'Ana Silva', itens: ['1x Pizza Calabresa', '1x Coca-Cola'], total: 45.90, status: 'PENDENTE', hora: '14:32' },
    { id: 1041, cliente: 'Carlos Mendes', itens: ['2x X-Burguer', '2x Fritas'], total: 62.00, status: 'EM_PREPARO', hora: '14:18' },
    { id: 1040, cliente: 'Julia Costa', itens: ['1x Combo Frango', '1x Suco'], total: 38.50, status: 'SAIU_PARA_ENTREGA', hora: '13:55' },
    { id: 1039, cliente: 'Rafael Lima', itens: ['1x Pizza Mussarela'], total: 35.00, status: 'ENTREGUE', hora: '13:20' },
    { id: 1038, cliente: 'Beatriz Souza', itens: ['3x Pastel', '1x Guaraná'], total: 28.00, status: 'CANCELADO', hora: '12:50' },
  ];

  maisVendidos = [
    { nome: 'Pizza Calabresa', vendas: 24 },
    { nome: 'X-Burguer', vendas: 18 },
    { nome: 'Combo Frango', vendas: 15 },
    { nome: 'Pizza Mussarela', vendas: 12 },
    { nome: 'Pastel', vendas: 9 },
  ];

  estoque: ProdutoEstoque[] = [
    { id: 1, nome: 'Farinha de trigo', quantidade: 15, minimo: 5, unidade: 'kg' },
    { id: 2, nome: 'Queijo mussarela', quantidade: 3, minimo: 4, unidade: 'kg' },
    { id: 3, nome: 'Calabresa', quantidade: 8, minimo: 3, unidade: 'kg' },
    { id: 4, nome: 'Coca-Cola 350ml', quantidade: 2, minimo: 12, unidade: 'un' },
    { id: 5, nome: 'Frango', quantidade: 10, minimo: 5, unidade: 'kg' },
    { id: 6, nome: 'Batata', quantidade: 20, minimo: 8, unidade: 'kg' },
  ];

  get pendentes(): number {
    return this.pedidos.filter(p => p.status === 'PENDENTE').length;
  }

  get pedidosEntregues(): number {
    return this.pedidos.filter(p => p.status === 'ENTREGUE').length;
  }

  get totalVendas(): number {
    return this.pedidos.filter(p => p.status === 'ENTREGUE').reduce((s, p) => s + p.total, 0);
  }

  get ticketMedio(): string {
    const entregues = this.pedidos.filter(p => p.status === 'ENTREGUE');
    if (!entregues.length) return 'R$ 0,00';
    return 'R$ ' + (entregues.reduce((s, p) => s + p.total, 0) / entregues.length).toFixed(2);
  }

  get estoqueBaixo(): number {
    return this.estoque.filter(e => e.quantidade <= e.minimo).length;
  }

  get pedidosFiltrados(): Pedido[] {
    if (this.filtroStatus === 'TODOS') return this.pedidos;
    return this.pedidos.filter(p => p.status === this.filtroStatus);
  }

  get resumoStatus() {
    return [
      { label: 'Pendente', count: this.pedidos.filter(p => p.status === 'PENDENTE').length, cor: 'orange' },
      { label: 'Em preparo', count: this.pedidos.filter(p => p.status === 'EM_PREPARO').length, cor: 'orange' },
      { label: 'Entregue', count: this.pedidosEntregues, cor: 'green' },
      { label: 'Cancelado', count: this.pedidos.filter(p => p.status === 'CANCELADO').length, cor: 'red' },
    ];
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDENTE: 'Pendente', CONFIRMADO: 'Confirmado',
      EM_PREPARO: 'Em preparo', SAIU_PARA_ENTREGA: 'Saiu p/ entrega',
      ENTREGUE: 'Entregue', CANCELADO: 'Cancelado'
    };
    return map[status] || status;
  }

  atualizarStatus(pedido: Pedido, novoStatus: Pedido['status']): void {
    pedido.status = novoStatus;
    // TODO: conectar com PedidoService para atualizar no backend
  }

  ajustarEstoque(item: ProdutoEstoque, delta: number): void {
    item.quantidade = Math.max(0, item.quantidade + delta);
    // TODO: conectar com EstoqueService para atualizar no backend
  }

  abrirEdicaoPedido(pedido: Pedido): void {
    this.pedidoEditando = { ...pedido, itens: [...pedido.itens] };
    this.pedidoEditandoOriginalId = pedido.id;
    this.erroEdicaoPedidoCliente = false;
    this.erroEdicaoPedidoTotal = false;
    this.mostrarModalEdicaoPedido = true;
  }

  fecharEdicaoPedido(): void {
    this.mostrarModalEdicaoPedido = false;
    this.pedidoEditando = null;
    this.pedidoEditandoOriginalId = null;
    this.erroEdicaoPedidoCliente = false;
    this.erroEdicaoPedidoTotal = false;
  }

  adicionarItemPedido(): void {
    this.pedidoEditando?.itens.push('');
  }

  removerItemPedido(index: number): void {
    this.pedidoEditando?.itens.splice(index, 1);
  }

  salvarEdicaoPedido(): void {
    if (!this.pedidoEditando) return;

    this.erroEdicaoPedidoCliente = !this.pedidoEditando.cliente.trim();
    this.erroEdicaoPedidoTotal = this.pedidoEditando.total < 0;

    if (this.erroEdicaoPedidoCliente || this.erroEdicaoPedidoTotal) return;

    const idx = this.pedidos.findIndex(p => p.id === this.pedidoEditandoOriginalId);
    if (idx !== -1) {
      this.pedidos[idx] = {
        ...this.pedidoEditando,
        itens: this.pedidoEditando.itens.filter(i => i.trim() !== ''),
      };
    }
    this.fecharEdicaoPedido();
  }

  get cardapioFiltrado(): Prato[] {
    if (this.filtroCategoria === 'Todos') return this.cardapio;
    return this.cardapio.filter(p => p.categoria === this.filtroCategoria);
  }

  onFotoPratoSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo || !this.pratoEditando) return;

    const reader = new FileReader();
    reader.onload = () => { this.pratoEditando!.imagemUrl = reader.result as string; };
    reader.readAsDataURL(arquivo);
    input.value = '';
  }

  toggleDisponivel(prato: Prato): void {
    prato.disponivel = !prato.disponivel;
  }

  abrirModalNovoPrato(): void {
    this.pratoEditando = { id: 0, nome: '', descricao: '', preco: 0, categoria: '', disponivel: true, imagemUrl: '' };
    this.modoFoto = 'upload';
    this.erroPratoNome = false;
    this.erroPratoPreco = false;
    this.erroPratoCategoria = false;
    this.mostrarModalPrato = true;
  }

  abrirEdicaoPrato(prato: Prato): void {
    this.pratoEditando = { ...prato };
    this.modoFoto = prato.imagemUrl.startsWith('data:') ? 'upload' : 'url';
    this.erroPratoNome = false;
    this.erroPratoPreco = false;
    this.erroPratoCategoria = false;
    this.mostrarModalPrato = true;
  }

  fecharModalPrato(): void {
    this.mostrarModalPrato = false;
    this.pratoEditando = null;
  }

  salvarPrato(): void {
    if (!this.pratoEditando) return;
    this.erroPratoNome = !this.pratoEditando.nome.trim();
    this.erroPratoPreco = this.pratoEditando.preco <= 0;
    this.erroPratoCategoria = !this.pratoEditando.categoria;
    if (this.erroPratoNome || this.erroPratoPreco || this.erroPratoCategoria) return;

    if (this.pratoEditando.id === 0) {
      const novoId = Math.max(...this.cardapio.map(p => p.id), 0) + 1;
      this.cardapio.push({ ...this.pratoEditando, id: novoId });
    } else {
      const idx = this.cardapio.findIndex(p => p.id === this.pratoEditando!.id);
      if (idx !== -1) this.cardapio[idx] = { ...this.pratoEditando };
    }
    this.fecharModalPrato();
  }

  abrirDeletePrato(prato: Prato): void {
    this.pratoParaDeletar = prato;
    this.mostrarDeletePrato = true;
  }

  fecharDeletePrato(): void {
    this.mostrarDeletePrato = false;
    this.pratoParaDeletar = null;
  }

  confirmarDeletePrato(): void {
    if (!this.pratoParaDeletar) return;
    this.cardapio = this.cardapio.filter(p => p.id !== this.pratoParaDeletar!.id);
    this.fecharDeletePrato();
  }

  abrirConfirmacaoDeletePedido(pedido: Pedido): void {
    this.pedidoParaDeletar = pedido;
    this.mostrarModalDeletePedido = true;
  }

  fecharModalDeletePedido(): void {
    this.mostrarModalDeletePedido = false;
    this.pedidoParaDeletar = null;
  }

  confirmarDeletePedido(): void {
    if (!this.pedidoParaDeletar) return;
    this.pedidos = this.pedidos.filter(p => p.id !== this.pedidoParaDeletar!.id);
    this.fecharModalDeletePedido();
  }

  abrirConfirmacaoDelete(item: ProdutoEstoque): void {
    this.itemParaDeletar = item;
    this.mostrarModalDelete = true;
  }

  fecharModalDelete(): void {
    this.mostrarModalDelete = false;
    this.itemParaDeletar = null;
  }

  confirmarDelete(): void {
    if (!this.itemParaDeletar) return;
    this.estoque = this.estoque.filter(e => e.id !== this.itemParaDeletar!.id);
    this.fecharModalDelete();
  }

  abrirEdicao(item: ProdutoEstoque): void {
    this.itemEditando = { ...item };
    this.itemEditandoOriginalId = item.id;
    this.erroEdicaoNome = false;
    this.erroEdicaoQuantidade = false;
    this.erroEdicaoMinimo = false;
    this.mostrarModalEdicao = true;
  }

  fecharModalEdicao(): void {
    this.mostrarModalEdicao = false;
    this.itemEditando = null;
    this.itemEditandoOriginalId = null;
    this.erroEdicaoNome = false;
    this.erroEdicaoQuantidade = false;
    this.erroEdicaoMinimo = false;
  }

  salvarEdicao(): void {
    if (!this.itemEditando) return;

    this.erroEdicaoNome = !this.itemEditando.nome.trim();
    this.erroEdicaoQuantidade = this.itemEditando.quantidade < 0;
    this.erroEdicaoMinimo = this.itemEditando.minimo < 0;

    if (this.erroEdicaoNome || this.erroEdicaoQuantidade || this.erroEdicaoMinimo) return;

    const idx = this.estoque.findIndex(e => e.id === this.itemEditandoOriginalId);
    if (idx !== -1) {
      this.estoque[idx] = { ...this.itemEditando };
    }
    this.fecharModalEdicao();
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.novoItem = { id: 0, nome: '', quantidade: 0, minimo: 0, unidade: 'kg' };
    this.erroNome = false;
    this.erroQuantidade = false;
    this.erroMinimo = false;
    this.erroUnidade = false;
  }

  salvarItem(): void {
    this.erroNome = !this.novoItem.nome.trim();
    this.erroQuantidade = this.novoItem.quantidade < 0 || this.novoItem.quantidade === null;
    this.erroMinimo = this.novoItem.minimo < 0 || this.novoItem.minimo === null;
    this.erroUnidade = !this.novoItem.unidade;

    if (this.erroNome || this.erroQuantidade || this.erroMinimo || this.erroUnidade) return;

    const novoId = Math.max(...this.estoque.map(e => e.id), 0) + 1;
    this.estoque.push({ ...this.novoItem, id: novoId });
    this.fecharModal();
  }

  ngOnInit(): void {
    // TODO: carregar dados da API
  }
}
