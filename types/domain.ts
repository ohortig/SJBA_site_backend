import type { EventImageRow, EventAttachmentRow } from './database.js';

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

export interface EventRelatedData {
     categories?: string[];
     tags?: string[];
     images?: EventImageRow[];
     attachments?: EventAttachmentRow[];
     socialLinks?: Record<string, string>;
}
