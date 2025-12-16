import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../model/base.entity';
import { Property } from '../../property/entities/property.entity';

@Entity('leads')
export class Lead extends BaseEntity {
  @Column()
  name: string;

  @Column()
  cpf: string;

  @Column()
  status: 'Novo' | 'Contato Inicial' | 'Em Negociação' | 'Convertido' | 'Perdido';

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column()
  municipality: string;

  @OneToMany(() => Property, (property) => property.lead, { cascade: true })
  properties: Property[];
}
