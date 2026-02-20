import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <aside class="auth-visual">
        <div class="visual-inner">
          <div class="logo-big">
            <span class="material-icons-round">delivery_dining</span>
          </div>
          <h1>Crie sua<br><span>conta grátis.</span></h1>
          <p>Em menos de 1 minuto você já pode fazer seu primeiro pedido.</p>
          <div class="steps">
            <div class="step"><div class="step-num">1</div><span>Crie sua conta</span></div>
            <div class="step-line"></div>
            <div class="step"><div class="step-num">2</div><span>Escolha o restaurante</span></div>
            <div class="step-line"></div>
            <div class="step"><div class="step-num">3</div><span>Receba em casa</span></div>
          </div>
        </div>
        <div class="visual-blob blob1"></div>
        <div class="visual-blob blob2"></div>
      </aside>

      <main class="auth-form-area">
        <div class="form-card fade-in">
          <div class="brand-mobile">
            <span class="material-icons-round">delivery_dining</span>
            <span>DeliveryApp</span>
          </div>

          <div class="form-header">
            <h2>Criar conta</h2>
            <p>Preencha os dados para começar</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="form-group">
              <label>Nome completo</label>
              <div class="input-wrap">
                <span class="material-icons-round">person_outline</span>
                <input type="text" formControlName="nome" placeholder="Seu nome" [class.error]="isInvalid('nome')"/>
              </div>
              <span class="error-msg" *ngIf="isInvalid('nome')">Nome obrigatório</span>
            </div>

            <div class="form-group">
              <label>E-mail</label>
              <div class="input-wrap">
                <span class="material-icons-round">mail_outline</span>
                <input type="email" formControlName="email" placeholder="seu@email.com" [class.error]="isInvalid('email')"/>
              </div>
              <span class="error-msg" *ngIf="isInvalid('email')">E-mail inválido</span>
            </div>

            <div class="form-group">
              <label>Telefone <span class="optional">(opcional)</span></label>
              <div class="input-wrap">
                <span class="material-icons-round">phone_outline</span>
                <input type="tel" formControlName="telefone" placeholder="(11) 99999-9999"/>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Senha</label>
                <div class="input-wrap">
                  <span class="material-icons-round">lock_outline</span>
                  <input [type]="showPass ? 'text' : 'password'" formControlName="senha" placeholder="Mín. 6 caracteres" [class.error]="isInvalid('senha')"/>
                  <button type="button" class="toggle-pass" (click)="showPass = !showPass">
                    <span class="material-icons-round">{{ showPass ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
                <span class="error-msg" *ngIf="isInvalid('senha')">Senha com mín. 6 caracteres</span>
              </div>
              <div class="form-group">
                <label>Confirmar senha</label>
                <div class="input-wrap">
                  <span class="material-icons-round">lock_outline</span>
                  <input [type]="showPass ? 'text' : 'password'" formControlName="confirmarSenha" placeholder="Repita a senha" [class.error]="isInvalid('confirmarSenha') || senhasDiferentes"/>
                </div>
                <span class="error-msg" *ngIf="senhasDiferentes">Senhas não coincidem</span>
              </div>
            </div>

            <div class="error-banner" *ngIf="errorMsg">
              <span class="material-icons-round">error_outline</span>
              {{ errorMsg }}
            </div>

            <button type="submit" class="btn btn-primary btn-lg submit-btn" [disabled]="loading">
              <span class="material-icons-round" *ngIf="!loading">person_add</span>
              <div class="btn-spinner" *ngIf="loading"></div>
              {{ loading ? 'Criando conta...' : 'Criar conta' }}
            </button>
          </form>

          <div class="form-footer">
            <p>Já tem conta? <a routerLink="/login">Fazer login</a></p>
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
      margin-bottom: 32px;
      .material-icons-round { font-size: 36px; }
    }

    .visual-inner h1 {
      font-family: var(--font-display);
      font-size: 2.8rem; font-weight: 800; line-height: 1.15;
      margin-bottom: 16px;
      span { opacity: 0.85; }
    }

    .visual-inner p { font-size: 1.05rem; opacity: 0.85; line-height: 1.6; margin-bottom: 40px; }

    .steps { display: flex; flex-direction: column; gap: 4px; }
    .step {
      display: flex; align-items: center; gap: 12px;
      font-size: 0.9rem; font-weight: 500;
    }
    .step-num {
      width: 32px; height: 32px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.85rem;
      flex-shrink: 0;
    }
    .step-line { width: 2px; height: 16px; background: rgba(255,255,255,0.25); margin-left: 15px; }

    .visual-blob { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.07); }
    .blob1 { width: 400px; height: 400px; bottom: -100px; right: -100px; }
    .blob2 { width: 200px; height: 200px; top: -50px; left: -50px; }

    .auth-form-area {
      flex: 1;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      background: var(--bg-secondary);
    }

    .form-card {
      background: white;
      border-radius: var(--radius-xl);
      padding: 48px 40px;
      width: 100%; max-width: 480px;
      box-shadow: var(--shadow-lg);
      @media (max-width: 480px) { padding: 32px 24px; }
    }

    .brand-mobile {
      display: none; align-items: center; gap: 8px;
      margin-bottom: 32px;
      font-family: var(--font-display); font-weight: 700; font-size: 1.2rem;
      color: var(--primary);
      .material-icons-round { font-size: 28px; }
      @media (max-width: 768px) { display: flex; }
    }

    .form-header {
      margin-bottom: 28px;
      h2 { font-family: var(--font-display); font-size: 1.8rem; font-weight: 700; margin-bottom: 6px; }
      p { color: var(--text-secondary); font-size: 0.95rem; }
    }

    form { display: flex; flex-direction: column; gap: 16px; }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      @media (max-width: 480px) { grid-template-columns: 1fr; }
    }

    .optional { font-size: 0.78rem; color: var(--text-muted); font-weight: 400; }

    .input-wrap {
      position: relative; display: flex; align-items: center;
      .material-icons-round:first-child {
        position: absolute; left: 14px; font-size: 20px;
        color: var(--text-muted); pointer-events: none;
      }
      input {
        width: 100%;
        padding: 12px 44px 12px 44px;
        border: 1.5px solid var(--border);
        border-radius: var(--radius-md);
        font-size: 0.9rem;
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
      position: absolute; right: 14px;
      background: none; border: none; cursor: pointer;
      display: flex; align-items: center;
      color: var(--text-muted); padding: 0;
      transition: var(--transition);
      &:hover { color: var(--text); }
      .material-icons-round { font-size: 20px; }
    }

    .error-msg { font-size: 0.8rem; color: #e53e3e; margin-top: -4px; }

    .error-banner {
      display: flex; align-items: center; gap: 8px;
      background: #fff5f5; border: 1px solid #fed7d7;
      color: #c53030; border-radius: var(--radius-md);
      padding: 12px 16px; font-size: 0.88rem;
      .material-icons-round { font-size: 18px; }
    }

    .submit-btn { width: 100%; margin-top: 4px; }
    .btn-spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .form-footer {
      margin-top: 20px; text-align: center;
      color: var(--text-secondary); font-size: 0.9rem;
      a { color: var(--primary); font-weight: 600; transition: var(--transition); &:hover { text-decoration: underline; } }
    }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';
  showPass = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required]
    });
  }

  get senhasDiferentes(): boolean {
    const { senha, confirmarSenha } = this.form.value;
    return !!(this.form.get('confirmarSenha')?.touched && senha !== confirmarSenha);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  submit(): void {
    if (this.form.invalid || this.senhasDiferentes) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    const { confirmarSenha, ...data } = this.form.value;
    this.auth.register(data).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/home']); },
      error: (err) => { this.loading = false; this.errorMsg = err.error?.message || 'Erro ao criar conta. Tente novamente.'; }
    });
  }
}
