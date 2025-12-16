import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead } from './entities/lead.entity';
import { QueryDto } from '../model/query.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async create(createLeadDto: CreateLeadDto) {
    const lead = this.leadRepository.create(createLeadDto);
    return await this.leadRepository.save(lead);
  }

  async findAll(query: QueryDto) {
    const { page, limit, sort, order, search } = query;

    // Construção segura do filtro WHERE
    const where: any = { deleted: false };

    if (search) {
      // ILike é Case Insensitive e previne injeção direta comparado a raw SQL
      where.name = ILike(`%${search}%`);
    }

    return await this.leadRepository.find({
      where,
      relations: ['properties'],
      skip: QueryDto.getSkip(page, limit),
      take: QueryDto.getTake(limit),
      order: QueryDto.getOrder(sort, order),
    });
  }

  async findOne(id: string) {
    const lead = await this.leadRepository.findOne({
      where: { id, deleted: false },
      relations: ['properties'],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    const lead = await this.findOne(id); // Garante que existe e não está deletado
    this.leadRepository.merge(lead, updateLeadDto);
    return await this.leadRepository.save(lead);
  }

  async remove(id: string) {
    const lead = await this.findOne(id);
    lead.deleted = true;
    return await this.leadRepository.save(lead);
  }
}
