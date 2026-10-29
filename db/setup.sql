-- ─────────────────────────────────────────────────────────────
-- SQLQuest 3D · Aprovisionamiento inicial (ejecutar UNA vez como root)
--
--   mysql -u root -p < db/setup.sql
--
-- Crea:
--   · las bases sqlquest_app, sqlquest_app_test y sqlquest_lab
--   · la cuenta de aplicación `sqlquest_dev` con privilegios mínimos
--   · el esquema del laboratorio (DDL solo lo hace el administrador)
--
-- ⚠️ Cambia la contraseña de ejemplo antes de ejecutar y guárdala en .env.
-- ─────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS sqlquest_app
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS sqlquest_app_test
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS sqlquest_lab
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Si el usuario ya existe, este script NO cambia su contraseña.
-- Para rotarla:  ALTER USER 'sqlquest_dev'@'localhost' IDENTIFIED BY 'nueva-clave';
CREATE USER IF NOT EXISTS 'sqlquest_dev'@'localhost'
  IDENTIFIED BY 'CAMBIA_ESTA_CLAVE';

-- Datos de la aplicación: la app puede crear/alterar sus propias tablas.
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
  ON sqlquest_app.* TO 'sqlquest_dev'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
  ON sqlquest_app_test.* TO 'sqlquest_dev'@'localhost';

-- Laboratorio infantil: solo lectura y escritura de filas.
-- Sin DROP, sin GRANT, sin FILE, sin acceso a las demás bases.
GRANT SELECT, INSERT, UPDATE, DELETE
  ON sqlquest_lab.* TO 'sqlquest_dev'@'localhost';

FLUSH PRIVILEGES;

-- ─── Esquema del laboratorio ─────────────────────────────────
USE sqlquest_lab;

CREATE TABLE IF NOT EXISTS lab_juguetes (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  player_id  INT UNSIGNED NOT NULL,
  nombre     VARCHAR(60)  NOT NULL,
  tipo       VARCHAR(40)  NOT NULL,
  color      VARCHAR(40)  NOT NULL,
  precio     DECIMAL(8, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_lab_player (player_id)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS lab_auditoria (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  player_id  INT UNSIGNED NOT NULL,
  accion     VARCHAR(20)  NOT NULL,
  detalle    VARCHAR(200) NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_lab_audit_player (player_id, created_at)
) ENGINE = InnoDB;
