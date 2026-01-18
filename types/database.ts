import type { EventStatus, EventCategory } from './domain.js';

export interface BoardMemberRow {
     id: string;
     position: string;
     full_name: string;
     bio: string;
     major: string;
     year: string;
     hometown: string;
     linkedin_url: string | null;
     email: string;
     headshot_file: string | null;
     order_index: number;
}

export interface NewsletterSignupRow {
     id: string;
     email: string;
     first_name: string;
     last_name: string;
     year: string;
     college: string;
     created_at: string;
     is_active?: boolean;
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
