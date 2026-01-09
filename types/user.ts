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
