
-- Create Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    photo_url TEXT,
    join_date DATE NOT NULL,
    dob DATE,
    kyc_document_url TEXT,
    nominee_name TEXT,
    nominee_relationship TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS for Members
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all members" ON public.members;
CREATE POLICY "Public can view all members" ON public.members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert new members" ON public.members;
CREATE POLICY "Public can insert new members" ON public.members FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update members" ON public.members;
CREATE POLICY "Public can update members" ON public.members FOR UPDATE USING (true) WITH CHECK (true);


-- Create Shares Table
CREATE TABLE IF NOT EXISTS public.shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    certificate_number TEXT NOT NULL UNIQUE,
    number_of_shares INTEGER NOT NULL,
    face_value NUMERIC(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS for Shares
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all shares" ON public.shares;
CREATE POLICY "Public can view all shares" ON public.shares FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert new shares" ON public.shares;
CREATE POLICY "Public can insert new shares" ON public.shares FOR INSERT WITH CHECK (true);


-- Create Saving Schemes Table
CREATE TABLE IF NOT EXISTS public.saving_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    interest_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
    type TEXT NOT NULL CHECK (type IN ('Daily', 'LTD', 'Current')),
    lock_in_period_years INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS for Saving Schemes
ALTER TABLE public.saving_schemes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all saving schemes" ON public.saving_schemes;
CREATE POLICY "Public can view all saving schemes" ON public.saving_schemes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert new saving schemes" ON public.saving_schemes;
CREATE POLICY "Public can insert new saving schemes" ON public.saving_schemes FOR INSERT WITH CHECK (true);

-- Insert default saving schemes if they don't exist
INSERT INTO public.saving_schemes (name, interest_rate, type)
VALUES ('General Savings', 4.5, 'Daily')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.saving_schemes (name, interest_rate, type)
VALUES ('Current Account', 0, 'Current')
ON CONFLICT (name) DO NOTHING;


-- Create Savings Table
CREATE TABLE IF NOT EXISTS public.savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    deposit_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns to savings table if they don't exist
ALTER TABLE public.savings
ADD COLUMN IF NOT EXISTS saving_scheme_id UUID REFERENCES public.saving_schemes(id),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- RLS for Savings
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all savings" ON public.savings;
CREATE POLICY "Public can view all savings" ON public.savings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert new savings" ON public.savings;
CREATE POLICY "Public can insert new savings" ON public.savings FOR INSERT WITH CHECK (true);

-- Create Loan Schemes Table
CREATE TABLE IF NOT EXISTS public.loan_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    default_interest_rate NUMERIC(5, 2) NOT NULL,
    max_term_months INTEGER NOT NULL,
    min_term_months INTEGER NOT NULL,
    applicable_to TEXT[] NOT NULL,
    repayment_frequency TEXT,
    processing_fee_percentage NUMERIC(5, 2),
    late_payment_penalty NUMERIC(10, 2),
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Loan Schemes
ALTER TABLE public.loan_schemes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all loan schemes" ON public.loan_schemes;
CREATE POLICY "Public can view all loan schemes" ON public.loan_schemes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert new loan schemes" ON public.loan_schemes;
CREATE POLICY "Public can insert new loan schemes" ON public.loan_schemes FOR INSERT WITH CHECK (true);


-- Create Loans Table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    loan_scheme_id UUID REFERENCES public.loan_schemes(id),
    amount NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    loan_term_months INTEGER NOT NULL,
    disbursement_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Active', 'Paid Off', 'Rejected')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Loans
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all loans" ON public.loans;
CREATE POLICY "Public can view all loans" ON public.loans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert new loans" ON public.loans;
CREATE POLICY "Public can insert new loans" ON public.loans FOR INSERT WITH CHECK (true);


-- Create Loan Repayments Table
CREATE TABLE IF NOT EXISTS public.loan_repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount_paid NUMERIC(15, 2) NOT NULL,
    principal_paid NUMERIC(15, 2) NOT NULL,
    interest_paid NUMERIC(15, 2) NOT NULL,
    penal_interest_paid NUMERIC(15, 2) DEFAULT 0,
    penalty_paid NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS for Loan Repayments
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all loan repayments" ON public.loan_repayments;
CREATE POLICY "Public can view all loan repayments" ON public.loan_repayments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert new loan repayments" ON public.loan_repayments;
CREATE POLICY "Public can insert new loan repayments" ON public.loan_repayments FOR INSERT WITH CHECK (true);


-- Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id),
    member_name TEXT,
    type TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all transactions" ON public.transactions;
CREATE POLICY "Public can view all transactions" ON public.transactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert new transactions" ON public.transactions;
CREATE POLICY "Public can insert new transactions" ON public.transactions FOR INSERT WITH CHECK (true);
