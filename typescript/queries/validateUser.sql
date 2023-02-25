INSERT INTO sessions (user_id) VALUES
  ((SELECT id FROM Users WHERE username=$1 AND password_hash=$2))
  RETURNING session_token;
