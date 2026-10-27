import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { parseIdList } from '../common/dto.js';
import { PickupSetDto } from './pickup-set.dto.js';
import { PickupSetsService } from './pickup-sets.service.js';

@Controller('pickup-sets')
export class PickupSetsController {
  constructor(private readonly service: PickupSetsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: PickupSetDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: PickupSetDto) {
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
