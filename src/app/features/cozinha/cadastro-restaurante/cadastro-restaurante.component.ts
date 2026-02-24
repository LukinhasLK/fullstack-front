import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastro-restaurante',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <aside class="auth-visual">
        <div class="visual-inner">
          <div class="logo-big">
            <span class="material-icons-round">storefront</span>
          </div>
          <h1>Cadastre seu<br><span>restaurante.</span></h1>
          <p>Em poucos minutos seu restaurante estará pronto para receber pedidos.</p>
          <div class="steps">
            <div class="step"><div class="step-num">1</div><span>Dados do restaurante</span></div>
            <div class="step-line"></div>
            <div class="step"><div class="step-num">2</div><span>Endereço</span></div>
            <div class="step-line"></div>
            <div class="step"><div class="step-num">3</div><span>Pronto para vender</span></div>
          </div>
        </div>
        <div class="visual-blob blob1"></div>
        <div class="visual-blob blob2"></div>
      </aside>

      <main class="auth-form-area">
        <div class="form-card fade-in">
          <div class="brand-mobile">
            <span class="material-icons-round">storefront</span>
            <span>Cozinha</span>
          </div>

          <!-- Steps indicator -->
          <div class="step-indicator">
            <div class="step-dot" [class.active]="step >= 1" [class.done]="step > 1">
              <span class="material-icons-round" *ngIf="step > 1">check</span>
              <span *ngIf="step <= 1">1</span>
            </div>
            <div class="step-bar" [class.active]="step > 1"></div>
            <div class="step-dot" [class.active]="step >= 2" [class.done]="step > 2">
              <span class="material-icons-round" *ngIf="step > 2">check</span>
              <span *ngIf="step <= 2">2</span>
            </div>
            <div class="step-bar" [class.active]="step > 2"></div>
            <div class="step-dot" [class.active]="step >= 3">
              <span>3</span>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>

            <!-- STEP 1: Dados do Restaurante -->
            <div *ngIf="step === 1">
              <div class="form-header">
                <h2>Dados do restaurante</h2>
                <p>Informações básicas do seu estabelecimento</p>
              </div>

              <div class="fields">

                <!-- LOGO -->
                <div class="logo-upload-group">
                  <div class="logo-preview" (click)="logoInput.click()" [class.has-image]="logoPreview">
                    <img *ngIf="logoPreview" [src]="logoPreview" alt="Logo" class="logo-preview-img" />
                    <div class="logo-placeholder" *ngIf="!logoPreview">
                      <span class="material-icons-round">add_a_photo</span>
                      <span>Logo do restaurante</span>
                    </div>
                    <div class="logo-overlay">
                      <span class="material-icons-round">photo_camera</span>
                    </div>
                  </div>
                  <input #logoInput type="file" accept="image/*" class="logo-file-input" (change)="onLogoSelecionado($event)" />
                  <div class="logo-info">
                    <p class="logo-hint">Clique na imagem para selecionar o logo</p>
                    <p class="logo-sub">PNG, JPG ou WEBP · Recomendado 400×400px</p>
                    <button type="button" class="logo-remover" *ngIf="logoPreview" (click)="removerLogo()">
                      <span class="material-icons-round">delete</span> Remover
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label>Nome do restaurante</label>
                  <div class="input-wrap">
                    <span class="material-icons-round">storefront</span>
                    <input type="text" formControlName="nome" placeholder="Ex: Pizzaria do João" [class.error]="isInvalid('nome')"/>
                  </div>
                  <span class="error-msg" *ngIf="isInvalid('nome')">Nome obrigatório</span>
                </div>

                <div class="form-group">
                  <label>CNPJ</label>
                  <div class="input-wrap">
                    <span class="material-icons-round">badge</span>
                    <input type="text" formControlName="cnpj" placeholder="00.000.000/0000-00" [class.error]="isInvalid('cnpj')"/>
                  </div>
                  <span class="error-msg" *ngIf="isInvalid('cnpj')">CNPJ obrigatório</span>
                </div>

                <div class="form-group">
                  <label>Telefone</label>
                  <div class="input-wrap">
                    <span class="material-icons-round">phone</span>
                    <input type="tel" formControlName="telefone" placeholder="(00) 00000-0000" [class.error]="isInvalid('telefone')"/>
                  </div>
                  <span class="error-msg" *ngIf="isInvalid('telefone')">Telefone obrigatório</span>
                </div>

                <div class="form-group">
                  <label>E-mail</label>
                  <div class="input-wrap">
                    <span class="material-icons-round">mail_outline</span>
                    <input type="email" formControlName="email" placeholder="contato@restaurante.com" [class.error]="isInvalid('email')"/>
                  </div>
                  <span class="error-msg" *ngIf="isInvalid('email')">E-mail inválido</span>
                </div>

                <div class="form-group">
                  <label>Senha</label>
                  <div class="input-wrap">
                    <span class="material-icons-round">lock_outline</span>
                    <input [type]="showPassword ? 'text' : 'password'" formControlName="senha" placeholder="Mínimo 6 caracteres" [class.error]="isInvalid('senha')"/>
                    <button type="button" class="toggle-pass" (click)="showPassword = !showPassword">
                      <span class="material-icons-round">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                  </div>
                  <span class="error-msg" *ngIf="isInvalid('senha')">Senha obrigatória (mín. 6 caracteres)</span>
                </div>

                <div class="form-group">
                  <label>Categoria do restaurante *</label>
                  <p class="campo-dica">Selecione uma ou mais categorias</p>
                  <div class="categoria-grid">
                    <button
                      type="button"
                      *ngFor="let c of categorias"
                      class="categoria-btn"
                      [class.selected]="categoriasSelecionadas.includes(c.valor)"
                      (click)="toggleCategoria(c.valor)">
                      <span class="categoria-check material-icons-round" *ngIf="categoriasSelecionadas.includes(c.valor)">check_circle</span>
                      <span class="categoria-emoji">{{ c.emoji }}</span>
                      <span class="categoria-nome">{{ c.label }}</span>
                    </button>
                  </div>
                  <span class="error-msg" *ngIf="erroCategoria">Selecione ao menos uma categoria</span>
                </div>

                <div class="form-group">
                  <div class="horario-header">
                    <label>Horário de funcionamento *</label>
                    <button type="button" class="btn-aplicar-todos" (click)="aplicarATodos()">
                      <span class="material-icons-round">content_copy</span>
                      Aplicar 1ª linha a todos
                    </button>
                  </div>

                  <div class="horario-list">
                    <div class="horario-row" *ngFor="let h of horarios" [class.inativo]="!h.ativo">
                      <div class="horario-toggle" (click)="h.ativo = !h.ativo" [class.on]="h.ativo">
                        <div class="toggle-knob-small"></div>
                      </div>
                      <span class="horario-dia">{{ h.abreviacao }}</span>
                      <div class="horario-times" *ngIf="h.ativo">
                        <input type="time" [(ngModel)]="h.abertura" [ngModelOptions]="{standalone: true}" class="time-input" />
                        <span class="horario-sep">até</span>
                        <input type="time" [(ngModel)]="h.fechamento" [ngModelOptions]="{standalone: true}" class="time-input" />
                      </div>
                      <span class="horario-fechado" *ngIf="!h.ativo">Fechado</span>
                    </div>
                  </div>
                  <span class="error-msg" *ngIf="erroHorario">Configure ao menos um dia de funcionamento</span>
                </div>

              </div>

              <button type="button" class="btn btn-primary btn-lg submit-btn" (click)="nextStep()">
                Próximo <span class="material-icons-round">arrow_forward</span>
              </button>
            </div>

            <!-- STEP 2: Endereço -->
            <div *ngIf="step === 2">
              <div class="form-header">
                <h2>Endereço</h2>
                <p>Onde fica seu restaurante?</p>
              </div>

              <div class="fields">
                <div class="row-2">
                  <div class="form-group">
                    <label>CEP</label>
                    <div class="input-wrap">
                      <span class="material-icons-round">location_on</span>
                      <input type="text" formControlName="cep" placeholder="00000-000" [class.error]="isInvalid('cep')"/>
                    </div>
                    <span class="error-msg" *ngIf="isInvalid('cep')">CEP obrigatório</span>
                  </div>

                  <div class="form-group">
                    <label>Estado</label>
                    <div class="input-wrap no-icon">
                      <input type="text" formControlName="estado" placeholder="SP" maxlength="2" [class.error]="isInvalid('estado')"/>
                    </div>
                    <span class="error-msg" *ngIf="isInvalid('estado')">Estado obrigatório</span>
                  </div>
                </div>

                <div class="form-group">
                  <label>Cidade</label>
                  <div class="input-wrap">
                    <span class="material-icons-round">location_city</span>
                    <input type="text" formControlName="cidade" placeholder="São Paulo" [class.error]="isInvalid('cidade')"/>
                  </div>
                  <span class="error-msg" *ngIf="isInvalid('cidade')">Cidade obrigatória</span>
                </div>

                <div class="form-group">
                  <label>Bairro</label>
                  <div class="input-wrap">
                    <span class="material-icons-round">map</span>
                    <input type="text" formControlName="bairro" placeholder="Centro" [class.error]="isInvalid('bairro')"/>
                  </div>
                  <span class="error-msg" *ngIf="isInvalid('bairro')">Bairro obrigatório</span>
                </div>

                <div class="row-2">
                  <div class="form-group">
                    <label>Rua</label>
                    <div class="input-wrap">
                      <span class="material-icons-round">signpost</span>
                      <input type="text" formControlName="rua" placeholder="Rua das Flores" [class.error]="isInvalid('rua')"/>
                    </div>
                    <span class="error-msg" *ngIf="isInvalid('rua')">Rua obrigatória</span>
                  </div>

                  <div class="form-group">
                    <label>Número</label>
                    <div class="input-wrap no-icon">
                      <input type="text" formControlName="numero" placeholder="123" [class.error]="isInvalid('numero')"/>
                    </div>
                    <span class="error-msg" *ngIf="isInvalid('numero')">Número obrigatório</span>
                  </div>
                </div>

                <div class="form-group">
                  <label>Complemento <span class="optional">(opcional)</span></label>
                  <div class="input-wrap">
                    <span class="material-icons-round">info_outline</span>
                    <input type="text" formControlName="complemento" placeholder="Sala 2, Loja A..."/>
                  </div>
                </div>
              </div>

              <div class="btn-row">
                <button type="button" class="btn btn-ghost" (click)="step = 1">
                  <span class="material-icons-round">arrow_back</span> Voltar
                </button>
                <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading">
                  <div class="btn-spinner" *ngIf="loading"></div>
                  <span class="material-icons-round" *ngIf="!loading">check</span>
                  {{ loading ? 'Cadastrando...' : 'Finalizar cadastro' }}
                </button>
              </div>
            </div>

          </form>

          <!-- STEP 3: SUCESSO -->
          <div *ngIf="step === 3" class="sucesso-wrap fade-in">

            <div class="sucesso-icone">
              <div class="sucesso-circulo">
                <span class="material-icons-round">check</span>
              </div>
            </div>

            <h2 class="sucesso-titulo">Cadastro realizado!</h2>
            <p class="sucesso-subtitulo">
              Seu restaurante foi cadastrado com sucesso e está pronto para receber pedidos.
            </p>

            <!-- Logo + nome do restaurante -->
            <div class="sucesso-restaurante">
              <div class="sucesso-logo">
                <img *ngIf="logoPreview" [src]="logoPreview" alt="Logo" />
                <span *ngIf="!logoPreview" class="material-icons-round">storefront</span>
              </div>
              <div class="sucesso-info">
                <div class="sucesso-nome">{{ form.get('nome')?.value }}</div>
                <div class="sucesso-categorias">
                  <span *ngFor="let c of categoriasSelecionadas" class="sucesso-tag">{{ c }}</span>
                </div>
              </div>
            </div>

            <!-- Resumo -->
            <div class="sucesso-resumo">
              <div class="resumo-item">
                <span class="material-icons-round">mail_outline</span>
                <span>{{ form.get('email')?.value }}</span>
              </div>
              <div class="resumo-item">
                <span class="material-icons-round">phone</span>
                <span>{{ form.get('telefone')?.value }}</span>
              </div>
              <div class="resumo-item">
                <span class="material-icons-round">location_on</span>
                <span>{{ form.get('rua')?.value }}, {{ form.get('numero')?.value }} — {{ form.get('cidade')?.value }}/{{ form.get('estado')?.value }}</span>
              </div>
              <div class="resumo-item">
                <span class="material-icons-round">schedule</span>
                <span>{{ diasAtivos }} dias de funcionamento configurados</span>
              </div>
            </div>

            <a routerLink="/cozinha/login" class="btn btn-primary btn-lg sucesso-btn">
              <span class="material-icons-round">login</span>
              Fazer login agora
            </a>

          </div>

          <div class="form-footer" *ngIf="step === 1">
            <p>Já tem conta? <a routerLink="/cozinha/login">Fazer login</a></p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; min-height: 100vh; }

    .auth-visual {
      width: 45%;
      background: var(--primary);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;

      @media (max-width: 768px) { display: none; }
    }

    .visual-inner { position: relative; z-index: 2; padding: 48px; color: white; }

    .logo-big {
      width: 72px; height: 72px;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 32px; backdrop-filter: blur(8px);
      .material-icons-round { font-size: 36px; }
    }

    .visual-inner h1 {
      font-family: var(--font-display);
      font-size: 2.8rem; font-weight: 800; line-height: 1.15; margin-bottom: 16px;
      span { opacity: 0.85; }
    }

    .visual-inner p { font-size: 1.05rem; opacity: 0.85; line-height: 1.6; margin-bottom: 40px; }

    .steps { display: flex; flex-direction: column; gap: 8px; }

    .step {
      display: flex; align-items: center; gap: 12px;
      color: white; font-size: 0.9rem; font-weight: 500;
    }

    .step-num {
      width: 28px; height: 28px;
      background: rgba(255,255,255,0.25);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.85rem;
    }

    .step-line {
      width: 2px; height: 16px; background: rgba(255,255,255,0.2); margin-left: 13px;
    }

    .visual-blob { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.07); }
    .blob1 { width: 400px; height: 400px; bottom: -100px; right: -100px; }
    .blob2 { width: 200px; height: 200px; top: -50px; left: -50px; }

    .auth-form-area {
      flex: 1; display: flex; align-items: center; justify-content: center;
      padding: 24px; background: var(--bg-secondary);
    }

    .form-card {
      background: white; border-radius: var(--radius-xl);
      padding: 48px 40px; width: 100%; max-width: 480px;
      box-shadow: var(--shadow-lg);
      @media (max-width: 480px) { padding: 32px 24px; }
    }

    .brand-mobile {
      display: none; align-items: center; gap: 8px; margin-bottom: 24px;
      font-family: var(--font-display); font-weight: 700; font-size: 1.2rem; color: var(--primary);
      .material-icons-round { font-size: 28px; }
      @media (max-width: 768px) { display: flex; }
    }

    /* Step indicator */
    .step-indicator {
      display: flex; align-items: center; gap: 0;
      margin-bottom: 32px;
    }

    .step-dot {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--surface); color: var(--text-muted);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700;
      transition: var(--transition);
      .material-icons-round { font-size: 16px; }

      &.active { background: var(--primary); color: white; }
      &.done { background: #1a9e5c; color: white; }
    }

    .step-bar {
      flex: 1; height: 3px; background: var(--border);
      transition: var(--transition);
      &.active { background: var(--primary); }
    }

    .form-header {
      margin-bottom: 24px;
      h2 { font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
      p { color: var(--text-secondary); font-size: 0.9rem; }
    }

    .fields { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }

    /* LOGO UPLOAD */
    .logo-upload-group {
      display: flex; align-items: center; gap: 20px;
      padding: 16px; background: var(--bg-secondary);
      border-radius: var(--radius-lg); border: 1.5px dashed var(--border);
    }

    .logo-preview {
      width: 88px; height: 88px; border-radius: 50%;
      background: white; border: 2px dashed var(--border);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; overflow: hidden; position: relative;
      flex-shrink: 0; transition: var(--transition);

      &:hover { border-color: var(--primary); }
      &:hover .logo-overlay { opacity: 1; }
      &.has-image { border-style: solid; border-color: var(--primary); }
    }

    .logo-preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .logo-placeholder {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      color: var(--text-muted); font-size: 0.65rem; font-weight: 500;
      text-align: center; padding: 8px;
      .material-icons-round { font-size: 24px; }
    }

    .logo-overlay {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: var(--transition);
      .material-icons-round { font-size: 22px; color: white; }
    }

    .logo-file-input { display: none; }

    .logo-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }

    .logo-hint { font-size: 0.85rem; font-weight: 600; color: var(--text); margin: 0; }

    .logo-sub { font-size: 0.75rem; color: var(--text-muted); margin: 0; }

    /* CATEGORIAS */
    .categoria-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    }

    .categoria-btn {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 12px 8px; border-radius: var(--radius-md);
      border: 1.5px solid var(--border); background: white;
      cursor: pointer; transition: var(--transition);

      &:hover { border-color: var(--primary); background: var(--primary-soft); }
      &.selected {
        border-color: var(--primary); background: var(--primary-soft);
        box-shadow: 0 0 0 2px rgba(255,107,0,0.2);
      }
    }

    .campo-dica { font-size: 0.78rem; color: var(--text-muted); margin: -4px 0 8px; }

    .categoria-emoji { font-size: 1.5rem; line-height: 1; }

    .categoria-check {
      position: absolute; top: 6px; right: 6px;
      font-size: 16px !important; color: var(--primary);
    }

    .categoria-btn { position: relative; }

    .categoria-nome {
      font-size: 0.75rem; font-weight: 600; color: var(--text-secondary);
      text-align: center; line-height: 1.2;
      .categoria-btn.selected & { color: var(--primary); }
    }

    /* HORÁRIOS */
    .horario-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 10px;
      label { margin-bottom: 0; }
    }

    .btn-aplicar-todos {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: var(--radius-sm);
      border: 1.5px solid var(--border); background: white;
      font-size: 0.75rem; font-weight: 600; color: var(--text-secondary);
      cursor: pointer; transition: var(--transition); white-space: nowrap;
      .material-icons-round { font-size: 14px; }
      &:hover { border-color: var(--primary); color: var(--primary); }
    }

    .horario-list {
      display: flex; flex-direction: column; gap: 6px;
      border: 1.5px solid var(--border); border-radius: var(--radius-md);
      overflow: hidden;
    }

    .horario-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; background: white; transition: var(--transition);
      &:not(:last-child) { border-bottom: 1px solid var(--border); }
      &.inativo { background: var(--bg-secondary); }
    }

    .horario-toggle {
      width: 36px; height: 20px; border-radius: 100px;
      background: var(--border); position: relative;
      cursor: pointer; transition: var(--transition); flex-shrink: 0;
      &.on { background: var(--primary); }
    }

    .toggle-knob-small {
      position: absolute; top: 3px; left: 3px;
      width: 14px; height: 14px; border-radius: 50%;
      background: white; transition: var(--transition);
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      .horario-toggle.on & { left: 19px; }
    }

    .horario-dia {
      font-size: 0.82rem; font-weight: 700; color: var(--text);
      width: 32px; flex-shrink: 0;
    }

    .horario-times {
      display: flex; align-items: center; gap: 8px; flex: 1;
    }

    .time-input {
      padding: 5px 8px; border: 1.5px solid var(--border);
      border-radius: var(--radius-sm); font-size: 0.85rem;
      color: var(--text); background: var(--bg-secondary);
      transition: var(--transition); cursor: pointer;
      &:focus { outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 3px rgba(255,107,0,0.1); }
    }

    .horario-sep { font-size: 0.78rem; color: var(--text-muted); white-space: nowrap; }

    .horario-fechado { font-size: 0.8rem; color: var(--text-muted); font-style: italic; }

    .logo-remover {
      display: inline-flex; align-items: center; gap: 4px; margin-top: 4px;
      padding: 4px 10px; border-radius: var(--radius-sm);
      border: 1px solid #fed7d7; background: #fff5f5;
      color: #c53030; font-size: 0.78rem; font-weight: 600;
      cursor: pointer; transition: var(--transition);
      .material-icons-round { font-size: 14px; }
      &:hover { background: #fed7d7; }
    }

    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .input-wrap {
      position: relative; display: flex; align-items: center;

      .material-icons-round:first-child {
        position: absolute; left: 14px; font-size: 20px;
        color: var(--text-muted); pointer-events: none;
      }

      input {
        width: 100%; padding: 13px 16px 13px 44px;
        border: 1.5px solid var(--border); border-radius: var(--radius-md);
        font-size: 0.95rem; background: var(--bg-secondary); color: var(--text);
        transition: var(--transition);

        &::placeholder { color: var(--text-muted); }
        &:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 3px rgba(255,107,0,0.1); }
        &.error { border-color: #e53e3e; }
      }

      &.no-icon input { padding-left: 16px; }
    }

    .toggle-pass {
      position: absolute; right: 14px; background: none; border: none;
      cursor: pointer; display: flex; align-items: center; color: var(--text-muted);
      padding: 0; transition: var(--transition);
      &:hover { color: var(--text); }
      .material-icons-round { font-size: 20px; }
    }

    .error-msg { font-size: 0.8rem; color: #e53e3e; margin-top: -8px; }
    .optional { font-size: 0.78rem; color: var(--text-muted); font-weight: 400; }

    .submit-btn {
      width: 100%;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }

    .btn-row {
      display: flex; gap: 12px; margin-top: 8px;
      .btn-primary { flex: 1; }
    }

    .btn-spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }

    /* SUCESSO */
    .sucesso-wrap {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; padding: 8px 0;
    }

    .sucesso-icone { margin-bottom: 20px; }

    .sucesso-circulo {
      width: 72px; height: 72px; border-radius: 50%;
      background: #F0FFF4; border: 3px solid #68D391;
      display: flex; align-items: center; justify-content: center;
      animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      .material-icons-round { font-size: 36px; color: #1a9e5c; }
    }

    .sucesso-titulo {
      font-family: var(--font-display); font-size: 1.6rem;
      font-weight: 700; color: var(--text); margin-bottom: 8px;
    }

    .sucesso-subtitulo {
      font-size: 0.9rem; color: var(--text-secondary);
      line-height: 1.6; margin-bottom: 24px; max-width: 340px;
    }

    .sucesso-restaurante {
      display: flex; align-items: center; gap: 14px;
      background: var(--bg-secondary); border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      padding: 14px 18px; width: 100%; margin-bottom: 16px; text-align: left;
    }

    .sucesso-logo {
      width: 52px; height: 52px; border-radius: 50%;
      background: white; border: 2px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; flex-shrink: 0;
      img { width: 100%; height: 100%; object-fit: cover; }
      .material-icons-round { font-size: 24px; color: var(--text-muted); }
    }

    .sucesso-info { flex: 1; }

    .sucesso-nome { font-weight: 700; font-size: 1rem; color: var(--text); margin-bottom: 6px; }

    .sucesso-categorias { display: flex; gap: 6px; flex-wrap: wrap; }

    .sucesso-tag {
      padding: 2px 10px; border-radius: 100px;
      background: var(--primary-soft); color: var(--primary);
      font-size: 0.72rem; font-weight: 700;
    }

    .sucesso-resumo {
      width: 100%; background: white; border: 1px solid var(--border);
      border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 24px;
    }

    .resumo-item {
      display: flex; align-items: center; gap: 10px;
      padding: 11px 16px; font-size: 0.85rem; color: var(--text-secondary);
      &:not(:last-child) { border-bottom: 1px solid var(--border); }
      .material-icons-round { font-size: 18px; color: var(--primary); flex-shrink: 0; }
      span:last-child { color: var(--text); font-weight: 500; }
    }

    .sucesso-btn {
      width: 100%; display: flex; align-items: center;
      justify-content: center; gap: 8px; text-decoration: none;
    }

    @keyframes popIn {
      from { transform: scale(0); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }

    .form-footer {
      margin-top: 24px; text-align: center;
      color: var(--text-secondary); font-size: 0.9rem;
      a { color: var(--primary); font-weight: 600; &:hover { text-decoration: underline; } }
    }
  `]
})
export class CadastroRestauranteComponent {
  form: FormGroup;
  step = 1;
  loading = false;
  showPassword = false;
  logoPreview: string | null = null;
  logoArquivo: File | null = null;
  categoriasSelecionadas: string[] = [];
  erroCategoria = false;

  erroHorario = false;

  horarios = [
    { dia: 'Segunda-feira',  abreviacao: 'Seg', ativo: true,  abertura: '08:00', fechamento: '22:00' },
    { dia: 'Terça-feira',    abreviacao: 'Ter', ativo: true,  abertura: '08:00', fechamento: '22:00' },
    { dia: 'Quarta-feira',   abreviacao: 'Qua', ativo: true,  abertura: '08:00', fechamento: '22:00' },
    { dia: 'Quinta-feira',   abreviacao: 'Qui', ativo: true,  abertura: '08:00', fechamento: '22:00' },
    { dia: 'Sexta-feira',    abreviacao: 'Sex', ativo: true,  abertura: '08:00', fechamento: '22:00' },
    { dia: 'Sábado',         abreviacao: 'Sáb', ativo: true,  abertura: '10:00', fechamento: '23:00' },
    { dia: 'Domingo',        abreviacao: 'Dom', ativo: false, abertura: '10:00', fechamento: '22:00' },
  ];

  categorias = [
    { valor: 'Pizza',      label: 'Pizza',      emoji: '🍕' },
    { valor: 'Hambúrguer', label: 'Hambúrguer', emoji: '🍔' },
    { valor: 'Japonês',    label: 'Japonês',    emoji: '🍣' },
    { valor: 'Saudável',   label: 'Saudável',   emoji: '🥗' },
    { valor: 'Sobremesas', label: 'Sobremesas', emoji: '🍰' },
    { valor: 'Bebidas',    label: 'Bebidas',    emoji: '🥤' },
    { valor: 'Italiana',   label: 'Italiana',   emoji: '🍝' },
    { valor: 'Brasileira', label: 'Brasileira', emoji: '🍖' },
    { valor: 'Mexicana',   label: 'Mexicana',   emoji: '🌮' },
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      // Step 1
      nome: ['', Validators.required],
      cnpj: ['', Validators.required],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      // Step 2
      cep: ['', Validators.required],
      estado: ['', Validators.required],
      cidade: ['', Validators.required],
      bairro: ['', Validators.required],
      rua: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: ['']
    });
  }

  onLogoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    this.logoArquivo = arquivo;
    const reader = new FileReader();
    reader.onload = () => { this.logoPreview = reader.result as string; };
    reader.readAsDataURL(arquivo);
    input.value = '';
  }

  removerLogo(): void {
    this.logoPreview = null;
    this.logoArquivo = null;
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  toggleCategoria(valor: string): void {
    const idx = this.categoriasSelecionadas.indexOf(valor);
    if (idx === -1) this.categoriasSelecionadas.push(valor);
    else this.categoriasSelecionadas.splice(idx, 1);
  }

  aplicarATodos(): void {
    const primeiro = this.horarios[0];
    this.horarios.forEach(h => {
      h.ativo = primeiro.ativo;
      h.abertura = primeiro.abertura;
      h.fechamento = primeiro.fechamento;
    });
  }

  nextStep(): void {
    const step1Fields = ['nome', 'cnpj', 'telefone', 'email', 'senha'];
    step1Fields.forEach(f => this.form.get(f)?.markAsTouched());
    const step1Valid = step1Fields.every(f => this.form.get(f)?.valid);
    this.erroCategoria = this.categoriasSelecionadas.length === 0;
    this.erroHorario = !this.horarios.some(h => h.ativo);
    if (step1Valid && !this.erroCategoria && !this.erroHorario) this.step = 2;
  }

  get diasAtivos(): number {
    return this.horarios.filter(h => h.ativo).length;
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;

    // TODO: conectar com RestauranteService
    setTimeout(() => {
      this.loading = false;
      this.step = 3;
    }, 1500);
  }
}
