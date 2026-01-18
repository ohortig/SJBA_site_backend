import type { EventStatus, EventCategory } from './domain.js';

export interface FindAllOptions {
     page?: number;
     limit?: number;
}

export interface EventFindAllOptions extends FindAllOptions {
     isPublic?: boolean;
     isFeatured?: boolean;
     status?: EventStatus;
     category?: EventCategory;
     upcoming?: boolean;
     past?: boolean;
     orderBy?: string;
     orderDirection?: 'asc' | 'desc';
}

export interface EventSearchOptions extends FindAllOptions {
     categories?: EventCategory[];
     isPublic?: boolean;
     status?: EventStatus;
}

export interface NewsletterFindAllOptions extends FindAllOptions {
     active?: boolean;
     orderBy?: string;
     orderDirection?: 'asc' | 'desc';
}
