'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProjetoPriority, ProjetoStatus } from '@/src/generated/elo';

interface Project {
  id: number;
  nome: string;
  projectId: string | null;
  descricao: string | null;
  icone: string | null;
  backgroundUrl: string | null;
  status: ProjetoStatus;
  prioridade: ProjetoPriority;
  ownerId: number;
  createdAt: string;
}

const STATUS_LABELS: Record<ProjetoStatus, string> = {
  draft: 'Rascunho',
  planning: 'Planejamento',
  execution: 'Execução',
  monitoring: 'Monitoramento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const PRIORITY_LABELS: Record<ProjetoPriority, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
  none: 'Nenhuma',
};

const STATUS_COLORS: Record<ProjetoStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  planning: 'bg-blue-100 text-blue-800',
  execution: 'bg-yellow-100 text-yellow-800',
  monitoring: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const PRIORITY_COLORS: Record<ProjetoPriority, string> = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
  none: 'bg-gray-100 text-gray-800',
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjetoStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<ProjetoPriority | ''>(
    '',
  );

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    projectId: '',
    descricao: '',
    icone: '',
    status: ProjetoStatus.draft as ProjetoStatus,
    prioridade: ProjetoPriority.medium as ProjetoPriority,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, statusFilter, priorityFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('prioridade', priorityFilter);

      const response = await fetch(`/api/projects?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.details?.errors) {
          const errors: Record<string, string> = {};
          data.error.details.errors.forEach(
            (err: { path: string[]; message: string }) => {
              errors[err.path[0]] = err.message;
            },
          );
          setFormErrors(errors);
        } else {
          alert(data.message || 'Erro ao criar projeto');
        }
        return;
      }

      // Success
      setShowForm(false);
      setFormData({
        nome: '',
        projectId: '',
        descricao: '',
        icone: '',
        status: ProjetoStatus.draft as ProjetoStatus,
        prioridade: ProjetoPriority.medium as ProjetoPriority,
      });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Erro ao criar projeto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Projetos</h1>
          <p className='mt-2 text-sm text-gray-600'>
            Gerencie todos os seus projetos em um só lugar
          </p>
        </div>

        {/* Filters and Actions */}
        <div className='bg-white rounded-lg shadow mb-6 p-4'>
          <div className='flex flex-col md:flex-row gap-4 mb-4'>
            {/* Search */}
            <div className='flex-1'>
              <input
                type='text'
                placeholder='Buscar projetos...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ProjetoStatus | '')
              }
              className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value=''>Todos os status</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as ProjetoPriority | '')
              }
              className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value=''>Todas as prioridades</option>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {/* New Project Button */}
            <button
              onClick={() => setShowForm(!showForm)}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap'
            >
              {showForm ? 'Cancelar' : '+ Novo Projeto'}
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className='bg-white rounded-lg shadow mb-6 p-6'>
            <h2 className='text-xl font-semibold mb-4'>Criar Novo Projeto</h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Nome */}
                <div className='md:col-span-2'>
                  <label
                    className='block text-sm font-medium text-gray-700 mb-1'
                    htmlFor='nome'
                  >
                    Nome do Projeto *
                  </label>
                  <input
                    type='text'
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    required
                  />
                  {formErrors.nome && (
                    <p className='mt-1 text-sm text-red-600'>
                      {formErrors.nome}
                    </p>
                  )}
                </div>

                {/* Project ID */}
                <div>
                  <label
                    className='block text-sm font-medium text-gray-700 mb-1'
                    htmlFor='projectId'
                  >
                    ID do Projeto (Sigla)
                  </label>
                  <input
                    type='text'
                    value={formData.projectId}
                    onChange={(e) =>
                      setFormData({ ...formData, projectId: e.target.value })
                    }
                    placeholder='Ex: PROJ-001'
                    maxLength={10}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                {/* Ícone */}
                <div>
                  <label
                    className='block text-sm font-medium text-gray-700 mb-1'
                    htmlFor='icone'
                  >
                    Ícone (Emoji)
                  </label>
                  <input
                    type='text'
                    value={formData.icone}
                    onChange={(e) =>
                      setFormData({ ...formData, icone: e.target.value })
                    }
                    placeholder='📊'
                    maxLength={10}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    className='block text-sm font-medium text-gray-700 mb-1'
                    htmlFor='status'
                  >
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ProjetoStatus,
                      })
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prioridade */}
                <div>
                  <label
                    className='block text-sm font-medium text-gray-700 mb-1'
                    htmlFor='prioridade'
                  >
                    Prioridade
                  </label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prioridade: e.target.value as ProjetoPriority,
                      })
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descrição */}
                <div className='md:col-span-2'>
                  <label
                    htmlFor='descricao'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    rows={3}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
              </div>

              {/* Actions */}
              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => setShowForm(false)}
                  className='px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  disabled={submitting}
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
                >
                  {submitting ? 'Criando...' : 'Criar Projeto'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className='text-center py-12'>
            <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent' />
            <p className='mt-4 text-gray-600'>Carregando projetos...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className='bg-white rounded-lg shadow p-12 text-center'>
            <p className='text-gray-600'>Nenhum projeto encontrado</p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className='mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                Criar Primeiro Projeto
              </button>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/projects/${project.id}`);
                  }
                }}
                className='bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden'
              >
                {/* Header */}
                <div className='p-6'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex items-center gap-2'>
                      {project.icone && (
                        <span className='text-2xl'>{project.icone}</span>
                      )}
                      <h3 className='text-lg font-semibold text-gray-900 line-clamp-1'>
                        {project.nome}
                      </h3>
                    </div>
                  </div>

                  {project.projectId && (
                    <p className='text-sm text-gray-500 mb-3'>
                      {project.projectId}
                    </p>
                  )}

                  {project.descricao && (
                    <p className='text-sm text-gray-600 line-clamp-2 mb-4'>
                      {project.descricao}
                    </p>
                  )}

                  {/* Badges */}
                  <div className='flex flex-wrap gap-2'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[project.status]}`}
                    >
                      {STATUS_LABELS[project.status]}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[project.prioridade]}`}
                    >
                      {PRIORITY_LABELS[project.prioridade]}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className='px-6 py-3 bg-gray-50 border-t border-gray-100'>
                  <p className='text-xs text-gray-500'>
                    Criado em{' '}
                    {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
