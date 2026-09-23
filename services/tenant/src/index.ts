import { randomUUID } from 'node:crypto';
import {
  assertTenantResource,
  requirePermission,
  type TenantContext,
} from '../../../packages/security/src/index.js';

export interface Tenant {
  tenantId: string;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface Workspace {
  workspaceId: string;
  tenantId: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
}

export interface TenantRepository {
  getTenant(tenantId: string): Promise<Tenant | undefined>;
  getWorkspace(workspaceId: string): Promise<Workspace | undefined>;
  findWorkspaceBySlug(tenantId: string, slug: string): Promise<Workspace | undefined>;
  saveWorkspace(workspace: Workspace): Promise<void>;
}

const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class TenantService {
  constructor(private readonly repository: TenantRepository) {}

  async createWorkspace(
    context: TenantContext,
    input: { name: string; slug: string },
  ): Promise<Workspace> {
    requirePermission(context, { permission: 'workspace:create' });

    const tenant = await this.repository.getTenant(context.tenantId);
    if (!tenant || tenant.status !== 'ACTIVE') throw new Error('TENANT_NOT_ACTIVE');

    const name = input.name.trim();
    const slug = input.slug.trim().toLowerCase();
    if (name.length < 2 || name.length > 120 || !validSlug.test(slug)) {
      throw new Error('INVALID_WORKSPACE');
    }
    if (await this.repository.findWorkspaceBySlug(context.tenantId, slug)) {
      throw new Error('WORKSPACE_SLUG_ALREADY_EXISTS');
    }

    const workspace: Workspace = {
      workspaceId: randomUUID(),
      tenantId: context.tenantId,
      name,
      slug,
      createdBy: context.userId,
      createdAt: new Date().toISOString(),
    };
    await this.repository.saveWorkspace(workspace);
    return workspace;
  }

  async getWorkspace(context: TenantContext, workspaceId: string): Promise<Workspace> {
    const workspace = await this.repository.getWorkspace(workspaceId);
    if (!workspace) throw new Error('WORKSPACE_NOT_FOUND');

    assertTenantResource(context, {
      tenantId: workspace.tenantId,
      workspaceId: workspace.workspaceId,
    });
    return structuredClone(workspace);
  }
}
