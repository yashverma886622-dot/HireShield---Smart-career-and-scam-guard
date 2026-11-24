# DBMS concepts used in CareerLens (for your report and viva)

## 1. Entities and relationships
| Relationship | Type | How it is stored |
|---|---|---|
| roles — users | 1 : N (a role is the target of many users) | `users.target_role_id` (FK) |
| users — applications | 1 : N | `applications.user_id` (FK) |
| users — fake_checks | 1 : N | `fake_checks.user_id` (FK) |
| fake_checks — fake_check_flags | 1 : N | `fake_check_flags.check_id` (FK) |
| users — skills | M : N | junction table `user_skills` |
| roles — skills | M : N | junction table `role_skills` (+ `importance` column) |
| jobs — skills | M : N | junction table `job_skills` |

A many-to-many relationship cannot be stored in one column, so it is split into a
**junction table** whose primary key is the pair of both foreign keys.

## 2. Normalization (why the tables look like this)
- **1NF** – every column holds one value. We do NOT store skills as `"React, CSS, HTML"`
  in the users table; each skill is its own row in `user_skills`.
- **2NF** – no partial dependency. In `user_skills (user_id, skill_id)` there are no
  other columns, and in `role_skills` the column `importance` depends on the
  *whole* key (role + skill), not on just one part.
- **3NF** – no transitive dependency. A role's name is stored once in `roles`, not
  repeated in every user row; a skill's name is stored once in `skills`.

## 3. Constraints used
| Constraint | Example in schema.sql |
|---|---|
| PRIMARY KEY | `user_id`, `application_id`, composite `(user_id, skill_id)` |
| FOREIGN KEY | `applications.user_id -> users.user_id` |
| UNIQUE | `users.email`, `skills.skill_name`, `roles.role_name` |
| NOT NULL | `users.name`, `applications.company` |
| DEFAULT | `applications.status DEFAULT 'Applied'` |
| CHECK | `fake_checks.risk_score BETWEEN 0 AND 100` |
| ENUM | `applications.status`, `role_skills.importance` |
| ON DELETE CASCADE | deleting a user deletes their applications, skills, checks |
| ON DELETE SET NULL | deleting a role sets `users.target_role_id` to NULL |

## 4. Other SQL features
- **INDEX** `idx_applications_user` – faster "applications of one user" lookups.
- **VIEW** `v_application_stats` – saved GROUP BY query (counts per status per user).
- **TRIGGER** `trg_applications_default_date` – BEFORE INSERT: fills `applied_date` with today if empty.
- **TRANSACTION** – signup (`routes/auth.js`) inserts the user and their skills together; if anything fails, `ROLLBACK` undoes it all (atomicity).
- **JOINs** – INNER JOIN, LEFT JOIN (blind spot: `WHERE us.user_id IS NULL` finds missing skills).
- **GROUP BY / HAVING / aggregates** – job match % in `routes/jobs.js`.
- **Subqueries** – see `queries_demo.sql` (queries 10 and 11).

## 5. Likely viva questions
**Q. Why SQL instead of MongoDB for this project?**
Our data is highly structured and relational (users → applications, users ↔ skills).
SQL enforces integrity with foreign keys and constraints, and JOINs let us calculate skill gaps and job matches directly in the database.

**Q. How is one student's data kept separate from another's?**
Every application row has a `user_id` foreign key, and every query includes `WHERE user_id = ?` using the id from the JWT token.

**Q. How are passwords stored?**
Only a bcrypt hash is stored in `password_hash`; the real password is never saved.

**Q. What is SQL injection and how do you avoid it?**
Injecting SQL through user input. We use **parameterized queries** (`?` placeholders) so input is treated as data, never as SQL.

**Q. How does the blind spot detector work in SQL?**
JOIN the user's target role to `role_skills`, then LEFT JOIN `user_skills`. Rows where the user side is NULL are the missing skills (`queries_demo.sql`, query 8).

**Q. How are job recommendations ranked?**
For each job: `COUNT` of the job's skills the user also has ÷ `COUNT` of all the job's skills, ×100, then `ORDER BY` that percentage (`queries_demo.sql`, query 9).
