-- Delete legacy investor posts (non-query type from investor-only users)

WITH investor_only_users AS (
  SELECT ur.user_id 
  FROM user_roles ur 
  GROUP BY ur.user_id 
  HAVING array_agg(ur.role) = ARRAY['investor']::app_role[]
),
bad_posts AS (
  SELECT p.id FROM posts p
  JOIN investor_only_users iou ON p.author_id = iou.user_id
  WHERE p.post_type != 'query'
)
DELETE FROM post_interactions WHERE post_id IN (SELECT id FROM bad_posts);

WITH investor_only_users AS (
  SELECT ur.user_id FROM user_roles ur GROUP BY ur.user_id HAVING array_agg(ur.role) = ARRAY['investor']::app_role[]
),
bad_posts AS (
  SELECT p.id FROM posts p JOIN investor_only_users iou ON p.author_id = iou.user_id WHERE p.post_type != 'query'
)
DELETE FROM comments WHERE post_id IN (SELECT id FROM bad_posts);

WITH investor_only_users AS (
  SELECT ur.user_id FROM user_roles ur GROUP BY ur.user_id HAVING array_agg(ur.role) = ARRAY['investor']::app_role[]
),
bad_posts AS (
  SELECT p.id FROM posts p JOIN investor_only_users iou ON p.author_id = iou.user_id WHERE p.post_type != 'query'
)
DELETE FROM reports WHERE post_id IN (SELECT id FROM bad_posts);

WITH investor_only_users AS (
  SELECT ur.user_id FROM user_roles ur GROUP BY ur.user_id HAVING array_agg(ur.role) = ARRAY['investor']::app_role[]
),
bad_posts AS (
  SELECT p.id::text FROM posts p JOIN investor_only_users iou ON p.author_id = iou.user_id WHERE p.post_type != 'query'
)
DELETE FROM notifications WHERE reference_type = 'post' AND reference_id IN (SELECT id FROM bad_posts);

WITH investor_only_users AS (
  SELECT ur.user_id FROM user_roles ur GROUP BY ur.user_id HAVING array_agg(ur.role) = ARRAY['investor']::app_role[]
)
DELETE FROM posts 
WHERE author_id IN (SELECT user_id FROM investor_only_users) AND post_type != 'query';