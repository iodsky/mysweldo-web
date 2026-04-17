export type ApiResponse<T> = {
  success: boolean;
  message: string;
  timestamp: string;
  data: T;
};

type PaginationMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type PaginatedApiResponse<T> = ApiResponse<T> & {
  meta: PaginationMeta;
};

type ValidationError = {
  field: string;
  message: string;
};

type DuplicateField = {
  field: string;
  value: string;
};

export type ApiError = {
  timestamp: string;
  status: number;
  message: string;
  validationErrors?: ValidationError[];
  duplicateField?: DuplicateField;
};
