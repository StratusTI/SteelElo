/*
  Warnings:

  - You are about to drop the column `cor` on the `projetos` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `projetos` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(28))` to `Enum(EnumId(0))`.
  - You are about to drop the column `prazo` on the `tarefas` table. All the data in the column will be lost.
  - You are about to alter the column `prioridade` on the `tarefas` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(8))` to `Enum(EnumId(4))`.

*/
-- DropIndex
DROP INDEX `idx_prazo` ON `tarefas`;

-- DropIndex
DROP INDEX `idx_prazo_prioridade` ON `tarefas`;

-- AlterTable
ALTER TABLE `projetos` DROP COLUMN `cor`,
    ADD COLUMN `acesso` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `backgroundUrl` VARCHAR(255) NULL,
    ADD COLUMN `icone` VARCHAR(50) NULL,
    ADD COLUMN `prioridade` ENUM('urgent', 'high', 'medium', 'low', 'none') NULL DEFAULT 'none',
    ADD COLUMN `projectId` VARCHAR(10) NULL,
    MODIFY `status` ENUM('draft', 'planning', 'execution', 'monitoring', 'completed', 'cancelled') NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE `tarefas` DROP COLUMN `prazo`,
    ADD COLUMN `data_fim` DATE NULL,
    ADD COLUMN `data_inicio` DATE NULL,
    ADD COLUMN `status` ENUM('backlog', 'todo', 'in_progress', 'done', 'cancelled') NULL DEFAULT 'backlog',
    MODIFY `prioridade` ENUM('urgent', 'high', 'medium', 'low', 'none') NULL DEFAULT 'none';
