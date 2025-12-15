// Organization types for multi-tenant system

export interface Organization {
  id: string;
  name: string;
  slug?: string; // URL-friendly name
  description?: string;
  logoUrl?: string;
  settings?: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID of creator
}

export interface OrganizationSettings {
  // General settings
  timezone: string;
  currency: 'ARS' | 'USD' | 'EUR';
  language: 'es' | 'en';

  // Feature flags
  features?: {
    accounting: boolean;
    roadmap: boolean;
    // Add more features as needed
  };
}

// Member roles
export type MemberRole = 'owner' | 'admin' | 'operator' | 'viewer';

export interface Member {
  id: string; // Same as user ID
  orgId: string;
  userId: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: MemberRole;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: Date;
  invitedBy?: string;
}

// Invitation types
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface Invitation {
  id: string;
  orgId: string;
  email: string;
  role: MemberRole;
  status: InvitationStatus;
  invitedBy: string;
  invitedByName: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}

// Role permissions
export const ROLE_PERMISSIONS: Record<MemberRole, string[]> = {
  owner: [
    'organization.delete',
    'organization.update',
    'members.manage',
    'members.invite',
    'data.read',
    'data.write',
    'data.delete',
  ],
  admin: [
    'organization.update',
    'members.manage',
    'members.invite',
    'data.read',
    'data.write',
    'data.delete',
  ],
  operator: ['data.read', 'data.write'],
  viewer: ['data.read'],
};

// Check if role has permission
export const hasPermission = (
  role: MemberRole,
  permission: string
): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};
