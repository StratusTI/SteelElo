-- CreateTable
CREATE TABLE `projetos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `descricao` TEXT NULL,
    `cor` VARCHAR(7) NULL DEFAULT '#6366f1',
    `data_inicio` DATE NULL,
    `data_fim` DATE NULL,
    `owner_id` INTEGER NOT NULL,
    `status` ENUM('ativo', 'pausado', 'concluido', 'cancelado') NULL DEFAULT 'ativo',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_owner`(`owner_id`),
    INDEX `idx_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projeto_membros` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projeto_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `role` ENUM('owner', 'admin', 'member', 'viewer') NULL DEFAULT 'member',
    `source` VARCHAR(50) NULL DEFAULT 'direct',
    `adicionado_em` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_projeto`(`projeto_id`),
    INDEX `idx_usuario`(`usuario_id`),
    UNIQUE INDEX `uniq_projeto_usuario_source`(`projeto_id`, `usuario_id`, `source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `colunas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(100) NOT NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `cor` VARCHAR(7) NULL DEFAULT '#cccccc',
    `projeto_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_projeto`(`projeto_id`),
    INDEX `idx_ordem`(`ordem`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tarefas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `descricao` TEXT NULL,
    `prazo` DATE NULL,
    `prioridade` ENUM('baixa', 'media', 'alta') NULL DEFAULT 'media',
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `estimativa_horas` DECIMAL(8, 2) NULL,
    `horas_realizadas` DECIMAL(8, 2) NULL,
    `data_inicio_real` DATETIME(0) NULL,
    `data_conclusao_real` DATETIME(0) NULL,
    `coluna_id` INTEGER NOT NULL,
    `projeto_id` INTEGER NOT NULL,
    `user_story_id` INTEGER NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_coluna`(`coluna_id`),
    INDEX `idx_projeto`(`projeto_id`),
    INDEX `idx_story`(`user_story_id`),
    INDEX `idx_prazo`(`prazo`),
    INDEX `idx_created_by`(`created_by`),
    INDEX `idx_projeto_coluna`(`projeto_id`, `coluna_id`),
    INDEX `idx_prazo_prioridade`(`prazo`, `prioridade`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tarefa_responsaveis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tarefa_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `atribuido_em` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_tarefa`(`tarefa_id`),
    INDEX `idx_usuario`(`usuario_id`),
    UNIQUE INDEX `uniq_tarefa_usuario`(`tarefa_id`, `usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subtarefas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `concluida` BOOLEAN NULL DEFAULT false,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `tarefa_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_tarefa`(`tarefa_id`),
    INDEX `idx_ordem`(`ordem`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(50) NOT NULL,
    `cor` VARCHAR(7) NULL DEFAULT '#3b82f6',
    `projeto_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_projeto`(`projeto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tarefa_tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tarefa_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,

    INDEX `idx_tarefa`(`tarefa_id`),
    INDEX `idx_tag`(`tag_id`),
    UNIQUE INDEX `uniq_tarefa_tag`(`tarefa_id`, `tag_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comentarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `texto` TEXT NOT NULL,
    `tarefa_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `parent_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_tarefa`(`tarefa_id`),
    INDEX `idx_usuario`(`usuario_id`),
    INDEX `idx_parent`(`parent_id`),
    INDEX `idx_created`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anexos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `tipo` VARCHAR(50) NULL,
    `tamanho` BIGINT NULL,
    `tarefa_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_tarefa`(`tarefa_id`),
    INDEX `idx_usuario`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_stories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `persona` VARCHAR(100) NULL,
    `acao` TEXT NULL,
    `beneficio` TEXT NULL,
    `criterios_aceitacao` TEXT NULL,
    `story_points` DECIMAL(5, 2) NULL,
    `estimativa_horas` DECIMAL(8, 2) NULL,
    `horas_realizadas` DECIMAL(8, 2) NULL,
    `prioridade` INTEGER NULL DEFAULT 0,
    `status` ENUM('backlog', 'in_progress', 'done') NULL DEFAULT 'backlog',
    `projeto_id` INTEGER NOT NULL,
    `sprint_id` INTEGER NULL,
    `feature_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_projeto`(`projeto_id`),
    INDEX `idx_sprint`(`sprint_id`),
    INDEX `idx_feature`(`feature_id`),
    INDEX `idx_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sprints` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `objetivo` TEXT NULL,
    `data_inicio` DATE NOT NULL,
    `data_fim` DATE NOT NULL,
    `capacidade_planejada` DECIMAL(10, 2) NULL,
    `capacidade_realizada` DECIMAL(10, 2) NULL,
    `velocidade` DECIMAL(10, 2) NULL,
    `status` ENUM('planejamento', 'ativo', 'concluido', 'cancelado') NULL DEFAULT 'planejamento',
    `projeto_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_projeto`(`projeto_id`),
    INDEX `idx_status`(`status`),
    INDEX `idx_datas`(`data_inicio`, `data_fim`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sprint_metricas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sprint_id` INTEGER NOT NULL,
    `data` DATE NOT NULL,
    `story_points_restantes` DECIMAL(10, 2) NULL,
    `horas_restantes` DECIMAL(10, 2) NULL,
    `tarefas_concluidas` INTEGER NULL DEFAULT 0,
    `tarefas_em_progresso` INTEGER NULL DEFAULT 0,
    `tarefas_bloqueadas` INTEGER NULL DEFAULT 0,
    `observacoes` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_sprint`(`sprint_id`),
    INDEX `idx_data`(`data`),
    UNIQUE INDEX `uniq_sprint_data`(`sprint_id`, `data`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `definition_of_done` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `descricao` TEXT NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `obrigatorio` BOOLEAN NULL DEFAULT true,
    `projeto_id` INTEGER NOT NULL,
    `nivel` ENUM('story', 'tarefa', 'sprint') NULL DEFAULT 'story',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_projeto`(`projeto_id`),
    INDEX `idx_nivel`(`nivel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `story_dod_checklist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `story_id` INTEGER NOT NULL,
    `dod_id` INTEGER NOT NULL,
    `concluido` BOOLEAN NULL DEFAULT false,
    `verificado_por` INTEGER NULL,
    `verificado_em` DATETIME(0) NULL,
    `observacoes` TEXT NULL,

    INDEX `idx_story`(`story_id`),
    INDEX `idx_dod`(`dod_id`),
    UNIQUE INDEX `uniq_story_dod`(`story_id`, `dod_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `capacidade_time` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projeto_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `sprint_id` INTEGER NULL,
    `pi_id` INTEGER NULL,
    `capacidade_total_horas` DECIMAL(8, 2) NOT NULL,
    `capacidade_planejada_sp` DECIMAL(8, 2) NULL,
    `ausencias_horas` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `trabalho_outros_projetos` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `capacidade_liquida` DECIMAL(8, 2) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_projeto`(`projeto_id`),
    INDEX `idx_usuario`(`usuario_id`),
    INDEX `idx_sprint`(`sprint_id`),
    INDEX `idx_pi`(`pi_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `retrospectivas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sprint_id` INTEGER NOT NULL,
    `data_reuniao` DATETIME(0) NOT NULL,
    `facilitador_id` INTEGER NULL,
    `formato` VARCHAR(100) NULL DEFAULT 'start-stop-continue',
    `status` ENUM('agendada', 'em_andamento', 'concluida') NULL DEFAULT 'agendada',
    `notas_gerais` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_sprint`(`sprint_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `retrospectiva_itens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `retrospectiva_id` INTEGER NOT NULL,
    `categoria` ENUM('start', 'stop', 'continue', 'mad', 'sad', 'glad', 'liked', 'learned', 'lacked', 'longed', 'outros') NOT NULL,
    `descricao` TEXT NOT NULL,
    `autor_id` INTEGER NULL,
    `votos` INTEGER NULL DEFAULT 0,
    `action_item` BOOLEAN NULL DEFAULT false,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_retrospectiva`(`retrospectiva_id`),
    INDEX `idx_categoria`(`categoria`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `retrospectiva_acoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `retrospectiva_id` INTEGER NOT NULL,
    `item_id` INTEGER NULL,
    `descricao` TEXT NOT NULL,
    `responsavel_id` INTEGER NULL,
    `prazo` DATE NULL,
    `status` ENUM('pendente', 'em_andamento', 'concluida', 'cancelada') NULL DEFAULT 'pendente',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_retrospectiva`(`retrospectiva_id`),
    INDEX `idx_responsavel`(`responsavel_id`),
    INDEX `idx_status`(`status`),
    INDEX `fk_retro_acao_item`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `arts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `value_stream` VARCHAR(100) NULL,
    `rte_id` INTEGER NULL,
    `cadencia_pi` INTEGER NULL DEFAULT 12,
    `status` ENUM('ativo', 'pausado', 'inativo') NULL DEFAULT 'ativo',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_rte`(`rte_id`),
    INDEX `idx_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projeto_art` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projeto_id` INTEGER NOT NULL,
    `art_id` INTEGER NOT NULL,
    `adicionado_em` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_projeto`(`projeto_id`),
    INDEX `idx_art`(`art_id`),
    UNIQUE INDEX `uniq_projeto_art`(`projeto_id`, `art_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program_increments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `art_id` INTEGER NOT NULL,
    `data_inicio` DATE NOT NULL,
    `data_fim` DATE NOT NULL,
    `data_planning` DATE NULL,
    `objetivo_pi` TEXT NULL,
    `tema` VARCHAR(255) NULL,
    `status` ENUM('planejamento', 'ativo', 'concluido', 'cancelado') NULL DEFAULT 'planejamento',
    `business_context` TEXT NULL,
    `architecture_vision` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_art`(`art_id`),
    INDEX `idx_status`(`status`),
    INDEX `idx_datas`(`data_inicio`, `data_fim`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_objectives` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pi_id` INTEGER NOT NULL,
    `projeto_id` INTEGER NOT NULL,
    `descricao` TEXT NOT NULL,
    `business_value` INTEGER NULL DEFAULT 0,
    `probabilidade_sucesso` DECIMAL(5, 2) NULL,
    `tipo` ENUM('committed', 'uncommitted') NULL DEFAULT 'committed',
    `stretch` BOOLEAN NULL DEFAULT false,
    `status` ENUM('planned', 'in_progress', 'achieved', 'partially_achieved', 'not_achieved') NULL DEFAULT 'planned',
    `resultado_final` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_pi`(`pi_id`),
    INDEX `idx_projeto`(`projeto_id`),
    INDEX `idx_tipo`(`tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_objective_features` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pi_objective_id` INTEGER NOT NULL,
    `feature_id` INTEGER NOT NULL,

    INDEX `idx_pio`(`pi_objective_id`),
    INDEX `idx_feature`(`feature_id`),
    UNIQUE INDEX `uniq_pio_feature`(`pi_objective_id`, `feature_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ip_iterations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pi_id` INTEGER NOT NULL,
    `data_inicio` DATE NOT NULL,
    `data_fim` DATE NOT NULL,
    `objetivo` TEXT NULL,
    `tipo_atividades` VARCHAR(191) NULL DEFAULT 'innovation',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_pi`(`pi_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inspect_adapt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pi_id` INTEGER NOT NULL,
    `data_reuniao` DATETIME(0) NOT NULL,
    `facilitador_id` INTEGER NULL,
    `pi_performance_metrics` LONGTEXT NULL,
    `notas_gerais` TEXT NULL,
    `status` ENUM('agendada', 'em_andamento', 'concluida') NULL DEFAULT 'agendada',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_pi`(`pi_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ia_problemas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inspect_adapt_id` INTEGER NOT NULL,
    `problema` TEXT NOT NULL,
    `impacto` TEXT NULL,
    `votos` INTEGER NULL DEFAULT 0,
    `categoria_fishbone` ENUM('people', 'process', 'tools', 'environment', 'other') NULL,
    `causa_raiz` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_ia`(`inspect_adapt_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ia_acoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `problema_id` INTEGER NOT NULL,
    `descricao` TEXT NOT NULL,
    `responsavel_id` INTEGER NULL,
    `prazo` DATE NULL,
    `status` ENUM('pendente', 'em_andamento', 'concluida', 'cancelada') NULL DEFAULT 'pendente',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_problema`(`problema_id`),
    INDEX `idx_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `epics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `descricao` TEXT NULL,
    `hypothesis_statement` TEXT NULL,
    `business_outcome` TEXT NULL,
    `leading_indicators` TEXT NULL,
    `tipo` ENUM('business', 'enabler', 'portfolio') NULL DEFAULT 'business',
    `status` ENUM('funnel', 'review', 'analysis', 'backlog', 'implementing', 'done', 'cancelled') NULL DEFAULT 'funnel',
    `wsjf_score` DECIMAL(10, 2) NULL,
    `valor_negocio` INTEGER NULL DEFAULT 0,
    `reducao_risco` INTEGER NULL DEFAULT 0,
    `oportunidade_tempo` INTEGER NULL DEFAULT 0,
    `tamanho_job` INTEGER NULL DEFAULT 0,
    `owner_id` INTEGER NULL,
    `art_id` INTEGER NULL,
    `pi_target` INTEGER NULL,
    `parent_epic_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_art`(`art_id`),
    INDEX `idx_status`(`status`),
    INDEX `idx_pi_target`(`pi_target`),
    INDEX `idx_parent`(`parent_epic_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `features` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `descricao` TEXT NULL,
    `benefit_hypothesis` TEXT NULL,
    `acceptance_criteria` TEXT NULL,
    `epic_id` INTEGER NULL,
    `pi_id` INTEGER NOT NULL,
    `status` ENUM('backlog', 'analysis', 'ready', 'implementing', 'validating', 'done', 'cancelled') NULL DEFAULT 'backlog',
    `wsjf_score` DECIMAL(10, 2) NULL,
    `valor_negocio` INTEGER NULL DEFAULT 0,
    `reducao_risco` INTEGER NULL DEFAULT 0,
    `oportunidade_tempo` INTEGER NULL DEFAULT 0,
    `tamanho_job` INTEGER NULL DEFAULT 0,
    `owner_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_epic`(`epic_id`),
    INDEX `idx_pi`(`pi_id`),
    INDEX `idx_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dependencias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_origem` ENUM('epic', 'feature', 'story', 'tarefa') NOT NULL,
    `entidade_origem_id` INTEGER NOT NULL,
    `tipo_destino` ENUM('epic', 'feature', 'story', 'tarefa') NOT NULL,
    `entidade_destino_id` INTEGER NOT NULL,
    `tipo_dependencia` ENUM('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish') NULL DEFAULT 'finish_to_start',
    `status` ENUM('identificada', 'resolvida', 'bloqueando', 'removida') NULL DEFAULT 'identificada',
    `criticidade` ENUM('baixa', 'media', 'alta', 'critica') NULL DEFAULT 'media',
    `descricao` TEXT NULL,
    `projeto_origem_id` INTEGER NULL,
    `projeto_destino_id` INTEGER NULL,
    `pi_id` INTEGER NULL,
    `criado_por` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_origem`(`tipo_origem`, `entidade_origem_id`),
    INDEX `idx_destino`(`tipo_destino`, `entidade_destino_id`),
    INDEX `idx_status`(`status`),
    INDEX `idx_pi`(`pi_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `riscos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `descricao` TEXT NOT NULL,
    `tipo` ENUM('risco', 'impedimento', 'issue') NULL DEFAULT 'risco',
    `categoria` VARCHAR(100) NULL,
    `probabilidade` ENUM('muito_baixa', 'baixa', 'media', 'alta', 'muito_alta') NULL DEFAULT 'media',
    `impacto` ENUM('muito_baixo', 'baixo', 'medio', 'alto', 'muito_alto') NULL DEFAULT 'medio',
    `score_risco` INTEGER NULL,
    `plano_mitigacao` TEXT NULL,
    `plano_contingencia` TEXT NULL,
    `status` ENUM('identificado', 'analisado', 'mitigado', 'aceito', 'resolvido', 'ocorrido') NULL DEFAULT 'identificado',
    `projeto_id` INTEGER NULL,
    `pi_id` INTEGER NULL,
    `feature_id` INTEGER NULL,
    `owner_id` INTEGER NULL,
    `identificado_por` INTEGER NULL,
    `data_identificacao` DATE NULL,
    `data_limite` DATE NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_tipo`(`tipo`),
    INDEX `idx_status`(`status`),
    INDEX `idx_score`(`score_risco`),
    INDEX `idx_projeto`(`projeto_id`),
    INDEX `idx_pi`(`pi_id`),
    INDEX `idx_feature`(`feature_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roadmaps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `art_id` INTEGER NULL,
    `tipo` ENUM('solution', 'program', 'portfolio') NULL DEFAULT 'program',
    `visibilidade` ENUM('publico', 'privado', 'restrito') NULL DEFAULT 'privado',
    `created_by` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_art`(`art_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roadmap_itens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roadmap_id` INTEGER NOT NULL,
    `feature_id` INTEGER NULL,
    `epic_id` INTEGER NULL,
    `pi_inicio` INTEGER NULL,
    `pi_fim` INTEGER NULL,
    `milestone` VARCHAR(100) NULL,
    `cor` VARCHAR(7) NULL DEFAULT '#3b82f6',
    `ordem` INTEGER NULL DEFAULT 0,

    INDEX `idx_roadmap`(`roadmap_id`),
    INDEX `idx_feature`(`feature_id`),
    INDEX `idx_epic`(`epic_id`),
    INDEX `idx_pi_inicio`(`pi_inicio`),
    INDEX `fk_ri_pi_fim`(`pi_fim`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `icone` VARCHAR(10) NOT NULL,
    `conteudo` LONGTEXT NULL,
    `parent_id` INTEGER NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `projeto_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_projeto`(`projeto_id`),
    INDEX `idx_parent`(`parent_id`),
    INDEX `idx_created_by`(`created_by`),
    INDEX `idx_ordem`(`ordem`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documento_versoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `documento_id` INTEGER NOT NULL,
    `versao` INTEGER NOT NULL DEFAULT 1,
    `conteudo` LONGTEXT NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `comentario` TEXT NULL,
    `hash_conteudo` CHAR(64) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `alteracoes_resumo` TEXT NULL,
    `tamanho_bytes` INTEGER NULL,

    INDEX `idx_documento`(`documento_id`),
    INDEX `idx_versao`(`versao`),
    INDEX `idx_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `atividades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('create', 'update', 'delete', 'move', 'assign', 'comment') NOT NULL,
    `entidade` ENUM('tarefa', 'coluna', 'projeto', 'user_story', 'documento') NOT NULL,
    `entidade_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `projeto_id` INTEGER NOT NULL,
    `descricao` TEXT NULL,
    `metadata` LONGTEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `visibilidade` ENUM('publica', 'projeto', 'privada') NULL DEFAULT 'projeto',
    `total_likes` INTEGER NULL DEFAULT 0,
    `total_comentarios` INTEGER NULL DEFAULT 0,
    `editado` BOOLEAN NULL DEFAULT false,
    `editado_em` DATETIME(0) NULL,

    INDEX `idx_entidade`(`entidade`, `entidade_id`),
    INDEX `idx_usuario`(`usuario_id`),
    INDEX `idx_projeto`(`projeto_id`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_projeto_created`(`projeto_id`, `created_at`),
    INDEX `idx_visibilidade_created`(`visibilidade`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `atividade_likes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `atividade_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_atividade`(`atividade_id`),
    INDEX `idx_usuario`(`usuario_id`),
    INDEX `idx_created`(`created_at`),
    UNIQUE INDEX `uniq_atividade_usuario`(`atividade_id`, `usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `atividade_comentarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `atividade_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `texto` TEXT NOT NULL,
    `parent_id` INTEGER NULL,
    `total_likes` INTEGER NULL DEFAULT 0,
    `editado` BOOLEAN NULL DEFAULT false,
    `editado_em` DATETIME(0) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_atividade`(`atividade_id`),
    INDEX `idx_usuario`(`usuario_id`),
    INDEX `idx_parent`(`parent_id`),
    INDEX `idx_created`(`created_at`),
    INDEX `idx_atividade_created`(`atividade_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comentario_likes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `comentario_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_comentario`(`comentario_id`),
    INDEX `idx_usuario`(`usuario_id`),
    UNIQUE INDEX `uniq_comentario_usuario`(`comentario_id`, `usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `projeto_membros` ADD CONSTRAINT `fk_pm_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `colunas` ADD CONSTRAINT `fk_coluna_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tarefas` ADD CONSTRAINT `fk_tarefa_coluna` FOREIGN KEY (`coluna_id`) REFERENCES `colunas`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tarefas` ADD CONSTRAINT `fk_tarefa_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tarefas` ADD CONSTRAINT `fk_tarefa_story` FOREIGN KEY (`user_story_id`) REFERENCES `user_stories`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tarefa_responsaveis` ADD CONSTRAINT `fk_tr_tarefa` FOREIGN KEY (`tarefa_id`) REFERENCES `tarefas`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subtarefas` ADD CONSTRAINT `fk_subtarefa_tarefa` FOREIGN KEY (`tarefa_id`) REFERENCES `tarefas`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tags` ADD CONSTRAINT `fk_tag_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tarefa_tags` ADD CONSTRAINT `fk_tt_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tarefa_tags` ADD CONSTRAINT `fk_tt_tarefa` FOREIGN KEY (`tarefa_id`) REFERENCES `tarefas`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `fk_comentario_parent` FOREIGN KEY (`parent_id`) REFERENCES `comentarios`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `fk_comentario_tarefa` FOREIGN KEY (`tarefa_id`) REFERENCES `tarefas`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `anexos` ADD CONSTRAINT `fk_anexo_tarefa` FOREIGN KEY (`tarefa_id`) REFERENCES `tarefas`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_stories` ADD CONSTRAINT `fk_story_feature` FOREIGN KEY (`feature_id`) REFERENCES `features`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_stories` ADD CONSTRAINT `fk_story_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_stories` ADD CONSTRAINT `fk_story_sprint` FOREIGN KEY (`sprint_id`) REFERENCES `sprints`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sprints` ADD CONSTRAINT `fk_sprint_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sprint_metricas` ADD CONSTRAINT `fk_metrica_sprint` FOREIGN KEY (`sprint_id`) REFERENCES `sprints`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `definition_of_done` ADD CONSTRAINT `fk_dod_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `story_dod_checklist` ADD CONSTRAINT `fk_story_dod_dod` FOREIGN KEY (`dod_id`) REFERENCES `definition_of_done`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `story_dod_checklist` ADD CONSTRAINT `fk_story_dod_story` FOREIGN KEY (`story_id`) REFERENCES `user_stories`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `capacidade_time` ADD CONSTRAINT `fk_cap_pi` FOREIGN KEY (`pi_id`) REFERENCES `program_increments`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `capacidade_time` ADD CONSTRAINT `fk_cap_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `capacidade_time` ADD CONSTRAINT `fk_cap_sprint` FOREIGN KEY (`sprint_id`) REFERENCES `sprints`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `retrospectivas` ADD CONSTRAINT `fk_retro_sprint` FOREIGN KEY (`sprint_id`) REFERENCES `sprints`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `retrospectiva_itens` ADD CONSTRAINT `fk_retro_item` FOREIGN KEY (`retrospectiva_id`) REFERENCES `retrospectivas`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `retrospectiva_acoes` ADD CONSTRAINT `fk_retro_acao` FOREIGN KEY (`retrospectiva_id`) REFERENCES `retrospectivas`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `retrospectiva_acoes` ADD CONSTRAINT `fk_retro_acao_item` FOREIGN KEY (`item_id`) REFERENCES `retrospectiva_itens`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `projeto_art` ADD CONSTRAINT `fk_pa_art` FOREIGN KEY (`art_id`) REFERENCES `arts`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `projeto_art` ADD CONSTRAINT `fk_pa_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `program_increments` ADD CONSTRAINT `fk_pi_art` FOREIGN KEY (`art_id`) REFERENCES `arts`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pi_objectives` ADD CONSTRAINT `fk_pio_pi` FOREIGN KEY (`pi_id`) REFERENCES `program_increments`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pi_objectives` ADD CONSTRAINT `fk_pio_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pi_objective_features` ADD CONSTRAINT `fk_piof_feature` FOREIGN KEY (`feature_id`) REFERENCES `features`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pi_objective_features` ADD CONSTRAINT `fk_piof_pio` FOREIGN KEY (`pi_objective_id`) REFERENCES `pi_objectives`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ip_iterations` ADD CONSTRAINT `fk_ip_pi` FOREIGN KEY (`pi_id`) REFERENCES `program_increments`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `inspect_adapt` ADD CONSTRAINT `fk_ia_pi` FOREIGN KEY (`pi_id`) REFERENCES `program_increments`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ia_problemas` ADD CONSTRAINT `fk_iap_ia` FOREIGN KEY (`inspect_adapt_id`) REFERENCES `inspect_adapt`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ia_acoes` ADD CONSTRAINT `fk_iaa_problema` FOREIGN KEY (`problema_id`) REFERENCES `ia_problemas`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `epics` ADD CONSTRAINT `fk_epic_art` FOREIGN KEY (`art_id`) REFERENCES `arts`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `epics` ADD CONSTRAINT `fk_epic_parent` FOREIGN KEY (`parent_epic_id`) REFERENCES `epics`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `epics` ADD CONSTRAINT `fk_epic_pi` FOREIGN KEY (`pi_target`) REFERENCES `program_increments`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `features` ADD CONSTRAINT `fk_feature_epic` FOREIGN KEY (`epic_id`) REFERENCES `epics`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `features` ADD CONSTRAINT `fk_feature_pi` FOREIGN KEY (`pi_id`) REFERENCES `program_increments`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `dependencias` ADD CONSTRAINT `fk_dep_pi` FOREIGN KEY (`pi_id`) REFERENCES `program_increments`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `riscos` ADD CONSTRAINT `fk_risco_feature` FOREIGN KEY (`feature_id`) REFERENCES `features`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `riscos` ADD CONSTRAINT `fk_risco_pi` FOREIGN KEY (`pi_id`) REFERENCES `program_increments`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `riscos` ADD CONSTRAINT `fk_risco_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `roadmaps` ADD CONSTRAINT `fk_roadmap_art` FOREIGN KEY (`art_id`) REFERENCES `arts`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `roadmap_itens` ADD CONSTRAINT `fk_ri_epic` FOREIGN KEY (`epic_id`) REFERENCES `epics`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `roadmap_itens` ADD CONSTRAINT `fk_ri_feature` FOREIGN KEY (`feature_id`) REFERENCES `features`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `roadmap_itens` ADD CONSTRAINT `fk_ri_pi_fim` FOREIGN KEY (`pi_fim`) REFERENCES `program_increments`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `roadmap_itens` ADD CONSTRAINT `fk_ri_pi_inicio` FOREIGN KEY (`pi_inicio`) REFERENCES `program_increments`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `roadmap_itens` ADD CONSTRAINT `fk_ri_roadmap` FOREIGN KEY (`roadmap_id`) REFERENCES `roadmaps`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `documentos` ADD CONSTRAINT `fk_doc_parent` FOREIGN KEY (`parent_id`) REFERENCES `documentos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `documentos` ADD CONSTRAINT `fk_doc_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `documento_versoes` ADD CONSTRAINT `fk_doc_versao` FOREIGN KEY (`documento_id`) REFERENCES `documentos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `atividades` ADD CONSTRAINT `fk_atividade_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `projetos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `atividade_likes` ADD CONSTRAINT `fk_like_atividade` FOREIGN KEY (`atividade_id`) REFERENCES `atividades`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `atividade_comentarios` ADD CONSTRAINT `fk_coment_atividade` FOREIGN KEY (`atividade_id`) REFERENCES `atividades`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `atividade_comentarios` ADD CONSTRAINT `fk_coment_parent` FOREIGN KEY (`parent_id`) REFERENCES `atividade_comentarios`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `comentario_likes` ADD CONSTRAINT `fk_clike_comentario` FOREIGN KEY (`comentario_id`) REFERENCES `atividade_comentarios`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
