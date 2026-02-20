import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produto, ProdutoRequest, Categoria, Restaurante } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly API = `${environment.apiUrl}/produtos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.API);
  }

  listarTodos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.API}/todos`);
  }

  buscarPorId(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.API}/${id}`);
  }

  criar(produto: ProdutoRequest): Observable<Produto> {
    return this.http.post<Produto>(this.API, produto);
  }

  atualizar(id: number, produto: ProdutoRequest): Observable<Produto> {
    return this.http.put<Produto>(`${this.API}/${id}`, produto);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly API = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.API);
  }
}

@Injectable({ providedIn: 'root' })
export class RestauranteService {
  private readonly API = `${environment.apiUrl}/restaurantes`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Restaurante[]> {
    return this.http.get<Restaurante[]>(this.API);
  }

  buscarPorId(id: number): Observable<Restaurante> {
    return this.http.get<Restaurante>(`${this.API}/${id}`);
  }

  criar(restaurante: Omit<Restaurante, 'id'>): Observable<Restaurante> {
    return this.http.post<Restaurante>(this.API, restaurante);
  }

  atualizar(id: number, restaurante: Partial<Restaurante>): Observable<Restaurante> {
    return this.http.put<Restaurante>(`${this.API}/${id}`, restaurante);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}