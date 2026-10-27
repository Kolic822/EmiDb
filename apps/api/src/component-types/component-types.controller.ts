import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { parseIdList } from '../common/dto.js';
import { ComponentTypeDto, SwitchTypeDto } from './component-type.dto.js';
import {
  ComponentTypesService,
  PotentiometerTypesService,
  SwitchTypesService,
} from './component-types.service.js';

/** Route handlers shared by every lookup table; subclasses only pick the path and service. */
abstract class ComponentTypesController {
  protected constructor(private readonly service: ComponentTypesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: ComponentTypeDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: ComponentTypeDto) {
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

@Controller('potentiometer-types')
export class PotentiometerTypesController extends ComponentTypesController {
  constructor(service: PotentiometerTypesService) {
    super(service);
  }
}

@Controller('switch-types')
export class SwitchTypesController extends ComponentTypesController {
  constructor(private readonly switches: SwitchTypesService) {
    super(switches);
  }

  @Post()
  override create(@Body() dto: SwitchTypeDto) {
    return this.switches.create(dto);
  }

  @Put(':id')
  override update(@Param('id', ParseIntPipe) id: number, @Body() dto: SwitchTypeDto) {
    return this.switches.update(id, dto);
  }
}
