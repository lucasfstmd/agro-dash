import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './entities/property.entity';
import { QueryDto } from '../model/query.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async create(createPropertyDto: CreatePropertyDto) {
    const property = this.propertyRepository.create({
      ...createPropertyDto,
      lead: { id: createPropertyDto.leadId },
    });
    return await this.propertyRepository.save(property);
  }

  async findAll(query: QueryDto) {
    const { page, limit, sort, order } = query;

    return await this.propertyRepository.find({
      where: { deleted: false },
      relations: ['lead'],
      skip: QueryDto.getSkip(page, limit),
      take: QueryDto.getTake(limit),
      order: QueryDto.getOrder(sort, order),
    });
  }

  async findOne(id: string) {
    const property = await this.propertyRepository.findOne({
      where: { id, deleted: false },
      relations: ['lead'],
    });
    if (!property) throw new NotFoundException(`Property #${id} not found`);
    return property;
  }

  async findByLeadId(leadId: string, query: QueryDto) {
    const { page, limit, sort, order } = query;
    return await this.propertyRepository.find({
      where: { lead: { id: leadId }, deleted: false },
      skip: QueryDto.getSkip(page, limit),
      take: QueryDto.getTake(limit),
      order: QueryDto.getOrder(sort, order),
    });
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    const property = await this.findOne(id);
    this.propertyRepository.merge(property, updatePropertyDto);
    return await this.propertyRepository.save(property);
  }

  async remove(id: string) {
    const property = await this.findOne(id);
    property.deleted = true;
    return await this.propertyRepository.save(property);
  }
}
