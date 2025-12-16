export class CreatePropertyDto {
  id?: string;
  culture: 'Soja' | 'Milho' | 'Algodão';
  municipality: string;
  area: number;
  geometry: { lat: number; lng: number }[];
  leadId?: string;
}