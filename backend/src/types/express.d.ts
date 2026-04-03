import type { DecodedToken } from "../utils/jwt";

interface StaffEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  role_id: string;
  pin_hash?: string;
  pin_failed_attempts: number;
  pin_locked_at: string | null;
  is_locked: boolean;
  is_developer: boolean;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface CustomerEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_verified: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthenticatedUser extends DecodedToken {
  entity?: StaffEntity | CustomerEntity;
}

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      user?: AuthenticatedUser;
    }
  }
}

export {};
