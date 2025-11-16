-- Create members table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    join_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    photo_url TEXT,
    dob DATE,
    nominee_name VARCHAR(255),
    nominee_relationship VARCHAR(100),
    kyc_document_url TEXT
);

-- Create shares table
CREATE TABLE IF NOT EXISTS public.shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    number_of_shares INT NOT NULL,
    face_value DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create savings table
CREATE TABLE IF NOT EXISTS public.savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    deposit_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(member_id, deposit_date)
);

-- Create loan_schemes table
CREATE TABLE IF NOT EXISTS public.loan_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    default_interest_rate DECIMAL(5, 2) NOT NULL,
    min_term_months INT,
    max_term_months INT,
    applicable_to VARCHAR(50)[] NOT NULL,
    repayment_frequency VARCHAR(50),
    processing_fee_percentage DECIMAL(5, 2),
    late_payment_penalty DECIMAL(10, 2),
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create loans table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    loan_scheme_id UUID REFERENCES public.loan_schemes(id),
    amount DECIMAL(12, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    loan_term_months INT NOT NULL,
    disbursement_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., Pending, Active, Paid Off, Defaulted
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id),
    member_name VARCHAR(255),
    type VARCHAR(100) NOT NULL, -- e.g., Share Purchase, Savings Deposit, Loan Disbursement
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- RLS POLICIES --
-- These are now set to public to allow all access in the test environment.

-- Enable RLS for all tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can manage members" ON public.members;
DROP POLICY IF EXISTS "Public can view all members" ON public.members;

DROP POLICY IF EXISTS "Public can manage shares" ON public.shares;
DROP POLICY IF EXISTS "Public can view all shares" ON public.shares;

DROP POLICY IF EXISTS "Public can manage savings" ON public.savings;
DROP POLICY IF EXISTS "Public can view all savings" ON public.savings;

DROP POLICY IF EXISTS "Public can manage loan schemes" ON public.loan_schemes;
DROP POLICY IF EXISTS "Public can view all loan schemes" ON public.loan_schemes;

DROP POLICY IF EXISTS "Public can manage loans" ON public.loans;
DROP POLICY IF EXISTS "Public can view all loans" ON public.loans;

DROP POLICY IF EXISTS "Public can manage transactions" ON public.transactions;
DROP POLICY IF EXISTS "Public can view all transactions" ON public.transactions;


-- Create policies for public access (no auth required)

-- Members
CREATE POLICY "Public can manage members" ON public.members
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Shares
CREATE POLICY "Public can manage shares" ON public.shares
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Savings
CREATE POLICY "Public can manage savings" ON public.savings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Loan Schemes
CREATE POLICY "Public can manage loan schemes" ON public.loan_schemes
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Loans
CREATE POLICY "Public can manage loans" ON public.loans
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Transactions
CREATE POLICY "Public can manage transactions" ON public.transactions
    FOR ALL
    USING (true)
    WITH CHECK (true);
