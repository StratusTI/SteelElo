'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ProjectRole } from '@/src/@types/project-role';
import type { User } from '@/src/@types/user';

interface Project {
  id: number;
  nome: string;
  ownerId: number;
}

interface Member {
  id: number;
  userId: number;
  role: ProjectRole;
  source: string;
  addedAt: Date;
  user: {
    id: number;
    nome: string;
    sobrenome: string;
    email: string;
    foto: string | null;
  };
}

interface ProjectMembersClientProps {
  project: Project;
  user: User;
  enterpriseId: string;
}

export function ProjectMembersClient({
  project,
  user,
  enterpriseId,
}: ProjectMembersClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [canManageMembers, setCanManageMembers] = useState(false);

  useEffect(() => {
    fetchMembers();
    checkPermissions();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/members`);
      const data = await res.json();

      if (data.success) {
        setMembers(data.data.members);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    // Superadmin, owner do projeto, ou admin podem gerenciar membros
    const userMember = members.find((m) => m.userId === user.id);
    const isOwner = project.ownerId === user.id;
    const isAdmin = userMember?.role === 'admin';
    const isSuperadmin = user.superadmin;

    setCanManageMembers(isSuperadmin || isOwner || isAdmin);
  };

  const handleChangeRole = async (userId: number, newRole: ProjectRole) => {
    if (!confirm(`Alterar role para ${newRole}?`)) return;

    try {
      const res = await fetch(`/api/projects/${project.id}/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Role atualizada com sucesso!');
        fetchMembers();
      } else {
        alert(data.error?.details || 'Erro ao atualizar role');
      }
    } catch (error) {
      alert('Erro ao atualizar role');
      console.error(error);
    }
  };

  const handleRemoveMember = async (userId: number, userName: string) => {
    if (!confirm(`Remover ${userName} do projeto?`)) return;

    try {
      const res = await fetch(`/api/projects/${project.id}/members/${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        alert('Membro removido com sucesso!');
        fetchMembers();
      } else {
        alert(data.error?.details || data.message || 'Erro ao remover membro');
      }
    } catch (error) {
      alert('Erro ao remover membro');
      console.error(error);
    }
  };

  const getRoleBadgeColor = (role: ProjectRole) => {
    const colors = {
      owner: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      member: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800',
      superadmin: 'bg-yellow-100 text-yellow-800',
    };
    return colors[role] || colors.viewer;
  };

  const getRoleLabel = (role: ProjectRole) => {
    const labels = {
      owner: 'Proprietário',
      admin: 'Administrador',
      member: 'Membro',
      viewer: 'Visualizador',
      superadmin: 'Super Admin',
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-4' />
            <div className='h-64 bg-gray-200 rounded' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <button
            type='button'
            onClick={() =>
              router.push(`/${enterpriseId}/projects/${project.id}`)
            }
            className='text-sm text-gray-600 hover:text-gray-900 mb-2'
          >
            ← Voltar para o projeto
          </button>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Membros</h1>
              <p className='text-gray-600 mt-1'>{project.nome}</p>
            </div>
            {canManageMembers && (
              <button
                type='button'
                onClick={() => setShowAddModal(true)}
                className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700'
              >
                + Adicionar Membro
              </button>
            )}
          </div>
        </div>

        {/* Lista de Membros */}
        <div className='bg-white rounded-lg shadow'>
          <div className='divide-y divide-gray-200'>
            {members.map((member) => (
              <div
                key={member.id}
                className='p-4 flex items-center justify-between hover:bg-gray-50'
              >
                {/* Avatar + Info */}
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold'>
                    {member.user.foto ? (
                      <Image
                        width={48}
                        height={48}
                        src={`https://painel.stratustelecom.com.br/${member.user.foto.replace(/^\.\.\//, '')}`}
                        alt={`${member.user.nome} ${member.user.sobrenome}`}
                        className='w-12 h-12 rounded-full object-cover'
                      />
                    ) : (
                      `${member.user.nome.charAt(0)}${member.user.sobrenome.charAt(0)}`
                    )}
                  </div>
                  <div>
                    <div className='flex items-center gap-2'>
                      <p className='font-semibold text-gray-900'>
                        {member.user.nome} {member.user.sobrenome}
                      </p>
                      {member.userId === project.ownerId && (
                        <span className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded'>
                          Owner Principal
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-gray-500'>{member.user.email}</p>
                  </div>
                </div>

                {/* Role + Actions */}
                <div className='flex items-center gap-3'>
                  {/* Badge de Role */}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(member.role)}`}
                  >
                    {getRoleLabel(member.role)}
                  </span>

                  {/* Dropdown de Role (se pode gerenciar) */}
                  {canManageMembers && member.userId !== user.id && (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleChangeRole(
                          member.userId,
                          e.target.value as ProjectRole,
                        )
                      }
                      className='px-2 py-1 border rounded text-sm'
                    >
                      <option value='viewer'>Visualizador</option>
                      <option value='member'>Membro</option>
                      <option value='admin'>Admin</option>
                      <option value='owner'>Owner</option>
                    </select>
                  )}

                  {/* Botão Remover */}
                  {canManageMembers && member.userId !== user.id && (
                    <button
                      type='button'
                      onClick={() =>
                        handleRemoveMember(
                          member.userId,
                          `${member.user.nome} ${member.user.sobrenome}`,
                        )
                      }
                      className='text-red-600 hover:text-red-800 text-sm'
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal de Adicionar Membro */}
        {showAddModal && (
          <AddMemberModal
            projectId={project.id}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              fetchMembers();
            }}
          />
        )}
      </div>
    </div>
  );
}

// Modal de Adicionar Membro
interface AddMemberModalProps {
  projectId: number;
  onClose: () => void;
  onSuccess: () => void;
}

function AddMemberModal({
  projectId,
  onClose,
  onSuccess,
}: AddMemberModalProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<ProjectRole>('member');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => {
        searchUsers();
      }, 500);
      return () => clearTimeout(timer);
    }
    setUsers([]);
  }, [query]);

  const searchUsers = async () => {
    setSearching(true);
    try {
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}&excludeProjectId=${projectId}&limit=10`,
      );
      const data = await res.json();

      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) {
      alert('Selecione um usuário');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          role: selectedRole,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Membro adicionado com sucesso!');
        onSuccess();
      } else {
        alert(
          data.error?.details || data.message || 'Erro ao adicionar membro',
        );
      }
    } catch (error) {
      alert('Erro ao adicionar membro');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 max-w-md w-full'>
        <h2 className='text-xl font-bold mb-4'>Adicionar Membro</h2>

        {/* Busca de Usuário */}
        <div className='mb-4'>
          <label
            className='block text-sm font-medium mb-2'
            htmlFor='search-user'
          >
            Buscar Usuário
          </label>
          <input
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Digite nome ou email...'
            className='w-full px-3 py-2 border rounded-lg'
          />
          {searching && (
            <p className='text-sm text-gray-500 mt-1'>Buscando...</p>
          )}
        </div>

        {/* Lista de Resultados */}
        {users.length > 0 && (
          <div className='mb-4 max-h-48 overflow-y-auto border rounded-lg'>
            {users.map((user) => (
              <button
                key={user.id}
                type='button'
                onClick={() => {
                  setSelectedUserId(user.id);
                  setQuery(`${user.nome} ${user.sobrenome}`);
                  setUsers([]);
                }}
                className={`w-full p-3 text-left hover:bg-gray-50 ${
                  selectedUserId === user.id ? 'bg-indigo-50' : ''
                }`}
              >
                <p className='font-medium'>{user.nomeCompleto}</p>
                <p className='text-sm text-gray-500'>{user.email}</p>
              </button>
            ))}
          </div>
        )}

        {/* Select de Role */}
        <div className='mb-4'>
          <label
            className='block text-sm font-medium mb-2'
            htmlFor='role-select'
          >
            Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as ProjectRole)}
            className='w-full px-3 py-2 border rounded-lg'
          >
            <option value='viewer'>Visualizador</option>
            <option value='member'>Membro</option>
            <option value='admin'>Administrador</option>
            <option value='owner'>Proprietário</option>
          </select>
        </div>

        {/* Botões */}
        <div className='flex gap-3'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50'
          >
            Cancelar
          </button>
          <button
            type='button'
            onClick={handleAddMember}
            disabled={!selectedUserId || loading}
            className='flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50'
          >
            {loading ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
}
