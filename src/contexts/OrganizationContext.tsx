'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { OrganizationService } from '@/services/organization/OrganizationService';
import { MemberService } from '@/services/organization/MemberService';
import { UserService } from '@/services/auth/UserService';
import {
  Organization,
  Member,
  MemberRole,
  hasPermission,
} from '@/types/organization';

interface OrganizationContextType {
  // Current organization
  organization: Organization | null;
  organizations: Organization[];

  // Current user's role and membership
  member: Member | null;
  members: Member[];

  // Loading states
  loading: boolean;
  error: string | null;

  // Actions
  switchOrganization: (orgId: string) => Promise<void>;
  createOrganization: (name: string) => Promise<Organization>;
  refreshOrganization: () => Promise<void>;
  refreshMembers: () => Promise<void>;

  // Permission checks
  can: (permission: string) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
  canWrite: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      'useOrganization must be used within an OrganizationProvider'
    );
  }
  return context;
};

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider = ({
  children,
}: OrganizationProviderProps) => {
  const { user } = useAuth();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's organizations
  useEffect(() => {
    const loadOrganizations = async () => {
      if (!user) {
        setOrganization(null);
        setOrganizations([]);
        setMember(null);
        setMembers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get all organizations for user
        const userOrgs = await OrganizationService.getByUserId(user.id);
        setOrganizations(userOrgs);

        // If user has a current org, load it
        if (user.currentOrganizationId) {
          const currentOrg = userOrgs.find(
            o => o.id === user.currentOrganizationId
          );
          if (currentOrg) {
            setOrganization(currentOrg);

            // Load current member info
            const memberInfo = await MemberService.getMember(
              currentOrg.id,
              user.id
            );
            setMember(memberInfo);

            // Load all members
            const allMembers = await MemberService.getMembers(currentOrg.id);
            setMembers(allMembers);
          }
        } else if (userOrgs.length > 0) {
          // Default to first org
          const firstOrg = userOrgs[0];
          setOrganization(firstOrg);

          // Update user's current organization
          await UserService.setCurrentOrganization(user.id, firstOrg.id);

          // Load member info
          const memberInfo = await MemberService.getMember(
            firstOrg.id,
            user.id
          );
          setMember(memberInfo);

          const allMembers = await MemberService.getMembers(firstOrg.id);
          setMembers(allMembers);
        }
      } catch (err) {
        console.error('Error loading organizations:', err);
        setError('Error al cargar organizaciones');
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, [user]);

  const switchOrganization = async (orgId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const org = organizations.find(o => o.id === orgId);

      if (org) {
        setOrganization(org);

        // Update user's current organization
        await UserService.setCurrentOrganization(user.id, orgId);

        // Load member info
        const memberInfo = await MemberService.getMember(orgId, user.id);
        setMember(memberInfo);

        const allMembers = await MemberService.getMembers(orgId);
        setMembers(allMembers);
      }
    } catch (err) {
      console.error('Error switching organization:', err);
      setError('Error al cambiar de organización');
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (name: string): Promise<Organization> => {
    if (!user) throw new Error('Not authenticated');

    try {
      const newOrg = await OrganizationService.create(
        name,
        user.id,
        user.email,
        user.displayName || undefined
      );

      // Update state
      setOrganizations(prev => [...prev, newOrg]);
      setOrganization(newOrg);

      // Update user's current organization
      await UserService.setCurrentOrganization(user.id, newOrg.id);

      // Load member info (creator is owner)
      const memberInfo = await MemberService.getMember(newOrg.id, user.id);
      setMember(memberInfo);
      setMembers(memberInfo ? [memberInfo] : []);

      return newOrg;
    } catch (err) {
      console.error('Error creating organization:', err);
      throw err;
    }
  };

  const refreshOrganization = async () => {
    if (!organization) return;

    try {
      const org = await OrganizationService.getById(organization.id);
      if (org) {
        setOrganization(org);
      }
    } catch (err) {
      console.error('Error refreshing organization:', err);
    }
  };

  const refreshMembers = async () => {
    if (!organization) return;

    try {
      const allMembers = await MemberService.getMembers(organization.id);
      setMembers(allMembers);
    } catch (err) {
      console.error('Error refreshing members:', err);
    }
  };

  // Permission helpers
  const can = (permission: string): boolean => {
    if (!member) return false;
    return hasPermission(member.role, permission);
  };

  const isOwner = member?.role === 'owner';
  const isAdmin = member?.role === 'owner' || member?.role === 'admin';
  const canWrite = member?.role !== 'viewer';

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizations,
        member,
        members,
        loading,
        error,
        switchOrganization,
        createOrganization,
        refreshOrganization,
        refreshMembers,
        can,
        isOwner,
        isAdmin,
        canWrite,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};
