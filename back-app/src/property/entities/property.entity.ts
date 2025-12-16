import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../model/base.entity';
import { Lead } from '../../leads/entities/lead.entity';

@Entity('properties')
export class Property extends BaseEntity {
  @Column()
  culture: 'Soja' | 'Milho' | 'Algodão';

  @Column()
  municipality: string;

  @Column('float')
  area: number; // In Hectares

  @Column('jsonb')
  geometry: { lat: number; lng: number }[];

  @ManyToOne(() => Lead, (lead) => lead.properties, { onDelete: 'CASCADE' })
  lead: Lead;
}