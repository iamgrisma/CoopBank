-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    photo_url TEXT,
    kyc_document_url TEXT,
    dob DATE,
    nominee_name VARCHAR(255),
    nominee_relationship VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create loan_schemes table
CREATE TABLE IF NOT EXISTS loan_schemes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    default_interest_rate REAL NOT NULL,
    max_term_months INTEGER NOT NULL,
    min_term_months INTEGER,
    applicable_to TEXT[], -- e.g., {'members', 'outsiders'}
    repayment_frequency VARCHAR(50),
    processing_fee_percentage REAL,
    late_payment_penalty REAL,
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create shares table
CREATE TABLE IF NOT EXISTS shares (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid REFERENCES members(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    number_of_shares INTEGER NOT NULL,
    face_value REAL NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create savings table
CREATE TABLE IF NOT EXISTS savings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid REFERENCES members(id) ON DELETE CASCADE,
    amount REAL NOT NULL,
    deposit_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (member_id, deposit_date) -- Assuming one deposit per member per day
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid REFERENCES members(id) ON DELETE CASCADE,
    loan_scheme_id uuid REFERENCES loan_schemes(id),
    amount REAL NOT NULL,
    interest_rate REAL NOT NULL,
    loan_term_months INTEGER NOT NULL,
    disbursement_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., Pending, Active, Paid Off, Rejected
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid REFERENCES members(id),
    member_name VARCHAR(255),
    type VARCHAR(100) NOT NULL, -- e.g., 'Share Purchase', 'Savings Deposit', 'Loan Disbursement'
    amount REAL NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- RLS Policies
-- Enable RLS for all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent errors on re-run
DROP POLICY IF EXISTS "Public read access for authenticated users" ON members;
DROP POLICY IF EXISTS "Public write access for authenticated users" ON members;
DROP POLICY IF EXISTS "Public read access for authenticated users" ON shares;
DROP POLICY IF EXISTS "Public write access for authenticated users" ON shares;
DROP POLICY IF EXISTS "Public read access for authenticated users" ON savings;
DROP POLICY IF EXISTS "Public write access for authenticated users" ON savings;
DROP POLICY IF EXISTS "Public read access for authenticated users" ON loans;
DROP POLICY IF EXISTS "Public write access for authenticated users" ON loans;
DROP POLICY IF EXISTS "Public read access for authenticated users" ON loan_schemes;
DROP POLICY IF EXISTS "Public write access for authenticated users" ON loan_schemes;
DROP POLICY IF EXISTS "Public read access for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Public write access for authenticated users" ON transactions;


-- Create policies for members
CREATE POLICY "Public read access for authenticated users" ON members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public write access for authenticated users" ON members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Public update access for authenticated users" ON members FOR UPDATE USING (auth.role() = 'authenticated');


-- Create policies for shares
CREATE POLICY "Public read access for authenticated users" ON shares FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public write access for authenticated users" ON shares FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for savings
CREATE POLICY "Public read access for authenticated users" ON savings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public write access for authenticated users" ON savings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for loans
CREATE POLICY "Public read access for authenticated users" ON loans FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public write access for authenticated users" ON loans FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for loan_schemes
CREATE POLICY "Public read access for authenticated users" ON loan_schemes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public write access for authenticated users" ON loan_schemes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for transactions
CREATE POLICY "Public read access for authenticated users" ON transactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public write access for authenticated users" ON transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
