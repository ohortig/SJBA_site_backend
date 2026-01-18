export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type EventCategory = 'workshop' | 'conference' | 'networking' | 'seminar' | 'hackathon' | 'meetup' | 'webinar' | 'other';
export type Currency = 'USD' | 'EUR' | 'GBP';

export interface Address {
     street: string | null;
     city: string | null;
     state: string | null;
     zipCode: string | null;
     country: string | null;
}

export interface Organizer {
     name: string | null;
     email: string | null;
     phone: string | null;
}

export interface EventRow {
     id: string;
     title: string;
     description: string;
     short_description: string | null;
     event_date: string;
     end_date: string | null;
     location: string | null;
     street: string | null;
     city: string | null;
     state: string | null;
     zip_code: string | null;
     country: string | null;
     is_virtual: boolean;
     virtual_link: string | null;
     is_public: boolean;
     is_featured: boolean;
     capacity: number | null;
     registration_required: boolean;
     registration_link: string | null;
     registration_deadline: string | null;
     price: string | number;
     currency: string;
     organizer_name: string | null;
     organizer_email: string | null;
     organizer_phone: string | null;
     status: EventStatus;
     created_at: string;
     updated_at: string;
}

export interface EventImageRow {
     id: string;
     event_id: string;
     url: string;
     alt_text: string | null;
     is_primary: boolean;
}

export interface EventCategoryRow {
     id: string;
     event_id: string;
     category: EventCategory;
}

export interface EventTagRow {
     id: string;
     event_id: string;
     tag: string;
}

export interface EventAttachmentRow {
     id: string;
     event_id: string;
     filename: string;
     url: string;
     file_type: string;
}

export interface EventSocialLinkRow {
     id: string;
     event_id: string;
     platform: string;
     url: string;
}

export interface EventRelatedData {
     categories?: string[];
     tags?: string[];
     images?: EventImageRow[];
     attachments?: EventAttachmentRow[];
     socialLinks?: Record<string, string>;
}

export interface EventData {
     id?: string;
     title?: string;
     description?: string;
     short_description?: string | null;
     event_date?: string;
     end_date?: string | null;
     location?: string | null;
     street?: string | null;
     city?: string | null;
     state?: string | null;
     zip_code?: string | null;
     country?: string | null;
     is_virtual?: boolean;
     virtual_link?: string | null;
     is_public?: boolean;
     is_featured?: boolean;
     capacity?: number | null;
     registration_required?: boolean;
     registration_link?: string | null;
     registration_deadline?: string | null;
     price?: string | number;
     currency?: string;
     organizer_name?: string | null;
     organizer_email?: string | null;
     organizer_phone?: string | null;
     status?: EventStatus;
     created_at?: string;
     updated_at?: string;
     categories?: string[];
     tags?: string[];
     images?: EventImageRow[];
     attachments?: EventAttachmentRow[];
     socialLinks?: Record<string, string>;
}

export interface EventJSON {
     id: string | undefined;
     title: string | undefined;
     description: string | undefined;
     shortDescription: string | null | undefined;
     date: string | undefined;
     endDate: string | null | undefined;
     location: string | null | undefined;
     address: Address;
     isVirtual: boolean | undefined;
     virtualLink: string | null | undefined;
     isPublic: boolean | undefined;
     isFeatured: boolean | undefined;
     capacity: number | null | undefined;
     registrationRequired: boolean | undefined;
     registrationLink: string | null | undefined;
     registrationDeadline: string | null | undefined;
     price: number;
     currency: string | undefined;
     organizer: Organizer;
     status: EventStatus | undefined;
     categories: string[];
     tags: string[];
     images: EventImageRow[];
     attachments: EventAttachmentRow[];
     socialLinks: Record<string, string>;
     isUpcoming: boolean;
     isPast: boolean;
     durationHours: number | null;
     primaryImage: EventImageRow | null;
     isRegistrationOpen: boolean;
     createdAt: string | undefined;
     updatedAt: string | undefined;
}

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
