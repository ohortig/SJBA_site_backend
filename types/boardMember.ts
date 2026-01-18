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

export interface BoardMemberData {
     id: string;
     full_name: string;
     position: string;
     bio: string;
     major: string;
     year: string;
     hometown: string;
     linkedin_url: string | null;
     email: string;
     headshot_file: string | null;
     order_index: number;
}

export interface BoardMemberJSON {
     id: string;
     full_name: string;
     position: string;
     bio: string;
     major: string;
     year: string;
     hometown: string;
     linkedin_url: string | null;
     email: string;
     headshot_file: string | null;
     order_index: number;
}