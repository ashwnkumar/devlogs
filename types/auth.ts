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
}
