
-- Seed Members
INSERT INTO public.members (id, name, email, phone, address, join_date, dob, nominee_name, nominee_relationship)
VALUES
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Grisma Pokharel', 'grisma.pokharel@example.com', '9801111111', 'Kathmandu, Nepal', '2023-01-15', '1990-05-20', 'Gita Pokharel', 'Mother'),
    ('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Aarav Sharma', 'aarav.sharma@example.com', '9802222222', 'Pokhara, Nepal', '2023-02-20', '1988-11-30', 'Priya Sharma', 'Spouse'),
    ('c3d4e5f6-a7b8-9012-3456-7890abcdef2', 'Saanvi Gurung', 'saanvi.gurung@example.com', '9803333333', 'Dharan, Nepal', '2023-03-10', '1995-02-18', 'Bikash Gurung', 'Brother'),
    ('d4e5f6a7-b8c9-0123-4567-890abcdef3', 'Vihaan Tamang', 'vihaan.tamang@example.com', '9804444444', 'Butwal, Nepal', '2023-04-05', '2000-08-12', 'Sunita Tamang', 'Mother'),
    ('e5f6a7b8-c9d0-1234-5678-90abcdef4', 'Anaya Thapa', 'anaya.thapa@example.com', '9805555555', 'Biratnagar, Nepal', '2023-05-25', '1992-07-22', 'Rajan Thapa', 'Father'),
    ('f6a7b8c9-d0e1-2345-6789-0abcdef5', 'Reyansh Adhikari', 'reyansh.adhikari@example.com', '9806666666', 'Hetauda, Nepal', '2023-06-18', '1985-01-01', 'Mira Adhikari', 'Spouse'),
    ('a7b8c9d0-e1f2-3456-7890-bcdef6a7b8', 'Myra Rai', 'myra.rai@example.com', '9807777777', 'Janakpur, Nepal', '2023-07-22', '1998-09-05', 'Sameer Rai', 'Husband'),
    ('b8c9d0e1-f2a3-4567-8901-cdef6a7b8c9', 'Kabir Yadav', 'kabir.yadav@example.com', '9808888888', 'Nepalgunj, Nepal', '2023-08-11', '1991-03-15', 'Anita Yadav', 'Wife'),
    ('c9d0e1f2-a3b4-5678-9012-def6a7b8c9d', 'Zara Sherpa', 'zara.sherpa@example.com', '9809999999', 'Lukla, Nepal', '2023-09-01', '1999-12-25', 'Tenzing Sherpa', 'Father'),
    ('d0e1f2a3-b4c5-6789-0123-ef6a7b8c9d0e', 'Arjun KC', 'arjun.kc@example.com', '9810000000', 'Gorkha, Nepal', '2023-10-30', '1980-06-10', 'Sabina KC', 'Wife');

-- Seed Loan Schemes
INSERT INTO public.loan_schemes (id, name, default_interest_rate, max_term_months, min_term_months, applicable_to, repayment_frequency, processing_fee_percentage, late_payment_penalty, is_active)
VALUES
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Personal Loan', 14.50, 60, 12, '{"members"}', 'Monthly', 1.5, 500.00, true),
    ('a1c8f1a8-3b2e-4b1c-9a70-7b6a1b2e3f4d', 'Business Loan', 12.00, 120, 24, '{"members"}', 'Monthly', 2.0, 1000.00, true),
    ('d2e3f4a5-6b7c-8d9e-0f1a-2b3c4d5e6f7a', 'Education Loan', 9.50, 84, 12, '{"members"}', 'Monthly', 1.0, 250.00, true),
    ('e3f4a5b6-7c8d-9e0f-1a2b-3c4d5e6f7a8b', 'Home Loan', 10.50, 240, 60, '{"members"}', 'Monthly', 1.25, 750.00, true),
    ('f4a5b6c7-8d9e-0f1a-2b3c-4d5e6f7a8b9c', 'Agriculture Loan', 8.00, 36, 6, '{"members"}', 'Half-Yearly', 0.5, 200.00, true);

-- Seed Shares (10 rows)
INSERT INTO public.shares (member_id, certificate_number, number_of_shares, face_value, purchase_date)
VALUES
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'SH-001', 100, 100, '2023-01-15'),
    ('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'SH-002', 200, 100, '2023-02-20'),
    ('c3d4e5f6-a7b8-9012-3456-7890abcdef2', 'SH-003', 50, 100, '2023-03-10'),
    ('d4e5f6a7-b8c9-0123-4567-890abcdef3', 'SH-004', 150, 100, '2023-04-05'),
    ('e5f6a7b8-c9d0-1234-5678-90abcdef4', 'SH-005', 250, 100, '2023-05-25'),
    ('f6a7b8c9-d0e1-2345-6789-0abcdef5', 'SH-006', 80, 100, '2023-06-18'),
    ('a7b8c9d0-e1f2-3456-7890-bcdef6a7b8', 'SH-007', 120, 100, '2023-07-22'),
    ('b8c9d0e1-f2a3-4567-8901-cdef6a7b8c9', 'SH-008', 300, 100, '2023-08-11'),
    ('c9d0e1f2-a3b4-5678-9012-def6a7b8c9d', 'SH-009', 75, 100, '2023-09-01'),
    ('d0e1f2a3-b4c5-6789-0123-ef6a7b8c9d0e', 'SH-010', 180, 100, '2023-10-30');

-- Seed Savings (10 rows)
INSERT INTO public.savings (member_id, amount, deposit_date, notes)
VALUES
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 5000, '2024-01-20', 'Monthly savings'),
    ('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 10000, '2024-01-22', 'Business profit deposit'),
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 2000, '2024-02-20', 'Monthly savings'),
    ('c3d4e5f6-a7b8-9012-3456-7890abcdef2', 3000, '2024-02-25', 'Regular deposit'),
    ('d4e5f6a7-b8c9-0123-4567-890abcdef3', 7500, '2024-03-01', 'Bonus deposit'),
    ('e5f6a7b8-c9d0-1234-5678-90abcdef4', 12000, '2024-03-15', 'Land sale'),
    ('f6a7b8c9-d0e1-2345-6789-0abcdef5', 4000, '2024-04-10', 'Monthly savings'),
    ('a7b8c9d0-e1f2-3456-7890-bcdef6a7b8', 6500, '2024-04-18', 'Festival bonus'),
    ('b8c9d0e1-f2a3-4567-8901-cdef6a7b8c9', 20000, '2024-05-01', 'Large deposit'),
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 5000, '2024-05-20', 'Monthly savings');

-- Seed Loans (at least 10, with some having repayments)
INSERT INTO public.loans (id, member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status)
VALUES
    -- Loan 1 for Grisma, recent, no repayments yet
    ('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 50000, 14.5, 12, '2024-04-01', 'Active'),
    -- Loan 2 for Aarav, older, some repayments
    ('22222222-2222-2222-2222-222222222222', 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'a1c8f1a8-3b2e-4b1c-9a70-7b6a1b2e3f4d', 250000, 12, 24, '2023-11-15', 'Active'),
    -- Loan 3 for Saanvi, short term
    ('33333333-3333-3333-3333-333333333333', 'c3d4e5f6-a7b8-9012-3456-7890abcdef2', 'e3f4a5b6-7c8d-9e0f-1a2b-3c4d5e6f7a8b', 75000, 9.5, 6, '2024-02-10', 'Active'),
    -- Loan 4, Paid off
    ('44444444-4444-4444-4444-444444444444', 'd4e5f6a7-b8c9-0123-4567-890abcdef3', 'f4a5b6c7-8d9e-0f1a-2b3c-4d5e6f7a8b9c', 30000, 8, 12, '2022-05-01', 'Paid Off'),
    -- Loan 5, pending
    ('55555555-5555-5555-5555-555555555555', 'e5f6a7b8-c9d0-1234-5678-90abcdef4', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 100000, 14.5, 24, '2024-05-20', 'Pending'),
    -- Loan 6, Rejected
    ('66666666-6666-6666-6666-666666666666', 'f6a7b8c9-d0e1-2345-6789-0abcdef5', 'd2e3f4a5-6b7c-8d9e-0f1a-2b3c4d5e6f7a', 150000, 9.5, 36, '2024-05-18', 'Rejected'),
     -- Loan 7 for Grisma again, different loan
    ('77777777-7777-7777-7777-777777777777', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'e3f4a5b6-7c8d-9e0f-1a2b-3c4d5e6f7a8b', 1200000, 10.5, 60, '2023-01-20', 'Active'),
    -- Loan 8 for Myra
    ('88888888-8888-8888-8888-888888888888', 'a7b8c9d0-e1f2-3456-7890-bcdef6a7b8', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 80000, 14.5, 18, '2024-03-15', 'Active'),
    -- Loan 9 for Zara
    ('99999999-9999-9999-9999-999999999999', 'c9d0e1f2-a3b4-5678-9012-def6a7b8c9d', 'f4a5b6c7-8d9e-0f1a-2b3c-4d5e6f7a8b9c', 45000, 8, 24, '2023-12-01', 'Active'),
    -- Loan 10 for Arjun
    ('10101010-1010-1010-1010-101010101010', 'd0e1f2a3-b4c5-6789-0123-ef6a7b8c9d0e', 'a1c8f1a8-3b2e-4b1c-9a70-7b6a1b2e3f4d', 500000, 12, 36, '2024-01-10', 'Active');


-- Seed Repayments for Loan 2 (Aarav) - 3 installments
INSERT INTO public.loan_repayments (loan_id, amount_paid, payment_date, notes, principal_paid, interest_paid, penalty_paid, penal_interest_paid)
VALUES
    ('22222222-2222-2222-2222-222222222222', 12200, '2023-12-15', 'First installment', 9700, 2500, 0, 0),
    ('22222222-2222-2222-2222-222222222222', 12200, '2024-01-16', 'Second installment', 9797, 2403, 0, 0),
    ('22222222-2222-2222-2222-222222222222', 12200, '2024-02-14', 'Third installment', 9895, 2305, 0, 0);

-- Seed Repayments for Loan 7 (Grisma) - demonstrating a late payment
INSERT INTO public.loan_repayments (loan_id, amount_paid, payment_date, notes, principal_paid, interest_paid, penalty_paid, penal_interest_paid)
VALUES
    ('77777777-7777-7777-7777-777777777777', 26700, '2023-02-20', 'First installment', 16200, 10500, 0, 0),
    ('77777777-7777-7777-7777-777777777777', 28000, '2023-03-25', 'Second installment (late)', 16341, 10359, 1300, 0);

-- Seed Repayments for Loan 4 (Paid off) - simplified full repayment
INSERT INTO public.loan_repayments (loan_id, amount_paid, payment_date, notes, principal_paid, interest_paid, penalty_paid, penal_interest_paid)
VALUES
    ('44444444-4444-4444-4444-444444444444', 32000, '2023-05-01', 'Full and final settlement', 30000, 2000, 0, 0);
    
-- Seed Transactions - derived from above actions
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT
    s.member_id,
    m.name,
    'Share Purchase',
    s.number_of_shares * s.face_value,
    s.purchase_date,
    'Completed',
    'Purchased ' || s.number_of_shares || ' shares (Cert: ' || s.certificate_number || ')'
FROM public.shares s JOIN public.members m ON s.member_id = m.id;

INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT
    s.member_id,
    m.name,
    'Savings Deposit',
    s.amount,
    s.deposit_date,
    'Completed',
    'Savings deposit. ' || COALESCE(s.notes, '')
FROM public.savings s JOIN public.members m ON s.member_id = m.id;

INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT
    l.member_id,
    m.name,
    'Loan Disbursement',
    l.amount,
    l.disbursement_date,
    'Completed',
    'Loan disbursed for ' || ls.name
FROM public.loans l
JOIN public.members m ON l.member_id = m.id
JOIN public.loan_schemes ls ON l.loan_scheme_id = ls.id
WHERE l.status = 'Active';

INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT
    l.member_id,
    m.name,
    'Loan Repayment',
    lr.principal_paid,
    lr.payment_date,
    'Completed',
    'Principal portion of repayment for loan ' || l.id
FROM public.loan_repayments lr
JOIN public.loans l ON lr.loan_id = l.id
JOIN public.members m ON l.member_id = m.id
WHERE lr.principal_paid > 0;

INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT
    l.member_id,
    m.name,
    'Loan Interest',
    lr.interest_paid,
    lr.payment_date,
    'Completed',
    'Interest portion of repayment for loan ' || l.id
FROM public.loan_repayments lr
JOIN public.loans l ON lr.loan_id = l.id
JOIN public.members m ON l.member_id = m.id
WHERE lr.interest_paid > 0;

INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT
    l.member_id,
    m.name,
    'Penalty Income',
    lr.penalty_paid,
    lr.payment_date,
    'Completed',
    'Fine portion of repayment for loan ' || l.id
FROM public.loan_repayments lr
JOIN public.loans l ON lr.loan_id = l.id
JOIN public.members m ON l.member_id = m.id
WHERE lr.penalty_paid > 0;

INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT
    l.member_id,
    m.name,
    'Penal Interest',
    lr.penal_interest_paid,
    lr.payment_date,
    'Completed',
    'Penal interest portion of repayment for loan ' || l.id
FROM public.loan_repayments lr
JOIN public.loans l ON lr.loan_id = l.id
JOIN public.members m ON l.member_id = m.id
WHERE lr.penal_interest_paid > 0;
