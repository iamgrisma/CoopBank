-- supabase/seed.sql
-- This script provides sample data for the application.
-- To use, copy and paste the content into the Supabase SQL Editor and run it.
-- Note: This script assumes your tables are empty. If they are not, you might encounter
-- errors due to duplicate primary keys (UUIDs).

-- Clear existing data (optional, uncomment if you want to start fresh)
-- TRUNCATE TABLE members, loan_schemes, shares, savings, loans, transactions RESTART IDENTITY CASCADE;

-- Insert Sample Members
INSERT INTO "members" ("id", "name", "email", "phone", "address", "join_date", "dob", "nominee_name", "nominee_relationship") VALUES
('1a86b332-944a-4886-9a2e-4b4e7b8e2b7e', 'Anjali Sharma', 'anjali.sharma@example.com', '9812345670', 'Kathmandu, Nepal', '2023-01-15', '1990-05-20', 'Rohan Sharma', 'Brother'),
('2b97c443-055b-5997-0b3f-5c5f8c9f3c8f', 'Bikram Thapa', 'bikram.thapa@example.com', '9809876543', 'Pokhara, Nepal', '2023-02-20', '1985-11-10', 'Sunita Thapa', 'Wife'),
('3c08d554-166c-6008-1c40-6d609d004d90', 'Prakriti Gurung', 'prakriti.gurung@example.com', '9845678901', 'Butwal, Nepal', '2023-03-10', '1995-02-25', 'Anil Gurung', 'Father');

-- Insert Sample Loan Schemes
INSERT INTO "loan_schemes" ("id", "name", "default_interest_rate", "min_term_months", "max_term_months", "applicable_to", "repayment_frequency", "processing_fee_percentage", "late_payment_penalty", "is_active") VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Personal Loan', 14.5, 12, 60, '{"members"}', 'Monthly', 1.5, 500, true),
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Business Expansion Loan', 12.0, 24, 120, '{"members", "outsiders"}', 'Quarterly', 2.0, 1000, true),
('c3d4e5f6-a7b8-9012-3456-7890abcdef23', 'Emergency Medical Loan', 10.0, 6, 36, '{"members"}', 'Monthly', 0.5, 250, true);

-- Insert Sample Share Purchases
INSERT INTO "shares" ("member_id", "certificate_number", "number_of_shares", "face_value", "purchase_date") VALUES
('1a86b332-944a-4886-9a2e-4b4e7b8e2b7e', 'SH-001', 100, 100, '2023-01-15'),
('2b97c443-055b-5997-0b3f-5c5f8c9f3c8f', 'SH-002', 250, 100, '2023-02-22');

-- Insert Sample Savings
INSERT INTO "savings" ("member_id", "amount", "deposit_date", "notes") VALUES
('1a86b332-944a-4886-9a2e-4b4e7b8e2b7e', 5000, '2024-05-01', 'Monthly saving'),
('2b97c443-055b-5997-0b3f-5c5f8c9f3c8f', 15000, '2024-05-01', 'Monthly saving'),
('1a86b332-944a-4886-9a2e-4b4e7b8e2b7e', 5500, '2024-06-01', 'Monthly saving with extra deposit');

-- Insert Sample Loans
INSERT INTO "loans" ("member_id", "loan_scheme_id", "amount", "interest_rate", "loan_term_months", "disbursement_date", "status", "description") VALUES
('2b97c443-055b-5997-0b3f-5c5f8c9f3c8f', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 200000, 14.5, 36, '2024-03-15', 'Active', 'Loan for home renovation'),
('1a86b332-944a-4886-9a2e-4b4e7b8e2b7e', 'c3d4e5f6-a7b8-9012-3456-7890abcdef23', 50000, 10.0, 12, '2024-04-01', 'Active', 'Medical expenses');

-- Insert Sample Transactions (to match the operations above)
INSERT INTO "transactions" ("member_id", "member_name", "type", "amount", "date", "status", "description") VALUES
-- Share Purchases
('1a86b332-944a-4886-9a2e-4b4e7b8e2b7e', 'Anjali Sharma', 'Share Purchase', 10000, '2023-01-15', 'Completed', 'Purchased 100 shares (Cert: SH-001)'),
('2b97c443-055b-5997-0b3f-5c5f8c9f3c8f', 'Bikram Thapa', 'Share Purchase', 25000, '2023-02-22', 'Completed', 'Purchased 250 shares (Cert: SH-002)'),
-- Savings Deposits
('1a86b332-944a-4886-9a2e-4b4e7b8e2b7e', 'Anjali Sharma', 'Savings Deposit', 5000, '2024-05-01', 'Completed', 'Monthly saving'),
('2b97c443-055b-5997-0b3f-5c5f8c9f3c8f', 'Bikram Thapa', 'Savings Deposit', 15000, '2024-05-01', 'Completed', 'Monthly saving'),
('1a86b332-944a-4886-9a2e-4b4e7b8e2b7e', 'Anjali Sharma', 'Savings Deposit', 5500, '2024-06-01', 'Completed', 'Monthly saving with extra deposit'),
-- Loan Disbursements
('2b97c443-055b-5997-0b3f-5c5f8c9f3c8f', 'Bikram Thapa', 'Loan Disbursement', 200000, '2024-03-15', 'Completed', 'Loan disbursed. Loan for home renovation'),
('1a86b332-944a-4886-9a2e-4b4e7b8e2b7e', 'Anjali Sharma', 'Loan Disbursement', 50000, '2024-04-01', 'Completed', 'Loan disbursed. Medical expenses');
