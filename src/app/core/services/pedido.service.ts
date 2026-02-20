import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pedido, CriarPedidoRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly API = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.API);
  }

  meusPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.API}/meus`);
  }

  buscarPorId(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.API}/${id}`);
  }

  criar(pedido: CriarPedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(this.API, pedido);
  }

  atualizarStatus(id: number, status: string): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.API}/${id}/status`, { status });
  }

  cancelar(id: number): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.API}/${id}/cancelar`, {});
  }
}
