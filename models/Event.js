import { getSupabase } from '../config/supabase.js';

class Event {
  constructor(data = {}) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.shortDescription = data.short_description;
    this.date = data.event_date;
    this.endDate = data.end_date;
    this.location = data.location;
    this.address = {
      street: data.street,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      country: data.country
    };
    this.isVirtual = data.is_virtual;
    this.virtualLink = data.virtual_link;
    this.isPublic = data.is_public;
    this.isFeatured = data.is_featured;
    this.capacity = data.capacity;
    this.registrationRequired = data.registration_required;
    this.registrationLink = data.registration_link;
    this.registrationDeadline = data.registration_deadline;
    this.price = parseFloat(data.price) || 0;
    this.currency = data.currency;
    this.organizer = {
      name: data.organizer_name,
      email: data.organizer_email,
      phone: data.organizer_phone
    };
    this.status = data.status;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    
    // Related data (loaded separately)
    this.categories = data.categories || [];
    this.tags = data.tags || [];
    this.images = data.images || [];
    this.attachments = data.attachments || [];
    this.socialLinks = data.socialLinks || {};
  }

  // Convert database row to model instance
  static fromDatabase(row, relatedData = {}) {
    if (!row) return null;
    
    const event = new Event(row);
    
    // Add related data if provided
    if (relatedData.categories) event.categories = relatedData.categories;
    if (relatedData.tags) event.tags = relatedData.tags;
    if (relatedData.images) event.images = relatedData.images;
    if (relatedData.attachments) event.attachments = relatedData.attachments;
    if (relatedData.socialLinks) event.socialLinks = relatedData.socialLinks;
    
    return event;
  }

  // Convert model instance to database format
  toDatabase() {
    return {
      title: this.title,
      description: this.description,
      short_description: this.shortDescription,
      event_date: this.date,
      end_date: this.endDate,
      location: this.location,
      street: this.address?.street,
      city: this.address?.city,
      state: this.address?.state,
      zip_code: this.address?.zipCode,
      country: this.address?.country || 'USA',
      is_virtual: this.isVirtual,
      virtual_link: this.virtualLink,
      is_public: this.isPublic,
      is_featured: this.isFeatured,
      capacity: this.capacity,
      registration_required: this.registrationRequired,
      registration_link: this.registrationLink,
      registration_deadline: this.registrationDeadline,
      price: this.price,
      currency: this.currency || 'USD',
      organizer_name: this.organizer?.name,
      organizer_email: this.organizer?.email,
      organizer_phone: this.organizer?.phone,
      status: this.status || 'published'
    };
  }

  // Convert to JSON for API response
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      shortDescription: this.shortDescription,
      date: this.date,
      endDate: this.endDate,
      location: this.location,
      address: this.address,
      isVirtual: this.isVirtual,
      virtualLink: this.virtualLink,
      isPublic: this.isPublic,
      isFeatured: this.isFeatured,
      capacity: this.capacity,
      registrationRequired: this.registrationRequired,
      registrationLink: this.registrationLink,
      registrationDeadline: this.registrationDeadline,
      price: this.price,
      currency: this.currency,
      organizer: this.organizer,
      status: this.status,
      categories: this.categories,
      tags: this.tags,
      images: this.images,
      attachments: this.attachments,
      socialLinks: this.socialLinks,
      isUpcoming: this.isUpcoming(),
      isPast: this.isPast(),
      durationHours: this.getDurationHours(),
      primaryImage: this.getPrimaryImage(),
      isRegistrationOpen: this.isRegistrationOpen(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Virtual properties
  isUpcoming() {
    return new Date(this.date) > new Date();
  }

  isPast() {
    const endDate = this.endDate ? new Date(this.endDate) : new Date(this.date);
    return endDate < new Date();
  }

  getDurationHours() {
    if (!this.endDate) return null;
    return Math.round((new Date(this.endDate) - new Date(this.date)) / (1000 * 60 * 60));
  }

  getPrimaryImage() {
    const primary = this.images.find(img => img.is_primary);
    return primary || (this.images.length > 0 ? this.images[0] : null);
  }

  isRegistrationOpen() {
    if (!this.registrationRequired) return false;
    if (!this.registrationDeadline) return this.isUpcoming();
    return new Date(this.registrationDeadline) > new Date() && this.isUpcoming();
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }
    if (this.title && this.title.length > 200) {
      errors.push('Title cannot exceed 200 characters');
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description is required');
    }
    if (this.description && this.description.length > 2000) {
      errors.push('Description cannot exceed 2000 characters');
    }

    if (!this.date) {
      errors.push('Event date is required');
    }

    if (this.shortDescription && this.shortDescription.length > 300) {
      errors.push('Short description cannot exceed 300 characters');
    }

    if (this.location && this.location.length > 200) {
      errors.push('Location cannot exceed 200 characters');
    }

    if (this.capacity && this.capacity < 0) {
      errors.push('Capacity must be a positive number');
    }

    if (this.price && this.price < 0) {
      errors.push('Price must be a positive number');
    }

    if (this.currency && !['USD', 'EUR', 'GBP'].includes(this.currency)) {
      errors.push('Currency must be USD, EUR, or GBP');
    }

    if (this.status && !['draft', 'published', 'cancelled', 'completed'].includes(this.status)) {
      errors.push('Status must be draft, published, cancelled, or completed');
    }

    return errors;
  }

  // Static methods for database operations
  static async findAll(options = {}) {
    const supabase = getSupabase();
    const {
      page = 1,
      limit = 10,
      isPublic = true,
      isFeatured,
      status = 'published',
      category,
      upcoming,
      past,
      orderBy = 'event_date',
      orderDirection = 'asc'
    } = options;

    let query = supabase
      .from('events')
      .select('*');

    // Apply filters
    query = query.eq('is_public', isPublic);
    query = query.eq('status', status);

    if (isFeatured !== undefined) {
      query = query.eq('is_featured', isFeatured);
    }

    // Date filtering
    const now = new Date().toISOString();
    if (upcoming) {
      query = query.gte('event_date', now);
    } else if (past) {
      query = query.lt('event_date', now);
    }

    // Category filtering (requires join with event_categories)
    if (category) {
      const { data: eventIds, error: categoryError } = await supabase
        .from('event_categories')
        .select('event_id')
        .eq('category', category);

      if (categoryError) {
        throw new Error(`Failed to filter by category: ${categoryError.message}`);
      }

      const ids = eventIds.map(row => row.event_id);
      if (ids.length === 0) {
        return { events: [], total: 0 }; // No events in this category
      }
      query = query.in('id', ids);
    }

    // Get total count
    const countQuery = supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    
    // Apply same filters to count query
    let totalQuery = countQuery.eq('is_public', isPublic).eq('status', status);
    if (isFeatured !== undefined) totalQuery = totalQuery.eq('is_featured', isFeatured);
    if (upcoming) totalQuery = totalQuery.gte('event_date', now);
    if (past) totalQuery = totalQuery.lt('event_date', now);
    if (category) {
      const { data: eventIds } = await supabase
        .from('event_categories')
        .select('event_id')
        .eq('category', category);
      const ids = eventIds.map(row => row.event_id);
      if (ids.length > 0) totalQuery = totalQuery.in('id', ids);
    }

    const [{ count: total, error: countError }, { data: events, error: eventsError }] = await Promise.all([
      totalQuery,
      query
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range((page - 1) * limit, page * limit - 1)
    ]);

    if (countError || eventsError) {
      throw new Error(`Failed to fetch events: ${countError?.message || eventsError?.message}`);
    }

    // Load related data for each event
    const eventsWithRelated = await Promise.all(
      events.map(event => Event.loadRelatedData(event))
    );

    return {
      events: eventsWithRelated.map(event => Event.fromDatabase(event.event, event.related)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async findById(id) {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch event: ${error.message}`);
    }

    // Load related data
    const { related } = await Event.loadRelatedData(data);
    return Event.fromDatabase(data, related);
  }

  static async findUpcoming(limit = 10) {
    const supabase = getSupabase();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'published')
      .gte('event_date', now)
      .order('event_date', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch upcoming events: ${error.message}`);
    }

    // Load related data for each event
    const eventsWithRelated = await Promise.all(
      data.map(event => Event.loadRelatedData(event))
    );

    return eventsWithRelated.map(event => Event.fromDatabase(event.event, event.related));
  }

  static async search(searchQuery, options = {}) {
    const supabase = getSupabase();
    const {
      page = 1,
      limit = 10,
      categories,
      isPublic = true,
      status = 'published'
    } = options;

    // Use PostgreSQL full-text search
    let query = supabase
      .from('events')
      .select('*')
      .textSearch('title', searchQuery)
      .eq('is_public', isPublic)
      .eq('status', status);

    // Category filtering
    if (categories && categories.length > 0) {
      const { data: eventIds, error: categoryError } = await supabase
        .from('event_categories')
        .select('event_id')
        .in('category', categories);

      if (categoryError) {
        throw new Error(`Failed to filter by categories: ${categoryError.message}`);
      }

      const ids = eventIds.map(row => row.event_id);
      if (ids.length === 0) {
        return { events: [], total: 0 };
      }
      query = query.in('id', ids);
    }

    // Get total count and events
    const countQuery = supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .textSearch('title', searchQuery)
      .eq('is_public', isPublic)
      .eq('status', status);

    if (categories && categories.length > 0) {
      const { data: eventIds } = await supabase
        .from('event_categories')
        .select('event_id')
        .in('category', categories);
      const ids = eventIds.map(row => row.event_id);
      if (ids.length > 0) countQuery.in('id', ids);
    }

    const [{ count: total, error: countError }, { data: events, error: eventsError }] = await Promise.all([
      countQuery,
      query
        .order('event_date', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)
    ]);

    if (countError || eventsError) {
      throw new Error(`Failed to search events: ${countError?.message || eventsError?.message}`);
    }

    // Load related data for each event
    const eventsWithRelated = await Promise.all(
      events.map(event => Event.loadRelatedData(event))
    );

    return {
      events: eventsWithRelated.map(event => Event.fromDatabase(event.event, event.related)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Helper method to load related data
  static async loadRelatedData(eventData) {
    const supabase = getSupabase();
    const eventId = eventData.id;

    const [
      { data: categories, error: catError },
      { data: tags, error: tagError },
      { data: images, error: imgError },
      { data: attachments, error: attError },
      { data: socialLinks, error: socialError }
    ] = await Promise.all([
      supabase.from('event_categories').select('category').eq('event_id', eventId),
      supabase.from('event_tags').select('tag').eq('event_id', eventId),
      supabase.from('event_images').select('*').eq('event_id', eventId),
      supabase.from('event_attachments').select('*').eq('event_id', eventId),
      supabase.from('event_social_links').select('*').eq('event_id', eventId)
    ]);

    if (catError || tagError || imgError || attError || socialError) {
      console.warn('Failed to load some related data for event:', eventId);
    }

    const related = {
      categories: categories?.map(c => c.category) || [],
      tags: tags?.map(t => t.tag) || [],
      images: images || [],
      attachments: attachments || [],
      socialLinks: socialLinks?.reduce((acc, link) => {
        acc[link.platform] = link.url;
        return acc;
      }, {}) || {}
    };

    return { event: eventData, related };
  }

  static async create(eventData) {
    const event = new Event(eventData);
    
    // Validate
    const errors = event.validate();
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('events')
      .insert(event.toDatabase())
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }

    const newEvent = Event.fromDatabase(data);
    
    // Save related data
    await newEvent.saveRelatedData();

    return newEvent;
  }

  async save() {
    // Validate
    const errors = this.validate();
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const supabase = getSupabase();

    if (this.id) {
      // Update existing
      const { data, error } = await supabase
        .from('events')
        .update(this.toDatabase())
        .eq('id', this.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update event: ${error.message}`);
      }

      Object.assign(this, Event.fromDatabase(data));
    } else {
      // Create new
      const { data, error } = await supabase
        .from('events')
        .insert(this.toDatabase())
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create event: ${error.message}`);
      }

      Object.assign(this, Event.fromDatabase(data));
    }

    // Save related data
    await this.saveRelatedData();

    return this;
  }

  async saveRelatedData() {
    const supabase = getSupabase();

    if (!this.id) return;

    // Clear existing related data
    await Promise.all([
      supabase.from('event_categories').delete().eq('event_id', this.id),
      supabase.from('event_tags').delete().eq('event_id', this.id),
      supabase.from('event_images').delete().eq('event_id', this.id),
      supabase.from('event_attachments').delete().eq('event_id', this.id),
      supabase.from('event_social_links').delete().eq('event_id', this.id)
    ]);

    // Insert new related data
    const promises = [];

    if (this.categories.length > 0) {
      promises.push(
        supabase.from('event_categories').insert(
          this.categories.map(category => ({ event_id: this.id, category }))
        )
      );
    }

    if (this.tags.length > 0) {
      promises.push(
        supabase.from('event_tags').insert(
          this.tags.map(tag => ({ event_id: this.id, tag }))
        )
      );
    }

    if (this.images.length > 0) {
      promises.push(
        supabase.from('event_images').insert(
          this.images.map(image => ({ event_id: this.id, ...image }))
        )
      );
    }

    if (this.attachments.length > 0) {
      promises.push(
        supabase.from('event_attachments').insert(
          this.attachments.map(attachment => ({ event_id: this.id, ...attachment }))
        )
      );
    }

    if (Object.keys(this.socialLinks).length > 0) {
      promises.push(
        supabase.from('event_social_links').insert(
          Object.entries(this.socialLinks).map(([platform, url]) => ({
            event_id: this.id,
            platform,
            url
          }))
        )
      );
    }

    await Promise.all(promises);
  }
}

export default Event;