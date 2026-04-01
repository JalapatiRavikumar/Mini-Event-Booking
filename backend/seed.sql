USE event_booking;

INSERT INTO users (name, email) VALUES
  ('Alice Johnson', 'alice@example.com'),
  ('Bob Smith', 'bob@example.com'),
  ('Carla Diaz', 'carla@example.com')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO events (title, description, date, total_capacity, remaining_tickets) VALUES
  ('Node.js Conference', 'Backend architecture and scalability', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY), 200, 200),
  ('Cloud Dev Summit', 'Cloud-native app development', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 14 DAY), 150, 150),
  ('Database Performance Workshop', 'MySQL indexing and query tuning', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 21 DAY), 100, 100);
