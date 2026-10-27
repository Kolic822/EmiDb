import { Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TrashService } from './trash.service.js';

@Controller('trash')
export class TrashController {
  constructor(private readonly service: TrashService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post(':kind/:id/restore')
  @HttpCode(204)
  restore(@Param('kind') kind: string, @Param('id', ParseIntPipe) id: number) {
    this.service.restore(kind, id);
  }

  /** Permanently removes one entry (and its files). */
  @Delete(':kind/:id')
  @HttpCode(204)
  purge(@Param('kind') kind: string, @Param('id', ParseIntPipe) id: number) {
    return this.service.purge(kind, id);
  }

  /** Empties the trash. */
  @Delete()
  @HttpCode(204)
  async empty() {
    await this.service.empty();
  }
}
