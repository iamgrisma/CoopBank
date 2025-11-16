-- Drop tables in reverse order of creation to handle dependencies
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS loan_schemes;
DROP TABLE IF EXISTS savings;
DROP TABLE IF EXISTS shares;
DROP TABLE IF EXISTS members;

-- Create members table
CREATE TABLE members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(255),
    address TEXT,
    join_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    dob DATE,
    photo_url TEXT,
    kyc_document_url TEXT,
    nominee_name VARCHAR(255),
    nominee_relationship VARCHAR(255)
);

-- Create shares table
CREATE TABLE shares (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid REFERENCES members(id) ON DELETE CASCADE,
    certificate_number VARCHAR(255) UNIQUE NOT NULL,
    number_of_shares INT NOT NULL,
    face_value NUMERIC(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create savings table
CREATE TABLE savings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid REFERENCES members(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    deposit_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE savings ADD CONSTRAINT unique_member_deposit_date UNIQUE (member_id, deposit_date);


-- Create loan_schemes table
CREATE TABLE loan_schemes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    default_interest_rate NUMERIC(5, 2) NOT NULL,
    max_term_months INT NOT NULL,
    min_term_months INT NOT NULL,
    applicable_to TEXT[] NOT NULL, -- e.g., {'members', 'outsiders'}
    repayment_frequency VARCHAR(50) NOT NULL,
    processing_fee_percentage NUMERIC(5, 2),
    late_payment_penalty NUMERIC(10, 2),
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Create loans table
CREATE TABLE loans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid REFERENCES members(id) ON DELETE CASCADE,
    loan_scheme_id uuid REFERENCES loan_schemes(id),
    amount NUMERIC(12, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    loan_term_months INT NOT NULL,
    disbursement_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Pending', 'Active', 'Paid Off', 'Rejected'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid REFERENCES members(id) ON DELETE CASCADE,
    member_name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Pre-populate loan schemes
INSERT INTO loan_schemes (name, default_interest_rate, min_term_months, max_term_months, applicable_to, repayment_frequency, processing_fee_percentage, late_payment_penalty, is_active)
VALUES
  ('General Member Loan', 10.5, 6, 60, '{"members"}', 'Monthly', 1.0, 500, true),
  ('Personal Loan', 12.0, 12, 72, '{"members"}', 'Monthly', 1.5, 500, true),
  ('House Loan', 9.5, 60, 240, '{"members"}', 'Monthly', 0.5, 1000, true),
  ('Education Loan', 8.0, 24, 120, '{"members"}', 'Monthly', 0.25, 250, true),
  ('Outsiders Business Loan', 15.0, 12, 48, '{"outsiders"}', 'Quarterly', 2.0, 1500, false);


-- Enable Row Level Security (RLS) for all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for members" ON members;
DROP POLICY IF EXISTS "Public full access for shares" ON shares;
DROP POLICY IF EXISTS "Public full access for savings" ON savings;
DROP POLICY IF EXISTS "Public full access for loan_schemes" ON loan_schemes;
DROP POLICY IF EXISTS "Public full access for loans" ON loans;
DROP POLICY IF EXISTS "Public full access for transactions" ON transactions;


-- Create policies to allow public access for authenticated users
-- This is a starting point. In a real app, you'd have more restrictive policies.
CREATE POLICY "Public read access for members" ON members FOR SELECT USING (true);
CREATE POLICY "Allow individual user to update their own info" ON members FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public full access for shares" ON shares FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for savings" ON savings FOR ALL USING (true) WITH CHECK (true);
CREATE_POLICY "Public full access for loan_schemes" ON loan_schemes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for loans" ON loans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
