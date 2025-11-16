-- supabase/setup.sql

-- 1. Create Members Table
CREATE TABLE IF NOT EXISTS public.members (
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
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Shares Table
CREATE TABLE IF NOT EXISTS public.shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    number_of_shares INT NOT NULL CHECK (number_of_shares > 0),
    face_value NUMERIC(10, 2) NOT NULL CHECK (face_value > 0),
    purchase_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Savings Table
CREATE TABLE IF NOT EXISTS public.savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    deposit_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Add a unique constraint to prevent duplicate deposits for the same member on the same day
ALTER TABLE public.savings ADD CONSTRAINT unique_daily_saving UNIQUE (member_id, deposit_date);


-- 4. Create Loan Schemes Table
CREATE TABLE IF NOT EXISTS public.loan_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    default_interest_rate NUMERIC(5, 2) NOT NULL,
    min_term_months INT NOT NULL,
    max_term_months INT NOT NULL,
    applicable_to TEXT[] NOT NULL, -- e.g., {'members', 'outsiders'}
    repayment_frequency VARCHAR(50) NOT NULL,
    processing_fee_percentage NUMERIC(5, 2) DEFAULT 0,
    late_payment_penalty NUMERIC(10, 2) DEFAULT 0,
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create Loans Table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    loan_scheme_id UUID REFERENCES public.loan_schemes(id),
    amount NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    loan_term_months INT NOT NULL,
    disbursement_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., Pending, Active, Paid Off, Rejected
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    member_name VARCHAR(255),
    type VARCHAR(100) NOT NULL, -- e.g., 'Share Purchase', 'Savings Deposit', 'Loan Disbursement'
    amount NUMERIC(15, 2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Completed', 'Pending'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS and create policies for `members` table
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-all access" ON public.members;
CREATE POLICY "Allow public read-all access" ON public.members FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write access" ON public.members;
CREATE POLICY "Allow authenticated write access" ON public.members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable RLS and create policies for `shares` table
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-all access" ON public.shares;
CREATE POLICY "Allow public read-all access" ON public.shares FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write access" ON public.shares;
CREATE POLICY "Allow authenticated write access" ON public.shares FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable RLS and create policies for `savings` table
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-all access" ON public.savings;
CREATE POLICY "Allow public read-all access" ON public.savings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write access" ON public.savings;
CREATE POLICY "Allow authenticated write access" ON public.savings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable RLS and create policies for `loan_schemes` table
ALTER TABLE public.loan_schemes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-all access" ON public.loan_schemes;
CREATE POLICY "Allow public read-all access" ON public.loan_schemes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write access" ON public.loan_schemes;
CREATE POLICY "Allow authenticated write access" ON public.loan_schemes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable RLS and create policies for `loans` table
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-all access" ON public.loans;
CREATE POLICY "Allow public read-all access" ON public.loans FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write access" ON public.loans;
CREATE POLICY "Allow authenticated write access" ON public.loans FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable RLS and create policies for `transactions` table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-all access" ON public.transactions;
CREATE POLICY "Allow public read-all access" ON public.transactions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated write access" ON public.transactions;
CREATE POLICY "Allow authenticated write access" ON public.transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
