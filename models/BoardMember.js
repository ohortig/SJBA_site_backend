import { getSupabase } from '../config/supabase.js';

class BoardMember {
  /*
    id uuid not null default gen_random_uuid (),
    position character varying(255) not null,
    full_name character varying(255) not null,
    bio text not null,
    major character varying(255) not null,
    year character varying(255) not null,
    hometown character varying(255) not null,
    linkedin_url character varying(255) null,
    email character varying(255) not null,
    headshot_file character varying(255) null,
  */
  constructor(data = {}) {
    this.id = data.id;
    this.fullName = data.full_name;
    this.position = data.position;
    this.bio = data.bio;
    this.major = data.major;
    this.year = data.year;
    this.hometown = data.hometown;
    this.linkedinUrl = data.linkedin_url;
    this.email = data.email;
    this.headshotFile = data.headshot_file;
    this.orderIndex = data.order_index;
  }

  static fromDatabase(row) {
    if (!row) return null;
    return new BoardMember(row);
  }

  toDatabase() {
    return {
      id: this.id,
      full_name: this.fullName,
      position: this.position,
      bio: this.bio,
      major: this.major,
      year: this.year,
      hometown: this.hometown,
      linkedin_url: this.linkedinUrl,
      email: this.email,
      headshot_file: this.headshotFile,
      order_index: this.orderIndex
    };
  }

  toJSON() {
    return {
      id: this.id,
      full_name: this.fullName,
      position: this.position,
      bio: this.bio,
      major: this.major,
      year: this.year,
      hometown: this.hometown,
      linkedin_url: this.linkedinUrl,
      email: this.email,
      headshot_file: this.headshotFile,
      order_index: this.orderIndex
    };
  }

  validate() {
    const errors = [];

    if (!this.fullName || this.fullName.trim().length === 0) {
      errors.push('Name is required');
    }

    if (this.fullName && this.fullName.length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }

    if (!this.position || this.position.trim().length === 0) {
      errors.push('Position is required');
    }
    if (this.position && this.position.length > 100) {
      errors.push('Position cannot exceed 100 characters');
    }

    if (this.email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(this.email)) {
        errors.push('Please enter a valid email');
      }
    }

    if (this.major && this.major.length > 100) {
      errors.push('Major cannot exceed 100 characters');
    }

    return errors;
  }

  static async findAll(options = {}) {
    const supabase = getSupabase();
    
    let query = supabase
      .from('board_members')
      .select('*');

    query = query.order('order_index', { ascending: true })
                 .order('full_name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch board members: ${error.message}`);
    }

    return data.map(row => BoardMember.fromDatabase(row));
  }

  static async findById(id) {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('board_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch board member: ${error.message}`);
    }

    return BoardMember.fromDatabase(data);
  }

  static async create(memberData) {
    const member = new BoardMember(memberData);
    const errors = member.validate();
    
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('board_members')
      .insert(member.toDatabase())
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create board member: ${error.message}`);
    }

    return BoardMember.fromDatabase(data);
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
        .from('board_members')
        .update(this.toDatabase())
        .eq('id', this.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update board member: ${error.message}`);
      }

      // Update instance with returned data
      Object.assign(this, BoardMember.fromDatabase(data));
    } else {
      // Create new
      const { data, error } = await supabase
        .from('board_members')
        .insert(this.toDatabase())
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create board member: ${error.message}`);
      }

      // Update instance with returned data
      Object.assign(this, BoardMember.fromDatabase(data));
    }

    return this;
  }

  async delete() {
    if (!this.id) {
      throw new Error('Cannot delete board member without ID');
    }

    const supabase = getSupabase();

    const { error } = await supabase
      .from('board_members')
      .delete()
      .eq('id', this.id);

    if (error) {
      throw new Error(`Failed to delete board member: ${error.message}`);
    }

    return true;
  }

  static async count(options = {}) {
    const supabase = getSupabase();

    let query = supabase
      .from('board_members')
      .select('*', { count: 'exact', head: true });

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count board members: ${error.message}`);
    }

    return count;
  }
}

export default BoardMember;