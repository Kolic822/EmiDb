import { MatAnchor, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ColumnPicker } from '../column-picker/column-picker';
import { DataTable } from '../data-table/data-table';
import { ListToolbar } from '../list-toolbar/list-toolbar';
import { PageHeader } from '../page-header/page-header';

/** Everything `entity-list-page.html` needs. */
export const ENTITY_LIST_IMPORTS = [PageHeader, ListToolbar, ColumnPicker, DataTable, MatButton, MatAnchor, MatIcon, RouterLink];
