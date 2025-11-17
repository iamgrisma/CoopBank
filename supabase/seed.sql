-- This script seeds the database with realistic sample data.
-- It uses Data-Modifying CTEs to handle foreign key relationships correctly
-- by capturing auto-generated UUIDs.

-- Clear existing data to ensure a clean slate.
-- Note: This is destructive and will remove all data in these tables.
TRUNCATE TABLE public.members, public.shares, public.savings, public.loans, public.loan_schemes, public.loan_repayments, public.transactions RESTART IDENTITY CASCADE;

-- Seed Loan Schemes first as they are independent
WITH new_loan_schemes AS (
    INSERT INTO public.loan_schemes (name, default_interest_rate, max_term_months, min_term_months, applicable_to, repayment_frequency, processing_fee_percentage, late_payment_penalty) VALUES
    ('Personal Loan', 14.5, 60, 12, '{"members"}', 'Monthly', 1.5, 500),
    ('Agriculture Loan', 9.0, 84, 24, '{"members"}', 'Half-Yearly', 1.0, 250),
    ('Education Loan', 11.2, 120, 36, '{"members"}', 'Monthly', 0.5, 300),
    ('Small Business Loan', 13.0, 60, 12, '{"members"}', 'Monthly', 2.0, 700),
    ('Emergency Loan', 16.0, 24, 3, '{"members"}', 'Monthly', 1.0, 100)
    RETURNING id, name
),
-- Seed Members
new_members AS (
    INSERT INTO public.members (name, email, phone, address, join_date, dob, nominee_name, nominee_relationship) VALUES
    ('Grisma Pokharel', 'grisma.pokharel@example.com', '9801111111', 'Kathmandu, Nepal', '2023-01-15', '1990-05-20', 'Gaurav Pokharel', 'Husband'),
    ('Aarav Shrestha', 'aarav.shrestha@example.com', '9802222222', 'Pokhara, Nepal', '2022-11-20', '1985-08-12', 'Anika Shrestha', 'Wife'),
    ('Saanvi Gurung', 'saanvi.gurung@example.com', '9803333333', 'Dharan, Nepal', '2023-03-10', '1995-02-18', 'Bikash Gurung', 'Brother'),
    ('Bibek Thapa', 'bibek.thapa@example.com', '9804444444', 'Butwal, Nepal', '2021-09-01', '1988-11-30', 'Sunita Thapa', 'Mother'),
    ('Isha Rai', 'isha.rai@example.com', '9805555555', 'Biratnagar, Nepal', '2023-07-22', '1998-07-07', 'Nabin Rai', 'Father'),
    ('Rohan Karki', 'rohan.karki@example.com', '9806666666', 'Lalitpur, Nepal', '2022-05-18', '1992-04-25', 'Rina Karki', 'Sister'),
    ('Priya Lama', 'priya.lama@example.com', '9807777777', 'Hetauda, Nepal', '2023-02-01', '1993-09-14', 'Pemba Lama', 'Husband'),
    ('Niraj Yadav', 'niraj.yadav@example.com', '9808888888', 'Janakpur, Nepal', '2020-12-30', '1982-01-05', 'Rita Yadav', 'Wife'),
    ('Anjali Chaudhary', 'anjali.chaudhary@example.com', '9809999999', 'Dhangadhi, Nepal', '2023-08-19', '1999-06-21', 'Amit Chaudhary', 'Brother'),
    ('Suresh Shah', 'suresh.shah@example.com', '9810000000', 'Birgunj, Nepal', '2022-08-15', '1980-03-03', 'Sarita Shah', 'Wife')
    RETURNING id, name
),
-- Seed Shares
new_shares AS (
    INSERT INTO public.shares (member_id, certificate_number, number_of_shares, face_value, purchase_date)
    SELECT id, 'SH-' || LPAD((ROW_NUMBER() OVER ())::text, 4, '0'), 100, 100, '2023-01-20' FROM new_members WHERE name = 'Grisma Pokharel'
    UNION ALL
    SELECT id, 'SH-' || LPAD((ROW_NUMBER() OVER (ORDER BY name) + 1)::text, 4, '0'), 150, 100, '2022-11-25' FROM new_members WHERE name = 'Aarav Shrestha'
    UNION ALL
    SELECT id, 'SH-' || LPAD((ROW_NUMBER() OVER (ORDER BY name) + 2)::text, 4, '0'), 50, 100, '2023-03-15' FROM new_members WHERE name = 'Saanvi Gurung'
    UNION ALL
    SELECT id, 'SH-' || LPAD((ROW_NUMBER() OVER (ORDER BY name) + 3)::text, 4, '0'), 200, 100, '2021-09-01' FROM new_members WHERE name = 'Bibek Thapa'
    UNION ALL
    SELECT id, 'SH-' || LPAD((ROW_NUMBER() OVER (ORDER BY name) + 4)::text, 4, '0'), 75, 100, '2023-08-01' FROM new_members WHERE name = 'Isha Rai'
    RETURNING member_id
),
-- Seed Savings
new_savings AS (
    INSERT INTO public.savings (member_id, amount, deposit_date, notes)
    SELECT id, 5000, '2023-05-01', 'Monthly saving' FROM new_members WHERE name = 'Grisma Pokharel'
    UNION ALL
    SELECT id, 10000, '2023-05-01', 'Monthly saving' FROM new_members WHERE name = 'Aarav Shrestha'
    UNION ALL
    SELECT id, 2500, '2023-05-10', 'Festival bonus deposit' FROM new_members WHERE name = 'Grisma Pokharel'
    UNION ALL
    SELECT id, 7000, '2023-04-15', 'Daily collection' FROM new_members WHERE name = 'Bibek Thapa'
    RETURNING member_id
),
-- Seed Loans
new_loans AS (
    INSERT INTO public.loans (member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status, description)
    SELECT
        m.id,
        ls.id,
        150000,
        ls.default_interest_rate,
        36,
        '2023-06-01',
        'Active',
        'Loan for home renovation'
    FROM new_members m, new_loan_schemes ls WHERE m.name = 'Grisma Pokharel' AND ls.name = 'Personal Loan'
    UNION ALL
    SELECT
        m.id,
        ls.id,
        500000,
        ls.default_interest_rate,
        60,
        '2022-12-01',
        'Active',
        'Tractor purchase'
    FROM new_members m, new_loan_schemes ls WHERE m.name = 'Aarav Shrestha' AND ls.name = 'Agriculture Loan'
    UNION ALL
    SELECT
        m.id,
        ls.id,
        25000,
        ls.default_interest_rate,
        12,
        '2023-08-15',
        'Paid Off',
        'Medical emergency'
    FROM new_members m, new_loan_schemes ls WHERE m.name = 'Saanvi Gurung' AND ls.name = 'Emergency Loan'
    RETURNING id, member_id, amount
)
-- Seed Loan Repayments using the returned loan IDs
INSERT INTO public.loan_repayments (loan_id, payment_date, amount_paid, principal_paid, interest_paid, penal_interest_paid, penalty_paid, notes)
SELECT
    l.id,
    '2023-07-05',
    5171.67, 3350.29, 1821.38, 0, 0, 'First installment'
FROM new_loans l JOIN new_members m ON l.member_id = m.id WHERE m.name = 'Grisma Pokharel'
UNION ALL
SELECT
    l.id,
    '2023-08-01',
    5171.67, 3390.96, 1780.71, 0, 0, 'Second installment'
FROM new_loans l JOIN new_members m ON l.member_id = m.id WHERE m.name = 'Grisma Pokharel'
UNION ALL
SELECT
    l.id,
    '2023-09-05', -- Late payment
    5300.00,
    3432.22,
    1739.45,
    100.00, -- Example penal interest
    28.33,  -- Example fine
    'Third installment paid late'
FROM new_loans l JOIN new_members m ON l.member_id = m.id WHERE m.name = 'Grisma Pokharel'
UNION ALL
SELECT
    l.id,
    '2023-06-01', -- Half-yearly payment for Agriculture Loan
    52345.89, 30095.89, 22250.00, 0, 0, 'First installment'
FROM new_loans l JOIN new_members m ON l.member_id = m.id WHERE m.name = 'Aarav Shrestha'
UNION ALL
SELECT
    l.id,
    '2023-09-15',
    25500.00, 25000.00, 381.94, 0, 118.06, 'Full and final payment'
FROM new_loans l JOIN new_members m ON l.member_id = m.id WHERE m.name = 'Saanvi Gurung';

-- Seed Transactions (Derived from other records for consistency)

-- Share Purchase Transactions
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Share Purchase', 100 * 100, '2023-01-20', 'Completed', 'Purchased 100 shares' FROM public.members m WHERE m.name = 'Grisma Pokharel';
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Share Purchase', 150 * 100, '2022-11-25', 'Completed', 'Purchased 150 shares' FROM public.members m WHERE m.name = 'Aarav Shrestha';

-- Savings Transactions
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Savings Deposit', 5000, '2023-05-01', 'Completed', 'Monthly saving' FROM public.members m WHERE m.name = 'Grisma Pokharel';
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Savings Deposit', 10000, '2023-05-01', 'Completed', 'Monthly saving' FROM public.members m WHERE m.name = 'Aarav Shrestha';

-- Loan Disbursement Transactions
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Loan Disbursement', 150000, '2023-06-01', 'Completed', 'Loan for home renovation' FROM public.members m WHERE m.name = 'Grisma Pokharel';
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Loan Disbursement', 500000, '2022-12-01', 'Completed', 'Tractor purchase' FROM public.members m WHERE m.name = 'Aarav Shrestha';

-- Loan Repayment Transactions (Income components)
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Loan Interest', 1821.38, '2023-07-05', 'Completed', 'Interest portion of repayment' FROM public.members m WHERE m.name = 'Grisma Pokharel';
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Loan Repayment', 3350.29, '2023-07-05', 'Completed', 'Principal portion of repayment' FROM public.members m WHERE m.name = 'Grisma Pokharel';

INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Loan Interest', 1780.71, '2023-08-01', 'Completed', 'Interest portion of repayment' FROM public.members m WHERE m.name = 'Grisma Pokharel';
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Loan Repayment', 3390.96, '2023-08-01', 'Completed', 'Principal portion of repayment' FROM public.members m WHERE m.name = 'Grisma Pokharel';

INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Loan Interest', 1739.45, '2023-09-05', 'Completed', 'Interest portion of repayment' FROM public.members m WHERE m.name = 'Grisma Pokharel';
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Penal Interest', 100.00, '2023-09-05', 'Completed', 'Penal interest portion of repayment' FROM public.members m WHERE m.name = 'Grisma Pokharel';
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Penalty Income', 28.33, '2023-09-05', 'Completed', 'Fine portion of repayment' FROM public.members m WHERE m.name = 'Grisma Pokharel';
INSERT INTO public.transactions (member_id, member_name, type, amount, date, status, description)
SELECT m.id, m.name, 'Loan Repayment', 3432.22, '2023-09-05', 'Completed', 'Principal portion of repayment' FROM public.members m WHERE m.name = 'Grisma Pokharel';
