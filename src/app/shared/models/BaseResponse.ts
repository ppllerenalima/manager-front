export interface BaseResponse {
  success: boolean;
  message?: string;
  errorCode?: string;
  statusCode: number;
}

export interface BaseResponseGeneric<T> extends BaseResponse {
  data?: T;
}