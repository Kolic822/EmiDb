import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { parseIdList } from '../common/dto.js';
import { PotLayoutDto } from './pot-layout.dto.js';
import { PotLayoutsService } from './pot-layouts.service.js';

@Controller('pot-layouts')
export class PotLayoutsController {
  constructor(private readonly service: PotLayoutsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: PotLayoutDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: PotLayoutDto) {
    return this.service.update(id, dto);
  }

  @Delete()
  @HttpCode(204)
  removeMany(@Query('ids') ids: string) {
    this.service.removeMany(parseIdList(ids));
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.service.remove(id);
  }
}
