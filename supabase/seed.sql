-- ===============================================================================================
-- Sample Data Seeding Script for CoopBank
--
-- Instructions:
-- 1. Navigate to your Supabase project dashboard.
-- 2. Go to the "SQL Editor".
-- 3. Click "+ New query".
-- 4. Copy the entire content of this file and paste it into the SQL editor.
-- 5. Click "RUN" to execute the script and populate your tables.
--
-- This script is designed to be re-runnable. It will delete existing data before inserting new
-- sample data to ensure a clean state.
-- ===============================================================================================

-- Clean up existing data in the correct order to respect foreign key constraints
DELETE FROM "public"."transactions";
DELETE FROM "public"."loans";
DELETE FROM "public"."savings";
DELETE FROM "public"."shares";
DELETE from "public"."loan_schemes";
DELETE FROM "public"."members";

-- Reset sequences for auto-incrementing IDs if you had them (optional but good practice)
-- Note: UUIDs don't need this, but if you add serial primary keys later, this is how you'd do it.
-- ALTER SEQUENCE members_id_seq RESTART WITH 1;
-- etc.

-- ===============================================================================================
-- 1. Seed Members
-- ===============================================================================================
INSERT INTO "public"."members" ("id", "name", "email", "phone", "address", "join_date", "dob", "nominee_name", "nominee_relationship") VALUES
('1a9c3b0d-5b3a-4b1c-9b0d-5b3a4b1c9b0d', 'Grisma Pokharel', 'iamgrisma@gmail.com', '9812345678', 'Kathmandu, Nepal', '2023-01-15', '1995-05-20', 'Gita Pokharel', 'Mother'),
('2b8d4c1e-6c4b-5c2d-ad1e-6c4b5c2dad1e', 'Ramesh Poudel', 'ramesh@example.com', '9823456789', 'Pokhara, Nepal', '2023-02-20', '1990-08-10', 'Sita Poudel', 'Spouse'),
('3c7e5d2f-7d5c-6d3e-be2f-7d5c6d3ebe2f', 'Sunita Thapa', 'sunita@example.com', '9834567890', 'Butwal, Nepal', '2023-03-10', '1998-11-25', 'Hari Thapa', 'Father');

-- ===============================================================================================
-- 2. Seed Loan Schemes
-- ===============================================================================================
INSERT INTO "public"."loan_schemes" ("id", "name", "default_interest_rate", "min_term_months", "max_term_months", "repayment_frequency") VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Personal Loan', 14.5, 12, 60, 'Monthly'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Business Startup Loan', 12.0, 24, 84, 'Monthly'),
('c3d4e5f6-a7b8-9012-3456-7890abcdef23', 'Agriculture Loan', 10.5, 6, 36, 'Quarterly');

-- ===============================================================================================
-- 3. Seed Shares and corresponding Transactions
-- ===============================================================================================
-- Grisma's Share
INSERT INTO "public"."shares" ("id", "member_id", "certificate_number", "number_of_shares", "face_value", "purchase_date") VALUES
('s1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '1a9c3b0d-5b3a-4b1c-9b0d-5b3a4b1c9b0d', 'SH-001', 100, 100.00, '2023-01-15');
INSERT INTO "public"."transactions" ("member_id", "member_name", "type", "amount", "date", "status", "description") VALUES
('1a9c3b0d-5b3a-4b1c-9b0d-5b3a4b1c9b0d', 'Grisma Pokharel', 'Share Purchase', 10000.00, '2023-01-15', 'Completed', 'Purchased 100 shares (Cert: SH-001)');

-- Ramesh's Share
INSERT INTO "public"."shares" ("id", "member_id", "certificate_number", "number_of_shares", "face_value", "purchase_date") VALUES
('s2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', '2b8d4c1e-6c4b-5c2d-ad1e-6c4b5c2dad1e', 'SH-002', 250, 100.00, '2023-02-20');
INSERT INTO "public"."transactions" ("member_id", "member_name", "type", "amount", "date", "status", "description") VALUES
('2b8d4c1e-6c4b-5c2d-ad1e-6c4b5c2dad1e', 'Ramesh Poudel', 'Share Purchase', 25000.00, '2023-02-20', 'Completed', 'Purchased 250 shares (Cert: SH-002)');

-- Sunita's Share
INSERT INTO "public"."shares" ("id", "member_id", "certificate_number", "number_of_shares", "face_value", "purchase_date") VALUES
('s3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', '3c7e5d2f-7d5c-6d3e-be2f-7d5c6d3ebe2f', 'SH-003', 150, 100.00, '2023-03-10');
INSERT INTO "public"."transactions" ("member_id", "member_name", "type", "amount", "date", "status", "description") VALUES
('3c7e5d2f-7d5c-6d3e-be2f-7d5c6d3ebe2f', 'Sunita Thapa', 'Share Purchase', 15000.00, '2023-03-10', 'Completed', 'Purchased 150 shares (Cert: SH-003)');


-- ===============================================================================================
-- 4. Seed Savings and corresponding Transactions
-- ===============================================================================================
-- Grisma's Savings
INSERT INTO "public"."savings" ("member_id", "amount", "deposit_date", "notes") VALUES
('1a9c3b0d-5b3a-4b1c-9b0d-5b3a4b1c9b0d', 5000.00, '2024-05-01', 'Monthly savings deposit'),
('1a9c3b0d-5b3a-4b1c-9b0d-5b3a4b1c9b0d', 5000.00, '2024-06-01', 'Monthly savings deposit');
INSERT INTO "public"."transactions" ("member_id", "member_name", "type", "amount", "date", "status", "description") VALUES
('1a9c3b0d-5b3a-4b1c-9b0d-5b3a4b1c9b0d', 'Grisma Pokharel', 'Savings Deposit', 5000.00, '2024-05-01', 'Completed', 'Monthly savings deposit'),
('1a9c3b0d-5b3a-4b1c-9b0d-5b3a4b1c9b0d', 'Grisma Pokharel', 'Savings Deposit', 5000.00, '2024-06-01', 'Completed', 'Monthly savings deposit');

-- Ramesh's Savings
INSERT INTO "public"."savings" ("member_id", "amount", "deposit_date", "notes") VALUES
('2b8d4c1e-6c4b-5c2d-ad1e-6c4b5c2dad1e', 10000.00, '2024-06-15', 'Business income deposit');
INSERT INTO "public"."transactions" ("member_id", "member_name", "type", "amount", "date", "status", "description") VALUES
('2b8d4c1e-6c4b-5c2d-ad1e-6c4b5c2dad1e', 'Ramesh Poudel', 'Savings Deposit', 10000.00, '2024-06-15', 'Completed', 'Business income deposit');


-- ===============================================================================================
-- 5. Seed Loans and corresponding Transactions
-- ===============================================================================================
-- Ramesh's Loan
INSERT INTO "public"."loans" ("id", "member_id", "loan_scheme_id", "amount", "interest_rate", "loan_term_months", "disbursement_date", "status", "description") VALUES
('l1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', '2b8d4c1e-6c4b-5c2d-ad1e-6c4b5c2dad1e', 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', 500000.00, 12.0, 60, '2024-01-01', 'Active', 'Loan for new shop');
INSERT INTO "public"."transactions" ("member_id", "member_name", "type", "amount", "date", "status", "description") VALUES
('2b8d4c1e-6c4b-5c2d-ad1e-6c4b5c2dad1e', 'Ramesh Poudel', 'Loan Disbursement', 500000.00, '2024-01-01', 'Completed', 'Loan for new shop');

-- Sunita's Loan
INSERT INTO "public"."loans" ("id", "member_id", "loan_scheme_id", "amount", "interest_rate", "loan_term_months", "disbursement_date", "status", "description") VALUES
('l2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', '3c7e5d2f-7d5c-6d3e-be2f-7d5c6d3ebe2f', 'c3d4e5f6-a7b8-9012-3456-7890abcdef23', 75000.00, 10.5, 24, '2024-04-10', 'Active', 'Loan for tractor parts');
INSERT INTO "public"."transactions" ("member_id", "member_name", "type", "amount", "date", "status", "description") VALUES
('3c7e5d2f-7d5c-6d3e-be2f-7d5c6d3ebe2f', 'Sunita Thapa', 'Loan Disbursement', 75000.00, '2024-04-10', 'Completed', 'Loan for tractor parts');


-- ===============================================================================================
-- End of Script
-- ===============================================================================================
