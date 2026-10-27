import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export const API_BASE = '/api';

/** Thin typed wrapper over the REST conventions every entity shares. */
export class CrudApi<T, TInput> {
  private readonly http = inject(HttpClient);
  private readonly url: string;

  constructor(path: string) {
    this.url = `${API_BASE}/${path}`;
  }

  list(): Promise<T[]> {
    return firstValueFrom(this.http.get<T[]>(this.url));
  }

  get(id: number): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${this.url}/${id}`));
  }

  getRelated<R>(id: number, relation: string): Promise<R[]> {
    return firstValueFrom(this.http.get<R[]>(`${this.url}/${id}/${relation}`));
  }

  create(input: TInput): Promise<T> {
    return firstValueFrom(this.http.post<T>(this.url, input));
  }

  update(id: number, input: TInput): Promise<T> {
    return firstValueFrom(this.http.put<T>(`${this.url}/${id}`, input));
  }

  remove(ids: number[]): Promise<void> {
    if (ids.length === 1) return firstValueFrom(this.http.delete<void>(`${this.url}/${ids[0]}`));
    return firstValueFrom(this.http.delete<void>(this.url, { params: { ids: ids.join(',') } }));
  }
}
