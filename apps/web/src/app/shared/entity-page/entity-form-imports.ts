import { MatAnchor, MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AttachmentsPanel } from '../attachments/attachments-panel';
import { EmptyState } from '../empty-state/empty-state';
import { EntityForm } from '../entity-form/entity-form';
import { PageHeader } from '../page-header/page-header';

/** Everything `entity-form-page.html` needs. */
export const ENTITY_FORM_IMPORTS = [PageHeader, EntityForm, AttachmentsPanel, EmptyState, MatButton, MatAnchor, RouterLink];
