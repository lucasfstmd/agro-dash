import { CreatePropertyDto } from '../../property/dto/create-property.dto';

export class CreateLeadDto {
  id?: string;
  name?: string;
  cpf?: string;
  status?: 'Novo' | 'Contato Inicial' | 'Em Negociação' | 'Convertido' | 'Perdido';
  comments?: string;
  municipality?: string;
  properties?: CreatePropertyDto[];
}
