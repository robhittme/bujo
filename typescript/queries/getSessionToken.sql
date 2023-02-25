SELECT u.username FROM Users u
JOIN Sessions s ON u.id = s.user_id
WHERE session_token = $1 AND expires_at >= (extract(epoch from now()));
