import { getSupabase } from '../config/supabase.js';

class NewsletterSignup {
  constructor(data = {}) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.source = data.source;
    this.isActive = data.is_active;
    this.unsubscribedAt = data.unsubscribed_at;
    this.ipAddress = data.ip_address;
    this.userAgent = data.user_agent;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Convert database row to model instance
  static fromDatabase(row) {
    if (!row) return null;
    return new NewsletterSignup(row);
  }

  // Convert model instance to database format
  toDatabase() {
    return {
      email: this.email,
      first_name: this.firstName,
      last_name: this.lastName,
      source: this.source,
      is_active: this.isActive,
      unsubscribed_at: this.unsubscribedAt,
      ip_address: this.ipAddress,
      user_agent: this.userAgent
    };
  }

  // Convert to JSON for API response (excludes sensitive data)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      source: this.source,
      isActive: this.isActive,
      unsubscribedAt: this.unsubscribedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      fullName: this.getFullName()
    };
  }

  // Get full name
  getFullName() {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.firstName || this.lastName || '';
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.email || this.email.trim().length === 0) {
      errors.push('Email is required');
    }

    if (this.email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(this.email.toLowerCase())) {
        errors.push('Please enter a valid email');
      }
    }

    if (this.firstName && this.firstName.length > 50) {
      errors.push('First name cannot exceed 50 characters');
    }

    if (this.lastName && this.lastName.length > 50) {
      errors.push('Last name cannot exceed 50 characters');
    }

    if (this.source && !['homepage', 'about', 'events', 'contact', 'other'].includes(this.source)) {
      errors.push('Invalid source value');
    }

    return errors;
  }

  // Instance method to unsubscribe
  async unsubscribe() {
    this.isActive = false;
    this.unsubscribedAt = new Date().toISOString();
    return await this.save();
  }

  // Static methods for database operations
  static async findByEmail(email) {
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

    return NewsletterSignup.fromDatabase(data);
  }

  static async findById(id) {
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

    return NewsletterSignup.fromDatabase(data);
  }

  static async create(signupData) {
    const signup = new NewsletterSignup(signupData);
    
    // Normalize email
    if (signup.email) {
      signup.email = signup.email.toLowerCase().trim();
    }

    // Set defaults
    if (!signup.source) {
      signup.source = 'homepage';
    }
    if (signup.isActive === undefined) {
      signup.isActive = true;
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

    return NewsletterSignup.fromDatabase(data);
  }

  async save() {
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
      Object.assign(this, NewsletterSignup.fromDatabase(data));
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
      Object.assign(this, NewsletterSignup.fromDatabase(data));
    }

    return this;
  }

  static async findAll(options = {}) {
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

    return data.map(row => NewsletterSignup.fromDatabase(row));
  }

  static async count(options = {}) {
    const supabase = getSupabase();
    const { active } = options;

    let query = supabase
      .from('newsletter_signups')
      .select('*', { count: 'exact', head: true });

    if (active !== undefined) {
      query = query.eq('is_active', active);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count newsletter signups: ${error.message}`);
    }

    return count;
  }

  static async getStats() {
    const supabase = getSupabase();

    // Get total counts
    const [totalResult, activeResult, unsubscribedResult] = await Promise.all([
      supabase.from('newsletter_signups').select('*', { count: 'exact', head: true }),
      supabase.from('newsletter_signups').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('newsletter_signups').select('*', { count: 'exact', head: true }).eq('is_active', false)
    ]);

    if (totalResult.error || activeResult.error || unsubscribedResult.error) {
      throw new Error('Failed to fetch newsletter statistics');
    }

    // Get signups by source
    const { data: sourceData, error: sourceError } = await supabase
      .from('newsletter_signups')
      .select('source')
      .eq('is_active', true);

    if (sourceError) {
      throw new Error('Failed to fetch signup sources');
    }

    const signupsBySource = sourceData.reduce((acc, row) => {
      acc[row.source] = (acc[row.source] || 0) + 1;
      return acc;
    }, {});

    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentSignups, error: recentError } = await supabase
      .from('newsletter_signups')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (recentError) {
      throw new Error('Failed to fetch recent signups');
    }

    return {
      total: totalResult.count,
      active: activeResult.count,
      unsubscribed: unsubscribedResult.count,
      recentSignups,
      signupsBySource: Object.entries(signupsBySource).map(([source, count]) => ({ source, count }))
    };
  }
}

export default NewsletterSignup;