import { ProjectMember, ProjectRole } from "../@types/project-role";

export interface ProjectMembersRepository {
  findByUserAndProject(userId: number, projectId: number): Promise<ProjectMember[]>;
  findByProject(projectId: number): Promise<ProjectMember[]>;
  create(data: {
    projectId: number,
    userId: number,
    role: ProjectRole
  }): Promise<ProjectMember>;
  updateRole(id: number, role: ProjectRole): Promise<ProjectMember>;
  delete(id: number): Promise<void>;
}
