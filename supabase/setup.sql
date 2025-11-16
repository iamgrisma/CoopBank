-- Create the members table
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    photo_url TEXT,
    kyc_document_url TEXT,
    join_date DATE NOT NULL,
    dob DATE,
    nominee_name TEXT,
    nominee_relationship TEXT
);

-- Create the shares table
CREATE TABLE shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    number_of_shares INTEGER NOT NULL,
    face_value NUMERIC NOT NULL,
    purchase_date DATE NOT NULL
);

-- Create the savings table
CREATE TABLE savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    deposit_date DATE NOT NULL,
    notes TEXT,
    CONSTRAINT unique_daily_saving UNIQUE (member_id, deposit_date)
);

-- Create the loan_schemes table
CREATE TABLE loan_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    default_interest_rate NUMERIC NOT NULL,
    max_term_months INTEGER NOT NULL
);

-- Create the loans table
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    loan_scheme_id UUID REFERENCES loan_schemes(id),
    amount NUMERIC NOT NULL,
    interest_rate NUMERIC NOT NULL,
    loan_term_months INTEGER NOT NULL,
    disbursement_date DATE NOT NULL,
    status TEXT NOT NULL, -- e.g., Pending, Active, Paid Off, Rejected
    description TEXT
);

-- Create the transactions table to log all financial activities
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    member_name TEXT, -- Denormalized for easy display
    type TEXT NOT NULL, -- e.g., 'Share Purchase', 'Savings Deposit', 'Loan Disbursement'
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL, -- e.g., 'Completed', 'Pending'
    description TEXT
);

-- Pre-populate loan schemes
INSERT INTO loan_schemes (name, description, default_interest_rate, max_term_months) VALUES
('General Loan', 'A general purpose loan for members.', 12.5, 36),
('Personal Loan', 'For personal expenses and needs.', 14.0, 24),
('House Loan', 'For purchasing or constructing a house.', 10.5, 180),
('Education Loan', 'For funding higher education.', 9.0, 60),
('Outsiders Loan', 'A special loan category for non-members, if applicable.', 18.0, 12);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your auth rules)
-- This allows authenticated users to access all data.
-- For production, you might want more restrictive policies.
CREATE POLICY "Allow all access to authenticated users" ON members FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON shares FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON savings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON loans FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON loan_schemes FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON transactions FOR ALL TO authenticated USING (true);
