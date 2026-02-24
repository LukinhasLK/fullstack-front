import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-restaurante',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <!-- Decoração lateral -->
      <aside class="auth-visual">
        <div class="visual-inner">
          <div class="logo-big">
            <span class="material-icons-round">storefront</span>
          </div>
          <h1>Painel da<br><span>Cozinha.</span></h1>
          <p>Gerencie seus pedidos, cardápio e estoque em um só lugar.</p>
          <div class="visual-tags">
            <div class="vtag"><span class="material-icons-round">receipt_long</span> Pedidos em tempo real</div>
            <div class="vtag"><span class="material-icons-round">bar_chart</span> Dashboard completo</div>
            <div class="vtag"><span class="material-icons-round">inventory_2</span> Controle de estoque</div>
          </div>
        </div>
        <div class="visual-blob blob1"></div>
        <div class="visual-blob blob2"></div>
      </aside>

      <!-- Formulário -->
      <main class="auth-form-area">
        <div class="form-card fade-in">
          <div class="brand-mobile">
            <span class="material-icons-round">storefront</span>
            <span>Cozinha</span>
          </div>

          <div class="form-header">
            <h2>Acesso ao restaurante</h2>
            <p>Entre para gerenciar seu estabelecimento</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate *ngIf="!sucesso">
            <div class="form-group">
              <label>E-mail do restaurante</label>
              <div class="input-wrap">
                <span class="material-icons-round">mail_outline</span>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="restaurante@email.com"
                  [class.error]="isInvalid('email')"
                />
              </div>
              <span class="error-msg" *ngIf="isInvalid('email')">E-mail inválido</span>
            </div>

            <div class="form-group">
              <label>Senha</label>
              <div class="input-wrap">
                <span class="material-icons-round">lock_outline</span>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="senha"
                  placeholder="Sua senha"
                  [class.error]="isInvalid('senha')"
                />
                <button type="button" class="toggle-pass" (click)="showPassword = !showPassword">
                  <span class="material-icons-round">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              <span class="error-msg" *ngIf="isInvalid('senha')">Senha obrigatória</span>
            </div>

            <div class="error-banner" *ngIf="errorMsg">
              <span class="material-icons-round">error_outline</span>
              {{ errorMsg }}
            </div>

            <button type="submit" class="btn btn-primary btn-lg submit-btn" [disabled]="loading">
              <span class="material-icons-round" *ngIf="!loading">login</span>
              <div class="btn-spinner" *ngIf="loading"></div>
              {{ loading ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>

          <div class="form-footer" *ngIf="!sucesso">
            <p>Ainda não tem conta? <a routerLink="/cozinha/cadastro">Cadastrar restaurante</a></p>
          </div>

          <!-- TELA DE SUCESSO -->
          <div *ngIf="sucesso" class="sucesso-wrap fade-in">
            <div class="sucesso-circulo">
              <span class="material-icons-round">storefront</span>
            </div>
            <h2 class="sucesso-titulo">Bem-vindo de volta!</h2>
            <p class="sucesso-subtitulo">Login realizado com sucesso. Preparando seu painel...</p>
            <div class="sucesso-email">
              <span class="material-icons-round">mail_outline</span>
              {{ form.get('email')?.value }}
            </div>
            <div class="sucesso-barra-wrap">
              <div class="sucesso-barra"></div>
            </div>
            <p class="sucesso-redirecionando">Redirecionando para o dashboard</p>
          </div>

        </div>
      </main>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      min-height: 100vh;
    }

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

    .visual-inner {
      position: relative;
      z-index: 2;
      padding: 48px;
      color: white;
    }

    .logo-big {
      width: 72px;
      height: 72px;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32px;
      backdrop-filter: blur(8px);

      .material-icons-round { font-size: 36px; }
    }

    .visual-inner h1 {
      font-family: var(--font-display);
      font-size: 2.8rem;
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 16px;

      span { opacity: 0.85; }
    }

    .visual-inner p {
      font-size: 1.05rem;
      opacity: 0.85;
      line-height: 1.6;
      margin-bottom: 40px;
    }

    .visual-tags {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .vtag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(8px);
      padding: 10px 16px;
      border-radius: 100px;
      font-size: 0.88rem;
      font-weight: 500;
      width: fit-content;

      .material-icons-round { font-size: 18px; }
    }

    .visual-blob {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.07);
    }

    .blob1 { width: 400px; height: 400px; bottom: -100px; right: -100px; }
    .blob2 { width: 200px; height: 200px; top: -50px; left: -50px; }

    .auth-form-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: var(--bg-secondary);
    }

    .form-card {
      background: white;
      border-radius: var(--radius-xl);
      padding: 48px 40px;
      width: 100%;
      max-width: 420px;
      box-shadow: var(--shadow-lg);

      @media (max-width: 480px) { padding: 32px 24px; }
    }

    .brand-mobile {
      display: none;
      align-items: center;
      gap: 8px;
      margin-bottom: 32px;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 1.2rem;
      color: var(--primary);

      .material-icons-round { font-size: 28px; }

      @media (max-width: 768px) { display: flex; }
    }

    .form-header {
      margin-bottom: 32px;

      h2 {
        font-family: var(--font-display);
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--text);
        margin-bottom: 6px;
      }

      p { color: var(--text-secondary); font-size: 0.95rem; }
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;

      .material-icons-round:first-child {
        position: absolute;
        left: 14px;
        font-size: 20px;
        color: var(--text-muted);
        pointer-events: none;
      }

      input {
        width: 100%;
        padding: 13px 48px 13px 44px;
        border: 1.5px solid var(--border);
        border-radius: var(--radius-md);
        font-size: 0.95rem;
        background: var(--bg-secondary);
        color: var(--text);
        transition: var(--transition);

        &::placeholder { color: var(--text-muted); }
        &:focus {
          border-color: var(--primary);
          background: white;
          box-shadow: 0 0 0 3px rgba(255,107,0,0.1);
        }
        &.error { border-color: #e53e3e; }
      }
    }

    .toggle-pass {
      position: absolute;
      right: 14px;
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      color: var(--text-muted);
      padding: 0;
      transition: var(--transition);

      &:hover { color: var(--text); }
      .material-icons-round { font-size: 20px; }
    }

    .error-msg {
      font-size: 0.8rem;
      color: #e53e3e;
      margin-top: -8px;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff5f5;
      border: 1px solid #fed7d7;
      color: #c53030;
      border-radius: var(--radius-md);
      padding: 12px 16px;
      font-size: 0.88rem;

      .material-icons-round { font-size: 18px; }
    }

    .submit-btn { width: 100%; margin-top: 4px; }

    .btn-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* SUCESSO */
    .sucesso-wrap {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; padding: 16px 0; gap: 12px;
    }

    .sucesso-circulo {
      width: 80px; height: 80px; border-radius: 50%;
      background: var(--primary-soft); border: 3px solid var(--primary);
      display: flex; align-items: center; justify-content: center;
      animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      .material-icons-round { font-size: 38px; color: var(--primary); }
    }

    .sucesso-titulo {
      font-family: var(--font-display); font-size: 1.6rem;
      font-weight: 700; color: var(--text); margin: 0;
    }

    .sucesso-subtitulo { font-size: 0.9rem; color: var(--text-secondary); margin: 0; }

    .sucesso-email {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 18px; border-radius: 100px;
      background: var(--bg-secondary); border: 1px solid var(--border);
      font-size: 0.88rem; font-weight: 500; color: var(--text-secondary);
      .material-icons-round { font-size: 16px; color: var(--primary); }
    }

    .sucesso-barra-wrap {
      width: 100%; height: 4px; background: var(--bg-secondary);
      border-radius: 100px; overflow: hidden; margin-top: 8px;
    }

    .sucesso-barra {
      height: 100%; background: var(--primary); border-radius: 100px;
      animation: progressBar 1.8s ease forwards;
    }

    .sucesso-redirecionando {
      font-size: 0.78rem; color: var(--text-muted); margin: 0;
    }

    @keyframes popIn {
      from { transform: scale(0); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }

    @keyframes progressBar {
      from { width: 0%; }
      to   { width: 100%; }
    }

    .form-footer {
      margin-top: 24px;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.9rem;

      a {
        color: var(--primary);
        font-weight: 600;
        transition: var(--transition);
        &:hover { text-decoration: underline; }
      }
    }
  `]
})
export class LoginRestauranteComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';
  showPassword = false;
  sucesso = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';

    // TODO: conectar com RestauranteService
    setTimeout(() => {
      this.loading = false;
      this.sucesso = true;
      setTimeout(() => this.router.navigate(['/cozinha/dashboard']), 2000);
    }, 1000);
  }
}
