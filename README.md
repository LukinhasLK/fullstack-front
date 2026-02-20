y# 🍕 DeliveryApp — Frontend Angular

Frontend minimalista estilo iFood para aplicação de delivery, desenvolvido com **Angular 17 Standalone Components**.

---

## 🚀 Como rodar o projeto

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar o servidor de desenvolvimento
```bash
npm start
# ou
ng serve
```

Acesse: `http://localhost:4200`

---

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── core/
│   │   ├── models/          # Interfaces TypeScript (User, Produto, Pedido...)
│   │   ├── services/        # AuthService, CarrinhoService, PedidoService, ProdutoService
│   │   ├── guards/          # authGuard, adminGuard, guestGuard
│   │   └── interceptors/    # authInterceptor (JWT Bearer token)
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/       # Tela de login
│   │   │   └── register/    # Tela de cadastro
│   │   ├── home/            # Cardápio (listagem + busca + categorias)
│   │   ├── cart/            # Carrinho + confirmação de pedido
│   │   └── admin/           # Dashboard admin (pedidos + CRUD produtos)
│   │
│   ├── app.routes.ts        # Rotas com lazy loading
│   ├── app.config.ts        # Configuração da aplicação
│   └── app.component.ts     # Root component
│
├── environments/
│   └── environment.ts       # URL base da API: http://localhost:8080/api
│
├── styles.scss              # Estilos globais + variáveis CSS
└── index.html               # Fontes: Syne + DM Sans
```

---

## 🔗 Endpoints esperados no backend (Spring Boot)

### Auth
| Método | Endpoint             | Descrição      |
|--------|----------------------|----------------|
| POST   | `/api/auth/login`    | Login          |
| POST   | `/api/auth/register` | Cadastro       |

**Resposta esperada do login/register:**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "role": "CLIENTE"
  }
}
```

---

### Produtos
| Método | Endpoint            | Descrição          |
|--------|---------------------|--------------------|
| GET    | `/api/produtos`     | Listar todos       |
| GET    | `/api/produtos/{id}`| Buscar por ID      |
| POST   | `/api/produtos`     | Criar (admin)      |
| PUT    | `/api/produtos/{id}`| Atualizar (admin)  |
| DELETE | `/api/produtos/{id}`| Deletar (admin)    |

---

### Pedidos
| Método | Endpoint                      | Descrição              |
|--------|-------------------------------|------------------------|
| GET    | `/api/pedidos`                | Listar todos (admin)   |
| GET    | `/api/pedidos/meus`           | Pedidos do usuário     |
| POST   | `/api/pedidos`                | Criar pedido           |
| PATCH  | `/api/pedidos/{id}/status`    | Atualizar status       |
| PATCH  | `/api/pedidos/{id}/cancelar`  | Cancelar pedido        |

---

## 🔐 Autenticação JWT

O `authInterceptor` injeta automaticamente o token em **todas as requisições**:
```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

### Roles
- `CLIENTE` → acessa Home e Carrinho
- `ADMIN` → acessa tudo, incluindo `/admin`

---

## 🎨 Design System

| Variável CSS        | Valor        |
|---------------------|--------------|
| `--primary`         | `#FF6B00`    |
| `--primary-light`   | `#FF8C38`    |
| `--primary-soft`    | `#FFF0E6`    |
| `--font-display`    | Syne         |
| `--font-body`       | DM Sans      |

---

## 📱 Telas do sistema

| Rota       | Tela          | Acesso  |
|------------|---------------|---------|
| `/login`   | Login         | Público |
| `/cadastro`| Cadastro      | Público |
| `/home`    | Cardápio      | Logado  |
| `/carrinho`| Carrinho      | Logado  |
| `/admin`   | Dashboard     | Admin   |

---

## ⚙️ Alterar URL da API

Edite o arquivo `src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api' // <- mude aqui
};
```

---

## 🛠️ Tecnologias
- Angular 17 (Standalone Components)
- Angular Router (Lazy Loading)
- Angular Forms (ReactiveForms + Template Forms)
- Angular HttpClient + Interceptors
- RxJS
- SCSS com variáveis CSS customizadas
