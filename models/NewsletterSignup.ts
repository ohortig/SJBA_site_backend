import { getSupabase } from '../config/supabase.js';
import type {
  NewsletterSignupRow,
  NewsletterSignupData,
  NewsletterSignupJSON,
  NewsletterFindAllOptions,
  NewsletterStats
} from '../types/index.js';

class NewsletterSignup {
  id: string | undefined;
  email: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  year: string | undefined;
  college: string | undefined;
  createdAt: string;

  constructor(data: NewsletterSignupData = {}) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.year = data.year;
    this.college = data.college;
    this.createdAt = data.created_at ?? new Date().toISOString();
  }

  // Convert database row to model instance
  static fromDatabase(row: NewsletterSignupRow | null): NewsletterSignup | null {
    if (!row) return null;
    return new NewsletterSignup(row);
  }

  // Convert model instance to database format
  toDatabase(): NewsletterSignupData {
    return {
      email: this.email,
      first_name: this.firstName,
      last_name: this.lastName,
      year: this.year,
      college: this.college,
      created_at: this.createdAt
    };
  }

  toJSON(): NewsletterSignupJSON {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      year: this.year,
      college: this.college,
      createdAt: this.createdAt
    };
  }

  // Validation
  validate(): string[] {
    const errors: string[] = [];

    if (!this.email || this.email.trim().length === 0) {
      errors.push('Email is required');
    }

    if (this.email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(this.email.toLowerCase())) {
        errors.push('Please enter a valid email');
      }
    }

    if (!this.firstName || this.firstName.trim().length === 0) {
      errors.push('First name is required');
    }

    if (!this.lastName || this.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }

    if (!this.year || this.year.trim().length === 0) {
      errors.push('Year is required');
    }

    if (!this.college || this.college.trim().length === 0) {
      errors.push('College is required');
    }

    if (this.firstName && this.firstName.length > 50) {
      errors.push('First name cannot exceed 50 characters');
    }

    if (this.lastName && this.lastName.length > 50) {
      errors.push('Last name cannot exceed 50 characters');
    }

    if (this.year && this.year.length > 50) {
      errors.push('Year cannot exceed 50 characters');
    }

    if (this.college && this.college.length > 50) {
      errors.push('College cannot exceed 50 characters');
    }

    return errors;
  }

  static async findByEmail(email: string): Promise<NewsletterSignup | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('newsletter_signups')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch newsletter signup: ${error.message}`);
    }

    return NewsletterSignup.fromDatabase(data as NewsletterSignupRow);
  }

  static async findById(id: string): Promise<NewsletterSignup | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('newsletter_signups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch newsletter signup: ${error.message}`);
    }

    return NewsletterSignup.fromDatabase(data as NewsletterSignupRow);
  }

  static async create(signupData: NewsletterSignupData): Promise<NewsletterSignup | null> {
    const signup = new NewsletterSignup(signupData);

    // Normalize email
    if (signup.email) {
      signup.email = signup.email.toLowerCase().trim();
    }

    // Validate
    const errors = signup.validate();
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('newsletter_signups')
      .insert(signup.toDatabase())
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Email is already subscribed to the newsletter');
      }
      throw new Error(`Failed to create newsletter signup: ${error.message}`);
    }

    return NewsletterSignup.fromDatabase(data as NewsletterSignupRow);
  }

  async save(): Promise<NewsletterSignup> {
    // Normalize email
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }

    // Validate
    const errors = this.validate();
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const supabase = getSupabase();

    if (this.id) {
      // Update existing
      const { data, error } = await supabase
        .from('newsletter_signups')
        .update(this.toDatabase())
        .eq('id', this.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update newsletter signup: ${error.message}`);
      }

      // Update instance with returned data
      const updated = NewsletterSignup.fromDatabase(data as NewsletterSignupRow);
      if (updated) {
        Object.assign(this, updated);
      }
    } else {
      // Create new
      const { data, error } = await supabase
        .from('newsletter_signups')
        .insert(this.toDatabase())
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Email is already subscribed to the newsletter');
        }
        throw new Error(`Failed to create newsletter signup: ${error.message}`);
      }

      // Update instance with returned data
      const created = NewsletterSignup.fromDatabase(data as NewsletterSignupRow);
      if (created) {
        Object.assign(this, created);
      }
    }

    return this;
  }

  static async findAll(options: NewsletterFindAllOptions = {}): Promise<NewsletterSignup[]> {
    const supabase = getSupabase();
    const {
      active,
      page = 1,
      limit = 50,
      orderBy = 'created_at',
      orderDirection = 'desc'
    } = options;

    let query = supabase
      .from('newsletter_signups')
      .select('*');

    if (active !== undefined) {
      query = query.eq('is_active', active);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch newsletter signups: ${error.message}`);
    }

    return (data as NewsletterSignupRow[]).map(row => NewsletterSignup.fromDatabase(row)!);
  }

  static async count(): Promise<number> {
    const supabase = getSupabase();

    const { count, error } = await supabase
      .from('newsletter_signups')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Failed to count newsletter signups: ${error.message}`);
    }

    return count ?? 0;
  }

  static async getStats(): Promise<NewsletterStats> {
    const supabase = getSupabase();

    const [totalResult] = await Promise.all([
      supabase.from('newsletter_signups').select('*', { count: 'exact', head: true }),
    ]);

    if (totalResult.error) {
      throw new Error('Failed to fetch newsletter statistics');
    }

    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentSignups, error: recentError } = await supabase
      .from('newsletter_signups')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (recentError) {
      throw new Error('Failed to fetch recent signups');
    }

    return {
      total: totalResult.count,
      recentSignups,
    };
  }
}

export default NewsletterSignup;