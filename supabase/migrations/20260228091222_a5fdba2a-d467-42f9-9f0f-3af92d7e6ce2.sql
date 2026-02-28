-- Clear fake avatar/banner paths that point to non-existent local files
UPDATE profiles SET avatar_url = NULL, banner_url = NULL
WHERE avatar_url LIKE '/images/%' OR banner_url LIKE '/images/%';