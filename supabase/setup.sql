-- Drop existing tables
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS loan_schemes;
DROP TABLE IF EXISTS savings;
DROP TABLE IF EXISTS shares;
DROP TABLE IF EXISTS members;


-- Create Members Table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    join_date DATE NOT NULL,
    dob DATE,
    photo_url TEXT,
    kyc_document_url TEXT,
    nominee_name VARCHAR(255),
    nominee_relationship VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Shares Table
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    number_of_shares INT NOT NULL,
    face_value DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Savings Table
CREATE TABLE IF NOT EXISTS savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    deposit_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(member_id, deposit_date)
);

-- Create Loan Schemes Table
CREATE TABLE IF NOT EXISTS loan_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    default_interest_rate DECIMAL(5, 2) NOT NULL,
    max_term_months INT NOT NULL,
    min_term_months INT NOT NULL,
    applicable_to TEXT[] NOT NULL, -- e.g., ARRAY['members', 'outsiders']
    repayment_frequency VARCHAR(50) NOT NULL, -- e.g., 'Monthly', 'Quarterly'
    processing_fee_percentage DECIMAL(5, 2),
    late_payment_penalty DECIMAL(10, 2),
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Loans Table
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    loan_scheme_id UUID REFERENCES loan_schemes(id),
    amount DECIMAL(12, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    loan_term_months INT NOT NULL,
    disbursement_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Pending', 'Active', 'Paid Off', 'Rejected'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    member_name VARCHAR(255),
    type VARCHAR(100) NOT NULL, -- e.g., 'Share Purchase', 'Savings Deposit', 'Loan Disbursement', 'Loan Repayment'
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Completed', 'Pending'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create Policies for public access
CREATE POLICY "Public members are viewable by everyone." ON members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert members" ON members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update members" ON members FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Public shares are viewable by everyone." ON shares FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert shares" ON shares FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Public savings are viewable by everyone." ON savings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert savings" ON savings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Public loan schemes are viewable by everyone." ON loan_schemes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert loan schemes" ON loan_schemes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Public loans are viewable by everyone." ON loans FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert loans" ON loans FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Public transactions are viewable by everyone." ON transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (true);


-- SEED DATA
-- Seed Members
INSERT INTO members (id, name, email, phone, address, join_date, dob) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Grisma Pokharel', 'iamgrisma@gmail.com', '9812345678', 'Kathmandu, Nepal', '2022-01-15', '1990-05-20'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Sunil Thapa', 'sunil.thapa@example.com', '9809876543', 'Pokhara, Nepal', '2022-03-22', '1988-11-30'),
('c3d4e5f6-a7b8-9012-3456-7890abcdef23', 'Anjali Gurung', 'anjali.gurung@example.com', '9845678901', 'Butwal, Nepal', '2023-07-10', '1995-02-14');

-- Seed Loan Schemes
INSERT INTO loan_schemes (id, name, default_interest_rate, max_term_months, min_term_months, applicable_to, repayment_frequency, processing_fee_percentage, late_payment_penalty, is_active) VALUES
('d4e5f6a7-b8c9-0123-4567-890abcdef345', 'Personal Loan', 12.5, 60, 12, ARRAY['members'], 'Monthly', 1.0, 500.00, true),
('e5f6a7b8-c9d0-1234-5678-90abcdef4567', 'Business Expansion Loan', 10.0, 120, 24, ARRAY['members'], 'Quarterly', 1.5, 1000.00, true),
('f6a7b8c9-d0e1-2345-6789-0abcdef56789', 'Emergency Loan', 15.0, 12, 1, ARRAY['members'], 'One-Time', 0.5, 250.00, false);

-- Seed Shares
INSERT INTO shares (member_id, certificate_number, number_of_shares, face_value, purchase_date) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'SH-001', 100, 100.00, '2022-01-15'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'SH-002', 150, 100.00, '2022-03-22'),
('c3d4e5f6-a7b8-9012-3456-7890abcdef23', 'SH-003', 50, 100.00, '2023-07-10');

-- Seed Savings
INSERT INTO savings (member_id, deposit_date, amount, notes) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', '2024-05-01', 5000.00, 'Monthly deposit'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', '2024-05-01', 7000.00, 'Monthly deposit'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', '2024-06-01', 5500.00, 'Monthly deposit with bonus');

-- Seed Loans
INSERT INTO loans (member_id, loan_scheme_id, amount, interest_rate, loan_term_months, disbursement_date, status) VALUES
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'd4e5f6a7-b8c9-0123-4567-890abcdef345', 100000.00, 12.5, 36, '2023-01-20', 'Active'),
('c3d4e5f6-a7b8-9012-3456-7890abcdef23', 'e5f6a7b8-c9d0-1234-5678-90abcdef4567', 500000.00, 10.0, 60, '2023-09-01', 'Active');

-- Seed Transactions (to reflect the seeds above)
INSERT INTO transactions (member_id, member_name, type, amount, date, status, description) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Grisma Pokharel', 'Share Purchase', 10000.00, '2022-01-15', 'Completed', 'Purchased 100 shares (Cert: SH-001)'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Sunil Thapa', 'Share Purchase', 15000.00, '2022-03-22', 'Completed', 'Purchased 150 shares (Cert: SH-002)'),
('c3d4e5f6-a7b8-9012-3456-7890abcdef23', 'Anjali Gurung', 'Share Purchase', 5000.00, '2023-07-10', 'Completed', 'Purchased 50 shares (Cert: SH-003)'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Grisma Pokharel', 'Savings Deposit', 5000.00, '2024-05-01', 'Completed', 'Monthly deposit'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Sunil Thapa', 'Savings Deposit', 7000.00, '2024-05-01', 'Completed', 'Monthly deposit'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Grisma Pokharel', 'Savings Deposit', 5500.00, '2024-06-01', 'Completed', 'Monthly deposit with bonus'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Sunil Thapa', 'Loan Disbursement', 100000.00, '2023-01-20', 'Completed', 'Loan disbursed.'),
('c3d4e5f6-a7b8-9012-3456-7890abcdef23', 'Anjali Gurung', 'Loan Disbursement', 500000.00, '2023-09-01', 'Completed', 'Loan disbursed.');
