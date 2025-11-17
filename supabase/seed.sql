-- Seed data for CoopBank application

-- Truncate existing data to ensure a clean slate
TRUNCATE TABLE public.members, public.shares, public.savings, public.loans, public.loan_schemes, public.loan_repayments, public.transactions RESTART IDENTITY CASCADE;

-- Insert Members
INSERT INTO public.members (id, name, email, phone, address, join_date, dob, nominee_name, nominee_relationship) VALUES
('a1b2c3d4-e5f6-a7b8-9012-34567890abcd', 'Grisma Pokharel', 'grisma.pokharel@example.com', '9801111111', 'Kathmandu, Nepal', '2023-01-15', '1990-05-20', 'Gaurav Pokharel', 'Husband'),
('b2c3d4e5-f6a7-b890-1234-567890abcde1', 'Aarav Sharma', 'aarav.sharma@example.com', '9802222222', 'Pokhara, Nepal', '2023-02-20', '1988-11-30', 'Anika Sharma', 'Wife'),
('c3d4e5f6-a7b8-c901-2345-67890abcdef2', 'Saanvi Gurung', 'saanvi.gurung@example.com', '9803333333', 'Dharan, Nepal', '2023-03-10', '1995-02-18', 'Bikash Gurung', 'Brother'),
('d4e5f6a7-b8c9-d012-3456-7890abcdef12', 'Vivaan Thapa', 'vivaan.thapa@example.com', '9804444444', 'Butwal, Nepal', '2023-04-05', '2000-08-10', 'Sunita Thapa', 'Mother'),
('e5f6a7b8-c9d0-e123-4567-890abcdef123', 'Anaya Rana', 'anaya.rana@example.com', '9805555555', 'Biratnagar, Nepal', '2023-05-12', '1992-07-22', 'Rohan Rana', 'Husband'),
('f6a7b8c9-d0e1-f234-5678-90abcdef1234', 'Reyansh Joshi', 'reyansh.joshi@example.com', '9806666666', 'Hetauda, Nepal', '2023-06-18', '1985-01-15', 'Priya Joshi', 'Wife'),
('a7b8c9d0-e1f2-a345-6789-01bcdef12345', 'Myra Adhikari', 'myra.adhikari@example.com', '9807777777', 'Janakpur, Nepal', '2023-07-21', '1998-09-05', 'Amit Adhikari', 'Father'),
('b8c9d0e1-f2a3-b456-7890-1cdef123456a', 'Kabir Neupane', 'kabir.neupane@example.com', '9808888888', 'Nepalgunj, Nepal', '2023-08-02', '1993-12-25', 'Sarita Neupane', 'Sister'),
('c9d0e1f2-a3b4-c567-8901-2def1234567b', 'Ishaan Shrestha', 'ishaan.shrestha@example.com', '9809999999', 'Kathmandu, Nepal', '2023-09-14', '1991-04-12', 'Nisha Shrestha', 'Wife'),
('d0e1f2a3-b4c5-d678-9012-3ef12345678c', 'Advika Singh', 'advika.singh@example.com', '9810000000', 'Pokhara, Nepal', '2023-10-25', '1996-06-30', 'Alok Singh', 'Father');

-- Insert Loan Schemes
INSERT INTO public.loan_schemes (id, name, default_interest_rate, max_term_months, min_term_months, applicable_to, repayment_frequency, processing_fee_percentage, late_payment_penalty) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Personal Loan', 14.5, 60, 12, '{"members"}', 'Monthly', 1.5, 500),
('f13a3a6e-445a-4a82-9c17-df3029433251', 'Business Loan', 12.0, 120, 24, '{"members"}', 'Monthly', 2.0, 1000),
('d4eab690-0d55-4f47-8a6a-1e43a9e5d4c2', 'Education Loan', 9.5, 84, 12, '{"members"}', 'Monthly', 1.0, 250),
('c7a7b8e3-2e2d-4e1a-9a9a-3e8a7d6c5b4a', 'Home Loan', 10.5, 240, 60, '{"members"}', 'Monthly', 1.25, 1500),
('a9b8c7d6-5f4e-3d2c-1b0a-987654321fed', 'Emergency Loan', 16.0, 24, 6, '{"members"}', 'Monthly', 1.0, 100);

-- Insert Shares
-- Member Grisma Pokharel
INSERT INTO public.shares (member_id, certificate_number, number_of_shares, face_value, purchase_date) VALUES
('a1b2c3d4-e5f6-a7b8-9012-34567890abcd', 'SH-001', 100, 100, '2023-01-15'),
('a1b2c3d4-e5f6-a7b8-9012-34567890abcd', 'SH-008', 50, 100, '2023-05-20');
-- Member Aarav Sharma
INSERT INTO public.shares (member_id, certificate_number, number_of_shares, face_value, purchase_date) VALUES
('b2c3d4e5-f6a7-b890-1234-567890abcde1', 'SH-002', 150, 100, '2023-02-20');
-- Member Saanvi Gurung
INSERT INTO public.shares (member_id, certificate_number, number_of_shares, face_value, purchase_date) VALUES
('c3d4e5f6-a7b8-c901-2345-67890abcdef2', 'SH-003', 200, 100, '2023-03-10');
-- Others
INSERT INTO public.shares (member_id, certificate_number, number_of_shares, face_value, purchase_date) VALUES
('d4e5f6a7-b8c9-d012-3456-7890abcdef12', 'SH-004', 75, 100, '2023-04-05'),
('e5f6a7b8-c9d0-e123-4567-890abcdef123', 'SH-005', 120, 100, '2023-05-12'),
('f6a7b8c9-d0e1-f234-5678-90abcdef1234', 'SH-006', 250, 100, '2023-06-18'),
('a7b8c9d0-e1f2-a345-6789-01bcdef12345', 'SH-007', 80, 100, '2023-07-21');

-- Insert Savings
INSERT INTO public.savings (member_id, amount, deposit_date, notes) VALUES
('a1b2c3d4-e5f6-a7b8-9012-34567890abcd', 5000, '2023-02-01', 'Monthly saving'),
('b2c3d4e5-f6a7-b890-1234-567890abcde1', 7000, '2023-03-01', 'Monthly saving'),
('c3d4e5f6-a7b8-c901-2345-67890abcdef2', 10000, '2023-04-01', 'Monthly saving'),
('a1b2c3d4-e5f6-a7b8-9012-34567890abcd', 5000, '2023-03-01', 'Monthly saving'),
('b2c3d4e5-f6a7-b890-1234-567890abcde1', 7500, '2023-04-01', 'Additional deposit'),
('d4e5f6a7-b8c9-d012-3456-7890abcdef12', 2000, '2023-05-01', 'Monthly saving'),
('e5f6a7b8-c9d0-e123-4567-890abcdef123', 6000, '2023-06-01', 'Monthly saving'),
('f6a7b8c9-d0e1-f234-5678-90abcdef1234', 12000, '2023-07-01', 'Monthly saving'),
('a7b8c9d0-e1f2-a345-6789-01bcdef12345', 3000, '2023-08-01', 'Monthly saving'),
('c9d0e1f2-a3b4-c567-8901-2def1234567b', 8000, '2023-10-01', 'Monthly saving');

-- Insert Loans
-- Loan 1 for Grisma Pokharel (Fully Paid Off)
INSERT INTO public.loans (id, member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status, description) VALUES
('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-a7b8-9012-34567890abcd', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 50000, 14.5, 12, '2023-08-01', 'Paid Off', 'Personal loan for travel');

-- Loan 2 for Aarav Sharma (Active with some overdue)
INSERT INTO public.loans (id, member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status, description) VALUES
('22222222-2222-2222-2222-222222222222', 'b2c3d4e5-f6a7-b890-1234-567890abcde1', 'f13a3a6e-445a-4a82-9c17-df3029433251', 250000, 12.0, 36, '2023-09-15', 'Active', 'Small business expansion');

-- Loan 3 for Saanvi Gurung (Active and up-to-date)
INSERT INTO public.loans (id, member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status, description) VALUES
('33333333-3333-3333-3333-333333333333', 'c3d4e5f6-a7b8-c901-2345-67890abcdef2', 'd4eab690-0d55-4f47-8a6a-1e43a9e5d4c2', 150000, 9.5, 24, '2024-01-10', 'Active', 'University tuition fees');

-- Loan 4 for Vivaan Thapa (Pending)
INSERT INTO public.loans (id, member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status, description) VALUES
('44444444-4444-4444-4444-444444444444', 'd4e5f6a7-b8c9-d012-3456-7890abcdef12', 'a9b8c7d6-5f4e-3d2c-1b0a-987654321fed', 25000, 16.0, 12, '2024-05-01', 'Pending', 'Emergency medical expenses');

-- Loan 5 for Ishaan Shrestha (Active, slightly behind)
INSERT INTO public.loans (id, member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status, description) VALUES
('55555555-5555-5555-5555-555555555555', 'c9d0e1f2-a3b4-c567-8901-2def1234567b', 'c7a7b8e3-2e2d-4e1a-9a9a-3e8a7d6c5b4a', 500000, 10.5, 60, '2023-11-01', 'Active', 'Downpayment for apartment');


-- Insert Loan Repayments
-- Repayments for Loan 1 (Grisma) - Paid off
-- EMI is approx 4500. Let's make payments that clear it.
INSERT INTO public.loan_repayments (loan_id, payment_date, amount_paid, principal_paid, interest_paid, penal_interest_paid, penalty_paid) VALUES
('11111111-1111-1111-1111-111111111111', '2023-09-05', 4500, 3912.67, 587.33, 0, 0), -- Paid Sep EMI
('11111111-1111-1111-1111-111111111111', '2023-10-04', 4500, 3959.27, 540.73, 0, 0), -- Paid Oct EMI
('11111111-1111-1111-1111-111111111111', '2023-11-05', 4500, 4006.42, 493.58, 0, 0), -- Paid Nov EMI
('11111111-1111-1111-1111-111111111111', '2023-12-05', 4500, 4054.12, 445.88, 0, 0), -- Paid Dec EMI
('11111111-1111-1111-1111-111111111111', '2024-01-05', 4500, 4102.38, 397.62, 0, 0), -- Paid Jan EMI
('11111111-1111-1111-1111-111111111111', '2024-02-05', 4500, 4151.20, 348.80, 0, 0), -- Paid Feb EMI
('11111111-1111-1111-1111-111111111111', '2024-03-05', 4500, 4200.59, 299.41, 0, 0), -- Paid Mar EMI
('11111111-1111-1111-1111-111111111111', '2024-04-05', 4500, 4250.55, 249.45, 0, 0), -- Paid Apr EMI
('11111111-1111-1111-1111-111111111111', '2024-05-05', 4500, 4301.10, 198.90, 0, 0), -- Paid May EMI
('11111111-1111-1111-1111-111111111111', '2024-06-05', 4500, 4352.23, 147.77, 0, 0), -- Paid Jun EMI
('11111111-1111-1111-1111-111111111111', '2024-07-05', 4500, 4403.95, 96.05, 0, 0),   -- Paid Jul EMI
('11111111-1111-1111-1111-111111111111', '2024-08-05', 4443.32, 4399.22, 44.10, 0, 0); -- Final payment

-- Repayments for Loan 2 (Aarav) - Overdue
-- EMI is approx 8305. Let's assume he paid the first 2 months, then missed a couple.
INSERT INTO public.loan_repayments (loan_id, payment_date, amount_paid, principal_paid, interest_paid, penal_interest_paid, penalty_paid) VALUES
('22222222-2222-2222-2222-222222222222', '2023-10-16', 8305, 5805, 2500, 0, 0), -- Paid Oct EMI
('22222222-2222-2222-2222-222222222222', '2023-11-15', 8305, 5863.05, 2441.95, 0, 0), -- Paid Nov EMI
('22222222-2222-2222-2222-222222222222', '2024-03-20', 10000, 1695, 2383.32, 500, 421.68); -- Partial payment for Dec EMI in March

-- Repayments for Loan 3 (Saanvi) - On track
-- EMI is approx 6873
INSERT INTO public.loan_repayments (loan_id, payment_date, amount_paid, principal_paid, interest_paid, penal_interest_paid, penalty_paid) VALUES
('33333333-3333-3333-3333-333333333333', '2024-02-10', 6873, 5685.5, 1187.5, 0, 0), -- Paid Feb EMI
('33333333-3333-3333-3333-333333333333', '2024-03-09', 6873, 5730.41, 1142.59, 0, 0), -- Paid Mar EMI
('33333333-3333-3333-3333-333333333333', '2024-04-10', 6873, 5775.76, 1097.24, 0, 0); -- Paid Apr EMI


-- Insert Transactions (This should be derived from the operations above but we add them manually for a complete seed)
-- Share Purchases
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT
    s.member_id,
    m.name,
    'Share Purchase',
    s.number_of_shares * s.face_value,
    s.purchase_date,
    'Completed',
    'Purchased ' || s.number_of_shares || ' shares (Cert: ' || s.certificate_number || ')'
FROM public.shares s
JOIN public.members m ON s.member_id = m.id;

-- Savings Deposits
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT
    s.member_id,
    m.name,
    'Savings Deposit',
    s.amount,
    s.deposit_date,
    'Completed',
    s.notes
FROM public.savings s
JOIN public.members m ON s.member_id = m.id;

-- Loan Disbursements
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT
    l.member_id,
    m.name,
    'Loan Disbursement',
    l.amount,
    l.disbursement_date,
    'Completed',
    'Loan disbursed: ' || ls.name
FROM public.loans l
JOIN public.members m ON l.member_id = m.id
JOIN public.loan_schemes ls ON l.loan_scheme_id = ls.id
WHERE l.status IN ('Active', 'Paid Off');

-- Loan Repayments (Principal and Interest as separate transactions for reporting)
-- Principal Repaid
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT
    l.member_id,
    m.name,
    'Loan Repayment',
    r.principal_paid,
    r.payment_date,
    'Completed',
    'Principal portion of repayment for loan ' || l.id
FROM public.loan_repayments r
JOIN public.loans l ON r.loan_id = l.id
JOIN public.members m ON l.member_id = m.id
WHERE r.principal_paid > 0;

-- Interest Paid
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT
    l.member_id,
    m.name,
    'Loan Interest',
    r.interest_paid,
    r.payment_date,
    'Completed',
    'Interest portion of repayment for loan ' || l.id
FROM public.loan_repayments r
JOIN public.loans l ON r.loan_id = l.id
JOIN public.members m ON l.member_id = m.id
WHERE r.interest_paid > 0;

-- Penal Interest Paid
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT
    l.member_id,
    m.name,
    'Penal Interest',
    r.penal_interest_paid,
    r.payment_date,
    'Completed',
    'Penal interest portion of repayment for loan ' || l.id
FROM public.loan_repayments r
JOIN public.loans l ON r.loan_id = l.id
JOIN public.members m ON l.member_id = m.id
WHERE r.penal_interest_paid > 0;

-- Penalty (Fine) Paid
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT
    l.member_id,
    m.name,
    'Penalty Income',
    r.penalty_paid,
    r.payment_date,
    'Completed',
    'Fine portion of repayment for loan ' || l.id
FROM public.loan_repayments r
JOIN public.loans l ON r.loan_id = l.id
JOIN public.members m ON l.member_id = m.id
WHERE r.penalty_paid > 0;
