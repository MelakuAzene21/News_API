export interface BaseResponse {
  Success: boolean;
  Message: string;
  Object: any | null;
  Errors: string[] | null;
}

export interface PaginatedResponse extends BaseResponse {
  PageNumber: number;
  PageSize: number;
  TotalSize: number;
}

export const formatResponse = (
  message: string,
  object: any = null,
  errors: string[] | null = null
): BaseResponse => {
  return {
    Success: errors === null,
    Message: message,
    Object: object,
    Errors: errors
  };
};

export const formatPaginatedResponse = (
  message: string,
  object: any[],
  pageNumber: number,
  pageSize: number,
  totalSize: number,
  errors: string[] | null = null
): PaginatedResponse => {
  return {
    Success: errors === null,
    Message: message,
    Object: object,
    PageNumber: pageNumber,
    PageSize: pageSize,
    TotalSize: totalSize,
    Errors: errors
  };
};