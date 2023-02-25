UPDATE Entries SET
  text = COALESCE($2, text),
  completed = COALESCE($3, completed),
  entry_type = COALESCE($4, entry_type),
  deadline = COALESCE($5, deadline),
  priority = COALESCE($6, priority),
  modified_timestamp = COALESCE(extract(epoch from now()))
WHERE id = $1 RETURNING *;

