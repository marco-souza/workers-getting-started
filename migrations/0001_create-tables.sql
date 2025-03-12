-- Migration number: 0001 	 2025-03-12T20:44:35.491Z

-- Create the table "movies"
--   - id
--   - title
--   - release date
--   - rating (1-5)

DROP TABLE IF EXISTS movies;

CREATE TABLE movies (
	id SERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	release_date DATE NOT NULL,
	rating INTEGER NOT NULL
);
