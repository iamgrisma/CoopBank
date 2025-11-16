-- Create members table
CREATE TABLE IF NOT EXISTS members (
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
    nominee_relationship TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shares table
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    number_of_shares INT NOT NULL,
    face_value NUMERIC NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create savings table
CREATE TABLE IF NOT EXISTS savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    deposit_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, deposit_date)
);

-- Create loan_schemes table
CREATE TABLE IF NOT EXISTS loan_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    default_interest_rate NUMERIC NOT NULL,
    min_term_months INT NOT NULL,
    max_term_months INT NOT NULL,
    applicable_to TEXT[] NOT NULL,
    repayment_frequency TEXT NOT NULL,
    processing_fee_percentage NUMERIC,
    late_payment_penalty NUMERIC,
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    loan_scheme_id UUID REFERENCES loan_schemes(id),
    amount NUMERIC NOT NULL,
    interest_rate NUMERIC NOT NULL,
    loan_term_months INT NOT NULL,
    disbursement_date DATE NOT NULL,
    status TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    member_name TEXT,
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


--
-- RLS (Row-Level Security) POLICIES
--

-- Enable RLS for all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Remove existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON members;
DROP POLICY IF EXISTS "Allow all access" ON members;
DROP POLICY IF EXISTS "Allow public read access" ON shares;
DROP POLICY IF EXISTS "Allow all access" ON shares;
DROP POLICY IF EXISTS "Allow public read access" ON savings;
DROP POLICY IF EXISTS "Allow all access" ON savings;
DROP POLICY IF EXISTS "Allow public read access" ON loan_schemes;
DROP POLICY IF EXISTS "Allow all access" ON loan_schemes;
DROP POLICY IF EXISTS "Allow public read access" ON loans;
DROP POLICY IF EXISTS "Allow all access" ON loans;
DROP POLICY IF EXISTS "Allow public read access" ON transactions;
DROP POLICY IF EXISTS "Allow all access" ON transactions;

-- Create policies to allow public access for now
CREATE POLICY "Allow all access" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON shares FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON savings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON loan_schemes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON loans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON transactions FOR ALL USING (true) WITH CHECK (true);
