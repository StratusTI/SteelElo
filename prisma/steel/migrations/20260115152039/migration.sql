-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NULL DEFAULT '',
    `email` VARCHAR(100) NULL DEFAULT '',
    `senha` VARCHAR(255) NULL DEFAULT '',
    `permissoes` TEXT NULL,
    `sobrenome` VARCHAR(100) NULL DEFAULT '',
    `foto` VARCHAR(100) NULL DEFAULT '',
    `telefone` VARCHAR(30) NULL DEFAULT '',
    `admin` BOOLEAN NULL DEFAULT false,
    `idempresa` INTEGER NULL,
    `idconfiguracao` INTEGER NULL,
    `ramal` VARCHAR(6) NULL DEFAULT '',
    `queue_penalty` INTEGER NULL DEFAULT 5,
    `session_token` VARCHAR(255) NULL DEFAULT '',
    `sigame` BOOLEAN NULL DEFAULT false,
    `superadmin` BOOLEAN NULL DEFAULT false,
    `iddevice` VARCHAR(11) NULL,
    `last_seen` DATETIME(0) NULL,
    `online` BOOLEAN NOT NULL DEFAULT false,
    `agente_dinamico` BOOLEAN NULL DEFAULT false,
    `senha_api_md5` CHAR(32) NULL,
    `vpn` BOOLEAN NULL DEFAULT false,
    `microsip_singlemode` BOOLEAN NULL DEFAULT false,
    `microsip_aa` BOOLEAN NULL DEFAULT false,
    `lgpd` BOOLEAN NULL DEFAULT false,
    `lgpd_date` DATETIME(0) NULL,
    `departamento` VARCHAR(100) NULL DEFAULT '',
    `time` VARCHAR(100) NULL DEFAULT '',
    `dispositivos` LONGTEXT NULL,

    UNIQUE INDEX `email`(`email`),
    INDEX `idx_usuarios_dev_online_seen`(`iddevice`, `online`, `last_seen`),
    INDEX `idempresa`(`idempresa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NULL DEFAULT '',
    `cnpj` VARCHAR(20) NULL DEFAULT '',
    `endereco` VARCHAR(255) NULL DEFAULT '',
    `cep` VARCHAR(10) NULL DEFAULT '',
    `coordenadas` VARCHAR(50) NULL DEFAULT '',
    `data_criacao` TIMESTAMP(0) NULL,
    `data_alteracao` TIMESTAMP(0) NULL,
    `logo_empresa` TEXT NULL,
    `status` VARCHAR(1) NULL DEFAULT '0',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `acessos_usuarios` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `numero_acesso` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_acessos_usuario_id`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(50) NULL,
    `date` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `iddevice` VARCHAR(11) NOT NULL,
    `whatsapp_numero` VARCHAR(20) NOT NULL,
    `sessionid` VARCHAR(100) NULL,

    PRIMARY KEY (`id`, `whatsapp_numero`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `arquivos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `caminho` VARCHAR(1024) NOT NULL,
    `nome_original` VARCHAR(255) NOT NULL,
    `mime_forcado` VARCHAR(120) NULL,
    `tamanho` BIGINT NULL,
    `criado_em` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `descricao` TEXT NULL,
    `superadmin` VARCHAR(1) NULL DEFAULT '0',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `arquivos_download_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `idarquivo` INTEGER NOT NULL,
    `idusuario` INTEGER NOT NULL,
    `ip` VARCHAR(45) NULL,
    `user_agent` VARCHAR(255) NULL,
    `dt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idarquivo`(`idarquivo`),
    INDEX `idusuario`(`idusuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `arquivos_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `idarquivo` INTEGER NULL,
    `acao` ENUM('upload', 'update', 'delete') NOT NULL,
    `idusuario` INTEGER NOT NULL,
    `detalhes` VARCHAR(255) NULL,
    `dt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idarquivo`(`idarquivo`),
    INDEX `idusuario`(`idusuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configuracao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `permissoes` TEXT NULL,
    `idsistemas` VARCHAR(10) NULL,
    `pagina` VARCHAR(10) NULL,
    `idusuario` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `db_modelo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip` VARCHAR(100) NOT NULL,
    `usuario` VARCHAR(100) NOT NULL,
    `senha` TEXT NOT NULL DEFAULT 'yi32YeCLNVtM6g+hxyL9FUSNqkiwDQKdBD6yp4MjEr8=',
    `banco` VARCHAR(100) NOT NULL,
    `idsistema` VARCHAR(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `device` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idcliente` INTEGER NOT NULL,
    `licenca` CHAR(100) NOT NULL DEFAULT '',
    `token` CHAR(36) NOT NULL DEFAULT (uuid()),
    `versao` VARCHAR(50) NULL DEFAULT '',
    `descricao` CHAR(200) NULL DEFAULT '',
    `ativo` INTEGER NULL,
    `ip` CHAR(32) NULL DEFAULT '',
    `usuario` CHAR(20) NULL DEFAULT '',
    `senha` CHAR(20) NULL DEFAULT '',
    `banco1` CHAR(30) NULL DEFAULT '',
    `banco2` CHAR(30) NULL DEFAULT '',
    `banco3` CHAR(30) NULL DEFAULT '',
    `banco4` CHAR(30) NULL DEFAULT '',
    `banco5` CHAR(30) NULL DEFAULT '',
    `banco6` CHAR(30) NULL DEFAULT '',
    `banco_status` INTEGER NULL DEFAULT 0,
    `bilhetador` INTEGER NULL DEFAULT 0,
    `banco7` CHAR(30) NULL DEFAULT '',
    `banco8` CHAR(30) NULL DEFAULT '',
    `banco9` CHAR(30) NULL DEFAULT '',
    `banco10` CHAR(30) NULL DEFAULT '',
    `banco11` VARCHAR(50) NULL DEFAULT 'steelflow2',
    `ip_steel` CHAR(30) NULL DEFAULT '',
    `ip_proxy` CHAR(30) NULL DEFAULT '',
    `ip_firewall` CHAR(30) NULL DEFAULT '',
    `VPABX` INTEGER NULL DEFAULT 0,
    `VLDAP` INTEGER NULL DEFAULT 0,
    `VPROXY` INTEGER NULL DEFAULT 0,
    `VFIREWALL` INTEGER NULL DEFAULT 0,
    `VVIEWER` INTEGER NULL DEFAULT 0,
    `VIDS` INTEGER NULL DEFAULT 0,
    `VBACKUP` INTEGER NULL DEFAULT 0,
    `VCHAMADOS` INTEGER NULL DEFAULT 0,
    `VGESTAOTI` INTEGER NULL DEFAULT 0,
    `VWIFI` INTEGER NULL DEFAULT 0,
    `VPRINT` INTEGER NULL DEFAULT 0,
    `VPRODUCAO` INTEGER NULL DEFAULT 0,
    `VPONTO` INTEGER NULL DEFAULT 0,
    `VFILESERVER` INTEGER NULL DEFAULT 0,
    `VNAC` BOOLEAN NULL DEFAULT false,
    `VRETRO` BOOLEAN NULL DEFAULT false,
    `VFSMONITOR` BOOLEAN NULL DEFAULT false,
    `ip1` CHAR(30) NULL DEFAULT '',
    `ip2` CHAR(30) NULL DEFAULT '',
    `ip3` CHAR(30) NULL DEFAULT '',
    `ip4` CHAR(30) NULL DEFAULT '',
    `ip5` CHAR(30) NULL DEFAULT '',
    `ip6` CHAR(30) NULL DEFAULT '',
    `ip7` CHAR(30) NULL DEFAULT '',
    `ip8` CHAR(30) NULL DEFAULT '',
    `ip9` CHAR(30) NULL DEFAULT '',
    `ip10` CHAR(30) NULL DEFAULT '',
    `usuario1` CHAR(20) NULL DEFAULT '',
    `usuario2` CHAR(20) NULL DEFAULT '',
    `usuario3` CHAR(20) NULL DEFAULT '',
    `usuario4` CHAR(20) NULL DEFAULT '',
    `usuario5` CHAR(20) NULL DEFAULT '',
    `usuario6` CHAR(20) NULL DEFAULT '',
    `usuario7` CHAR(20) NULL DEFAULT '',
    `usuario8` CHAR(20) NULL DEFAULT '',
    `usuario9` CHAR(20) NULL DEFAULT '',
    `usuario10` CHAR(20) NULL DEFAULT '',
    `senha1` CHAR(20) NULL DEFAULT '',
    `senha2` CHAR(20) NULL DEFAULT '',
    `senha3` CHAR(20) NULL DEFAULT '',
    `senha4` CHAR(20) NULL DEFAULT '',
    `senha5` CHAR(20) NULL DEFAULT '',
    `senha6` CHAR(20) NULL DEFAULT '',
    `senha7` CHAR(20) NULL DEFAULT '',
    `senha8` CHAR(20) NULL DEFAULT '',
    `senha9` CHAR(20) NULL DEFAULT '',
    `senha10` CHAR(20) NULL DEFAULT '',
    `revenda` INTEGER NULL DEFAULT 0,
    `idrevenda` VARCHAR(30) NULL DEFAULT '',
    `mail_servidorsmtp` VARCHAR(250) NULL DEFAULT '',
    `mail_from` VARCHAR(250) NULL DEFAULT '',
    `mail_user` VARCHAR(250) NULL DEFAULT '',
    `mail_pass` VARCHAR(50) NULL DEFAULT '',
    `mail_port` VARCHAR(10) NULL DEFAULT '',
    `mail_ssl` INTEGER NULL,
    `hostname_pdc` VARCHAR(250) NULL DEFAULT '',
    `update_wagente` INTEGER NULL DEFAULT 0,
    `ip1ext` VARCHAR(30) NULL DEFAULT '',
    `ip2ext` VARCHAR(30) NULL DEFAULT '',
    `ip3ext` VARCHAR(30) NULL DEFAULT '',
    `ip4ext` VARCHAR(30) NULL DEFAULT '',
    `ip5ext` VARCHAR(30) NULL DEFAULT '',
    `ip6ext` VARCHAR(30) NULL DEFAULT '',
    `ip7ext` VARCHAR(30) NULL DEFAULT '',
    `ip8ext` VARCHAR(30) NULL DEFAULT '',
    `ip9ext` VARCHAR(30) NULL DEFAULT '',
    `ip10ext` VARCHAR(30) NULL DEFAULT '',
    `transbordo_sip` INTEGER NULL DEFAULT 0,
    `transbordo_e1` INTEGER NULL DEFAULT 0,
    `tpeer` VARCHAR(20) NULL DEFAULT '',
    `corebilhetes` INTEGER NULL DEFAULT 0,
    `callback` INTEGER NULL DEFAULT 0,
    `iabot` INTEGER NULL DEFAULT 0,
    `data_iabot` DATETIME(0) NULL,
    `offline` INTEGER NULL DEFAULT 0,
    `vempresaid` VARCHAR(10) NULL DEFAULT '',
    `cep` VARCHAR(10) NULL DEFAULT '',
    `address` VARCHAR(250) NULL DEFAULT '',
    `estado` VARCHAR(3) NULL DEFAULT '',
    `distrito` VARCHAR(250) NULL DEFAULT '',
    `city` VARCHAR(250) NULL DEFAULT '',
    `lat` VARCHAR(15) NULL DEFAULT '',
    `lng` VARCHAR(15) NULL DEFAULT '',
    `cod_ibge` VARCHAR(15) NULL DEFAULT '',
    `ddd` VARCHAR(3) NULL DEFAULT '',
    `pf` VARCHAR(1) NULL DEFAULT '0',
    `pj` VARCHAR(1) NULL DEFAULT '0',
    `telefone1` VARCHAR(30) NULL DEFAULT '',
    `telefone2` VARCHAR(30) NULL DEFAULT '',
    `contato_zap` VARCHAR(30) NULL DEFAULT '',
    `bandeira` VARCHAR(100) NULL DEFAULT '',
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `pbx_update_files` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`, `idcliente`, `licenca`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dispositivos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idusuarios` INTEGER NULL,
    `iddevice` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dispositivos_usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NULL,
    `device_id` VARCHAR(64) NULL,
    `user_agent` TEXT NULL,
    `plataforma` VARCHAR(100) NULL,
    `idioma` VARCHAR(20) NULL,
    `largura` INTEGER NULL,
    `altura` INTEGER NULL,
    `data_registro` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `autorizado` BOOLEAN NULL DEFAULT false,
    `memoria_gb` FLOAT NULL,
    `cpu_nucleos` INTEGER NULL,
    `tipo_conexao` VARCHAR(20) NULL,
    `velocidade_mbps` FLOAT NULL,
    `nivel_bateria` FLOAT NULL,
    `carregando` VARCHAR(10) NULL,
    `tipo_dispositivo` VARCHAR(20) NULL,
    `permissao_camera` BOOLEAN NULL DEFAULT false,
    `permissao_localizacao` BOOLEAN NULL DEFAULT false,
    `data_atualizacao` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `id_usuario`(`id_usuario`, `device_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `files` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `relpath` VARCHAR(500) NOT NULL,
    `sha256` CHAR(64) NULL,
    `tamanho` BIGINT NULL,
    `needs_update` BOOLEAN NOT NULL DEFAULT false,
    `versao` INTEGER NOT NULL DEFAULT 1,
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `last_pull_at` DATETIME(0) NULL,
    `last_pull_ip` VARCHAR(45) NULL,
    `classificacao` VARCHAR(50) NOT NULL DEFAULT 'asterisk_script',
    `descricao` VARCHAR(500) NOT NULL,

    UNIQUE INDEX `uq_files_relpath`(`relpath`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `files_log` (
    `iddevice` INTEGER NOT NULL,
    `idfile` INTEGER NOT NULL DEFAULT 0,
    `versao_aplicada` INTEGER NOT NULL DEFAULT 0,
    `last_pull_at` DATETIME(0) NULL,
    `token` VARCHAR(128) NULL,
    `last_ip` VARCHAR(45) NULL,
    `last_action` VARCHAR(20) NULL,
    `last_status` VARCHAR(10) NULL,
    `last_error` VARCHAR(255) NULL,
    `last_count` INTEGER NULL,
    `last_file_id` INTEGER NULL,
    `last_file` VARCHAR(255) NULL,
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_files_log_device`(`iddevice`),
    INDEX `idx_files_log_file`(`idfile`),
    PRIMARY KEY (`idfile`, `iddevice`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `horarios_padrao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `dia_semana` ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo') NOT NULL,
    `hora_entrada` TIME(0) NOT NULL,
    `hora_saida` TIME(0) NOT NULL,
    `horario_flexivel` BOOLEAN NULL DEFAULT false,

    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `linphone_config_pabx` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `iddevice` INTEGER NOT NULL,
    `display_name` VARCHAR(100) NULL,
    `welcome_message` TEXT NULL,
    `enable_video` BOOLEAN NOT NULL DEFAULT true,
    `enable_chat` BOOLEAN NOT NULL DEFAULT true,
    `codec_order` VARCHAR(255) NOT NULL DEFAULT 'opus,PCMU,PCMA',
    `refresh_interval` INTEGER NOT NULL DEFAULT 0,
    `allow_account_edit` BOOLEAN NOT NULL DEFAULT false,
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_linphone_cfg_iddevice`(`iddevice`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `noticias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `destaque` TEXT NOT NULL,
    `descricao` TEXT NOT NULL,
    `topicos` LONGTEXT NOT NULL,
    `rodape` TEXT NOT NULL,
    `link_texto` VARCHAR(100) NOT NULL,
    `link_url` VARCHAR(500) NOT NULL,
    `imagem` VARCHAR(500) NOT NULL,
    `imagem_alt` VARCHAR(255) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_ativo`(`ativo`),
    INDEX `idx_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paginas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `produto` VARCHAR(50) NULL DEFAULT '',
    `pagina` VARCHAR(20) NULL DEFAULT '',
    `descricao` VARCHAR(250) NULL DEFAULT '',
    `arquivo` VARCHAR(250) NULL DEFAULT '',
    `tipo` ENUM('Menu', 'Configuração', 'Relatório', 'Gravações', 'Dashboard', 'Administração', 'Operação', 'Usuário', 'Mensagens', 'Remoto', 'Inteligência Artificial', 'Projeto', 'PI Planning', 'SCRUM', 'Colaboração') NULL,
    `arquivo_homologacao` VARCHAR(250) NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paginas_perfil` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idpaginas` LONGTEXT NULL,
    `nome` VARCHAR(250) NULL,
    `descricao` VARCHAR(250) NULL,
    `created_at` DATETIME(0) NULL,
    `idsistemas` VARCHAR(11) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `painel_custom` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idusuario` INTEGER NULL,
    `colunas` VARCHAR(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `iduser` VARCHAR(11) NULL DEFAULT '',
    `permissoes` TEXT NULL,
    `tela` VARCHAR(5) NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ponto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `data` DATE NOT NULL,
    `entrada` DATETIME(0) NULL,
    `almoco_saida` DATETIME(0) NULL,
    `almoco_retorno` DATETIME(0) NULL,
    `saida_final` DATETIME(0) NULL,
    `latitude_entrada` DECIMAL(10, 8) NULL,
    `longitude_entrada` DECIMAL(11, 8) NULL,
    `latitude_saida` DECIMAL(10, 8) NULL,
    `longitude_saida` DECIMAL(11, 8) NULL,
    `foto_entrada` VARCHAR(255) NULL,

    UNIQUE INDEX `id_usuario`(`id_usuario`, `data`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ponto_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_empresa` INTEGER NULL,
    `obrigatorio_camera` BOOLEAN NULL DEFAULT true,
    `obrigatorio_localizacao` BOOLEAN NULL DEFAULT true,
    `horario_flexivel` BOOLEAN NULL DEFAULT false,
    `horario_tolerancia_entrada` INTEGER NULL DEFAULT 0,
    `horario_tolerancia_saida` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `radiosonline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(254) NULL,
    `nome` VARCHAR(100) NULL,
    `data_criacao` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sistemas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `url` VARCHAR(255) NOT NULL,
    `cor` VARCHAR(20) NULL DEFAULT '#0d6efd',
    `url_homologacao` VARCHAR(255) NOT NULL,
    `banco` VARCHAR(100) NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `softphone_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` CHAR(64) NOT NULL,
    `iddevice` INTEGER NULL,
    `ramal` VARCHAR(50) NOT NULL,
    `sip_domain` VARCHAR(255) NULL,
    `sip_user` VARCHAR(80) NULL,
    `sip_pass` VARCHAR(255) NULL,
    `transport` VARCHAR(10) NOT NULL DEFAULT 'udp',
    `criado_em` DATETIME(0) NOT NULL,
    `expira_em` DATETIME(0) NOT NULL,
    `usado_em` DATETIME(0) NULL,
    `criado_por` INTEGER NULL,

    UNIQUE INDEX `token`(`token`),
    INDEX `idx_softphone_tokens_reuse`(`iddevice`, `ramal`, `usado_em`, `expira_em`, `criado_em`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tokens_ws` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `criado_em` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `expira_em` DATETIME(0) NULL,

    UNIQUE INDEX `token`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `whatsapp_emoji` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `emoji` VARCHAR(20) NOT NULL,
    `categoria` VARCHAR(50) NULL DEFAULT 'normal',
    `ativo` BOOLEAN NULL DEFAULT true,
    `iddevice` INTEGER NULL DEFAULT 0,
    `custom` BOOLEAN NULL DEFAULT false,
    `arquivo` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `whatsapp_numero` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `iddevice` VARCHAR(11) NULL,
    `numero` VARCHAR(20) NOT NULL,
    `numero_id` VARCHAR(50) NOT NULL,
    `meta` BOOLEAN NULL DEFAULT false,
    `zapi` BOOLEAN NULL DEFAULT false,
    `zapi_instancia` VARCHAR(250) NULL DEFAULT '',
    `zapi_token` VARCHAR(250) NULL DEFAULT '',
    `meta_token` VARCHAR(512) NULL DEFAULT '',
    `zapi_client_token` VARCHAR(250) NULL DEFAULT '',
    `status` VARCHAR(20) NULL,
    `status_erro` TEXT NULL,
    `status_data` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`idempresa`) REFERENCES `empresa`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `acessos_usuarios` ADD CONSTRAINT `fk_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `arquivos_download_log` ADD CONSTRAINT `fk_adl_arq` FOREIGN KEY (`idarquivo`) REFERENCES `arquivos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `horarios_padrao` ADD CONSTRAINT `horarios_padrao_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ponto` ADD CONSTRAINT `ponto_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
