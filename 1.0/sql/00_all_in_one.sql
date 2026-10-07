-- =============================================================================
-- 中俄能源装备术语库系统 · 数据库结构脚本 (MySQL 8.0)
-- 文件: 01_schema.sql
-- 说明: 建库 + 建表(17 张) + 索引 + 视图。可在 Navicat Premium 17 中直接“运行 SQL 文件”导入。
--       字符集统一 utf8mb4，支持中文 / 俄文(西里尔字母) / 英文。
--
-- Navicat 使用步骤:
--   1) 连接你的 MySQL -> 右键连接 -> “运行 SQL 文件...” -> 选择本文件 -> 开始
--      (或: 新建查询 -> 粘贴本文件内容 -> 运行)
--   2) 再导入 02_seed.sql 以获得演示数据与演示账号
--   也可直接导入 00_all_in_one.sql(结构+数据 一体)
--
-- 提示: 脚本不包含外键约束(应用层采用软删除/级联逻辑，加外键反而会阻断删除)，
--       因此对导入顺序不敏感；同时内置 DROP TABLE，可“重复导入”以重置结构。
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `energy_term_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `energy_term_db`;

-- -----------------------------------------------------------------------------
-- 1. users 用户
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username`      VARCHAR(50)  NOT NULL                COMMENT '登录名(字母/数字/下划线/汉字, 3-20)',
  `passwordHash`  VARCHAR(100) NOT NULL                COMMENT '密码(BCrypt 哈希)',
  `name`          VARCHAR(50)      NULL                COMMENT '昵称/姓名',
  `email`         VARCHAR(100)     NULL                COMMENT '邮箱',
  `phone`         VARCHAR(30)      NULL                COMMENT '手机号',
  `avatar`        VARCHAR(255)     NULL                COMMENT '头像地址',
  `bio`           VARCHAR(500)     NULL                COMMENT '个人简介',
  `role`          VARCHAR(20)  NOT NULL DEFAULT 'user' COMMENT '角色 user/teacher/student/admin',
  `status`        VARCHAR(20)  NOT NULL DEFAULT 'active' COMMENT '状态 active/disabled',
  `lastSignInAt`  DATETIME         NULL                COMMENT '最近登录时间',
  `createdAt`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户';

-- -----------------------------------------------------------------------------
-- 2. databases 分数据库(术语库)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `databases`;
CREATE TABLE `databases` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name`        VARCHAR(100) NOT NULL                COMMENT '分库名称',
  `category`    VARCHAR(50)  NOT NULL                COMMENT '所属领域',
  `description` VARCHAR(500)     NULL                COMMENT '描述',
  `ownerId`     BIGINT           NULL                COMMENT '库主用户 id',
  `visibility`  VARCHAR(20)  NOT NULL DEFAULT 'public' COMMENT '可见性 public/private/team',
  `termCount`   INT          NOT NULL DEFAULT 0      COMMENT '术语数量(冗余统计)',
  `status`      VARCHAR(20)  NOT NULL DEFAULT 'active' COMMENT '状态 active/archived',
  `createdAt`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_databases_owner` (`ownerId`),
  KEY `idx_databases_category` (`category`),
  KEY `idx_databases_status` (`status`),
  KEY `idx_databases_visibility` (`visibility`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分数据库';

-- -----------------------------------------------------------------------------
-- 3. user_database_roles 用户-分库角色
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `user_database_roles`;
CREATE TABLE `user_database_roles` (
  `id`        BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  `userId`    BIGINT      NOT NULL                COMMENT '用户 id',
  `dbId`      BIGINT      NOT NULL                COMMENT '分库 id',
  `role`      VARCHAR(20) NOT NULL DEFAULT 'viewer' COMMENT '分库角色 admin/editor/viewer',
  `createdAt` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_udr_user_db` (`userId`, `dbId`),
  KEY `idx_udr_db` (`dbId`),
  KEY `idx_udr_user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户-分库角色';

-- -----------------------------------------------------------------------------
-- 4. terms 术语条目
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `terms`;
CREATE TABLE `terms` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `dbId`        BIGINT       NOT NULL                COMMENT '所属分库 id',
  `cnTerm`      VARCHAR(200) NOT NULL                COMMENT '中文名',
  `ruTerm`      VARCHAR(300) NOT NULL                COMMENT '俄文名',
  `enTerm`      VARCHAR(200)     NULL                COMMENT '英文名',
  `definition`  TEXT             NULL                COMMENT '专业释义',
  `context`     TEXT             NULL                COMMENT '使用场景',
  `cultureNote` TEXT             NULL                COMMENT '文化注释',
  `pos`         VARCHAR(30)      NULL                COMMENT '词性',
  `tags`        VARCHAR(255)     NULL                COMMENT '标签(逗号分隔)',
  `status`      VARCHAR(20)  NOT NULL DEFAULT 'active' COMMENT '状态 active/deleted',
  `version`     INT          NOT NULL DEFAULT 1      COMMENT '当前版本号',
  `createdBy`   BIGINT           NULL                COMMENT '创建人 id',
  `updatedBy`   BIGINT           NULL                COMMENT '最后修改人 id',
  `createdAt`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_terms_db_status` (`dbId`, `status`),
  KEY `idx_terms_db_updated` (`dbId`, `updatedAt`),
  KEY `idx_terms_pos` (`pos`),
  KEY `idx_terms_status` (`status`),
  KEY `idx_terms_cn` (`cnTerm`),
  KEY `idx_terms_ru` (`ruTerm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='术语条目';

-- -----------------------------------------------------------------------------
-- 5. term_media 术语富媒体
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `term_media`;
CREATE TABLE `term_media` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `termId`      BIGINT       NOT NULL                COMMENT '术语 id',
  `type`        VARCHAR(20)      NULL                COMMENT '类型 image/audio/video/document',
  `url`         VARCHAR(500)     NULL                COMMENT '资源地址',
  `description` VARCHAR(500)     NULL                COMMENT '说明',
  `sortOrder`   INT          NOT NULL DEFAULT 0      COMMENT '排序',
  `createdAt`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_media_term` (`termId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='术语富媒体';

-- -----------------------------------------------------------------------------
-- 6. term_relations 术语关联
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `term_relations`;
CREATE TABLE `term_relations` (
  `id`            BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  `termId`        BIGINT      NOT NULL                COMMENT '源术语 id',
  `relatedTermId` BIGINT      NOT NULL                COMMENT '关联术语 id',
  `relationType`  VARCHAR(30) NOT NULL DEFAULT 'related' COMMENT '同义/反义/上下位/参见 related/synonym/antonym/hypernym/seealso',
  `createdAt`     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rel` (`termId`, `relatedTermId`, `relationType`),
  KEY `idx_rel_related` (`relatedTermId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='术语关联';

-- -----------------------------------------------------------------------------
-- 7. term_versions 术语版本历史
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `term_versions`;
CREATE TABLE `term_versions` (
  `id`         BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  `termId`     BIGINT      NOT NULL                COMMENT '术语 id',
  `version`    INT         NOT NULL                COMMENT '版本号',
  `snapshot`   MEDIUMTEXT      NULL                COMMENT '版本快照(JSON)',
  `changeType` VARCHAR(20)     NULL                COMMENT '变更类型 create/update/restore',
  `changedBy`  BIGINT          NULL                COMMENT '操作人 id',
  `changeNote` VARCHAR(500)    NULL                COMMENT '变更说明',
  `createdAt`  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_ver_term` (`termId`, `version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='术语版本历史';

-- -----------------------------------------------------------------------------
-- 8. resources 教学资源
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `resources`;
CREATE TABLE `resources` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `dbId`       BIGINT       NOT NULL                COMMENT '所属分库 id',
  `moduleType` VARCHAR(20)      NULL                COMMENT '模块 dialogue/reading/case/video/quiz/culture',
  `title`      VARCHAR(200) NOT NULL                COMMENT '标题',
  `content`    MEDIUMTEXT       NULL                COMMENT '正文/富文本',
  `coverUrl`   VARCHAR(500)     NULL                COMMENT '封面图',
  `mediaUrl`   VARCHAR(500)     NULL                COMMENT '媒体地址',
  `difficulty` VARCHAR(20)  NOT NULL DEFAULT 'beginner' COMMENT '难度 beginner/intermediate/advanced',
  `duration`   INT              NULL                COMMENT '时长(分钟)',
  `status`     VARCHAR(20)  NOT NULL DEFAULT 'active' COMMENT '状态 active/deleted',
  `creatorId`  BIGINT           NULL                COMMENT '创建人 id',
  `createdAt`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_res_db_status` (`dbId`, `status`),
  KEY `idx_res_module_status` (`moduleType`, `status`),
  KEY `idx_res_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教学资源';

-- -----------------------------------------------------------------------------
-- 9. quiz_questions 试题库
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `quiz_questions`;
CREATE TABLE `quiz_questions` (
  `id`           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `dbId`         BIGINT           NULL                COMMENT '所属分库 id',
  `resourceId`   BIGINT           NULL                COMMENT '所属资源 id',
  `questionType` VARCHAR(30)      NULL                COMMENT '题型 single/multiple/blank/match',
  `question`     VARCHAR(500)     NULL                COMMENT '题干',
  `options`      TEXT             NULL                COMMENT '选项(JSON 数组)',
  `answer`       VARCHAR(500)     NULL                COMMENT '答案',
  `explanation`  TEXT             NULL                COMMENT '解析',
  `difficulty`   VARCHAR(20)      NULL                COMMENT '难度',
  `createdAt`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_quiz_db` (`dbId`),
  KEY `idx_quiz_resource` (`resourceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='试题库';

-- -----------------------------------------------------------------------------
-- 10. learning_records 学习记录
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `learning_records`;
CREATE TABLE `learning_records` (
  `id`           BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  `userId`       BIGINT      NOT NULL                COMMENT '用户 id',
  `dbId`         BIGINT          NULL                COMMENT '分库 id',
  `targetType`   VARCHAR(20) NOT NULL DEFAULT 'term' COMMENT '对象类型 term/resource',
  `targetId`     BIGINT          NULL                COMMENT '对象 id',
  `mode`         VARCHAR(20)     NULL                COMMENT '模式 flashcard/quiz/compare/scenario',
  `score`        INT             NULL                COMMENT '得分(0/1 或百分制)',
  `correctCount` INT             NULL                COMMENT '答对题数',
  `totalCount`   INT             NULL                COMMENT '总题数',
  `duration`     INT             NULL                COMMENT '时长(秒)',
  `detail`       TEXT            NULL                COMMENT '明细(JSON)',
  `createdAt`    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_lr_user_created` (`userId`, `createdAt`),
  KEY `idx_lr_db` (`dbId`),
  KEY `idx_lr_mode` (`mode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习记录';

-- -----------------------------------------------------------------------------
-- 11. favorites 收藏
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `id`         BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  `userId`     BIGINT      NOT NULL                COMMENT '用户 id',
  `targetType` VARCHAR(20) NOT NULL DEFAULT 'term' COMMENT '对象类型 term/resource',
  `targetId`   BIGINT      NOT NULL                COMMENT '对象 id',
  `notes`      VARCHAR(500)    NULL                COMMENT '备注',
  `createdAt`  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fav` (`userId`, `targetType`, `targetId`),
  KEY `idx_fav_user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏';

-- -----------------------------------------------------------------------------
-- 12. notes 个人笔记
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `notes`;
CREATE TABLE `notes` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `userId`     BIGINT       NOT NULL                COMMENT '用户 id',
  `targetType` VARCHAR(20)  NOT NULL DEFAULT 'custom' COMMENT '关联对象类型',
  `targetId`   BIGINT           NULL                COMMENT '关联对象 id',
  `title`      VARCHAR(200)     NULL                COMMENT '标题',
  `content`    TEXT             NULL                COMMENT '内容',
  `createdAt`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_notes_user_updated` (`userId`, `updatedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='个人笔记';

-- -----------------------------------------------------------------------------
-- 13. translation_tasks 翻译任务
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `translation_tasks`;
CREATE TABLE `translation_tasks` (
  `id`             BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  `userId`         BIGINT          NULL                COMMENT '用户 id',
  `taskType`       VARCHAR(20)     NULL                COMMENT '类型 text/file',
  `sourceLang`     VARCHAR(10)     NULL                COMMENT '源语言 zh/ru',
  `targetLang`     VARCHAR(10)     NULL                COMMENT '目标语言 zh/ru',
  `sourceText`     MEDIUMTEXT      NULL                COMMENT '原文',
  `resultText`     MEDIUMTEXT      NULL                COMMENT '译文',
  `matchedTerms`   TEXT            NULL                COMMENT '命中术语(JSON)',
  `fileName`       VARCHAR(255)    NULL                COMMENT '上传文件名',
  `fileUrl`        VARCHAR(500)    NULL                COMMENT '上传文件地址',
  `resultFileUrl`  VARCHAR(500)    NULL                COMMENT '结果文件地址',
  `status`         VARCHAR(20)     NULL                COMMENT '状态 processing/completed/failed',
  `errorMsg`       VARCHAR(500)    NULL                COMMENT '错误信息',
  `createdAt`      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `completedAt`    DATETIME        NULL                COMMENT '完成时间',
  PRIMARY KEY (`id`),
  KEY `idx_tt_user_created` (`userId`, `createdAt`),
  KEY `idx_tt_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='翻译任务';

-- -----------------------------------------------------------------------------
-- 14. learning_paths 学习路径
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `learning_paths`;
CREATE TABLE `learning_paths` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name`        VARCHAR(100) NOT NULL                COMMENT '路径名称',
  `description` VARCHAR(500)     NULL                COMMENT '描述',
  `level`       VARCHAR(20)      NULL                COMMENT '级别 beginner/intermediate/advanced',
  `coverUrl`    VARCHAR(500)     NULL                COMMENT '封面图',
  `sortOrder`   INT          NOT NULL DEFAULT 0      COMMENT '排序',
  `status`      VARCHAR(20)  NOT NULL DEFAULT 'active' COMMENT '状态 active/disabled',
  `createdAt`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_paths_status_sort` (`status`, `sortOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习路径';

-- -----------------------------------------------------------------------------
-- 15. learning_path_nodes 学习路径节点
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `learning_path_nodes`;
CREATE TABLE `learning_path_nodes` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `pathId`     BIGINT       NOT NULL                COMMENT '学习路径 id',
  `dbId`       BIGINT           NULL                COMMENT '关联分库 id',
  `resourceId` BIGINT           NULL                COMMENT '关联资源 id',
  `title`      VARCHAR(200)     NULL                COMMENT '节点标题',
  `sortOrder`  INT          NOT NULL DEFAULT 0      COMMENT '排序',
  `createdAt`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_nodes_path` (`pathId`),
  KEY `idx_nodes_db` (`dbId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习路径节点';

-- -----------------------------------------------------------------------------
-- 16. announcements 公告/推荐
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id`        BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `title`     VARCHAR(200) NOT NULL                COMMENT '标题',
  `content`   TEXT             NULL                COMMENT '内容',
  `type`      VARCHAR(20)  NOT NULL DEFAULT 'notice' COMMENT '类型 notice/recommend',
  `linkUrl`   VARCHAR(500)     NULL                COMMENT '跳转链接',
  `status`    VARCHAR(20)  NOT NULL DEFAULT 'published' COMMENT '状态 published/draft',
  `sortOrder` INT          NOT NULL DEFAULT 0      COMMENT '排序',
  `createdBy` BIGINT           NULL                COMMENT '发布人 id',
  `createdAt` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_ann_status_type_sort` (`status`, `type`, `sortOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告/推荐';

-- -----------------------------------------------------------------------------
-- 17. audit_logs 操作审计日志
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `userId`     BIGINT           NULL                COMMENT '操作人 id',
  `action`     VARCHAR(50)      NULL                COMMENT '动作 create/update/delete/login...',
  `targetType` VARCHAR(50)      NULL                COMMENT '对象类型 user/term/database/resource...',
  `targetId`   BIGINT           NULL                COMMENT '对象 id',
  `detail`     TEXT             NULL                COMMENT '详情(JSON)',
  `ip`         VARCHAR(64)      NULL                COMMENT '来源 IP',
  `userAgent`  VARCHAR(500)     NULL                COMMENT '浏览器 UA',
  `createdAt`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`userId`),
  KEY `idx_audit_created` (`createdAt`),
  KEY `idx_audit_target` (`targetType`, `targetId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作审计日志';

-- -----------------------------------------------------------------------------
-- 视图 v_database_overview 分库概览(分库 + 库主 + 成员数)
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS `v_database_overview`;
CREATE OR REPLACE VIEW `v_database_overview` AS
SELECT
  d.`id`          AS `id`,
  d.`name`        AS `name`,
  d.`category`    AS `category`,
  d.`description` AS `description`,
  d.`ownerId`     AS `ownerId`,
  u.`username`    AS `ownerUsername`,
  u.`name`        AS `ownerName`,
  d.`visibility`  AS `visibility`,
  d.`termCount`   AS `termCount`,
  d.`status`      AS `status`,
  (SELECT COUNT(*) FROM `user_database_roles` r WHERE r.`dbId` = d.`id`) AS `memberCount`,
  d.`createdAt`   AS `createdAt`,
  d.`updatedAt`   AS `updatedAt`
FROM `databases` d
LEFT JOIN `users` u ON u.`id` = d.`ownerId`;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 结构创建完成: 17 张表 + 1 个视图。
-- 下一步: 导入 02_seed.sql 写入演示数据(含账号 admin/admin123、student/student123)。
-- =============================================================================


-- =============================================================================
-- 中俄能源装备术语库系统 · 演示数据脚本 (MySQL 8.0)
-- 文件: 02_seed.sql
-- 说明: 写入演示账号、分库、术语、教学资源、学习记录、收藏、笔记、公告等。
--       请先执行 01_schema.sql 建库建表，再导入本文件。
--
-- 演示账号(密码均为 BCrypt 加密):
--   admin    / admin123    系统管理员
--   student  / student123  学生
--   teacher  / teacher123  教师
-- =============================================================================

SET NAMES utf8mb4;
USE `energy_term_db`;

-- 清空(可重复导入) -----------------------------------------------------------
DELETE FROM `audit_logs`;
DELETE FROM `announcements`;
DELETE FROM `learning_path_nodes`;
DELETE FROM `learning_paths`;
DELETE FROM `translation_tasks`;
DELETE FROM `notes`;
DELETE FROM `favorites`;
DELETE FROM `learning_records`;
DELETE FROM `quiz_questions`;
DELETE FROM `resources`;
DELETE FROM `term_versions`;
DELETE FROM `term_relations`;
DELETE FROM `term_media`;
DELETE FROM `terms`;
DELETE FROM `user_database_roles`;
DELETE FROM `databases`;
DELETE FROM `users`;

-- -----------------------------------------------------------------------------
-- 用户
-- -----------------------------------------------------------------------------
INSERT INTO `users` (`id`,`username`,`passwordHash`,`name`,`email`,`phone`,`bio`,`role`,`status`,`lastSignInAt`) VALUES
(1,'admin','$2a$10$4Qojs7C3Y76icgPQzPSVbOY0PSxR/dNAPh6imNUKcG9.in8x9jo7G','系统管理员','admin@example.com',NULL,'平台管理员，负责分库、用户与内容审核。','admin','active',NOW()),
(2,'student','$2a$10$s2DvSjMbgHFXQM8XoJRvdOABOxV1uG3ziLPmOtVEs3gO0zW4QrM.W','王同学','student@example.com',NULL,'俄语专业，主攻能源装备方向。','student','active',NOW()),
(3,'teacher','$2a$10$M4CD9POl2aFv1deL4M3mqeDLvbKX/94D97cKbWIes69PFNcbLw3E2','陈教授','teacher@example.com',NULL,'能源装备与俄语术语研究者。','teacher','active',NOW()),
(4,'elena','$2a$10$s2DvSjMbgHFXQM8XoJRvdOABOxV1uG3ziLPmOtVEs3gO0zW4QrM.W','叶莲娜','elena@example.com',NULL,'来自莫斯科的交换学生。','student','active',NULL),
(5,'zhangsan','$2a$10$s2DvSjMbgHFXQM8XoJRvdOABOxV1uG3ziLPmOtVEs3gO0zW4QrM.W','张三','zhangsan@example.com',NULL,'机械工程专业学生。','user','active',NULL),
(6,'lisi','$2a$10$s2DvSjMbgHFXQM8XoJRvdOABOxV1uG3ziLPmOtVEs3gO0zW4QrM.W','李四','lisi@example.com',NULL,'国际贸易专业学生。','user','disabled',NULL);

-- -----------------------------------------------------------------------------
-- 分数据库
-- -----------------------------------------------------------------------------
INSERT INTO `databases` (`id`,`name`,`category`,`description`,`ownerId`,`visibility`,`termCount`,`status`) VALUES
(1,'石油钻采装备术语库','石油装备','覆盖钻井、采油、井下工具及地面集输装备的中俄术语。',1,'public',14,'active'),
(2,'天然气与管道输送术语库','天然气','涵盖天然气开采、液化、长输管道与储气设施术语。',1,'public',10,'active'),
(3,'电力与输变电装备术语库','电力装备','发电、变电、输电与配电装备的中俄对照术语。',3,'public',9,'active'),
(4,'新能源装备术语库','新能源','光伏、风电、储能、氢能等新兴能源装备术语。',1,'public',9,'active'),
(5,'能源贸易与合同术语库','经贸合同','面向一带一路能源合作与装备贸易的实务术语。',1,'public',10,'active'),
(6,'煤炭清洁利用术语库','煤炭','煤炭开采与清洁高效利用相关术语（团队库）。',3,'team',4,'active');

-- -----------------------------------------------------------------------------
-- 用户-分库角色
-- -----------------------------------------------------------------------------
INSERT INTO `user_database_roles` (`userId`,`dbId`,`role`) VALUES
(1,1,'admin'),(1,2,'admin'),(1,3,'admin'),(1,4,'admin'),(1,5,'admin'),(1,6,'admin'),
(3,1,'editor'),(3,2,'editor'),(3,6,'admin'),
(2,1,'viewer'),(2,3,'viewer'),(2,5,'viewer'),
(5,1,'editor'),
(4,4,'viewer');

-- -----------------------------------------------------------------------------
-- 术语 (56 条)
-- -----------------------------------------------------------------------------
INSERT INTO `terms` (`id`,`dbId`,`cnTerm`,`ruTerm`,`enTerm`,`definition`,`context`,`cultureNote`,`pos`,`tags`,`status`,`version`,`createdBy`,`updatedBy`,`createdAt`,`updatedAt`) VALUES
-- 分库 1 石油钻采装备
(1,1,'石油','нефть','oil','以液态形式存在于地下的天然可燃矿产，是能源与化工的基础原料。','用于国际能源贸易与装备技术交流。','俄罗斯为全球主要石油生产与出口国之一。','名词','石油,能源,原料','active',1,1,1,DATE_SUB(NOW(),INTERVAL 6 MONTH),DATE_SUB(NOW(),INTERVAL 6 MONTH)),
(2,1,'钻井','бурение','drilling','利用钻头破碎岩石、形成井眼以获取油气的过程。','描述油气勘探开发作业。',NULL,'名词','钻井,勘探,工艺','active',1,1,1,DATE_SUB(NOW(),INTERVAL 6 MONTH),DATE_SUB(NOW(),INTERVAL 6 MONTH)),
(3,1,'钻机','буровая установка','drilling rig','提供动力与提升、旋转系统以完成钻井作业的成套装备。','装备招标与技术规格书中的核心条目。',NULL,'名词','钻井,装备,机械','active',1,1,1,DATE_SUB(NOW(),INTERVAL 6 MONTH),DATE_SUB(NOW(),INTERVAL 5 MONTH)),
(4,1,'抽油机','станок-качалка','pumping unit','游梁式有杆泵采油的地面驱动装置，俗称磕头机。','油田地面采油设备。',NULL,'名词','采油,装备,机械','active',1,1,1,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 5 MONTH)),
(5,1,'油井','нефтяная скважина','oil well','为开采石油而钻出的圆柱形井筒。','描述油田生产单元。',NULL,'名词','采油,井','active',1,1,1,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 5 MONTH)),
(6,1,'采油','добыча нефти','oil extraction','将石油从油层开采至地面的生产过程。','生产指标与作业描述。',NULL,'名词','采油,生产','active',1,1,1,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(7,1,'套管','обсадная труба','casing','下入井内用于巩固井壁、封隔地层的钢管。','完井与固井作业。',NULL,'名词','钻井,管材','active',1,1,1,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(8,1,'输油管道','нефтепровод','oil pipeline','用于输送原油或成品油的管道系统。','长距离能源输送。',NULL,'名词','管道,输送','active',1,1,1,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(9,1,'阀门','клапан','valve','用于控制管道内流体通断与流量的部件。','管道与装备的通用部件。',NULL,'名词','管道,部件','active',1,1,1,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
(10,1,'泵','насос','pump','提升或输送液体的流体机械。','采油与集输装备。',NULL,'名词','装备,流体机械','active',1,1,1,DATE_SUB(NOW(),INTERVAL 3 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
(11,1,'压缩机','компрессор','compressor','提高气体压力并输送气体的机械。','增压与集输系统。',NULL,'名词','装备,流体机械','active',1,1,1,DATE_SUB(NOW(),INTERVAL 3 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
(12,1,'封隔器','пакер','packer','下入井内用于封隔油套环空的井下工具。','分层开采与措施作业。',NULL,'名词','井下工具,完井','active',1,1,1,DATE_SUB(NOW(),INTERVAL 3 MONTH),DATE_SUB(NOW(),INTERVAL 2 MONTH)),
(13,1,'储油罐','резервуар для нефти','oil storage tank','用于储存原油或成品油的立式或卧式容器。','油田与油库储存设施。',NULL,'名词','储运,装备','active',1,1,1,DATE_SUB(NOW(),INTERVAL 2 MONTH),DATE_SUB(NOW(),INTERVAL 2 MONTH)),
(14,1,'开采','добыча','extraction','将地下矿产或流体资源采出的过程。','泛指油气、煤炭等资源生产。',NULL,'动词','生产,通用','active',1,1,1,DATE_SUB(NOW(),INTERVAL 2 MONTH),DATE_SUB(NOW(),INTERVAL 2 MONTH)),
-- 分库 2 天然气与管道输送
(15,2,'天然气','природный газ','natural gas','以甲烷为主、赋存于地层中的可燃气体。','能源贸易与城市燃气。','中俄东线天然气管道是重要合作项目。','名词','天然气,能源','active',1,1,1,DATE_SUB(NOW(),INTERVAL 6 MONTH),DATE_SUB(NOW(),INTERVAL 6 MONTH)),
(16,2,'液化天然气','сжиженный природный газ','LNG','经低温液化便于储运的天然气，体积大幅缩小。','LNG 接收站与运输船。',NULL,'名词','天然气,LNG,储运','active',1,1,1,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 5 MONTH)),
(17,2,'输气管道','газопровод','gas pipeline','用于长距离输送天然气的管道系统。','干线管道与城镇管网。',NULL,'名词','管道,输送','active',1,1,1,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 5 MONTH)),
(18,2,'压缩机站','компрессорная станция','compressor station','为管道天然气增压、保证输送压力的站场设施。','长输管道沿线站场。',NULL,'名词','管道,站场','active',1,1,1,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(19,2,'调压阀','регулятор давления','pressure regulator','自动调节并稳定管道压力的阀门。','分输与调压计量。',NULL,'名词','管道,部件','active',1,1,1,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(20,2,'流量计','расходомер','flow meter','测量管道内流体流量的计量仪表。','贸易计量与结算。',NULL,'名词','计量,仪表','active',1,1,1,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(21,2,'燃气轮机','газовая турбина','gas turbine','以燃气为工质做功的动力机械，常用于驱动压缩机。','驱动与发电装备。',NULL,'名词','动力,装备','active',1,1,1,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
(22,2,'储气库','подземное хранилище газа','underground gas storage','利用枯竭油气藏或盐穴储存天然气的设施。','季节调峰与应急保供。',NULL,'名词','储运,设施','active',1,1,1,DATE_SUB(NOW(),INTERVAL 3 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
(23,2,'管道输送','трубопроводный транспорт','pipeline transportation','以管道方式连续输送油气的运输方式。','能源物流。',NULL,'名词','输送,物流','active',1,1,1,DATE_SUB(NOW(),INTERVAL 3 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
(24,2,'焊接','сварка','welding','通过加热或加压使金属件连接成整体的工艺。','管道施工与装备制造。',NULL,'名词','工艺,施工','active',1,1,1,DATE_SUB(NOW(),INTERVAL 3 MONTH),DATE_SUB(NOW(),INTERVAL 2 MONTH)),
-- 分库 3 电力与输变电装备
(25,3,'电力','электроэнергия','electricity','由发电设施生产、经电网输配的电能。','电力系统与用能。',NULL,'名词','电力,能源','active',1,3,3,DATE_SUB(NOW(),INTERVAL 6 MONTH),DATE_SUB(NOW(),INTERVAL 6 MONTH)),
(26,3,'变压器','трансформатор','transformer','利用电磁感应改变交流电压的静止电气设备。','输变电核心装备。',NULL,'名词','电力,装备','active',1,3,3,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 5 MONTH)),
(27,3,'发电机','генератор','generator','将机械能转换为电能的旋转电机。','电源侧核心装备。',NULL,'名词','电力,装备','active',1,3,3,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 5 MONTH)),
(28,3,'断路器','выключатель','circuit breaker','能关合、承载并开断正常及短路电流的开关设备。','保护与控制设备。',NULL,'名词','电力,开关','active',1,3,3,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(29,3,'输电线','линия электропередачи','transmission line','用于输送电能的架空线路或电缆线路。','输电通道。',NULL,'名词','电力,线路','active',1,3,3,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(30,3,'变电站','подстанция','substation','变换电压、汇集与分配电能的电力设施。','电网节点。',NULL,'名词','电力,站场','active',1,3,3,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(31,3,'开关柜','распределительный шкаф','switchgear','用于配电系统中安装开关电器及保护装置的柜体。','配电室设备。',NULL,'名词','电力,装备','active',1,3,3,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
(32,3,'绝缘子','изолятор','insulator','用于支撑导线并保证电气绝缘的器件。','线路与变电金具。',NULL,'名词','电力,部件','active',1,3,3,DATE_SUB(NOW(),INTERVAL 3 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
(33,3,'电网','электросеть','power grid','由变电、输配电设施组成的电力网络。','电力系统整体。',NULL,'名词','电力,系统','active',1,3,3,DATE_SUB(NOW(),INTERVAL 3 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
-- 分库 4 新能源装备
(34,4,'新能源','возобновляемая энергия','renewable energy','相对于传统化石能源的可再生能源，如风能、太阳能等。','能源转型主题。',NULL,'名词','新能源,能源','active',1,1,1,DATE_SUB(NOW(),INTERVAL 6 MONTH),DATE_SUB(NOW(),INTERVAL 6 MONTH)),
(35,4,'太阳能','солнечная энергия','solar energy','太阳辐射转化而来的能量，可通过光伏或光热利用。','光伏发电与供热。',NULL,'名词','新能源,太阳能','active',1,1,1,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 5 MONTH)),
(36,4,'光伏组件','фотоэлектрический модуль','photovoltaic module','由光伏电池封装而成的发电单元。','光伏电站核心部件。',NULL,'名词','新能源,装备','active',1,1,1,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 5 MONTH)),
(37,4,'风能','ветровая энергия','wind energy','由空气流动产生的动能，可用于风力发电。','风电开发。',NULL,'名词','新能源,风能','active',1,1,1,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(38,4,'风力发电机','ветрогенератор','wind turbine','将风能转换为电能的发电设备。','风电装备。',NULL,'名词','新能源,装备','active',1,1,1,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(39,4,'储能电池','аккумуляторная батарея','storage battery','用于储存电能、在需要时释放的电池系统。','电化学储能。',NULL,'名词','新能源,储能','active',1,1,1,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(40,4,'核能','ядерная энергия','nuclear energy','通过核裂变或核聚变释放的能量。','核电与能源结构。',NULL,'名词','新能源,核能','active',1,1,1,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
(41,4,'氢能','водородная энергия','hydrogen energy','以氢气为载体的清洁能源。','制氢储氢与燃料电池。',NULL,'名词','新能源,氢能','active',1,1,1,DATE_SUB(NOW(),INTERVAL 3 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
(42,4,'储能系统','система хранения энергии','energy storage system','由储能本体、变流与控制系统组成的成套装置。','源网荷储一体化。',NULL,'名词','新能源,储能,系统','active',1,1,1,DATE_SUB(NOW(),INTERVAL 3 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
-- 分库 5 能源贸易与合同
(43,5,'合同','контракт','contract','当事人之间设立、变更、终止民事权利义务关系的协议。','商务与法务核心术语。',NULL,'名词','贸易,法务','active',1,1,1,DATE_SUB(NOW(),INTERVAL 6 MONTH),DATE_SUB(NOW(),INTERVAL 6 MONTH)),
(44,5,'招标','тендер','tender','采购方公开邀请供应商投标的行为与程序。','装备采购流程。',NULL,'名词','贸易,采购','active',1,1,1,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 5 MONTH)),
(45,5,'投标','заявка на тендер','bid','供应商响应招标、提交报价与方案的行为。','采购流程。',NULL,'名词','贸易,采购','active',1,1,1,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 5 MONTH)),
(46,5,'谈判','переговоры','negotiation','双方就交易条件进行协商以达成一致的过程。','商务谈判。',NULL,'名词','贸易,商务','active',1,1,1,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(47,5,'出口','экспорт','export','将本国商品或服务销售到国外的贸易行为。','国际贸易。',NULL,'名词','贸易,通用','active',1,1,1,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(48,5,'进口','импорт','import','从国外购进商品或服务的贸易行为。','国际贸易。',NULL,'名词','贸易,通用','active',1,1,1,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(49,5,'关税','пошлина','tariff','国家对进出口商品征收的税。','海关与结算。',NULL,'名词','贸易,税务','active',1,1,1,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
(50,5,'报价','коммерческое предложение','quotation','向买方提出的价格及交易条件的书面表示。','商务文件。',NULL,'名词','贸易,商务','active',1,1,1,DATE_SUB(NOW(),INTERVAL 3 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
(51,5,'交货期','срок поставки','delivery term','卖方交付货物的约定时间或期限。','合同条款。',NULL,'名词','贸易,合同','active',1,1,1,DATE_SUB(NOW(),INTERVAL 3 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
(52,5,'保修','гарантия','warranty','供货方对产品质量承担修理或更换责任的承诺。','合同条款。',NULL,'名词','贸易,合同','active',1,1,1,DATE_SUB(NOW(),INTERVAL 2 MONTH),DATE_SUB(NOW(),INTERVAL 2 MONTH)),
-- 分库 6 煤炭清洁利用
(53,6,'煤炭','уголь','coal','由古代植物埋藏转化形成的固体可燃矿产。','能源与化工原料。',NULL,'名词','煤炭,能源','active',1,3,3,DATE_SUB(NOW(),INTERVAL 5 MONTH),DATE_SUB(NOW(),INTERVAL 5 MONTH)),
(54,6,'采煤机','угольный комбайн','coal shearer','用于煤壁落煤与装煤的综采机械。','煤矿综采装备。',NULL,'名词','煤炭,装备','active',1,3,3,DATE_SUB(NOW(),INTERVAL 4 MONTH),DATE_SUB(NOW(),INTERVAL 4 MONTH)),
(55,6,'选煤','обогащение угля','coal preparation','去除原煤中杂质、提高煤质的加工过程。','洗选加工。',NULL,'名词','煤炭,工艺','active',1,3,3,DATE_SUB(NOW(),INTERVAL 3 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH)),
(56,6,'煤化工','угольная химия','coal chemical industry','以煤为原料生产化工产品的产业。','现代煤化工。',NULL,'名词','煤炭,化工','active',1,3,3,DATE_SUB(NOW(),INTERVAL 3 MONTH),DATE_SUB(NOW(),INTERVAL 3 MONTH));

-- 术语富媒体
INSERT INTO `term_media` (`termId`,`type`,`url`,`description`,`sortOrder`) VALUES
(3,'image','/uploads/demo/drilling-rig.jpg','钻机示意图',1),
(1,'audio','/uploads/demo/neft.mp3','石油俄语发音',1),
(35,'video','/uploads/demo/solar.mp4','太阳能光伏发电微课',1);

-- 术语关联
INSERT INTO `term_relations` (`termId`,`relatedTermId`,`relationType`) VALUES
(6,14,'seealso'),
(10,11,'seealso'),
(1,15,'seealso'),
(35,37,'related'),
(47,48,'related');

-- 术语版本历史 (示例)
INSERT INTO `term_versions` (`termId`,`version`,`snapshot`,`changeType`,`changedBy`,`changeNote`) VALUES
(3,1,'{"id":3,"dbId":1,"cnTerm":"钻机","ruTerm":"буровая установка","enTerm":"drilling rig"}','create',1,'初始创建');

-- -----------------------------------------------------------------------------
-- 教学资源
-- -----------------------------------------------------------------------------
INSERT INTO `resources` (`id`,`dbId`,`moduleType`,`title`,`content`,`difficulty`,`duration`,`status`,`creatorId`) VALUES
(1,1,'dialogue','询价与报价对话','买方就钻机配件向卖方询价，双方确认价格与交货期。','beginner',15,'active',3),
(2,1,'reading','钻井装备概述','介绍陆地钻机的主要系统与关键部件。','beginner',20,'active',3),
(3,1,'case','某油田抽油机选型案例','结合实际工况，分析抽油机选型与配套参数。','intermediate',30,'active',3),
(4,1,'video','钻机作业流程微课','以动画演示起钻、下钻与完井流程。','beginner',12,'active',3),
(5,1,'quiz','石油装备基础测试','涵盖钻井、采油、集输的 10 道基础题。','beginner',10,'active',3),
(6,1,'culture','中俄能源合作小知识','介绍中俄能源合作的背景与常用礼仪用语。','beginner',8,'active',3),
(7,2,'dialogue','天然气管道验收对话','买卖双方就管道压力试验与验收标准进行沟通。','intermediate',18,'active',3),
(8,2,'reading','长输管道与压缩机站','讲解长输管道输气工艺与压缩机站作用。','intermediate',25,'active',3),
(9,2,'culture','俄罗斯天然气工业文化','俄罗斯天然气工业的相关背景与术语习惯。','beginner',10,'active',3),
(10,3,'reading','输变电装备导论','介绍变压器、断路器等输变电核心装备。','intermediate',22,'active',3),
(11,3,'video','变电站巡检微课','演示变电站主要设备的巡检要点。','intermediate',15,'active',3),
(12,4,'reading','光伏发电系统构成','讲解光伏组件、逆变器与支架系统。','beginner',20,'active',1),
(13,4,'case','风电项目设备选型案例','结合风资源数据，分析风机选型与布局。','advanced',35,'active',1),
(14,4,'video','储能技术入门微课','介绍电化学储能与系统集成。','beginner',14,'active',1),
(15,5,'dialogue','商务谈判开场对话','装备出口谈判中的开场与议题安排。','intermediate',16,'active',1),
(16,5,'case','设备出口合同条款案例','分析交货、验收与保修条款的常见争议。','advanced',30,'active',1),
(17,5,'reading','国际贸易术语基础','介绍常用贸易术语与结算方式。','beginner',18,'active',1);

-- 试题库
INSERT INTO `quiz_questions` (`dbId`,`resourceId`,`questionType`,`question`,`options`,`answer`,`explanation`,`difficulty`) VALUES
(1,5,'single','「钻机」的俄文是？','["буровая установка","насос","клапан","генератор"]','буровая установка','钻机 = буровая установка。','beginner'),
(1,5,'single','「насос」的中文是？','["泵","阀门","压缩机","套管"]','泵','насос 即泵。','beginner'),
(1,5,'single','用于提升液体的流体机械是？','["泵","变压器","流量计","绝缘子"]','泵','泵用于提升或输送液体。','beginner'),
(2,NULL,'single','「природный газ」的中文是？','["天然气","石油","煤炭","电力"]','天然气','天然气的俄文为 природный газ。','beginner'),
(3,NULL,'single','改变交流电压的静止电气设备是？','["变压器","发电机","断路器","开关柜"]','变压器','变压器用于改变交流电压。','beginner'),
(4,NULL,'single','「ветрогенератор」的中文是？','["风力发电机","光伏组件","储能电池","核能"]','风力发电机','ветрогенератор 即风力发电机。','beginner');

-- -----------------------------------------------------------------------------
-- 学习记录
-- -----------------------------------------------------------------------------
INSERT INTO `learning_records` (`userId`,`dbId`,`targetType`,`targetId`,`mode`,`score`,`correctCount`,`totalCount`,`duration`,`createdAt`) VALUES
(2,1,'term',1,'flashcard',1,NULL,NULL,60,DATE_SUB(NOW(),INTERVAL 5 DAY)),
(2,1,'term',2,'flashcard',0,NULL,NULL,45,DATE_SUB(NOW(),INTERVAL 5 DAY)),
(2,1,'term',NULL,'quiz',80,8,10,240,DATE_SUB(NOW(),INTERVAL 4 DAY)),
(2,2,'term',NULL,'quiz',90,9,10,220,DATE_SUB(NOW(),INTERVAL 3 DAY)),
(2,1,'term',NULL,'flashcard',1,NULL,NULL,120,DATE_SUB(NOW(),INTERVAL 2 DAY)),
(2,3,'term',NULL,'quiz',70,7,10,260,DATE_SUB(NOW(),INTERVAL 1 DAY)),
(5,1,'term',NULL,'quiz',60,6,10,300,DATE_SUB(NOW(),INTERVAL 2 DAY)),
(5,1,'term',1,'flashcard',1,NULL,NULL,50,DATE_SUB(NOW(),INTERVAL 1 DAY)),
(3,4,'term',NULL,'compare',NULL,NULL,NULL,180,DATE_SUB(NOW(),INTERVAL 3 DAY));

-- -----------------------------------------------------------------------------
-- 收藏
-- -----------------------------------------------------------------------------
INSERT INTO `favorites` (`userId`,`targetType`,`targetId`,`notes`) VALUES
(2,'term',1,'核心基础词'),
(2,'term',3,'招标文件常出现'),
(2,'term',15,'天然气重点术语'),
(5,'term',35,'新能源方向');

-- -----------------------------------------------------------------------------
-- 个人笔记
-- -----------------------------------------------------------------------------
INSERT INTO `notes` (`userId`,`targetType`,`targetId`,`title`,`content`) VALUES
(2,'term',3,'钻机配套记忆点','钻机配套：动力、提升、旋转、循环四大系统。'),
(2,'custom',NULL,'复习计划','本周重点复习分库 1 与分库 2，完成闪卡两轮。'),
(5,'custom',NULL,'课程笔记','能源装备俄语课第 3 讲：管道与阀门词汇。');

-- -----------------------------------------------------------------------------
-- 翻译任务
-- -----------------------------------------------------------------------------
INSERT INTO `translation_tasks` (`userId`,`taskType`,`sourceLang`,`targetLang`,`sourceText`,`resultText`,`status`,`createdAt`,`completedAt`) VALUES
(2,'text','zh','ru','石油和天然气的开采需要钻机和管道。','нефть и природный газ добыча нуждается буровая установка и трубопровод.','completed',DATE_SUB(NOW(),INTERVAL 2 DAY),DATE_SUB(NOW(),INTERVAL 2 DAY)),
(2,'file','zh','ru','钻井装备概述手册','бурение оборудование обзор руководство','completed',DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_SUB(NOW(),INTERVAL 1 DAY));

-- -----------------------------------------------------------------------------
-- 学习路径
-- -----------------------------------------------------------------------------
INSERT INTO `learning_paths` (`id`,`name`,`description`,`level`,`sortOrder`,`status`) VALUES
(1,'新手入门','从能源装备基础术语开始，掌握常用词汇与发音。','beginner',1,'active'),
(2,'商务谈判进阶','聚焦能源装备贸易与合同谈判实务。','intermediate',2,'active'),
(3,'能源装备综合','贯通石油、天然气、电力与新能源四大方向。','advanced',3,'active');

INSERT INTO `learning_path_nodes` (`pathId`,`dbId`,`resourceId`,`title`,`sortOrder`) VALUES
(1,1,1,'情境对话：询价与报价',1),
(1,2,7,'情境对话：管道验收',2),
(1,4,12,'专业阅读：光伏系统',3),
(2,5,15,'商务谈判开场',1),
(2,5,16,'合同条款案例',2),
(3,1,2,'石油装备概览',1),
(3,2,8,'长输管道与压缩机站',2),
(3,3,10,'输变电装备导论',3),
(3,4,13,'风电项目选型',4);

-- -----------------------------------------------------------------------------
-- 公告/推荐
-- -----------------------------------------------------------------------------
INSERT INTO `announcements` (`title`,`content`,`type`,`linkUrl`,`status`,`sortOrder`,`createdBy`) VALUES
('中俄能源装备术语库系统上线','本系统提供术语库、教学资源、学习中心与翻译服务，欢迎使用并反馈。','notice',NULL,'published',1,1),
('推荐学习路径：能源装备入门','建议新用户从闪卡记忆开始，逐步进入情境对话与测试。','recommend','/learn/flashcard','published',1,1),
('新增“新能源装备术语库”','本分库已上线光伏、风电、储能、氢能等术语，欢迎浏览。','notice','/terminology/4','published',2,1);

-- -----------------------------------------------------------------------------
-- 审计日志 (示例)
-- -----------------------------------------------------------------------------
INSERT INTO `audit_logs` (`userId`,`action`,`targetType`,`targetId`,`ip`,`userAgent`,`createdAt`) VALUES
(1,'login','user',1,'127.0.0.1','Mozilla/5.0',DATE_SUB(NOW(),INTERVAL 6 DAY)),
(3,'create','term',3,'127.0.0.1','Mozilla/5.0',DATE_SUB(NOW(),INTERVAL 5 MONTH)),
(1,'create','database',4,'127.0.0.1','Mozilla/5.0',DATE_SUB(NOW(),INTERVAL 6 MONTH)),
(2,'login','user',2,'127.0.0.1','Mozilla/5.0',DATE_SUB(NOW(),INTERVAL 4 DAY));

-- =============================================================================
-- 演示数据导入完成。
-- 登录: admin/admin123 (管理员), student/student123 (学生), teacher/teacher123 (教师)
-- =============================================================================
