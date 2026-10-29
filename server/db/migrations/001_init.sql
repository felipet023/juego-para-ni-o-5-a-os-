-- ─────────────────────────────────────────────────────────────
-- SQLQuest 3D · Migración 001 · Esquema principal
-- Base de datos: sqlquest_app
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS schema_migrations (
  id          VARCHAR(120) NOT NULL PRIMARY KEY,
  applied_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username       VARCHAR(40)  NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  role           ENUM('player', 'admin') NOT NULL DEFAULT 'player',
  display_name   VARCHAR(60)  NOT NULL,
  avatar         VARCHAR(20)  NOT NULL DEFAULT 'ajolote',
  is_active      TINYINT(1)   NOT NULL DEFAULT 1,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_username (username),
  KEY idx_users_role (role)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS sessions (
  token_hash  CHAR(64)     NOT NULL PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at  DATETIME     NOT NULL,
  user_agent  VARCHAR(255) NULL,
  ip_hash     CHAR(64)     NULL,
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS lessons (
  id           VARCHAR(60)  NOT NULL PRIMARY KEY,
  order_index  INT          NOT NULL,
  title        VARCHAR(120) NOT NULL,
  zone         VARCHAR(40)  NOT NULL,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  is_custom    TINYINT(1)   NOT NULL DEFAULT 0,
  content_json JSON         NOT NULL,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_lessons_order (order_index)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS progress (
  user_id         INT UNSIGNED NOT NULL,
  lesson_id       VARCHAR(60)  NOT NULL,
  status          ENUM('locked', 'available', 'in_progress', 'mastered') NOT NULL DEFAULT 'locked',
  stars           TINYINT UNSIGNED NOT NULL DEFAULT 0,
  mission_done    TINYINT(1)   NOT NULL DEFAULT 0,
  practice_done   TINYINT(1)   NOT NULL DEFAULT 0,
  checks_passed   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  attempts_count  INT UNSIGNED NOT NULL DEFAULT 0,
  hints_used      INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lesson_id),
  CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS attempts (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  lesson_id   VARCHAR(60)  NOT NULL,
  step        VARCHAR(20)  NOT NULL,
  is_correct  TINYINT(1)   NOT NULL,
  answer_json JSON         NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_attempts_user (user_id, created_at),
  CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS badges (
  user_id    INT UNSIGNED NOT NULL,
  badge_key  VARCHAR(60)  NOT NULL,
  awarded_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_key),
  CONSTRAINT fk_badges_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS audit_log (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_id        INT UNSIGNED NULL,
  actor_username  VARCHAR(40)  NULL,
  action          VARCHAR(60)  NOT NULL,
  target_type     VARCHAR(40)  NULL,
  target_id       VARCHAR(60)  NULL,
  meta_json       JSON         NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_created (created_at),
  KEY idx_audit_actor (actor_id)
) ENGINE = InnoDB;
