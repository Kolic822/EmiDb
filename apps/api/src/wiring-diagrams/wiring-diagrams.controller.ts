import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { parseIdList } from '../common/dto.js';
import { WiringDiagramDto } from './wiring-diagram.dto.js';
import { WiringDiagramsService } from './wiring-diagrams.service.js';

@Controller('wiring-diagrams')
export class WiringDiagramsController {
  constructor(private readonly service: WiringDiagramsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: WiringDiagramDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: WiringDiagramDto) {
    return this.service.update(id, dto);
  }

  @Delete()
  @HttpCode(204)
  removeMany(@Query('ids') ids: string) {
    return this.service.removeMany(parseIdList(ids));
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
