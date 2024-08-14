export interface PagedList<T> {
  data: Array<T>;
  numberOfpages: number;
  totalRecords: number;
}
