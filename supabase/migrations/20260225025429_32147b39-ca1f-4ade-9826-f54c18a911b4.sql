
-- Seed comments
INSERT INTO public.comments (author_id, post_id, content, created_at) VALUES
-- Comments on various posts using known user and post IDs
('c7570894-a440-4f1c-97ff-4a015714cdec', '53178312-ece7-4373-8b01-ac4162827169', 'Great analysis on the SIP trends, Rajesh. The shift towards passive index funds is quite notable.', now() - interval '6 days'),
('02c35abf-a053-43ca-aa98-3fb4bca55182', '53178312-ece7-4373-8b01-ac4162827169', 'The 40% YoY growth in SIP book is remarkable. Small-cap allocation concerns remain though.', now() - interval '5 days 20 hours'),
('a9a62521-77fb-40a5-b3b8-963d0f4c0206', 'b0894c67-dccc-4c8c-9767-ddc5961520ab', 'Excellent point on rate cuts impacting duration strategy. We have been adding gilt exposure.', now() - interval '5 days'),
('389bd69e-3ce7-4027-b2af-1b8205fd23e7', 'b0894c67-dccc-4c8c-9767-ddc5961520ab', 'What is your take on corporate bond spreads at current levels, Priya?', now() - interval '4 days 18 hours'),
('5c2b939e-fc71-4c2e-9b42-711bd200c0dc', 'ea1239ca-0799-4386-80ce-e244542a2658', 'Meera, the ESG analysis is spot on. More AMCs need to integrate these frameworks.', now() - interval '4 days'),
('0041b4f3-64ff-4b6e-b668-d77aac3688a1', 'c04bca9c-02fb-4b62-9e7d-96a60e545367', 'The new SEBI margin rules will significantly impact F&O trading volumes. Good summary Karan.', now() - interval '3 days 12 hours'),
('979bd2a8-124c-4546-a4ea-666a635f98ee', '07b21b13-dad4-4fce-ab22-6604a42b65a0', 'Congratulations Vikram! The NFO timing looks good given current market valuations.', now() - interval '3 days'),
('c7570894-a440-4f1c-97ff-4a015714cdec', '3d20ed70-1bda-45c0-95a4-e7f0c957efbb', 'Anita, the tax-loss harvesting strategy is underutilized by most retail investors. Great article!', now() - interval '2 days 18 hours'),
('acfa870c-47cd-4aba-a159-4882c4ace359', '3d20ed70-1bda-45c0-95a4-e7f0c957efbb', 'Would love to see a follow-up on the new LTCG indexation changes.', now() - interval '2 days 12 hours'),
('02c35abf-a053-43ca-aa98-3fb4bca55182', '0539758f-237e-48e5-ab50-39e5fc102138', 'Sneha, the fintech lending space is evolving rapidly. NPA trends need careful monitoring.', now() - interval '2 days'),
('389bd69e-3ce7-4027-b2af-1b8205fd23e7', 'e0ffbeea-2085-4108-98d6-abc28afc0d28', 'The REIT performance data is very insightful. Office space demand recovery is a key driver.', now() - interval '1 day 18 hours'),
('a9a62521-77fb-40a5-b3b8-963d0f4c0206', '0bf27c1c-1b40-422d-ad71-72bac0eff2e3', 'The quant fund allocation framework is excellent. What backtesting period did you use?', now() - interval '1 day'),
('5c2b939e-fc71-4c2e-9b42-711bd200c0dc', '650d0060-6333-4394-ab29-1db57e96322b', 'Arjun, the pharma sector thesis is compelling. API pricing recovery is a catalyst.', now() - interval '12 hours'),
('0041b4f3-64ff-4b6e-b668-d77aac3688a1', '72cabfbd-caf6-4aad-8bb8-c39c16a6fc0c', 'Excellent cross-asset analysis. The gold-equity correlation breakdown is noteworthy.', now() - interval '6 hours'),
('c7570894-a440-4f1c-97ff-4a015714cdec', '0038825f-88a0-4853-8b1f-c144b3e2efc1', 'Great infrastructure sector overview, Vikram. The capex cycle thesis is strong.', now() - interval '3 hours');

-- Seed post interactions (likes and bookmarks)
INSERT INTO public.post_interactions (user_id, post_id, interaction_type, created_at) VALUES
-- Likes
('c7570894-a440-4f1c-97ff-4a015714cdec', '53178312-ece7-4373-8b01-ac4162827169', 'like', now() - interval '6 days'),
('02c35abf-a053-43ca-aa98-3fb4bca55182', '53178312-ece7-4373-8b01-ac4162827169', 'like', now() - interval '5 days'),
('a9a62521-77fb-40a5-b3b8-963d0f4c0206', '53178312-ece7-4373-8b01-ac4162827169', 'like', now() - interval '5 days'),
('389bd69e-3ce7-4027-b2af-1b8205fd23e7', 'b0894c67-dccc-4c8c-9767-ddc5961520ab', 'like', now() - interval '4 days'),
('5c2b939e-fc71-4c2e-9b42-711bd200c0dc', 'b0894c67-dccc-4c8c-9767-ddc5961520ab', 'like', now() - interval '4 days'),
('0041b4f3-64ff-4b6e-b668-d77aac3688a1', 'ea1239ca-0799-4386-80ce-e244542a2658', 'like', now() - interval '3 days'),
('979bd2a8-124c-4546-a4ea-666a635f98ee', 'ea1239ca-0799-4386-80ce-e244542a2658', 'like', now() - interval '3 days'),
('c7570894-a440-4f1c-97ff-4a015714cdec', 'c04bca9c-02fb-4b62-9e7d-96a60e545367', 'like', now() - interval '3 days'),
('02c35abf-a053-43ca-aa98-3fb4bca55182', '07b21b13-dad4-4fce-ab22-6604a42b65a0', 'like', now() - interval '2 days'),
('a9a62521-77fb-40a5-b3b8-963d0f4c0206', '3d20ed70-1bda-45c0-95a4-e7f0c957efbb', 'like', now() - interval '2 days'),
('389bd69e-3ce7-4027-b2af-1b8205fd23e7', '0539758f-237e-48e5-ab50-39e5fc102138', 'like', now() - interval '1 day'),
('5c2b939e-fc71-4c2e-9b42-711bd200c0dc', 'e0ffbeea-2085-4108-98d6-abc28afc0d28', 'like', now() - interval '1 day'),
('0041b4f3-64ff-4b6e-b668-d77aac3688a1', '0bf27c1c-1b40-422d-ad71-72bac0eff2e3', 'like', now() - interval '18 hours'),
('979bd2a8-124c-4546-a4ea-666a635f98ee', '650d0060-6333-4394-ab29-1db57e96322b', 'like', now() - interval '12 hours'),
('c7570894-a440-4f1c-97ff-4a015714cdec', '72cabfbd-caf6-4aad-8bb8-c39c16a6fc0c', 'like', now() - interval '6 hours'),
-- Bookmarks
('c7570894-a440-4f1c-97ff-4a015714cdec', 'ea1239ca-0799-4386-80ce-e244542a2658', 'bookmark', now() - interval '4 days'),
('02c35abf-a053-43ca-aa98-3fb4bca55182', 'b0894c67-dccc-4c8c-9767-ddc5961520ab', 'bookmark', now() - interval '4 days'),
('389bd69e-3ce7-4027-b2af-1b8205fd23e7', '3d20ed70-1bda-45c0-95a4-e7f0c957efbb', 'bookmark', now() - interval '2 days'),
('a9a62521-77fb-40a5-b3b8-963d0f4c0206', '0bf27c1c-1b40-422d-ad71-72bac0eff2e3', 'bookmark', now() - interval '1 day'),
('5c2b939e-fc71-4c2e-9b42-711bd200c0dc', '72cabfbd-caf6-4aad-8bb8-c39c16a6fc0c', 'bookmark', now() - interval '6 hours');

-- Seed connections
INSERT INTO public.connections (from_user_id, to_user_id, connection_type, status, created_at) VALUES
-- Follow connections
('c7570894-a440-4f1c-97ff-4a015714cdec', '5c2b939e-fc71-4c2e-9b42-711bd200c0dc', 'follow', 'accepted', now() - interval '10 days'),
('c7570894-a440-4f1c-97ff-4a015714cdec', '02c35abf-a053-43ca-aa98-3fb4bca55182', 'follow', 'accepted', now() - interval '9 days'),
('02c35abf-a053-43ca-aa98-3fb4bca55182', 'c7570894-a440-4f1c-97ff-4a015714cdec', 'follow', 'accepted', now() - interval '9 days'),
('a9a62521-77fb-40a5-b3b8-963d0f4c0206', '389bd69e-3ce7-4027-b2af-1b8205fd23e7', 'follow', 'accepted', now() - interval '8 days'),
('389bd69e-3ce7-4027-b2af-1b8205fd23e7', 'a9a62521-77fb-40a5-b3b8-963d0f4c0206', 'follow', 'accepted', now() - interval '8 days'),
('979bd2a8-124c-4546-a4ea-666a635f98ee', '5c2b939e-fc71-4c2e-9b42-711bd200c0dc', 'follow', 'accepted', now() - interval '7 days'),
('0041b4f3-64ff-4b6e-b668-d77aac3688a1', 'c7570894-a440-4f1c-97ff-4a015714cdec', 'follow', 'accepted', now() - interval '7 days'),
('acfa870c-47cd-4aba-a159-4882c4ace359', '02c35abf-a053-43ca-aa98-3fb4bca55182', 'follow', 'accepted', now() - interval '6 days'),
-- Connect (mutual networking) connections
('5c2b939e-fc71-4c2e-9b42-711bd200c0dc', '389bd69e-3ce7-4027-b2af-1b8205fd23e7', 'connect', 'accepted', now() - interval '9 days'),
('979bd2a8-124c-4546-a4ea-666a635f98ee', '02c35abf-a053-43ca-aa98-3fb4bca55182', 'connect', 'accepted', now() - interval '6 days'),
('0041b4f3-64ff-4b6e-b668-d77aac3688a1', 'acfa870c-47cd-4aba-a159-4882c4ace359', 'connect', 'accepted', now() - interval '5 days'),
('a9a62521-77fb-40a5-b3b8-963d0f4c0206', 'c7570894-a440-4f1c-97ff-4a015714cdec', 'connect', 'pending', now() - interval '2 days'),
('acfa870c-47cd-4aba-a159-4882c4ace359', '389bd69e-3ce7-4027-b2af-1b8205fd23e7', 'connect', 'pending', now() - interval '1 day');
