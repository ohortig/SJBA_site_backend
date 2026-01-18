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

export interface NewsletterSignupData {
     id?: string;
     email?: string;
     first_name?: string;
     last_name?: string;
     year?: string;
     college?: string;
     created_at?: string;
}

export interface NewsletterSignupJSON {
     id: string | undefined;
     email: string | undefined;
     firstName: string | undefined;
     lastName: string | undefined;
     year: string | undefined;
     college: string | undefined;
     createdAt: string;
}

export interface NewsletterFindAllOptions {
     active?: boolean;
     page?: number;
     limit?: number;
     orderBy?: string;
     orderDirection?: 'asc' | 'desc';
}

export interface NewsletterStats {
     total: number | null;
     recentSignups: number | null;
}
