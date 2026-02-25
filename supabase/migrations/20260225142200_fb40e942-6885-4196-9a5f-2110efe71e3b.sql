
DO $$
DECLARE
  v_rajesh uuid;
  v_priya uuid;
  v_arjun uuid;
  v_sneha uuid;
  v_vikram uuid;
  v_anita uuid;
  v_karan uuid;
  v_meera uuid;
  v_post_ids uuid[];
  v_poll_post_id uuid;
  v_poll_opt_ids uuid[];
  v_survey_post_id uuid;
  v_q_id uuid;
  v_opt_id uuid;
BEGIN
  SELECT id INTO v_rajesh FROM profiles WHERE full_name = 'Rajesh Kumar' LIMIT 1;
  SELECT id INTO v_priya FROM profiles WHERE full_name = 'Priya Sharma' LIMIT 1;
  SELECT id INTO v_arjun FROM profiles WHERE full_name = 'Arjun Mehta' LIMIT 1;
  SELECT id INTO v_sneha FROM profiles WHERE full_name = 'Sneha Patel' LIMIT 1;
  SELECT id INTO v_vikram FROM profiles WHERE full_name = 'Vikram Singh' LIMIT 1;
  SELECT id INTO v_anita FROM profiles WHERE full_name = 'Anita Desai' LIMIT 1;
  SELECT id INTO v_karan FROM profiles WHERE full_name = 'Karan Joshi' LIMIT 1;
  SELECT id INTO v_meera FROM profiles WHERE full_name = 'Meera Reddy' LIMIT 1;

  IF v_rajesh IS NULL THEN RAISE NOTICE 'Users not found'; RETURN; END IF;

  -- POSTS
  WITH ins AS (
    INSERT INTO posts (author_id, content, post_type, hashtags, attachment_type, attachment_url, attachment_name) VALUES
    (v_rajesh, E'SIP journey with index funds. Compounding is real! 📈\n#IndexFunds #SIP', 'text', ARRAY['IndexFunds','SIP'], NULL, NULL, NULL),
    (v_karan, E'NRI navigating Indian regulations. Looking for RIA.\n#NRIInvesting', 'text', ARRAY['NRIInvesting'], NULL, NULL, NULL),
    (v_priya, E'Market Commentary Feb 2026. Nifty at 24500. FII moderated, DII robust.\n#MarketCommentary #Nifty50', 'market_commentary', ARRAY['MarketCommentary','Nifty50'], NULL, NULL, NULL),
    (v_meera, E'Pharma Update: Sun Pharma leading. Top picks: Sun, Cipla, Divis.\n#Pharma', 'market_commentary', ARRAY['Pharma'], NULL, NULL, NULL),
    (v_meera, E'IT Deep Dive Q3 FY26: 4-6% QoQ growth. AI/ML 8-12% of revenue.\n#ITSector', 'research_note', ARRAY['ITSector'], 'document', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800', 'IT_Q3.pdf'),
    (v_priya, E'Model Portfolio: Equity 60%, Debt 30%, Gold 10%.\n#AssetAllocation', 'research_note', ARRAY['AssetAllocation'], NULL, NULL, NULL),
    (v_vikram, E'Singh Infra awarded Rs2400Cr NHAI highway project.\n#Infrastructure', 'announcement', ARRAY['Infrastructure'], 'image', 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800', 'highway.jpg'),
    (v_arjun, E'Bluechip AMC: India Innovation Fund NFO March 1-15.\n#NFO #Innovation', 'announcement', ARRAY['NFO','Innovation'], NULL, NULL, NULL),
    (v_anita, E'Desai FS crossed Rs5000Cr AUM! Expanding Tier-2.\n#GrowthStory', 'announcement', ARRAY['GrowthStory'], 'image', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', 'milestone.jpg'),
    (v_sneha, E'Tax Regime Guide Budget 2026. LTCG STCG changes.\n#TaxPlanning', 'article', ARRAY['TaxPlanning'], NULL, NULL, NULL),
    (v_priya, E'Podcast: Why Retail Investors Underperform.\n#InvestorEducation', 'article', ARRAY['InvestorEducation'], NULL, NULL, NULL),
    (v_arjun, E'CIO Outlook H1 2026: sector rotation, mid-caps.\n#MarketOutlook', 'market_commentary', ARRAY['MarketOutlook'], 'video', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800', 'CIO.mp4'),
    (v_anita, E'AMFI conference: MF 10L to 60L Cr in 10 years!\n#MutualFunds', 'text', ARRAY['MutualFunds'], NULL, NULL, NULL),
    (v_rajesh, E'6 months on FindOO. Better than YouTube. 💯\n#FindOO', 'text', ARRAY['FindOO'], NULL, NULL, NULL),
    (v_vikram, E'Q3 FY26: Revenue 1840Cr +22%, PAT 142Cr +28%.\n#Earnings', 'announcement', ARRAY['Earnings'], NULL, NULL, NULL)
    RETURNING id
  )
  SELECT array_agg(id) INTO v_post_ids FROM ins;

  -- COMMENTS
  INSERT INTO comments (post_id, author_id, content) VALUES
  (v_post_ids[1], v_priya, 'Great decision! Nifty 50 + Next 50 for beginners. 👍'),
  (v_post_ids[1], v_sneha, 'Growth option more tax-efficient!'),
  (v_post_ids[1], v_meera, 'UTI Nifty 50 excellent for core allocation.'),
  (v_post_ids[3], v_rajesh, 'Very helpful analysis!'),
  (v_post_ids[3], v_arjun, 'Agree on banking sector.'),
  (v_post_ids[3], v_karan, 'Views on IT for NRIs?'),
  (v_post_ids[7], v_anita, 'Congratulations! 🎉'),
  (v_post_ids[7], v_rajesh, 'Impressive order book!'),
  (v_post_ids[8], v_priya, 'Will review SID. Expense ratio?'),
  (v_post_ids[8], v_karan, 'Can NRIs invest?'),
  (v_post_ids[10], v_karan, 'NRI section super helpful!'),
  (v_post_ids[10], v_rajesh, 'Great LTCG explainer!'),
  (v_post_ids[10], v_anita, 'Can we do a webinar?');

  -- INTERACTIONS
  INSERT INTO post_interactions (post_id, user_id, interaction_type) VALUES
  (v_post_ids[1], v_priya, 'like'), (v_post_ids[1], v_sneha, 'like'), (v_post_ids[1], v_meera, 'like'), (v_post_ids[1], v_karan, 'like'),
  (v_post_ids[2], v_priya, 'like'), (v_post_ids[2], v_sneha, 'like'),
  (v_post_ids[3], v_rajesh, 'like'), (v_post_ids[3], v_arjun, 'like'), (v_post_ids[3], v_karan, 'like'), (v_post_ids[3], v_anita, 'like'),
  (v_post_ids[4], v_priya, 'like'), (v_post_ids[4], v_rajesh, 'like'),
  (v_post_ids[5], v_rajesh, 'like'), (v_post_ids[5], v_arjun, 'like'),
  (v_post_ids[6], v_rajesh, 'like'), (v_post_ids[6], v_karan, 'like'),
  (v_post_ids[7], v_anita, 'like'), (v_post_ids[7], v_rajesh, 'like'), (v_post_ids[7], v_priya, 'like'),
  (v_post_ids[8], v_priya, 'like'), (v_post_ids[8], v_karan, 'like'),
  (v_post_ids[9], v_rajesh, 'like'), (v_post_ids[9], v_priya, 'like'),
  (v_post_ids[10], v_karan, 'like'), (v_post_ids[10], v_rajesh, 'like'), (v_post_ids[10], v_anita, 'like'),
  (v_post_ids[11], v_rajesh, 'like'), (v_post_ids[11], v_priya, 'like'),
  (v_post_ids[12], v_priya, 'like'), (v_post_ids[12], v_meera, 'like'),
  (v_post_ids[13], v_sneha, 'like'),
  (v_post_ids[14], v_priya, 'like'), (v_post_ids[14], v_meera, 'like'),
  (v_post_ids[15], v_anita, 'like'), (v_post_ids[15], v_rajesh, 'like'),
  -- Bookmarks
  (v_post_ids[1], v_karan, 'bookmark'), (v_post_ids[3], v_rajesh, 'bookmark'),
  (v_post_ids[6], v_rajesh, 'bookmark'), (v_post_ids[10], v_karan, 'bookmark'),
  -- Reposts
  (v_post_ids[3], v_arjun, 'repost'), (v_post_ids[7], v_anita, 'repost'), (v_post_ids[10], v_priya, 'repost');

  -- POLL 1
  INSERT INTO posts (author_id, content, post_type, post_kind, hashtags) VALUES
  (v_priya, E'Poll: Primary investment vehicle in 2026?\n#InvestorPoll', 'text', 'poll', ARRAY['InvestorPoll'])
  RETURNING id INTO v_poll_post_id;
  WITH opts AS (
    INSERT INTO poll_options (post_id, option_text, position) VALUES
    (v_poll_post_id, 'Mutual Funds (SIP)', 0), (v_poll_post_id, 'Direct Equity', 1),
    (v_poll_post_id, 'ETFs / Index Funds', 2), (v_poll_post_id, 'FDs / Bonds', 3)
    RETURNING id, position
  ) SELECT array_agg(id ORDER BY position) INTO v_poll_opt_ids FROM opts;
  INSERT INTO poll_votes (poll_option_id, user_id) VALUES
  (v_poll_opt_ids[1], v_rajesh), (v_poll_opt_ids[1], v_karan),
  (v_poll_opt_ids[2], v_meera), (v_poll_opt_ids[3], v_arjun), (v_poll_opt_ids[3], v_anita);

  -- POLL 2
  INSERT INTO posts (author_id, content, post_type, post_kind, hashtags) VALUES
  (v_arjun, E'Sector to outperform H2 2026?\n#SectorOutlook', 'market_commentary', 'poll', ARRAY['SectorOutlook'])
  RETURNING id INTO v_poll_post_id;
  WITH opts AS (
    INSERT INTO poll_options (post_id, option_text, position) VALUES
    (v_poll_post_id, 'IT', 0), (v_poll_post_id, 'Banking', 1),
    (v_poll_post_id, 'Pharma', 2), (v_poll_post_id, 'Infrastructure', 3)
    RETURNING id, position
  ) SELECT array_agg(id ORDER BY position) INTO v_poll_opt_ids FROM opts;
  INSERT INTO poll_votes (poll_option_id, user_id) VALUES
  (v_poll_opt_ids[1], v_karan), (v_poll_opt_ids[2], v_rajesh), (v_poll_opt_ids[2], v_priya),
  (v_poll_opt_ids[3], v_meera), (v_poll_opt_ids[4], v_vikram);

  -- SURVEY
  INSERT INTO posts (author_id, content, post_type, post_kind, hashtags) VALUES
  (v_anita, E'Investor Sentiment Survey Q1 2026\n#Survey', 'text', 'survey', ARRAY['Survey'])
  RETURNING id INTO v_survey_post_id;

  INSERT INTO survey_questions (post_id, question_text, question_type, position) VALUES
  (v_survey_post_id, 'Confidence in Indian markets next 6 months?', 'single_choice', 0)
  RETURNING id INTO v_q_id;
  INSERT INTO survey_options (question_id, option_text, position) VALUES
  (v_q_id, 'Very Bullish', 0), (v_q_id, 'Cautiously Optimistic', 1), (v_q_id, 'Neutral', 2), (v_q_id, 'Bearish', 3);
  SELECT id INTO v_opt_id FROM survey_options WHERE question_id = v_q_id AND position = 1 LIMIT 1;
  INSERT INTO survey_responses (question_id, option_id, user_id) VALUES (v_q_id, v_opt_id, v_rajesh);

  INSERT INTO survey_questions (post_id, question_text, question_type, position) VALUES
  (v_survey_post_id, 'Biggest investment concern?', 'single_choice', 1)
  RETURNING id INTO v_q_id;
  INSERT INTO survey_options (question_id, option_text, position) VALUES
  (v_q_id, 'Global recession', 0), (v_q_id, 'Inflation', 1), (v_q_id, 'Geopolitics', 2), (v_q_id, 'Regulation', 3);
  SELECT id INTO v_opt_id FROM survey_options WHERE question_id = v_q_id AND position = 0 LIMIT 1;
  INSERT INTO survey_responses (question_id, option_id, user_id) VALUES (v_q_id, v_opt_id, v_sneha);

  -- CONNECTIONS
  INSERT INTO connections (from_user_id, to_user_id, connection_type, status) VALUES
  (v_rajesh, v_priya, 'connect', 'accepted'),
  (v_rajesh, v_meera, 'follow', 'accepted'),
  (v_rajesh, v_vikram, 'follow', 'accepted'),
  (v_rajesh, v_arjun, 'follow', 'accepted'),
  (v_priya, v_sneha, 'connect', 'accepted'),
  (v_priya, v_meera, 'connect', 'accepted'),
  (v_priya, v_anita, 'connect', 'accepted'),
  (v_arjun, v_anita, 'connect', 'accepted'),
  (v_karan, v_priya, 'connect', 'pending'),
  (v_karan, v_sneha, 'follow', 'accepted'),
  (v_karan, v_vikram, 'follow', 'accepted'),
  (v_vikram, v_anita, 'connect', 'accepted'),
  (v_anita, v_meera, 'connect', 'accepted'),
  (v_meera, v_vikram, 'follow', 'accepted'),
  (v_meera, v_arjun, 'connect', 'accepted'),
  (v_sneha, v_vikram, 'follow', 'accepted'),
  (v_sneha, v_anita, 'connect', 'pending')
  ON CONFLICT DO NOTHING;

  -- MESSAGES
  INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES
  (v_rajesh, v_priya, 'Hi Priya, could you review my portfolio?', now() - interval '3 days'),
  (v_priya, v_rajesh, 'Happy to help! Share your holdings.', now() - interval '3 days' + interval '1 hour'),
  (v_rajesh, v_priya, 'Mostly large-cap MFs, 10+ yr horizon.', now() - interval '2 days'),
  (v_priya, v_rajesh, 'Lets do a call. Will share calendar.', now() - interval '2 days' + interval '30 minutes'),
  (v_arjun, v_anita, 'Congrats on 5000Cr AUM! Distribution partnership?', now() - interval '5 days'),
  (v_anita, v_arjun, 'Innovation theme fits our HNI clients!', now() - interval '4 days'),
  (v_arjun, v_anita, 'Meeting next week for terms.', now() - interval '3 days'),
  (v_karan, v_sneha, 'Help with DTAA for NRIs?', now() - interval '2 days'),
  (v_sneha, v_karan, 'Which country? DTAA varies.', now() - interval '2 days' + interval '2 hours'),
  (v_karan, v_sneha, 'Singapore. Capital gains concern.', now() - interval '1 day'),
  (v_sneha, v_karan, 'India-Singapore DTAA favorable. Will prepare note.', now() - interval '1 day' + interval '1 hour'),
  (v_vikram, v_meera, 'Analyst meet with our management?', now() - interval '6 days'),
  (v_meera, v_vikram, 'Yes! Pipeline and margins discussion.', now() - interval '5 days'),
  (v_priya, v_meera, 'Pharma note excellent. Webinar collab?', now() - interval '1 day'),
  (v_meera, v_priya, 'Love it! Next Thursday?', now() - interval '6 hours');

  -- NOTIFICATIONS (manual, skip trigger-generated ones)
  INSERT INTO notifications (user_id, actor_id, type, message, reference_type, reference_id, read) VALUES
  (v_priya, v_karan, 'connection_request', 'Karan Joshi sent you a connection request', 'connection', v_karan::text, false),
  (v_vikram, v_rajesh, 'follow', 'Rajesh Kumar started following you', 'profile', v_rajesh::text, true),
  (v_meera, v_vikram, 'message', 'Vikram Singh sent you a message', 'message', v_vikram::text, true),
  (v_anita, v_arjun, 'message', 'Bluechip Capital sent you a message', 'message', v_arjun::text, false);

  -- REPORTS
  INSERT INTO reports (reporter_id, post_id, reason, description, status) VALUES
  (v_rajesh, v_post_ids[12], 'misleading_info', 'Overly promotional without disclaimers.', 'pending');

  -- USER SETTINGS
  INSERT INTO user_settings (user_id, email_notifications, notify_likes, notify_comments, notify_follows, notify_connections, notify_messages, profile_visibility, show_email, show_phone) VALUES
  (v_rajesh, true, true, true, true, true, true, 'public', true, false),
  (v_priya, true, true, true, true, true, true, 'public', true, false),
  (v_arjun, true, true, true, false, true, true, 'public', false, false),
  (v_sneha, true, true, true, true, true, true, 'public', true, false),
  (v_vikram, true, true, true, true, true, true, 'public', false, false),
  (v_anita, true, true, true, true, true, true, 'public', true, false),
  (v_karan, false, true, true, true, true, true, 'connections', true, false),
  (v_meera, true, true, true, true, true, true, 'public', false, false)
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE 'Seed complete!';
END $$;
