// 后端统一响应格式
export interface BaseResponse<T = any> {
  status: number;
  message: string;
  data: T;
}
