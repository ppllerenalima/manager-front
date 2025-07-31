export interface PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  total: number;
  data: T[];
}
