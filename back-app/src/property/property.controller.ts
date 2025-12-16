import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryDto } from '../model/query.dto';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.create(createPropertyDto);
  }

  @Get()
  findAll(@Query() query: QueryDto) {
    return this.propertyService.findAll(query);
  }

  @Get('lead/:leadId')
  findByLeadId(@Param('leadId') leadId: string, @Query() query: QueryDto) {
    return this.propertyService.findByLeadId(leadId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertyService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertyService.remove(id);
  }
}
