// ===== USER MODEL =====
export interface User {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  role: 'CLIENTE' | 'ADMIN';
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}

export interface AuthResponse {
  token: string;
  nome: string;
  email: string;
  role: string;
}

export interface Restaurante {
  id: number;
  nome: string;
  descricao?: string;
  imagemUrl?: string;
  categoria: string;
  avaliacao: number;
  tempoEntrega: string;
  taxaEntrega: number;
  aberto: boolean;
  produtos?: Produto[];
}

// ===== CATEGORY MODEL =====
export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
}

// ===== PRODUCT MODEL =====
export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagemUrl?: string;
  categoria: Categoria | null;
  disponivel: boolean;
}

export interface ProdutoRequest {
  nome: string;
  descricao: string;
  preco: number;
  imagemUrl?: string;
  categoriaId: number | null;
  disponivel: boolean;
}

// ===== CART MODEL =====
export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

// ===== ORDER MODEL =====
export interface Pedido {
  id: number;
  usuario: { id: number; nome: string; email: string };
  itens: ItemPedido[];
  total: number;
  status: 'PENDENTE' | 'CONFIRMADO' | 'EM_PREPARO' | 'SAIU_PARA_ENTREGA' | 'ENTREGUE' | 'CANCELADO';
  endereco?: { rua: string; numero: string; complemento?: string; bairro: string; cidade: string; cep: string } | null;
  dataCriacao: string;
}

export interface ItemPedido {
  id?: number;
  produto: { id: number; nome: string; preco: number };
  quantidade: number;
  precoUnitario: number;
}

export interface CriarPedidoRequest {
  enderecoId: number | null;
  itens: { produtoId: number; quantidade: number }[];
}