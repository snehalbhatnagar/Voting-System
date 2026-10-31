-- MySQL schema for the online voting system.
CREATE DATABASE IF NOT EXISTS voting;
USE voting;

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(30)  NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,          -- bcrypt
  mobile        CHAR(10)     NOT NULL,
  aadhaar_hash  CHAR(64)     NOT NULL UNIQUE,   -- HMAC-SHA256; the number itself is never stored
  type          ENUM('Voter','Officer') NOT NULL DEFAULT 'Voter',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS candidates (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  name   VARCHAR(100) NOT NULL,
  party  VARCHAR(100) NOT NULL,
  symbol VARCHAR(40)  NOT NULL
);

-- Who has voted (one row per voter). No choice is stored here.
CREATE TABLE IF NOT EXISTS ballots_cast (
  user_id  INT PRIMARY KEY,
  cast_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- What was chosen. No voter reference, so ballots stay secret.
CREATE TABLE IF NOT EXISTS votes (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT NULL,
  nota         BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id),
  CHECK ((candidate_id IS NULL) = nota)
);

-- Sample (fictional) candidates
INSERT INTO candidates (name, party, symbol) VALUES
  ('Asha Verma',   'Civic Progress Party', 'lamp'),
  ('Rohan Mehta',  'United Farmers Front', 'wheat'),
  ('Meera Iyer',   'Green Future Alliance', 'tree'),
  ('Kabir Singh',  'Independent',          'kite');
