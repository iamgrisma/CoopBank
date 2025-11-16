-- Create members table
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    join_date DATE NOT NULL,
    photo_url TEXT,
    dob DATE,
    kyc_document_url TEXT,
    nominee_name VARCHAR(255),
    nominee_relationship VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shares table
CREATE TABLE shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    number_of_shares INT NOT NULL,
    face_value DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create savings table
CREATE TABLE savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    deposit_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, deposit_date) -- Prevents duplicate daily savings for the same member
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    member_name VARCHAR(255),
    type VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Completed', 'Pending', 'Failed'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create loan_schemes table
CREATE TABLE loan_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    default_interest_rate DECIMAL(5, 2) NOT NULL,
    min_term_months INT NOT NULL,
    max_term_months INT NOT NULL,
    applicable_to TEXT[] NOT NULL, -- e.g., {'members', 'outsiders'}
    repayment_frequency VARCHAR(50) NOT NULL, -- e.g., 'Monthly', 'Quarterly'
    processing_fee_percentage DECIMAL(5, 2),
    late_payment_penalty DECIMAL(10, 2),
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create loans table
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    loan_scheme_id UUID REFERENCES loan_schemes(id),
    amount DECIMAL(12, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    loan_term_months INT NOT NULL,
    disbursement_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Pending', 'Active', 'Paid Off', 'Rejected'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial loan schemes
INSERT INTO loan_schemes (name, default_interest_rate, min_term_months, max_term_months, applicable_to, repayment_frequency, processing_fee_percentage, late_payment_penalty, is_active) VALUES
('General Member Loan', 10.5, 6, 36, '{"members"}', 'Monthly', 1.0, 500, true),
('Personal Loan', 12.0, 12, 60, '{"members"}', 'Monthly', 1.5, 500, true),
('House Building Loan', 9.5, 60, 240, '{"members"}', 'Monthly', 0.75, 1000, true),
('Education Loan', 8.0, 24, 84, '{"members"}', 'Monthly', 0.5, 250, true),
('Outsiders Business Loan', 15.0, 12, 48, '{"outsiders"}', 'Monthly', 2.0, 1000, false);


-- Policies for Row Level Security (RLS)

-- Enable RLS for all tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access for authenticated users
CREATE POLICY "Public read access for members" ON public.members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public read access for shares" ON public.shares FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public read access for savings" ON public.savings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public read access for transactions" ON public.transactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public read access for loan schemes" ON public.loan_schemes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public read access for loans" ON public.loans FOR SELECT USING (auth.role() = 'authenticated');

-- Create policies to allow all operations for authenticated users (a more permissive setup for development)
CREATE POLICY "Allow all operations for authenticated users on members" ON public.members FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on shares" ON public.shares FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on savings" ON public.savings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on transactions" ON public.transactions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on loan_schemes" ON public.loan_schemes FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on loans" ON public.loans FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
