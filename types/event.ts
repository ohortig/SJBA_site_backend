export interface EventRow {
     id: string;
     created_at: string;
     updated_at: string;
     title: string;
     company: string | null;
     start_time: string;
     end_time: string | null;
     location: string | null;
     flyer_file: string | null;
     rsvp_link: string | null;
     description: string | null;
     is_visible: boolean;
}

export interface EventsQueryParams {
     page?: number;
     limit?: number;
     search?: string;
     startDate?: string;
     endDate?: string;
}

export interface EventPaginatedResult<T> {
     events: T[];
     total: number;
     page: number;
     limit: number;
     totalPages: number;
}
