-- Seed data for the members table
INSERT INTO public.members (id, name, email, phone, address, join_date, dob, nominee_name, nominee_relationship)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Aarav Sharma', 'aarav.sharma@example.com', '9812345670', 'Kathmandu, Nepal', '2023-01-15', '1990-05-20', 'Priya Sharma', 'Spouse'),
    ('22222222-2222-2222-2222-222222222222', 'Bina Pokharel', 'bina.pokharel@example.com', '9809876543', 'Pokhara, Nepal', '2023-02-20', '1985-11-30', 'Ramesh Pokharel', 'Brother'),
    ('33333333-3333-3333-3333-333333333333', 'Chandan Kumar', 'chandan.kumar@example.com', '9841122334', 'Biratnagar, Nepal', '2023-03-10', '1995-02-10', 'Sunita Kumar', 'Mother');

-- Seed data for the loan_schemes table
INSERT INTO public.loan_schemes (id, name, default_interest_rate, min_term_months, max_term_months, applicable_to, repayment_frequency)
VALUES 
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Personal Loan', 14.50, 12, 60, '{members}', 'Monthly'),
    ('b2c3d4e5-f6a7-8901-2345-67890abcdef0', 'Business Loan', 12.00, 24, 84, '{members}', 'Monthly'),
    ('c3d4e5f6-a7b8-9012-3456-7890abcdef01', 'Education Loan', 9.50, 36, 120, '{members}', 'Monthly');

-- Seed data for the shares table
INSERT INTO public.shares (member_id, certificate_number, number_of_shares, face_value, purchase_date)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'SH-001', 100, 100.00, '2023-01-15'),
    ('22222222-2222-2222-2222-222222222222', 'SH-002', 200, 100.00, '2023-02-20'),
    ('11111111-1111-1111-1111-111111111111', 'SH-003', 50, 100.00, '2023-05-10');
    
-- Seed data for the savings table
INSERT INTO public.savings (member_id, amount, deposit_date, notes)
VALUES
    ('11111111-1111-1111-1111-111111111111', 5000.00, '2023-01-15', 'Initial deposit'),
    ('22222222-2222-2222-2222-222222222222', 10000.00, '2023-02-20', 'Initial deposit'),
    ('33333333-3333-3333-3333-333333333333', 2500.00, '2023-03-10', 'Initial deposit'),
    ('11111111-1111-1111-1111-111111111111', 1200.00, '2023-04-05', 'Regular saving');

-- Seed data for the loans table
INSERT INTO public.loans (member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status, description)
VALUES
    ('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 200000.00, 14.50, 36, '2023-06-01', 'Active', 'Personal loan for home renovation'),
    ('33333333-3333-3333-3333-333333333333', 'b2c3d4e5-f6a7-8901-2345-67890abcdef0', 500000.00, 12.00, 60, '2023-07-15', 'Pending', 'Loan for starting a new business');

-- Seed data for the transactions table
-- Share purchases
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Aarav Sharma', 'Share Purchase', 10000.00, '2023-01-15', 'Completed', 'Purchased 100 shares (Cert: SH-001)'),
    ('22222222-2222-2222-2222-222222222222', 'Bina Pokharel', 'Share Purchase', 20000.00, '2023-02-20', 'Completed', 'Purchased 200 shares (Cert: SH-002)'),
    ('11111111-1111-1111-1111-111111111111', 'Aarav Sharma', 'Share Purchase', 5000.00, '2023-05-10', 'Completed', 'Purchased 50 shares (Cert: SH-003)');

-- Savings deposits
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Aarav Sharma', 'Savings Deposit', 5000.00, '2023-01-15', 'Completed', 'Initial deposit'),
    ('22222222-2222-2222-2222-222222222222', 'Bina Pokharel', 'Savings Deposit', 10000.00, '2023-02-20', 'Completed', 'Initial deposit'),
    ('33333333-3333-3333-3333-333333333333', 'Chandan Kumar', 'Savings Deposit', 2500.00, '2023-03-10', 'Completed', 'Initial deposit'),
    ('11111111-1111-1111-1111-111111111111', 'Aarav Sharma', 'Savings Deposit', 1200.00, '2023-04-05', 'Completed', 'Regular saving');

-- Loan disbursement
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
VALUES
    ('22222222-2222-2222-2222-222222222222', 'Bina Pokharel', 'Loan Disbursement', 200000.00, '2023-06-01', 'Completed', 'Loan disbursed. Personal loan for home renovation');
