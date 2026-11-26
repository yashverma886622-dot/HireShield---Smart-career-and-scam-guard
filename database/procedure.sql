
USE hireshield_db;

DROP PROCEDURE IF EXISTS sp_get_user_applications;
DROP PROCEDURE IF EXISTS sp_add_application;
DROP PROCEDURE IF EXISTS sp_update_application_status;
DROP PROCEDURE IF EXISTS sp_get_user_blind_spots;
DROP PROCEDURE IF EXISTS sp_get_job_recommendations;
DROP PROCEDURE IF EXISTS sp_get_fake_check_report;
DROP PROCEDURE IF EXISTS sp_get_user_summary;

DELIMITER $$

-- ---------------------------------------------------------------------
-- 1. Get all applications of a specific user (IN parameter)
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_get_user_applications(IN p_user_id INT)
BEGIN
    SELECT application_id, company, role_title, status,
           applied_date, deadline, location, salary, next_step
    FROM applications
    WHERE user_id = p_user_id
    ORDER BY applied_date DESC, created_at DESC;
END$$

-- ---------------------------------------------------------------------
-- 2. Add a new application with user validation (INSERT + IF-ELSE)
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_add_application(
    IN p_user_id    INT,
    IN p_company    VARCHAR(120),
    IN p_role_title VARCHAR(120),
    IN p_location   VARCHAR(120),
    IN p_salary     VARCHAR(60)
)
BEGIN
    DECLARE v_user_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO v_user_exists
    FROM users
    WHERE user_id = p_user_id;

    IF v_user_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'User ID does not exist in users table.';
    ELSE
        INSERT INTO applications (user_id, company, role_title, status, location, salary)
        VALUES (p_user_id, p_company, p_role_title, 'Applied', p_location, p_salary);

        SELECT LAST_INSERT_ID() AS new_application_id,
               'Application added successfully' AS message;
    END IF;
END$$

-- ---------------------------------------------------------------------
-- 3. Update application status with validation (UPDATE + IF-ELSE)
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_update_application_status(
    IN p_application_id INT,
    IN p_new_status     VARCHAR(20)
)
BEGIN
    IF p_new_status NOT IN ('Applied', 'Interview', 'Offered', 'Rejected') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid status. Allowed: Applied, Interview, Offered, Rejected.';
    ELSE
        UPDATE applications
        SET status = p_new_status
        WHERE application_id = p_application_id;

        SELECT application_id, company, role_title, status
        FROM applications
        WHERE application_id = p_application_id;
    END IF;
END$$

-- ---------------------------------------------------------------------
-- 4. Blind Spot Detector: Missing skills for a user's target role
--    (Multi-table JOIN + LEFT JOIN IS NULL)
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_get_user_blind_spots(IN p_user_id INT)
BEGIN
    SELECT u.name AS student_name,
           r.role_name AS target_role,
           s.skill_name AS missing_skill,
           rs.importance
    FROM users u
    JOIN roles r        ON r.role_id = u.target_role_id
    JOIN role_skills rs ON rs.role_id = u.target_role_id
    JOIN skills s       ON s.skill_id = rs.skill_id
    LEFT JOIN user_skills us
           ON us.user_id = u.user_id AND us.skill_id = rs.skill_id
    WHERE u.user_id = p_user_id
      AND us.skill_id IS NULL
    ORDER BY rs.importance, s.skill_name;
END$$

-- ---------------------------------------------------------------------
-- 5. Job Recommendations: Match % between user skills & job skills
--    (JOIN + GROUP BY + Aggregate Calculation)
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_get_job_recommendations(IN p_user_id INT)
BEGIN
    SELECT j.job_id,
           j.title,
           j.company,
           j.job_type,
           j.location,
           COUNT(us.skill_id) AS matched_skills,
           COUNT(js.skill_id) AS total_required_skills,
           ROUND(100 * COUNT(us.skill_id) / COUNT(js.skill_id)) AS match_percent
    FROM jobs j
    JOIN job_skills js ON js.job_id = j.job_id
    LEFT JOIN user_skills us
           ON us.skill_id = js.skill_id AND us.user_id = p_user_id
    GROUP BY j.job_id, j.title, j.company, j.job_type, j.location
    ORDER BY match_percent DESC, j.job_id ASC;
END$$

-- ---------------------------------------------------------------------
-- 6. Fake Internship Check Report with total red flags per check
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_get_fake_check_report(IN p_user_id INT)
BEGIN
    SELECT fc.check_id,
           fc.title,
           fc.company,
           fc.risk_score,
           fc.verdict,
           COUNT(f.flag_id) AS total_red_flags,
           fc.checked_at
    FROM fake_checks fc
    LEFT JOIN fake_check_flags f ON f.check_id = fc.check_id
    WHERE fc.user_id = p_user_id
    GROUP BY fc.check_id, fc.title, fc.company, fc.risk_score, fc.verdict, fc.checked_at
    ORDER BY fc.checked_at DESC;
END$$

-- ---------------------------------------------------------------------
-- 7. Dashboard Summary using IN & OUT parameters (reads VIEW)
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_get_user_summary(
    IN  p_user_id    INT,
    OUT p_total_apps INT,
    OUT p_interviews INT,
    OUT p_offers     INT,
    OUT p_rejected   INT
)
BEGIN
    SELECT COALESCE(total, 0),
           COALESCE(interview, 0),
           COALESCE(offered, 0),
           COALESCE(rejected, 0)
    INTO p_total_apps, p_interviews, p_offers, p_rejected
    FROM v_application_stats
    WHERE user_id = p_user_id;
END$$

DELIMITER ;

-- =====================================================================
-- VIVA DEMO CALLS (Uncomment any line to run in MySQL Workbench)
-- =====================================================================
-- CALL sp_get_user_applications(1);
-- CALL sp_get_user_blind_spots(1);
-- CALL sp_get_job_recommendations(1);
-- CALL sp_get_fake_check_report(1);
--
-- CALL sp_get_user_summary(1, @total, @interviews, @offers, @rejected);
-- SELECT @total AS total_apps, @interviews AS in_interview, @offers AS offers, @rejected AS rejected;