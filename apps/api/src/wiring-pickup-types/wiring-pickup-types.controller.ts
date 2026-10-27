import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { parseIdList } from '../common/dto.js';
import { WiringPickupTypeDto } from './wiring-pickup-type.dto.js';
import { WiringPickupTypesService } from './wiring-pickup-types.service.js';

@Controller('wiring-pickup-types')
export class WiringPickupTypesController {
  constructor(private readonly service: WiringPickupTypesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: WiringPickupTypeDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: WiringPickupTypeDto) {
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
