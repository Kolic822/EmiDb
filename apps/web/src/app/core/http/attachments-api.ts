import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Attachment, AttachmentOwner } from '@emidb/shared';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from './crud-api';

@Injectable({ providedIn: 'root' })
export class AttachmentsApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/attachments`;

  list(owner: AttachmentOwner, ownerId: number): Promise<Attachment[]> {
    return firstValueFrom(this.http.get<Attachment[]>(this.url, { params: { owner, ownerId } }));
  }

  upload(owner: AttachmentOwner, ownerId: number, file: File, caption?: string): Promise<Attachment> {
    const form = new FormData();
    form.append('owner', owner);
    form.append('ownerId', String(ownerId));
    if (caption) form.append('caption', caption);
    form.append('file', file, file.name);
    return firstValueFrom(this.http.post<Attachment>(this.url, form));
  }

  updateCaption(id: number, caption: string | null): Promise<Attachment> {
    return firstValueFrom(this.http.patch<Attachment>(`${this.url}/${id}`, { caption }));
  }

  remove(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }
}
