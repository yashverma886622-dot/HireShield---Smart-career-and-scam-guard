-- =====================================================================
-- CareerLens - schema.sql
-- =====================================================================

DROP DATABASE IF EXISTS careerlens_db;
CREATE DATABASE careerlens_db;
USE careerlens_db;

-- ---------------------------------------------------------------------
-- 1. ROLES  (target job roles such as "Frontend Developer")
-- ---------------------------------------------------------------------
CREATE TABLE roles (
    role_id    INT AUTO_INCREMENT PRIMARY KEY,
    role_name  VARCHAR(60) NOT NULL UNIQUE
);

-- ---------------------------------------------------------------------
-- 2. SKILLS  (one row per skill, e.g. "React", "SQL")
-- ---------------------------------------------------------------------
CREATE TABLE skills (
    skill_id    INT AUTO_INCREMENT PRIMARY KEY,
    skill_name  VARCHAR(60) NOT NULL UNIQUE
);

-- ---------------------------------------------------------------------
-- 3. USERS
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(120) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,          -- bcrypt hash, never the real password
    college         VARCHAR(120) DEFAULT '',
    branch          VARCHAR(80)  DEFAULT '',
    year_of_study   VARCHAR(20)  DEFAULT '',
    resume_link     VARCHAR(255) DEFAULT '',
    target_role_id  INT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role
        FOREIGN KEY (target_role_id) REFERENCES roles(role_id)
        ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- 4. USER_SKILLS   (Many-to-Many: users <-> skills)
-- ---------------------------------------------------------------------
CREATE TABLE user_skills (
    user_id   INT NOT NULL,
    skill_id  INT NOT NULL,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id)  REFERENCES users(user_id)   ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 5. ROLE_SKILLS   (Many-to-Many: roles <-> skills, with importance)
-- ---------------------------------------------------------------------
CREATE TABLE role_skills (
    role_id     INT NOT NULL,
    skill_id    INT NOT NULL,
    importance  ENUM('required', 'preferred') NOT NULL,
    PRIMARY KEY (role_id, skill_id),
    FOREIGN KEY (role_id)  REFERENCES roles(role_id)   ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 6. APPLICATIONS  (One user -> many applications)
-- ---------------------------------------------------------------------
CREATE TABLE applications (
    application_id  INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    company         VARCHAR(120) NOT NULL,
    role_title      VARCHAR(120) NOT NULL,
    status          ENUM('Applied', 'Interview', 'Offered', 'Rejected')
                    NOT NULL DEFAULT 'Applied',
    applied_date    DATE NULL,
    deadline        DATE NULL,
    location        VARCHAR(120) DEFAULT '',
    salary          VARCHAR(60)  DEFAULT '',
    notes           TEXT,
    next_step       VARCHAR(255) DEFAULT '',
    logo            VARCHAR(5)   DEFAULT '',
    logo_color      VARCHAR(10)  DEFAULT '#3B82F6',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 7. JOBS  (job / internship listings shown in Job Recommendations)
-- ---------------------------------------------------------------------
CREATE TABLE jobs (
    job_id       INT AUTO_INCREMENT PRIMARY KEY,
    external_id  VARCHAR(60) NULL UNIQUE,            -- id from Adzuna API (NULL for sample jobs)
    title        VARCHAR(150) NOT NULL,
    company      VARCHAR(120) NOT NULL,
    location     VARCHAR(120) DEFAULT '',
    job_type     ENUM('Internship', 'Full-time') NOT NULL DEFAULT 'Full-time',
    salary       VARCHAR(80)  DEFAULT 'Not specified',
    description  TEXT,
    category     VARCHAR(40)  DEFAULT 'Frontend',
    posted       VARCHAR(40)  DEFAULT 'Recently',
    apply_url    VARCHAR(500) DEFAULT ''
);

-- ---------------------------------------------------------------------
-- 8. JOB_SKILLS   (Many-to-Many: jobs <-> skills)
-- ---------------------------------------------------------------------
CREATE TABLE job_skills (
    job_id    INT NOT NULL,
    skill_id  INT NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id)   REFERENCES jobs(job_id)     ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 9. FAKE_CHECKS  (each time a user checks a listing, we store the result)
-- ---------------------------------------------------------------------
CREATE TABLE fake_checks (
    check_id     INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    title        VARCHAR(150) DEFAULT '',
    company      VARCHAR(120) DEFAULT '',
    salary       VARCHAR(80)  DEFAULT '',
    contact      VARCHAR(150) DEFAULT '',
    description  TEXT,
    risk_score   INT NOT NULL,
    verdict      ENUM('LIKELY SAFE', 'REVIEW', 'SUSPICIOUS', 'FAKE') NOT NULL,
    checked_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_score CHECK (risk_score BETWEEN 0 AND 100),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 10. FAKE_CHECK_FLAGS  (One check -> many red flags)
-- ---------------------------------------------------------------------
CREATE TABLE fake_check_flags (
    flag_id   INT AUTO_INCREMENT PRIMARY KEY,
    check_id  INT NOT NULL,
    label     VARCHAR(255) NOT NULL,
    severity  ENUM('low', 'medium', 'high') NOT NULL,
    FOREIGN KEY (check_id) REFERENCES fake_checks(check_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- INDEX: speeds up "show me this user's applications"
-- ---------------------------------------------------------------------
CREATE INDEX idx_applications_user ON applications(user_id);

-- ---------------------------------------------------------------------
-- VIEW: per-user application statistics (used by the dashboard idea)
-- ---------------------------------------------------------------------
CREATE VIEW v_application_stats AS
SELECT  user_id,
        COUNT(*)                     AS total,
        SUM(status = 'Applied')      AS applied,
        SUM(status = 'Interview')    AS interview,
        SUM(status = 'Offered')      AS offered,
        SUM(status = 'Rejected')     AS rejected
FROM applications
GROUP BY user_id;

-- ---------------------------------------------------------------------
-- TRIGGER: if no applied_date is given, use today's date automatically
-- ---------------------------------------------------------------------
DELIMITER $$
CREATE TRIGGER trg_applications_default_date
BEFORE INSERT ON applications
FOR EACH ROW
BEGIN
    IF NEW.applied_date IS NULL THEN
        SET NEW.applied_date = CURDATE();
    END IF;
END$$
DELIMITER ;
