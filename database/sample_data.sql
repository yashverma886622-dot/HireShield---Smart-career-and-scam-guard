-- =====================================================================
-- CareerLens (SQL version) - sample_data.sql   (OPTIONAL)
-- Run after schema.sql and seed.sql to get demo rows for your SQL queries.
-- Both demo users have the password:  demo123
-- =====================================================================
USE careerlens_db;
select * from users;
INSERT INTO users (name, email, password_hash, college, branch, year_of_study, target_role_id) VALUES
 ('Demo Student', 'demo@careerlens.com', '$2a$10$JYye5dMPBz2a2Ar/YPAxSuom44qOZkqbYiC3jDhFl3/wnnsMUvO.W', 'KRMU', 'CSE', '2nd Year',
    (SELECT role_id FROM roles WHERE role_name = 'Frontend Developer')),
 ('Riya Sharma',  'riya@careerlens.com', '$2a$10$JYye5dMPBz2a2Ar/YPAxSuom44qOZkqbYiC3jDhFl3/wnnsMUvO.W', 'KRMU', 'AI&ML', '1st Year',
    (SELECT role_id FROM roles WHERE role_name = 'ML Engineer'));

INSERT INTO user_skills (user_id, skill_id)
SELECT u.user_id, s.skill_id FROM users u JOIN skills s
 WHERE (u.email = 'demo@careerlens.com' AND s.skill_name IN ('HTML','CSS','JavaScript','Git'))
    OR (u.email = 'riya@careerlens.com'  AND s.skill_name IN ('Python','Pandas','SQL'));

INSERT INTO applications (user_id, company, role_title, status, applied_date, deadline, location, logo, logo_color) VALUES
 ((SELECT user_id FROM users WHERE email='demo@careerlens.com'), 'Razorpay', 'Frontend Intern', 'Applied',   '2026-10-01', '2026-11-30', 'Bangalore', 'R', '#3B82F6'),
 ((SELECT user_id FROM users WHERE email='demo@careerlens.com'), 'Zoho',     'Web Developer',   'Interview', '2026-10-05', NULL,         'Chennai',   'Z', '#10B981'),
 ((SELECT user_id FROM users WHERE email='demo@careerlens.com'), 'CRED',     'UI Intern',       'Rejected',  '2026-09-20', NULL,         'Bangalore', 'C', '#EF4444'),
 ((SELECT user_id FROM users WHERE email='riya@careerlens.com'), 'Fractal',  'ML Intern',       'Offered',   '2026-10-10', NULL,         'Gurugram',  'F', '#8B5CF6'),
 ((SELECT user_id FROM users WHERE email='riya@careerlens.com'), 'Swiggy',   'Data Analyst',    'Applied',   '2026-10-12', '2026-12-01', 'Bangalore', 'S', '#F59E0B');
