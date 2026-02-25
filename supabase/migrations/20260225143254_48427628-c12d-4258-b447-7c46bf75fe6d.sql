
-- Seed notifications for Bhavesh Vora (c2c780fe-0a51-4102-a757-3847f9c5ad26)
INSERT INTO notifications (user_id, type, message, actor_id, reference_id, reference_type, read, created_at) VALUES
-- Connection requests
('c2c780fe-0a51-4102-a757-3847f9c5ad26', 'connection_request', 'Arjun Mehta sent you a connection request', '979bd2a8-124c-4546-a4ea-666a635f98ee', 'b2928ef6-133d-4732-b68e-ddf8f80cdd2d', 'connection', false, now() - interval '10 minutes'),
('c2c780fe-0a51-4102-a757-3847f9c5ad26', 'connection_request', 'Karan Joshi sent you a connection request', 'acfa870c-47cd-4aba-a159-4882c4ace359', '046c1d3c-c463-40ac-ab77-88fba5ad5def', 'connection', false, now() - interval '25 minutes'),
-- Likes on Bhavesh's posts (need a post by Bhavesh first)
('c2c780fe-0a51-4102-a757-3847f9c5ad26', 'connection_accepted', 'Sneha Patel accepted your connection request', '0041b4f3-64ff-4b6e-b668-d77aac3688a1', 'ef3ef6fa-39dc-4263-8562-a608a7c297e4', 'connection', false, now() - interval '1 hour'),
('c2c780fe-0a51-4102-a757-3847f9c5ad26', 'connection_accepted', 'Anita Desai accepted your connection request', '02c35abf-a053-43ca-aa98-3fb4bca55182', 'e56cdc26-f1f6-421d-92c4-26c877902aa5', 'connection', false, now() - interval '2 hours'),
('c2c780fe-0a51-4102-a757-3847f9c5ad26', 'follow', 'Priya Sharma started following you', 'c7570894-a440-4f1c-97ff-4a015714cdec', null, 'profile', true, now() - interval '3 hours'),
('c2c780fe-0a51-4102-a757-3847f9c5ad26', 'like', 'Vikram Singh liked your post', '389bd69e-3ce7-4027-b2af-1b8205fd23e7', null, 'post', true, now() - interval '4 hours'),
('c2c780fe-0a51-4102-a757-3847f9c5ad26', 'comment', 'Rajesh Kumar commented on your post', '5c2b939e-fc71-4c2e-9b42-711bd200c0dc', null, 'post', true, now() - interval '5 hours'),
('c2c780fe-0a51-4102-a757-3847f9c5ad26', 'like', 'Meera Reddy liked your post', 'a9a62521-77fb-40a5-b3b8-963d0f4c0206', null, 'post', true, now() - interval '6 hours'),
('c2c780fe-0a51-4102-a757-3847f9c5ad26', 'repost', 'Arjun Mehta reposted your post', '979bd2a8-124c-4546-a4ea-666a635f98ee', null, 'post', false, now() - interval '30 minutes'),
('c2c780fe-0a51-4102-a757-3847f9c5ad26', 'comment', 'Sneha Patel commented on your post', '0041b4f3-64ff-4b6e-b668-d77aac3688a1', null, 'post', false, now() - interval '45 minutes');

-- Seed messages for Bhavesh Vora with mutual connections
-- Conversation with Vikram Singh (mutual connect)
INSERT INTO messages (sender_id, receiver_id, content, read, created_at) VALUES
('389bd69e-3ce7-4027-b2af-1b8205fd23e7', 'c2c780fe-0a51-4102-a757-3847f9c5ad26', 'Hi Bhavesh! I saw your profile on Findoo. Would love to discuss some investment opportunities.', true, now() - interval '2 days'),
('c2c780fe-0a51-4102-a757-3847f9c5ad26', '389bd69e-3ce7-4027-b2af-1b8205fd23e7', 'Hey Vikram! Sure, I''d be happy to chat. What sectors are you looking at?', true, now() - interval '2 days' + interval '15 minutes'),
('389bd69e-3ce7-4027-b2af-1b8205fd23e7', 'c2c780fe-0a51-4102-a757-3847f9c5ad26', 'Primarily fintech and green energy. I have a few leads that might interest you.', true, now() - interval '2 days' + interval '30 minutes'),
('c2c780fe-0a51-4102-a757-3847f9c5ad26', '389bd69e-3ce7-4027-b2af-1b8205fd23e7', 'Green energy sounds promising! Let me review some prospectuses and get back to you.', true, now() - interval '1 day'),
('389bd69e-3ce7-4027-b2af-1b8205fd23e7', 'c2c780fe-0a51-4102-a757-3847f9c5ad26', 'Perfect. I''ll send over the details by tomorrow. Looking forward to collaborating!', false, now() - interval '3 hours'),

-- Conversation with Priya Sharma (mutual connect)
('c7570894-a440-4f1c-97ff-4a015714cdec', 'c2c780fe-0a51-4102-a757-3847f9c5ad26', 'Bhavesh, your market commentary on the bond yields was spot on!', true, now() - interval '1 day'),
('c2c780fe-0a51-4102-a757-3847f9c5ad26', 'c7570894-a440-4f1c-97ff-4a015714cdec', 'Thanks Priya! I''ve been tracking the RBI policy closely. What''s your take on the rate cut expectations?', true, now() - interval '1 day' + interval '20 minutes'),
('c7570894-a440-4f1c-97ff-4a015714cdec', 'c2c780fe-0a51-4102-a757-3847f9c5ad26', 'I think a 25bps cut is likely in the next meeting. The inflation data supports it.', false, now() - interval '5 hours'),

-- Conversation with Sneha Patel (mutual connect)
('0041b4f3-64ff-4b6e-b668-d77aac3688a1', 'c2c780fe-0a51-4102-a757-3847f9c5ad26', 'Hi Bhavesh, welcome to Findoo! Let me know if you need any help getting started.', true, now() - interval '3 days'),
('c2c780fe-0a51-4102-a757-3847f9c5ad26', '0041b4f3-64ff-4b6e-b668-d77aac3688a1', 'Thank you Sneha! The platform looks great. I''m exploring the research tools.', true, now() - interval '3 days' + interval '1 hour'),
('0041b4f3-64ff-4b6e-b668-d77aac3688a1', 'c2c780fe-0a51-4102-a757-3847f9c5ad26', 'Great! Also check out the market commentary section - lots of good insights there.', true, now() - interval '2 days'),

-- Conversation with Anita Desai (mutual connect)
('02c35abf-a053-43ca-aa98-3fb4bca55182', 'c2c780fe-0a51-4102-a757-3847f9c5ad26', 'Bhavesh, are you attending the SEBI regulatory workshop next week?', false, now() - interval '1 hour'),
('02c35abf-a053-43ca-aa98-3fb4bca55182', 'c2c780fe-0a51-4102-a757-3847f9c5ad26', 'It would be great to meet in person and discuss the new compliance framework.', false, now() - interval '50 minutes');
