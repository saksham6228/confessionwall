-- =============================================
--   init.sql — Database schema and seed data
-- =============================================
-- This runs automatically the first time the MySQL container
-- starts, because it's placed in /docker-entrypoint-initdb.d/
-- (a special MySQL image folder that auto-executes .sql files
-- on first startup only).

USE confession_wall;

-- --- TABLE: confessions ---
CREATE TABLE IF NOT EXISTS confessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Random',
  votes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --- SEED DATA ---
-- A few starter confessions so the wall isn't empty on first run
INSERT INTO confessions (content, category, votes) VALUES
('I still haven''t started the DBMS assignment due tomorrow.', 'Academics', 12),
('I pretend to understand OS scheduling but I really don''t.', 'Academics', 8),
('I once skipped a whole week of class to binge-watch cricket highlights.', 'Campus Life', 15),
('I have a crush on someone in my TOC class but I''m too scared to say anything.', 'Love', 6),
('I microwave leftover dal bhat at 2 AM almost every night.', 'Random', 4);
