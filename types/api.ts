export interface ApiResponse<T = unknown> {
     success: boolean;
     data?: T;
     message?: string;
     count?: number;
     pagination?: PaginationInfo;
     error?: ApiError;
}

export interface ApiError {
     message: string;
     code: string;
     details?: unknown;
     reqBody?: unknown;
}

export interface PaginationInfo {
     page: number;
     limit: number;
     total: number;
     totalPages: number;
     hasNext: boolean;
     hasPrev: boolean;
}

export interface EventPaginatedResult {
     events: import('../models/Event.js').default[];
     total: number;
     page: number;
     limit: number;
     totalPages: number;
}
