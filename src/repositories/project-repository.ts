import {
    CreateProjectRequest,
    Project,
    ProjectFilters,
    UpdateProjectRequest
} from "../@types/project";

export interface ProjectRepository {
  create(data: CreateProjectRequest & { ownerId: number; idempresa: number }): Promise<Project>;
  findById(id: number): Promise<Project | null>;
  findByNameAndCompany(nome: string, idempresa: number): Promise<Project | null>;
  findMany(filters: ProjectFilters, userId: number, isSuperadmin: boolean, userCompany: number): Promise<{
    projects: Project[];
    total: number;
  }>;
  update(id: number, data: UpdateProjectRequest): Promise<Project>;
  archive(id: number): Promise<void>;
  isUserMember(projectId: number, userId: number): Promise<boolean>;
}
