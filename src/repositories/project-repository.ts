import {
    CreateProjectRequest,
    Project,
    ProjectFilters,
    UpdateProjectRequest
} from "../@types/project";

export interface ProjectRepository {
  create(data: CreateProjectRequest & { ownerId: number; idempresa: number }): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByNameAndCompany(nome: string, idempresa: number): Promise<Project | null>;
  findMany(filters: ProjectFilters, userId: number, isSuperadmin: boolean): Promise<{
    projects: Project[];
    total: number;
  }>;
  update(id: string, data: UpdateProjectRequest): Promise<Project>;
  archive(id: string): Promise<void>;
  isUserMember(projectId: string, userId: number): Promise<boolean>;
}
