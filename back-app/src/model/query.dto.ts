export class QueryDto {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  search?: string; // Campo genérico para busca textual

  // Método auxiliar para obter pular (skip) registros
  static getSkip(page?: number, limit?: number): number {
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 10;
    return (p - 1) * l;
  }

  // Método auxiliar para obter limite (take)
  static getTake(limit?: number): number {
    return limit ? Number(limit) : 10;
  }

  // Sanitização básica para ordenação
  static getOrder(sort?: string, order?: 'ASC' | 'DESC'): { [p: string]: string } {
    if (!sort) return { created_at: 'DESC' };
    // Retorna o objeto de ordenação seguro para o TypeORM
    return { [sort]: order === 'ASC' ? 'ASC' : 'DESC' };
  }
}
