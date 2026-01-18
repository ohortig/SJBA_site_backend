export interface ContactSubmissionRow {
     id: string;
     first_name: string;
     last_name: string;
     email: string;
     company: string | null;
     message: string;
     created_at: string;
}

export interface ContactFormData {
     id?: string;
     first_name?: string;
     last_name?: string;
     email?: string;
     company?: string | null;
     message?: string;
     created_at?: string;
}

export interface ContactFormJSON {
     id: string | undefined;
     firstName: string | undefined;
     lastName: string | undefined;
     email: string | undefined;
     company: string | null | undefined;
     message: string | undefined;
     createdAt: string;
}
