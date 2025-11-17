-- supabase/seed.sql

-- Insert Members
-- We use specified UUIDs to make it easier to link data in other tables.
INSERT INTO public.members (id, name, email, phone, address, join_date, dob) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grisma Pokharel', 'grisma.pokharel@example.com', '9801111111', 'Kathmandu, Nepal', '2023-01-15', '1990-05-20'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Aarav Sharma', 'aarav.sharma@example.com', '9802222222', 'Pokhara, Nepal', '2023-02-20', '1988-11-30'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Sunita Thapa', 'sunita.thapa@example.com', '9803333333', 'Butwal, Nepal', '2023-03-10', '1995-02-18'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Bikram Rai', 'bikram.rai@example.com', '9804444444', 'Dharan, Nepal', '2023-04-05', '1992-09-01'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Priya Gurung', 'priya.gurung@example.com', '9805555555', 'Chitwan, Nepal', '2023-05-25', '1998-07-14'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Manish Adhikari', 'manish.adhikari@example.com', '9806666666', 'Lalitpur, Nepal', '2022-11-12', '1985-01-22'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Anjali Lama', 'anjali.lama@example.com', '9807777777', 'Bhaktapur, Nepal', '2022-12-01', '1993-03-03'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Rajesh Hamal', 'rajesh.hamal@example.com', '9808888888', 'Biratnagar, Nepal', '2021-06-30', '1975-08-19'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Deepa Shree Niraula', 'deepa.shree@example.com', '9809999999', 'Hetauda, Nepal', '2021-07-15', '1980-04-23'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Hari Bansha Acharya', 'hari.bansha@example.com', '9810000000', 'Kathmandu, Nepal', '2020-01-01', '1965-10-10');

-- Insert Loan Schemes
INSERT INTO public.loan_schemes (id, name, default_interest_rate, min_term_months, max_term_months, repayment_frequency, processing_fee_percentage, late_payment_penalty) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Personal Loan', 14.5, 12, 60, 'Monthly', 1.5, 500),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Business Loan', 12, 24, 120, 'Monthly', 1, 1000),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Education Loan', 9.5, 60, 180, 'Monthly', 0.5, 250),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Home Loan', 10.5, 120, 300, 'Monthly', 1, 1500),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Emergency Loan', 18, 3, 12, 'One-Time', 0, 100);

-- Insert Share Certificates
INSERT INTO public.shares (member_id, certificate_number, number_of_shares, face_value, purchase_date) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'SH-001', 100, 100, '2023-01-15'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'SH-002', 50, 100, '2023-02-20'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'SH-003', 75, 100, '2023-03-10'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'SH-004', 200, 100, '2023-04-05'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'SH-005', 120, 100, '2023-05-25'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'SH-006', 300, 100, '2022-11-12'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'SH-007', 150, 100, '2022-12-01'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'SH-008', 500, 100, '2021-06-30'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'SH-009', 250, 100, '2021-07-15'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'SH-010', 1000, 100, '2020-01-01');

-- Insert Savings Deposits
INSERT INTO public.savings (member_id, amount, deposit_date, notes) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5000, '2024-01-10', 'Monthly savings'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1500, '2024-02-10', 'Monthly savings'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 10000, '2024-01-15', 'Bonus deposit'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 2000, '2024-01-20', 'Daily collection'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 2500, '2024-02-20', 'Daily collection'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 7500, '2024-03-01', 'Festival savings'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 3000, '2024-03-05', 'Regular deposit'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 12000, '2024-03-10', 'Land sale profit'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 4000, '2024-04-01', 'Monthly savings'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 25000, '2024-04-05', 'Large deposit');

-- Insert Loans
-- Loan 1 for Grisma: Overdue
INSERT INTO public.loans (id, member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 50000, 14.5, 12, '2023-10-01', 'Active');

-- Loan 2 for Aarav: Paid on time
INSERT INTO public.loans (id, member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 250000, 12, 24, '2023-06-01', 'Active');

-- Loan 3 for Sunita: Partially paid, slightly overdue
INSERT INTO public.loans (id, member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 75000, 9.5, 36, '2024-01-15', 'Active');

-- Loan 4 for Bikram: Fresh loan, upcoming payments
INSERT INTO public.loans (id, member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 500000, 10.5, 120, '2024-05-01', 'Active');

-- Loan 5 for Priya: Paid off
INSERT INTO public.loans (id, member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 20000, 18, 6, '2023-01-01', 'Paid Off');

-- Insert Loan Repayments
-- Payments for Grisma's Loan (Loan 1) - Let's make it so they missed some payments
-- EMI is approx 4496
INSERT INTO public.loan_repayments (loan_id, amount_paid, payment_date, principal_paid, interest_paid, penal_interest_paid, penalty_paid) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 4500, '2023-11-01', 3894.17, 605.83, 0, 0), -- Paid on time
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 4500, '2023-12-05', 3941.00, 559.00, 0, 0), -- Paid a bit late
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2000, '2024-02-15', 1500.00, 500.00, 0, 0);   -- Paid partially and very late

-- Payments for Aarav's Loan (Loan 2) - Paid regularly
-- EMI is approx 11767
INSERT INTO public.loan_repayments (loan_id, amount_paid, payment_date, principal_paid, interest_paid, penal_interest_paid, penalty_paid) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 11767, '2023-07-01', 9267, 2500, 0, 0),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 11767, '2023-08-01', 9359.67, 2407.33, 0, 0),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 11767, '2023-09-01', 9453.27, 2313.73, 0, 0),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 11767, '2023-10-01', 9547.80, 2219.20, 0, 0),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 11767, '2023-11-01', 9643.28, 2123.72, 0, 0);

-- Payments for Sunita's Loan (Loan 3) - Paid one installment
-- EMI is approx 2400
INSERT INTO public.loan_repayments (loan_id, amount_paid, payment_date, principal_paid, interest_paid, penal_interest_paid, penalty_paid) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 2400, '2024-02-15', 1806.25, 593.75, 0, 0);

-- Payments for Priya's Loan (Loan 5) - Fully paid off
-- EMI is approx 3500
INSERT INTO public.loan_repayments (loan_id, amount_paid, payment_date, principal_paid, interest_paid, penal_interest_paid, penalty_paid) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 3500, '2023-02-01', 3200, 300, 0, 0),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 3500, '2023-03-01', 3248, 252, 0, 0),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 3500, '2023-04-01', 3296.72, 203.28, 0, 0),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 3500, '2023-05-01', 3346.17, 153.83, 0, 0),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 3500, '2023-06-01', 3396.36, 103.64, 0, 0),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 3500, '2023-07-01', 3447.31, 52.69, 0, 0);


-- Insert Transactions
-- Share Purchases
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grisma Pokharel', 'Share Purchase', 10000, '2023-01-15', 'Completed', 'Purchased 100 shares'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Aarav Sharma', 'Share Purchase', 5000, '2023-02-20', 'Completed', 'Purchased 50 shares');

-- Savings Deposits
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grisma Pokharel', 'Savings Deposit', 5000, '2024-01-10', 'Completed', 'Monthly savings'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Aarav Sharma', 'Savings Deposit', 10000, '2024-01-15', 'Completed', 'Bonus deposit');

-- Loan Disbursements
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grisma Pokharel', 'Loan Disbursement', 50000, '2023-10-01', 'Completed', 'Personal Loan'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Aarav Sharma', 'Loan Disbursement', 250000, '2023-06-01', 'Completed', 'Business Loan');

-- Loan Repayments (Interest and Penalty)
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grisma Pokharel', 'Loan Repayment', 3894.17, '2023-11-01', 'Completed', 'Principal portion of repayment for loan c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grisma Pokharel', 'Loan Interest', 605.83, '2023-11-01', 'Completed', 'Interest portion of repayment for loan c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Aarav Sharma', 'Loan Repayment', 9267, '2023-07-01', 'Completed', 'Principal portion of repayment for loan c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Aarav Sharma', 'Loan Interest', 2500, '2023-07-01', 'Completed', 'Interest portion of repayment for loan c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Sunita Thapa', 'Loan Interest', 593.75, '2024-02-15', 'Completed', 'Interest portion of repayment for loan c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Sunita Thapa', 'Loan Repayment', 1806.25, '2024-02-15', 'Completed', 'Principal portion of repayment for loan c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
