import { Location } from '@angular/common';
import { computed, Directive, effect, inject, input, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { type AttachmentOwner, type FieldDef, type FieldGroup, t } from '@emidb/shared';
import { AttachmentsApi } from '../../core/http/attachments-api';
import { LookupService } from '../../core/lookups';
import { NotifyService } from '../../core/notify';
import type { EntityStore } from '../../core/store/entity-store';
import { buildEntityForm, type EntityFormGroup, formToInput } from '../entity-form/form-builder';
import { capitalise } from './entity-list-base';

/**
 * Create/edit page for one entity. The route decides the mode: `new` (no id)
 * or `:id/edit`. Subclasses provide the store, fields and groups and reuse
 * `entity-form-page.html`.
 */
@Directive()
export abstract class EntityFormBase<T extends { id: number; name: string }, TInput> {
  protected abstract readonly store: EntityStore<T, TInput>;
  protected abstract readonly fields: readonly FieldDef<T>[];
  protected abstract readonly groups: readonly FieldGroup[];
  protected abstract readonly noun: string;
  /** English title for the create page, e.g. "New pickup". */
  protected abstract readonly createLabel: string;
  /** English label of the create button, e.g. "Create pickup". */
  protected abstract readonly submitLabel: string;
  protected abstract readonly basePath: string;
  /** Set when the entity can have files attached. */
  protected readonly attachmentOwner: AttachmentOwner | null = null;

  /** Route parameter; absent when creating. */
  readonly id = input<string>();
  /** Query parameter: id of a record to copy into a new one. */
  readonly from = input<string>();

  /** Files picked while creating; uploaded right after the entity exists. */
  protected readonly pendingFiles = signal<File[]>([]);
  private readonly attachments = inject(AttachmentsApi);

  protected readonly router = inject(Router);
  protected readonly location = inject(Location);
  protected readonly notify = inject(NotifyService);
  private readonly lookups = inject(LookupService);

  protected readonly numericId = computed(() => (this.id() ? Number(this.id()) : null));
  protected readonly copySourceId = computed(() => (this.from() ? Number(this.from()) : null));
  protected readonly isEdit = computed(() => this.numericId() != null);
  protected readonly existing = computed(() => {
    const id = this.numericId();
    return id == null ? undefined : this.store.byId().get(id);
  });
  protected readonly missing = computed(() => this.isEdit() && this.store.loaded() && !this.existing());
  protected readonly form = signal<EntityFormGroup | null>(null);
  protected readonly saving = signal(false);
  protected readonly title = computed(() =>
    this.isEdit() ? t('Edit {name}', { name: this.existing()?.name ?? t(this.noun) }) : t(this.createLabel),
  );

  constructor() {
    effect(() => {
      if (this.form()) return;
      const sourceId = this.copySourceId();
      if (!this.isEdit() && sourceId == null) {
        this.createForm(undefined);
        return;
      }
      untracked(() => void this.store.ensureLoaded());
      if (sourceId != null) {
        const source = this.store.byId().get(sourceId);
        if (source) this.createForm({ ...source, name: t('{name} (copy)', { name: source.name }) } as T);
        return;
      }
      const row = this.existing();
      if (row) this.createForm(row);
    });
    void this.lookups.ensureLoaded();
  }

  /** Hook for entity-specific behaviour once the form exists. */
  protected onFormCreated(_form: EntityFormGroup): void {}

  protected async save(): Promise<void> {
    const form = this.form();
    if (!form) return;
    if (form.invalid) {
      form.markAllAsTouched();
      this.notify.error(t('Please fix the highlighted fields'));
      return;
    }
    this.saving.set(true);
    try {
      const input = formToInput<TInput>(this.fields, form);
      const id = this.numericId();
      const saved = id == null ? await this.store.create(input) : await this.store.update(id, input);
      await this.uploadPending(saved.id);
      const noun = capitalise(t(this.noun));
      this.notify.success(id == null ? t('{noun} created', { noun }) : t('{noun} saved', { noun }));
      form.markAsPristine();
      void this.router.navigate([this.basePath, saved.id]);
    } catch {
      // Reported by the HTTP interceptor.
    } finally {
      this.saving.set(false);
    }
  }

  protected cancel(): void {
    this.location.back();
  }

  private async uploadPending(ownerId: number): Promise<void> {
    const owner = this.attachmentOwner;
    const files = this.pendingFiles();
    if (!owner || !files.length) return;
    for (const file of files) {
      await this.attachments.upload(owner, ownerId, file);
    }
    this.pendingFiles.set([]);
  }

  private createForm(value: T | undefined): void {
    const form = buildEntityForm(this.fields, value);
    this.form.set(form);
    this.onFormCreated(form);
  }
}
