import type { TenantContext } from '../../../packages/security/src/index.js';

export interface IdentityProfile {
  userId: string;
  tenantId: string;
  displayName: string;
  email?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface IdentityProfileRepository {
  findByUserId(userId: string): Promise<IdentityProfile | undefined>;
}

export class IdentityService {
  constructor(private readonly profiles: IdentityProfileRepository) {}

  async currentProfile(context: TenantContext): Promise<IdentityProfile> {
    const profile = await this.profiles.findByUserId(context.userId);

    if (!profile || profile.tenantId !== context.tenantId) {
      throw new Error('IDENTITY_PROFILE_NOT_FOUND');
    }
    if (profile.status !== 'ACTIVE') {
      throw new Error('IDENTITY_SUSPENDED');
    }

    return structuredClone(profile);
  }

  assertPrivilegedAccess(
    context: TenantContext,
    allowedRoles: ReadonlySet<string>,
  ): void {
    if (!context.roles.some((role) => allowedRoles.has(role))) {
      throw new Error('PRIVILEGED_ROLE_REQUIRED');
    }
    if (!context.mfa) {
      throw new Error('MFA_REQUIRED_FOR_PRIVILEGED_ROLE');
    }
  }
}
