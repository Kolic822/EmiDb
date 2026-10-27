import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { parseIdList } from '../common/dto.js';
import { PickupSetsService } from '../pickup-sets/pickup-sets.service.js';
import { PickupDto } from './pickup.dto.js';
import { PickupsService } from './pickups.service.js';

@Controller('pickups')
export class PickupsController {
  constructor(
    private readonly service: PickupsService,
    private readonly sets: PickupSetsService,
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /** Sets this pickup is part of. */
  @Get(':id/sets')
  findSets(@Param('id', ParseIntPipe) id: number) {
    this.service.findOne(id);
    return this.sets.findByPickup(id);
  }

  @Post()
  create(@Body() dto: PickupDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: PickupDto) {
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
