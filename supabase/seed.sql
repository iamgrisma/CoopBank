-- Seed data for the CoopBank application

-- Truncate existing data to start fresh
TRUNCATE TABLE members, shares, savings, loan_schemes, loans, loan_repayments, transactions RESTART IDENTITY CASCADE;

-- Seed Members
INSERT INTO public.members (id, name, email, phone, address, join_date, dob, nominee_name, nominee_relationship) VALUES
('a1b2c3d4-e5f6-a7b8-9012-34567890abcd', 'Aarav Sharma', 'aarav.sharma@example.com', '9801111111', 'Kathmandu, Nepal', '2023-01-15', '1990-05-20', 'Priya Sharma', 'Spouse'),
('b2c3d4e5-f6a7-b890-1234-567890abcde1', 'Bikram Rana', 'bikram.rana@example.com', '9802222222', 'Pokhara, Nepal', '2023-02-20', '1988-11-30', 'Sunita Rana', 'Mother'),
('c3d4e5f6-a7b8-9012-3456-7890abcdef2a', 'Saanvi Gurung', 'saanvi.gurung@example.com', '9803333333', 'Dharan, Nepal', '2023-03-10', '1995-02-18', 'Bikash Gurung', 'Brother'),
('d4e5f6a7-b890-1234-5678-90abcdef123b', 'Anisha Thapa', 'anisha.thapa@example.com', '9804444444', 'Butwal, Nepal', '2023-04-05', '2000-08-12', 'Rajesh Thapa', 'Father'),
('e5f6a7b8-9012-3456-7890-abcdef12345c', 'Rohan Adhikari', 'rohan.adhikari@example.com', '9805555555', 'Biratnagar, Nepal', '2023-05-25', '1998-07-22', 'Anita Adhikari', 'Sister'),
('f6a7b890-1234-5678-90ab-cdef1234567d', 'Isha Shrestha', 'isha.shrestha@example.com', '9806666666', 'Lalitpur, Nepal', '2023-06-18', '1993-09-05', 'Nabin Shrestha', 'Husband'),
('a7b89012-3456-7890-abcd-ef123456789e', 'Nitesh Yadav', 'nitesh.yadav@example.com', '9807777777', 'Janakpur, Nepal', '2023-07-22', '1991-04-15', 'Pooja Yadav', 'Wife'),
('b8901234-5678-90ab-cdef-12345678901f', 'Kritika Rai', 'kritika.rai@example.com', '9808888888', 'Hetauda, Nepal', '2023-08-30', '1997-12-28', 'Suman Rai', 'Father'),
('c9012345-6789-0abc-def1-23456789012a', 'Manish Singh', 'manish.singh@example.com', '9809999999', 'Nepalgunj, Nepal', '2023-09-11', '1985-06-10', 'Rekha Singh', 'Wife'),
('d0123456-7890-abcd-ef12-34567890123b', 'Deepika Joshi', 'deepika.joshi@example.com', '9810000000', 'Dhangadhi, Nepal', '2023-10-02', '1999-01-01', 'Ganesh Joshi', 'Father');

-- Seed Loan Schemes
INSERT INTO public.loan_schemes (name, default_interest_rate, max_term_months, min_term_months, applicable_to, repayment_frequency, processing_fee_percentage, late_payment_penalty, is_active) VALUES
('Personal Loan', 14.5, 60, 12, '{"members"}', 'Monthly', 1.5, 500, true),
('Business Loan', 12.0, 120, 24, '{"members"}', 'Monthly', 2.0, 1000, true),
('Education Loan', 9.5, 84, 12, '{"members"}', 'Monthly', 1.0, 250, true),
('Home Loan', 10.5, 240, 60, '{"members"}', 'Monthly', 1.25, 750, true),
('Agriculture Loan', 8.0, 36, 6, '{"members"}', 'Quarterly', 0.5, 100, true);

-- Seed Shares
-- 2 share purchases for Aarav Sharma
INSERT INTO public.shares (member_id, certificate_number, number_of_shares, face_value, purchase_date) VALUES
('a1b2c3d4-e5f6-a7b8-9012-34567890abcd', 'SH-001', 100, 100, '2023-01-15'),
('a1b2c3d4-e5f6-a7b8-9012-34567890abcd', 'SH-011', 50, 100, '2023-07-20');
-- 1 share purchase for each other member
INSERT INTO public.shares (member_id, certificate_number, number_of_shares, face_value, purchase_date) VALUES
('b2c3d4e5-f6a7-b890-1234-567890abcde1', 'SH-002', 150, 100, '2023-02-20'),
('c3d4e5f6-a7b8-9012-3456-7890abcdef2a', 'SH-003', 200, 100, '2023-03-10'),
('d4e5f6a7-b890-1234-5678-90abcdef123b', 'SH-004', 50, 100, '2023-04-05'),
('e5f6a7b8-9012-3456-7890-abcdef12345c', 'SH-005', 120, 100, '2023-05-25'),
('f6a7b890-1234-5678-90ab-cdef1234567d', 'SH-006', 300, 100, '2023-06-18'),
('a7b89012-3456-7890-abcd-ef123456789e', 'SH-007', 80, 100, '2023-07-22'),
('b8901234-5678-90ab-cdef-12345678901f', 'SH-008', 250, 100, '2023-08-30'),
('c9012345-6789-0abc-def1-23456789012a', 'SH-009', 100, 100, '2023-09-11'),
('d0123456-7890-abcd-ef12-34567890123b', 'SH-010', 180, 100, '2023-10-02');

-- Seed Savings
-- Multiple savings deposits for a few members
INSERT INTO public.savings (member_id, amount, deposit_date, notes) VALUES
('a1b2c3d4-e5f6-a7b8-9012-34567890abcd', 5000, '2023-02-01', 'Monthly saving'),
('a1b2c3d4-e5f6-a7b8-9012-34567890abcd', 5500, '2023-03-01', 'Monthly saving'),
('a1b2c3d4-e5f6-a7b8-9012-34567890abcd', 5200, '2023-04-01', 'Monthly saving'),
('b2c3d4e5-f6a7-b890-1234-567890abcde1', 10000, '2023-03-15', 'Bonus deposit'),
('b2c3d4e5-f6a7-b890-1234-567890abcde1', 2500, '2023-04-15', 'Regular saving'),
('c3d4e5f6-a7b8-9012-3456-7890abcdef2a', 8000, '2023-04-10', 'Initial deposit'),
('d4e5f6a7-b890-1234-5678-90abcdef123b', 12000, '2023-05-01', 'Festival bonus'),
('e5f6a7b8-9012-3456-7890-abcdef12345c', 3000, '2023-06-01', 'Regular saving'),
('f6a7b890-1234-5678-90ab-cdef1234567d', 20000, '2023-07-01', 'Land sale profit'),
('a7b89012-3456-7890-abcd-ef123456789e', 4500, '2023-08-01', 'Monthly saving');

-- Seed Loans
-- Loan for Aarav Sharma (Personal Loan)
INSERT INTO public.loans (member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status, description) VALUES
('a1b2c3d4-e5f6-a7b8-9012-34567890abcd', (SELECT id FROM loan_schemes WHERE name = 'Personal Loan'), 50000, 14.5, 12, '2023-08-01', 'Active', 'For home renovation');
-- Loan for Bikram Rana (Business Loan)
INSERT INTO public.loans (member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status, description) VALUES
('b2c3d4e5-f6a7-b890-1234-567890abcde1', (SELECT id FROM loan_schemes WHERE name = 'Business Loan'), 250000, 12.0, 36, '2023-09-01', 'Active', 'Startup capital for new shop');
-- Loan for Saanvi Gurung (Education Loan)
INSERT INTO public.loans (member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status, description) VALUES
('c3d4e5f6-a7b8-9012-3456-7890abcdef2a', (SELECT id FROM loan_schemes WHERE name = 'Education Loan'), 150000, 9.5, 24, '2023-09-15', 'Active', 'For masters degree');
-- Loan for Isha Shrestha (Home Loan) - Paid Off
INSERT INTO public.loans (member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status, description) VALUES
('f6a7b890-1234-5678-90ab-cdef1234567d', (SELECT id FROM loan_schemes WHERE name = 'Home Loan'), 500000, 10.5, 6, '2023-04-01', 'Paid Off', 'Downpayment for apartment');
-- Loan for Manish Singh (Pending)
INSERT INTO public.loans (member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status, description) VALUES
('c9012345-6789-0abc-def1-23456789012a', (SELECT id FROM loan_schemes WHERE name = 'Personal Loan'), 75000, 14.5, 24, '2023-11-10', 'Pending', 'For medical emergency');

-- Seed Loan Repayments
-- Assume today is Nov 17, 2023 for context
-- Aarav Sharma's loan (ID: 1, disbursed Aug 1, 2023), EMI is approx 4496. Due dates: Sep 1, Oct 1, Nov 1
-- Paid Sep and Oct, Nov is overdue
INSERT INTO public.loan_repayments (loan_id, payment_date, amount_paid, principal_paid, interest_paid, penal_interest_paid, penalty_paid) VALUES
(1, '2023-09-05', 4500, 3912.67, 587.33, 0, 0), -- Paid Sep EMI
(1, '2023-10-03', 4500, 3959.83, 540.17, 0, 0); -- Paid Oct EMI
-- Nov is overdue as of Nov 17

-- Bikram Rana's loan (ID: 2, disbursed Sep 1, 2023), EMI is approx 7156. Due dates: Oct 1, Nov 1
-- Paid Oct, Nov is overdue
INSERT INTO public.loan_repayments (loan_id, payment_date, amount_paid, principal_paid, interest_paid, penal_interest_paid, penalty_paid) VALUES
(2, '2023-10-10', 7200, 4700, 2500, 0, 0); -- Paid Oct EMI
-- Nov is overdue as of Nov 17

-- Saanvi Gurung's loan (ID: 3, disbursed Sep 15, 2023). Due dates: Oct 15, Nov 15
-- Paid Oct partially, Nov is due/overdue
INSERT INTO public.loan_repayments (loan_id, payment_date, amount_paid, principal_paid, interest_paid, penal_interest_paid, penalty_paid) VALUES
(3, '2023-10-20', 5000, 3812.5, 1187.5, 0, 0); -- Paid part of Oct EMI

-- Isha Shrestha's loan (ID: 4) - All paid off
INSERT INTO public.loan_repayments (loan_id, payment_date, amount_paid, principal_paid, interest_paid, penal_interest_paid, penalty_paid) VALUES
(4, '2023-05-01', 85790, 81415, 4375, 0, 0),
(4, '2023-06-01', 85790, 82126, 3664, 0, 0),
(4, '2023-07-01', 85790, 82844, 2946, 0, 0),
(4, '2023-08-01', 85790, 83567, 2223, 0, 0),
(4, '2023-09-01', 85790, 84297, 1493, 0, 0),
(4, '2023-10-01', 85790, 85033, 757, 0, 0);

-- Seed Transactions (Auto-generated from Shares, Savings, Loans, Repayments)
-- Share Purchases
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Share Purchase', s.number_of_shares * s.face_value, s.purchase_date, 'Completed', 'Purchased ' || s.number_of_shares || ' shares (Cert: ' || s.certificate_number || ')'
FROM public.shares s JOIN public.members m ON s.member_id = m.id;

-- Savings Deposits
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Savings Deposit', s.amount, s.deposit_date, 'Completed', 'Daily saving deposit. ' || COALESCE(s.notes, '')
FROM public.savings s JOIN public.members m ON s.member_id = m.id;

-- Loan Disbursements
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Loan Disbursement', l.amount, l.disbursement_date, 'Completed', 'Loan disbursed. ' || COALESCE(l.description, '')
FROM public.loans l JOIN public.members m ON l.member_id = m.id
WHERE l.status = 'Active' OR l.status = 'Paid Off';

-- Loan Repayments (Principal)
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT l.member_id, m.name, 'Loan Repayment', r.principal_paid, r.payment_date, 'Completed', 'Principal portion of repayment for loan ' || l.id
FROM public.loan_repayments r JOIN public.loans l ON r.loan_id = l.id JOIN public.members m ON l.member_id = m.id
WHERE r.principal_paid > 0;

-- Loan Repayments (Interest)
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT l.member_id, m.name, 'Loan Interest', r.interest_paid, r.payment_date, 'Completed', 'Interest portion of repayment for loan ' || l.id
FROM public.loan_repayments r JOIN public.loans l ON r.loan_id = l.id JOIN public.members m ON l.member_id = m.id
WHERE r.interest_paid > 0;

-- Loan Repayments (Penal Interest)
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT l.member_id, m.name, 'Penal Interest', r.penal_interest_paid, r.payment_date, 'Completed', 'Penal interest portion of repayment for loan ' || l.id
FROM public.loan_repayments r JOIN public.loans l ON r.loan_id = l.id JOIN public.members m ON l.member_id = m.id
WHERE r.penal_interest_paid > 0;

-- Loan Repayments (Penalty Income)
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT l.member_id, m.name, 'Penalty Income', r.penalty_paid, r.payment_date, 'Completed', 'Fine portion of repayment for loan ' || l.id
FROM public.loan_repayments r JOIN public.loans l ON r.loan_id = l.id JOIN public.members m ON l.member_id = m.id
WHERE r.penalty_paid > 0;
