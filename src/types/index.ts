export type Role = 'volunteer' | 'leader' | 'admin' | 'super_admin';

export interface Profile {
    id: string;
    church_id: string;
    name: string;
    phone?: string;
    email?: string;
    avatar_url?: string;
    role: Role;
    ministry_ids?: string[] | null;
    created_at: string;
}

export interface Church {
    id: string;
    name: string;
    logo_url?: string;
}

export interface Ministry {
    id: string;
    church_id: string;
    name: string;
    description?: string;
    leader_profile_id?: string;
}

export interface ServiceTime {
    id: string;
    church_id: string;
    day_of_week: string;
    time: string;
    name?: string;
}

export interface Schedule {
    id: string;
    church_id: string;
    ministry_id: string;
    date: string;
    service_time_id: string;
    created_by_profile_id?: string;
    // Joins
    ministries?: Ministry;
    service_times?: ServiceTime;
}

export interface Assignment {
    id: string;
    schedule_id: string;
    profile_id: string;
    role_in_ministry?: string;
    status: 'pending' | 'confirmed' | 'declined' | 'cancelled';
    feedback_on_cancellation?: string;
    created_at: string;
    // Joins
    profiles?: Profile;
    schedules?: Schedule;
}
