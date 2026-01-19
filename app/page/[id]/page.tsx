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
  dataInicio: string | null;
  dataFim: string | null;
  status: ProjetoStatus;
  prioridade: ProjetoPriority;
  acesso: boolean;
  ownerId: number;
  idempresa: number;
  createdAt: string;
  updatedAt: string;
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

export default function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    projectId: '',
    descricao: '',
    icone: '',
    status: ProjetoStatus.draft,
    prioridade: ProjetoPriority.medium,
    dataInicio: '',
    dataFim: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          alert('Projeto não encontrado');
          router.push('/projects');
          return;
        }
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      const projectData = data.data.project;
      setProject(projectData);

      // Initialize form data
      setFormData({
        nome: projectData.nome || '',
        projectId: projectData.projectId || '',
        descricao: projectData.descricao || '',
        icone: projectData.icone || '',
        status: projectData.status,
        prioridade: projectData.prioridade,
        dataInicio: projectData.dataInicio
          ? new Date(projectData.dataInicio).toISOString().split('T')[0]
          : '',
        dataFim: projectData.dataFim
          ? new Date(projectData.dataFim).toISOString().split('T')[0]
          : '',
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      alert('Erro ao carregar projeto');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const payload: any = { ...formData };

      // Convert dates to ISO if present
      if (payload.dataInicio) {
        payload.dataInicio = new Date(payload.dataInicio).toISOString();
      }
      if (payload.dataFim) {
        payload.dataFim = new Date(payload.dataFim).toISOString();
      }

      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.details?.errors) {
          const errors: Record<string, string> = {};
          data.error.details.errors.forEach((err: any) => {
            errors[err.path[0]] = err.message;
          });
          setFormErrors(errors);
        } else {
          alert(data.message || 'Erro ao atualizar projeto');
        }
        return;
      }

      // Success
      setEditing(false);
      fetchProject();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Erro ao atualizar projeto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja arquivar este projeto?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.message || 'Erro ao arquivar projeto');
        return;
      }

      alert('Projeto arquivado com sucesso');
      router.push('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Erro ao arquivar projeto');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent' />
          <p className='mt-4 text-gray-600'>Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Back Button */}
        <button
          onClick={() => router.push('/projects')}
          className='mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors'
        >
          <svg
            className='w-5 h-5 mr-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
          Voltar para Projetos
        </button>

        {/* Header */}
        <div className='bg-white rounded-lg shadow mb-6 p-6'>
          <div className='flex items-start justify-between mb-4'>
            <div className='flex items-center gap-3'>
              {project.icone && (
                <span className='text-4xl'>{project.icone}</span>
              )}
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                  {project.nome}
                </h1>
                {project.projectId && (
                  <p className='text-sm text-gray-500 mt-1'>
                    {project.projectId}
                  </p>
                )}
              </div>
            </div>

            {!editing && (
              <div className='flex gap-2'>
                <button
                  onClick={() => setEditing(true)}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
                >
                  {deleting ? 'Arquivando...' : 'Arquivar'}
                </button>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className='flex flex-wrap gap-2 mb-4'>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[project.status]}`}
            >
              {STATUS_LABELS[project.status]}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_COLORS[project.prioridade]}`}
            >
              {PRIORITY_LABELS[project.prioridade]}
            </span>
            {project.acesso && (
              <span className='px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800'>
                Acesso Público
              </span>
            )}
          </div>

          {project.descricao && !editing && (
            <p className='text-gray-700 whitespace-pre-wrap'>
              {project.descricao}
            </p>
          )}
        </div>

        {/* Edit Form */}
        {editing ? (
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-xl font-semibold mb-4'>Editar Projeto</h2>
            <form onSubmit={handleUpdate} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Nome */}
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='nome'>
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
                  <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='projectId'>
                    ID do Projeto
                  </label>
                  <input
                    type='text'
                    value={formData.projectId}
                    onChange={(e) =>
                      setFormData({ ...formData, projectId: e.target.value })
                    }
                    maxLength={10}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                {/* Ícone */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='icone'>
                    Ícone
                  </label>
                  <input
                    type='text'
                    value={formData.icone}
                    onChange={(e) =>
                      setFormData({ ...formData, icone: e.target.value })
                    }
                    maxLength={10}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                {/* Status */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='status'>
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
                  <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='prioridade'>
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

                {/* Data Início */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='dataInicio'>
                    Data de Início
                  </label>
                  <input
                    type='date'
                    value={formData.dataInicio}
                    onChange={(e) =>
                      setFormData({ ...formData, dataInicio: e.target.value })
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                {/* Data Fim */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='dataFim'>
                    Data de Término
                  </label>
                  <input
                    type='date'
                    value={formData.dataFim}
                    onChange={(e) =>
                      setFormData({ ...formData, dataFim: e.target.value })
                    }
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                {/* Descrição */}
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='descricao'>
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    rows={4}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
              </div>

              {/* Actions */}
              <div className='flex justify-end gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => {
                    setEditing(false);
                    setFormErrors({});
                  }}
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
                  {submitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Details View */
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Info Card */}
            <div className='bg-white rounded-lg shadow p-6'>
              <h2 className='text-lg font-semibold mb-4'>Informações</h2>
              <dl className='space-y-3'>
                <div>
                  <dt className='text-sm font-medium text-gray-500'>ID</dt>
                  <dd className='mt-1 text-sm text-gray-900'>{project.id}</dd>
                </div>
                {project.projectId && (
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Código
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900'>
                      {project.projectId}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className='text-sm font-medium text-gray-500'>
                    Owner ID
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900'>
                    {project.ownerId}
                  </dd>
                </div>
                <div>
                  <dt className='text-sm font-medium text-gray-500'>
                    Empresa ID
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900'>
                    {project.idempresa}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Dates Card */}
            <div className='bg-white rounded-lg shadow p-6'>
              <h2 className='text-lg font-semibold mb-4'>Datas</h2>
              <dl className='space-y-3'>
                {project.dataInicio && (
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Data de Início
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900'>
                      {new Date(project.dataInicio).toLocaleDateString('pt-BR')}
                    </dd>
                  </div>
                )}
                {project.dataFim && (
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Data de Término
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900'>
                      {new Date(project.dataFim).toLocaleDateString('pt-BR')}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className='text-sm font-medium text-gray-500'>
                    Criado em
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900'>
                    {new Date(project.createdAt).toLocaleString('pt-BR')}
                  </dd>
                </div>
                <div>
                  <dt className='text-sm font-medium text-gray-500'>
                    Atualizado em
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900'>
                    {new Date(project.updatedAt).toLocaleString('pt-BR')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
