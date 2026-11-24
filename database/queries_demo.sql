-- =====================================================================
-- CareerLens (SQL version) - queries_demo.sql
-- Practice / viva queries. Run after schema.sql, seed.sql and sample_data.sql.
-- =====================================================================
USE careerlens_db;

-- 1. Basic SELECT with WHERE and ORDER BY
SELECT name, email, college FROM users WHERE branch = 'CSE' ORDER BY name;

-- 2. INNER JOIN: every application together with the student's name
SELECT u.name, a.company, a.role_title, a.status
FROM applications a
JOIN users u ON u.user_id = a.user_id
ORDER BY u.name, a.applied_date;

-- 3. GROUP BY + COUNT: number of applications per student
SELECT u.name, COUNT(a.application_id) AS total_applications
FROM users u
LEFT JOIN applications a ON a.user_id = u.user_id
GROUP BY u.user_id, u.name;

-- 4. GROUP BY + HAVING: students with 2 or more applications
SELECT u.name, COUNT(*) AS total
FROM applications a JOIN users u ON u.user_id = a.user_id
GROUP BY u.user_id, u.name
HAVING COUNT(*) >= 2;

-- 5. Count of applications by status (used for the dashboard cards)
SELECT status, COUNT(*) AS how_many FROM applications GROUP BY status;

-- 6. Using the VIEW created in schema.sql
SELECT u.name, v.* FROM v_application_stats v JOIN users u ON u.user_id = v.user_id;

-- 7. Many-to-many JOIN: skills of each user
SELECT u.name, s.skill_name
FROM users u
JOIN user_skills us ON us.user_id = u.user_id
JOIN skills s       ON s.skill_id = us.skill_id
ORDER BY u.name, s.skill_name;

-- 8. BLIND SPOT query: required skills of the user's target role that the user is MISSING
--    (LEFT JOIN + IS NULL finds rows with no match)
SELECT u.name, s.skill_name AS missing_required_skill
FROM users u
JOIN role_skills rs ON rs.role_id = u.target_role_id AND rs.importance = 'required'
JOIN skills s       ON s.skill_id = rs.skill_id
LEFT JOIN user_skills us ON us.user_id = u.user_id AND us.skill_id = rs.skill_id
WHERE us.user_id IS NULL
ORDER BY u.name, s.skill_name;

-- 9. JOB RECOMMENDATION query: match % between each job and one user (change the email)
SELECT j.title, j.company,
       COUNT(us.skill_id) AS skills_you_have,
       COUNT(js.skill_id) AS skills_job_needs,
       ROUND(100 * COUNT(us.skill_id) / COUNT(js.skill_id)) AS match_percent
FROM jobs j
JOIN job_skills js ON js.job_id = j.job_id
LEFT JOIN user_skills us ON us.skill_id = js.skill_id
     AND us.user_id = (SELECT user_id FROM users WHERE email = 'demo@careerlens.com')
GROUP BY j.job_id, j.title, j.company
ORDER BY match_percent DESC;

-- 10. SUBQUERY: students who have at least one 'Offered' application
SELECT name FROM users
WHERE user_id IN (SELECT user_id FROM applications WHERE status = 'Offered');

-- 11. SUBQUERY with aggregate: jobs that need more skills than the average job
SELECT j.title, COUNT(js.skill_id) AS skills_needed
FROM jobs j JOIN job_skills js ON js.job_id = j.job_id
GROUP BY j.job_id, j.title
HAVING COUNT(js.skill_id) > (SELECT AVG(c) FROM (SELECT COUNT(*) AS c FROM job_skills GROUP BY job_id) t);

-- 12. UPDATE and DELETE examples
UPDATE applications SET status = 'Interview'
WHERE company = 'Swiggy' AND user_id = (SELECT user_id FROM users WHERE email = 'riya@careerlens.com');

DELETE FROM applications WHERE status = 'Rejected' AND company = 'CRED';

-- 13. TRIGGER demo: inserting without applied_date -> trigger fills today's date
INSERT INTO applications (user_id, company, role_title)
VALUES ((SELECT user_id FROM users WHERE email = 'demo@careerlens.com'), 'TestCo', 'Trigger Demo');
SELECT company, applied_date FROM applications WHERE company = 'TestCo';

-- 14. Fake checker history: each check with its red flags (1 : many JOIN)
SELECT fc.check_id, fc.verdict, fc.risk_score, f.label, f.severity
FROM fake_checks fc
JOIN fake_check_flags f ON f.check_id = fc.check_id
ORDER BY fc.check_id;
