export interface BaseResponse<T> {
  success: boolean;
  data?: T;
  errorMessage?: string;
}
