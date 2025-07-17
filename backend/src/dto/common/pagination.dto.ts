export class PaginationDto<T = any> {
  page: number;
  limit: number;
  total: number;
  data: T[];

  constructor(page: number, limit: number, total: number, data: T[]) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.data = data;
  }
}
