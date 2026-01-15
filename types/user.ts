export interface UserType {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  avatar_url: string;
  username: string;
  timezone: string;
  last_active: Date;
  email: string;
  preferences: Record<string, unknown>;
  current_company: string | null;
}

export type CompanyType = {
  id: string;
  user_id: string;
  name: string;
  joined_at: string;
  left_at: string | null;
  location: string;
  created_at: string;
  updated_at: string;
};

export type ProjectType = {
  id: string;
  name: string;
  company_id: string;
  created_at: string;
  updated_at: string;
};

export type TaskTypeType = {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};


export type TaskType = {
  id: string;
  user_id: string;
  project_id: string;
  task_type: string;

  title: string;

  start_time: string; // ISO datetime
  end_time: string | null;
  duration_minutes: number | null;

  is_running: boolean;
  is_overtime: boolean;

  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
};
