import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'cadastro',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'carrinho',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'cozinha',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/cozinha/login-restaurante/login-restaurante.component').then(m => m.LoginRestauranteComponent)
      },
      {
        path: 'cadastro',
        loadComponent: () => import('./features/cozinha/cadastro-restaurante/cadastro-restaurante.component').then(m => m.CadastroRestauranteComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/cozinha/dashboard/dashboard-cozinha.component').then(m => m.DashboardCozinhaComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
