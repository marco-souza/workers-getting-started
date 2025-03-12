-- Migration number: 0002 	 2025-03-12T20:53:58.343Z

-- generate a list with 10 best movies of all times
INSERT INTO movies (title, release_date, rating) VALUES
('The Shawshank Redemption', '1994-09-23', 5),
('The Godfather', '1972-03-24', 5),
('The Dark Knight', '2008-07-18', 5),
('The Lord of the Rings: The Return of the King', '2003-12-17', 5),
('Pulp Fiction', '1994-10-14', 5),
('Schindler''s List', '1994-12-15', 5),
('Forrest Gump', '1994-07-06', 5),
('Inception', '2010-07-16', 5),
('The Lord of the Rings: The Fellowship of the Ring', '2001-12-19', 5),
('The Matrix', '1999-03-31', 5);
