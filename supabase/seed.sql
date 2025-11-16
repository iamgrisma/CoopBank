-- Sample Members
INSERT INTO "public"."members" ("id", "name", "email", "phone", "address", "join_date", "dob", "photo_url", "nominee_name", "nominee_relationship") VALUES
('1a2b3c4d-5e6f-7890-1234-567890abcdef', 'Grisma Pokharel', 'grisma@example.com', '9801111111', 'Kathmandu, Nepal', '2023-01-15', '1990-05-20', 'https://i.pravatar.cc/150?u=grisma', 'Aarav Pokharel', 'Son'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Aarav Sharma', 'aarav@example.com', '9802222222', 'Pokhara, Nepal', '2023-02-20', '1985-11-10', 'https://i.pravatar.cc/150?u=aarav', 'Sunita Sharma', 'Wife'),
('c3d4e5f6-a7b8-9012-3456-7890abcdef12', 'Sunita Karki', 'sunita@example.com', '9803333333', 'Lalitpur, Nepal', '2023-03-10', '1992-08-25', 'https://i.pravatar.cc/150?u=sunita', 'Rabin Karki', 'Husband');

-- Sample Loan Schemes
INSERT INTO "public"."loan_schemes" ("id", "name", "default_interest_rate", "min_term_months", "max_term_months", "repayment_frequency", "applicable_to", "is_active") VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Personal Loan', 14.50, 12, 60, 'Monthly', '{members}', true),
('d2c3e4f5-a6b7-8901-2345-67890abcdef1', 'Business Loan', 12.00, 24, 120, 'Monthly', '{members,outsiders}', true),
('e3d4f5a6-b7c8-9012-3456-7890abcdef12', 'Emergency Loan', 18.00, 1, 12, 'One-Time', '{members}', true);

-- Sample Shares for Grisma Pokharel
INSERT INTO "public"."shares" ("member_id", "certificate_number", "number_of_shares", "face_value", "purchase_date") VALUES
('1a2b3c4d-5e6f-7890-1234-567890abcdef', 'SH-001', 100, 100.00, '2023-01-15');

-- Sample Shares for Aarav Sharma
INSERT INTO "public"."shares" ("member_id", "certificate_number", "number_of_shares", "face_value", "purchase_date") VALUES
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'SH-002', 200, 100.00, '2023-02-22');

-- Sample Shares for Sunita Karki
INSERT INTO "public"."shares" ("member_id", "certificate_number", "number_of_shares", "face_value", "purchase_date") VALUES
('c3d4e5f6-a7b8-9012-3456-7890abcdef12', 'SH-003', 150, 100.00, '2023-03-12');

-- Sample Savings for Grisma Pokharel
INSERT INTO "public"."savings" ("member_id", "amount", "deposit_date", "notes") VALUES
('1a2b3c4d-5e6f-7890-1234-567890abcdef', 5000.00, '2023-02-01', 'Monthly saving'),
('1a2b3c4d-5e6f-7890-1234-567890abcdef', 5000.00, '2023-03-01', 'Monthly saving');

-- Sample Savings for Aarav Sharma
INSERT INTO "public"."savings" ("member_id", "amount", "deposit_date", "notes") VALUES
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 10000.00, '2023-03-05', 'Initial deposit');

-- Sample Loans for Grisma Pokharel
INSERT INTO "public"."loans" ("member_id", "loan_scheme_id", "amount", "interest_rate", "loan_term_months", "disbursement_date", "status") VALUES
('1a2b3c4d-5e6f-7890-1234-56T890abcdef', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 100000.00, 14.50, 36, '2023-04-01', 'Active');

-- Sample Loans for Sunita Karki
INSERT INTO "public"."loans" ("member_id", "loan_scheme_id", "amount", "interest_rate", "loan_term_months", "disbursement_date", "status") VALUES
('c3d4e5f6-a7b8-9012-3456-7890abcdef12', 'd2c3e4f5-a6b7-8901-2345-67890abcdef1', 500000.00, 12.00, 60, '2023-05-10', 'Pending');


-- Corresponding Transactions for the activities above

-- Share Transactions
INSERT INTO "public"."transactions" ("member_id", "member_name", "type", "amount", "date", "status", "description") VALUES
('1a2b3c4d-5e6f-7890-1234-567890abcdef', 'Grisma Pokharel', 'Share Purchase', 10000.00, '2023-01-15', 'Completed', 'Purchased 100 shares (Cert: SH-001)'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Aarav Sharma', 'Share Purchase', 20000.00, '2023-02-22', 'Completed', 'Purchased 200 shares (Cert: SH-002)'),
('c3d4e5f6-a7b8-9012-3456-7890abcdef12', 'Sunita Karki', 'Share Purchase', 15000.00, '2023-03-12', 'Completed', 'Purchased 150 shares (Cert: SH-003)');

-- Savings Transactions
INSERT INTO "public"."transactions" ("member_id", "member_name", "type", "amount", "date", "status", "description") VALUES
('1a2b3c4d-5e6f-7890-1234-567890abcdef', 'Grisma Pokharel', 'Savings Deposit', 5000.00, '2023-02-01', 'Completed', 'Monthly saving'),
('1a2b3c4d-5e6f-7890-1234-567890abcdef', 'Grisma Pokharel', 'Savings Deposit', 5000.00, '2023-03-01', 'Completed', 'Monthly saving'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Aarav Sharma', 'Savings Deposit', 10000.00, '2023-03-05', 'Completed', 'Initial deposit');

-- Loan Transaction
INSERT INTO "public"."transactions" ("member_id", "member_name", "type", "amount", "date", "status", "description") VALUES
('1a2b3c4d-5e6f-7890-1234-567890abcdef', 'Grisma Pokharel', 'Loan Disbursement', 100000.00, '2023-04-01', 'Completed', 'Loan disbursed for Personal Loan');
