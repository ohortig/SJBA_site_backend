import { getSupabase } from '@config/supabase.js';
import type {
  EventRow,
  EventImageRow,
  EventAttachmentRow,
  EventSocialLinkRow,
  EventStatus,
  Address,
  Organizer,
  EventRelatedData,
  EventFindAllOptions,
  EventSearchOptions
} from '@app-types/index.js';

interface EventData {
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

interface EventPaginatedResult {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EventJSON {
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

class Event {
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
  createdAt: string | undefined;
  updatedAt: string | undefined;
  categories: string[];
  tags: string[];
  images: EventImageRow[];
  attachments: EventAttachmentRow[];
  socialLinks: Record<string, string>;

  constructor(data: EventData = {}) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.shortDescription = data.short_description;
    this.date = data.event_date;
    this.endDate = data.end_date;
    this.location = data.location;
    this.address = {
      street: data.street ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      zipCode: data.zip_code ?? null,
      country: data.country ?? null
    };
    this.isVirtual = data.is_virtual;
    this.virtualLink = data.virtual_link;
    this.isPublic = data.is_public;
    this.isFeatured = data.is_featured;
    this.capacity = data.capacity;
    this.registrationRequired = data.registration_required;
    this.registrationLink = data.registration_link;
    this.registrationDeadline = data.registration_deadline;
    this.price = typeof data.price === 'string' ? parseFloat(data.price) || 0 : (data.price ?? 0);
    this.currency = data.currency;
    this.organizer = {
      name: data.organizer_name ?? null,
      email: data.organizer_email ?? null,
      phone: data.organizer_phone ?? null
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
  static fromDatabase(row: EventRow | null, relatedData: EventRelatedData = {}): Event | null {
    if (!row) return null;

    const eventData: EventData = {
      ...row,
      categories: relatedData.categories,
      tags: relatedData.tags,
      images: relatedData.images,
      attachments: relatedData.attachments,
      socialLinks: relatedData.socialLinks
    };

    return new Event(eventData);
  }

  // Convert model instance to database format
  toDatabase(): Partial<EventRow> {
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
  toJSON(): EventJSON {
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
  isUpcoming(): boolean {
    if (!this.date) return false;
    return new Date(this.date) > new Date();
  }

  isPast(): boolean {
    const endDate = this.endDate ? new Date(this.endDate) : (this.date ? new Date(this.date) : null);
    if (!endDate) return false;
    return endDate < new Date();
  }

  getDurationHours(): number | null {
    if (!this.endDate || !this.date) return null;
    return Math.round((new Date(this.endDate).getTime() - new Date(this.date).getTime()) / (1000 * 60 * 60));
  }

  getPrimaryImage(): EventImageRow | null {
    const primary = this.images.find(img => img.is_primary);
    return primary || (this.images.length > 0 ? this.images[0] : null);
  }

  isRegistrationOpen(): boolean {
    if (!this.registrationRequired) return false;
    if (!this.registrationDeadline) return this.isUpcoming();
    return new Date(this.registrationDeadline) > new Date() && this.isUpcoming();
  }

  // Validation
  validate(): string[] {
    const errors: string[] = [];

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
  static async findAll(options: EventFindAllOptions = {}): Promise<EventPaginatedResult> {
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

      const ids = (eventIds as { event_id: string }[]).map(row => row.event_id);
      if (ids.length === 0) {
        return { events: [], total: 0, page, limit, totalPages: 0 };
      }
      query = query.in('id', ids);
    }

    // Get total count
    let totalQuery = supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', isPublic)
      .eq('status', status);

    if (isFeatured !== undefined) totalQuery = totalQuery.eq('is_featured', isFeatured);
    if (upcoming) totalQuery = totalQuery.gte('event_date', now);
    if (past) totalQuery = totalQuery.lt('event_date', now);
    if (category) {
      const { data: eventIds } = await supabase
        .from('event_categories')
        .select('event_id')
        .eq('category', category);
      const ids = (eventIds as { event_id: string }[] | null)?.map(row => row.event_id) ?? [];
      if (ids.length > 0) totalQuery = totalQuery.in('id', ids);
    }

    const [countResult, eventsResult] = await Promise.all([
      totalQuery,
      query
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range((page - 1) * limit, page * limit - 1)
    ]);

    if (countResult.error || eventsResult.error) {
      throw new Error(`Failed to fetch events: ${countResult.error?.message || eventsResult.error?.message}`);
    }

    const total = countResult.count ?? 0;
    const events = eventsResult.data as EventRow[];

    // Load related data for each event
    const eventsWithRelated = await Promise.all(
      events.map(event => Event.loadRelatedData(event))
    );

    return {
      events: eventsWithRelated.map(({ event, related }) => Event.fromDatabase(event, related)!),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async findById(id: string): Promise<Event | null> {
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
    const { related } = await Event.loadRelatedData(data as EventRow);
    return Event.fromDatabase(data as EventRow, related);
  }

  static async findUpcoming(limit: number = 10): Promise<Event[]> {
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
      (data as EventRow[]).map(event => Event.loadRelatedData(event))
    );

    return eventsWithRelated.map(({ event, related }) => Event.fromDatabase(event, related)!);
  }

  static async search(searchQuery: string, options: EventSearchOptions = {}): Promise<EventPaginatedResult> {
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

      const ids = (eventIds as { event_id: string }[]).map(row => row.event_id);
      if (ids.length === 0) {
        return { events: [], total: 0, page, limit, totalPages: 0 };
      }
      query = query.in('id', ids);
    }

    // Get total count and events
    let countQuery = supabase
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
      const ids = (eventIds as { event_id: string }[] | null)?.map(row => row.event_id) ?? [];
      if (ids.length > 0) countQuery = countQuery.in('id', ids);
    }

    const [countResult, eventsResult] = await Promise.all([
      countQuery,
      query
        .order('event_date', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)
    ]);

    if (countResult.error || eventsResult.error) {
      throw new Error(`Failed to search events: ${countResult.error?.message || eventsResult.error?.message}`);
    }

    const total = countResult.count ?? 0;
    const events = eventsResult.data as EventRow[];

    // Load related data for each event
    const eventsWithRelated = await Promise.all(
      events.map(event => Event.loadRelatedData(event))
    );

    return {
      events: eventsWithRelated.map(({ event, related }) => Event.fromDatabase(event, related)!),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Helper method to load related data
  static async loadRelatedData(eventData: EventRow): Promise<{ event: EventRow; related: EventRelatedData }> {
    const supabase = getSupabase();
    const eventId = eventData.id;

    const [
      categoriesResult,
      tagsResult,
      imagesResult,
      attachmentsResult,
      socialLinksResult
    ] = await Promise.all([
      supabase.from('event_categories').select('category').eq('event_id', eventId),
      supabase.from('event_tags').select('tag').eq('event_id', eventId),
      supabase.from('event_images').select('*').eq('event_id', eventId),
      supabase.from('event_attachments').select('*').eq('event_id', eventId),
      supabase.from('event_social_links').select('*').eq('event_id', eventId)
    ]);

    if (categoriesResult.error || tagsResult.error || imagesResult.error || attachmentsResult.error || socialLinksResult.error) {
      console.warn('Failed to load some related data for event:', eventId);
    }

    const categories = categoriesResult.data as { category: string }[] | null;
    const tags = tagsResult.data as { tag: string }[] | null;
    const images = imagesResult.data as EventImageRow[] | null;
    const attachments = attachmentsResult.data as EventAttachmentRow[] | null;
    const socialLinks = socialLinksResult.data as EventSocialLinkRow[] | null;

    const related: EventRelatedData = {
      categories: categories?.map(c => c.category) || [],
      tags: tags?.map(t => t.tag) || [],
      images: images || [],
      attachments: attachments || [],
      socialLinks: socialLinks?.reduce<Record<string, string>>((acc, link) => {
        acc[link.platform] = link.url;
        return acc;
      }, {}) || {}
    };

    return { event: eventData, related };
  }

  static async create(eventData: EventData): Promise<Event | null> {
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

    const newEvent = Event.fromDatabase(data as EventRow);

    // Save related data
    if (newEvent) {
      await newEvent.saveRelatedData();
    }

    return newEvent;
  }

  async save(): Promise<Event> {
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

      const updated = Event.fromDatabase(data as EventRow);
      if (updated) {
        Object.assign(this, updated);
      }
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

      const created = Event.fromDatabase(data as EventRow);
      if (created) {
        Object.assign(this, created);
      }
    }

    // Save related data
    await this.saveRelatedData();

    return this;
  }

  async saveRelatedData(): Promise<void> {
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
    if (this.categories.length > 0) {
      await supabase.from('event_categories').insert(
        this.categories.map(category => ({ event_id: this.id, category }))
      );
    }

    if (this.tags.length > 0) {
      await supabase.from('event_tags').insert(
        this.tags.map(tag => ({ event_id: this.id, tag }))
      );
    }

    if (this.images.length > 0) {
      await supabase.from('event_images').insert(
        this.images.map(({ id: _id, event_id: _eventId, ...rest }) => ({
          event_id: this.id,
          ...rest
        }))
      );
    }

    if (this.attachments.length > 0) {
      await supabase.from('event_attachments').insert(
        this.attachments.map(({ id: _id, event_id: _eventId, ...rest }) => ({
          event_id: this.id,
          ...rest
        }))
      );
    }

    if (Object.keys(this.socialLinks).length > 0) {
      await supabase.from('event_social_links').insert(
        Object.entries(this.socialLinks).map(([platform, url]) => ({
          event_id: this.id,
          platform,
          url
        }))
      );
    }
  }
}

export default Event;