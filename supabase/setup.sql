-- Create members table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    join_date DATE NOT NULL,
    dob DATE,
    photo_url TEXT,
    kyc_document_url TEXT,
    nominee_name TEXT,
    nominee_relationship TEXT
);

-- Create shares table
CREATE TABLE IF NOT EXISTS public.shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    certificate_number TEXT NOT NULL UNIQUE,
    number_of_shares INTEGER NOT NULL,
    face_value NUMERIC NOT NULL,
    purchase_date DATE NOT NULL
);

-- Create savings table
CREATE TABLE IF NOT EXISTS public.savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    deposit_date DATE NOT NULL,
    notes TEXT,
    UNIQUE(member_id, deposit_date) -- Assuming one deposit per member per day for daily savings
);

-- Create loan_schemes table
CREATE TABLE IF NOT EXISTS public.loan_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    default_interest_rate NUMERIC NOT NULL,
    min_term_months INTEGER,
    max_term_months INTEGER,
    applicable_to TEXT[], -- e.g., {'members', 'staff'}
    repayment_frequency TEXT,
    processing_fee_percentage NUMERIC,
    late_payment_penalty NUMERIC,
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create loans table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    loan_scheme_id UUID REFERENCES public.loan_schemes(id),
    amount NUMERIC NOT NULL,
    interest_rate NUMERIC NOT NULL,
    loan_term_months INTEGER NOT NULL,
    disbursement_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Active', 'Paid Off', 'Rejected')),
    description TEXT
);

-- Create loan_repayments table
CREATE TABLE IF NOT EXISTS public.loan_repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount_paid NUMERIC NOT NULL,
    notes TEXT,
    principal_paid NUMERIC NOT NULL DEFAULT 0,
    interest_paid NUMERIC NOT NULL DEFAULT 0,
    penalty_paid NUMERIC NOT NULL DEFAULT 0
);


-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    member_name TEXT,
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL, -- e.g., 'Completed', 'Pending'
    description TEXT
);


-- RLS Policies

-- Enable RLS for all tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;


-- Policies for 'members' table
DROP POLICY IF EXISTS "Public can view all members" ON public.members;
CREATE POLICY "Public can view all members" ON public.members
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can create members" ON public.members;
CREATE POLICY "Public can create members" ON public.members
    FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public can update members" ON public.members;
CREATE POLICY "Public can update members" ON public.members
    FOR UPDATE USING (TRUE) WITH CHECK (TRUE);


-- Policies for 'shares' table
DROP POLICY IF EXISTS "Public can view all shares" ON public.shares;
CREATE POLICY "Public can view all shares" ON public.shares
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can create shares" ON public.shares;
CREATE POLICY "Public can create shares" ON public.shares
    FOR INSERT WITH CHECK (TRUE);

-- Policies for 'savings' table
DROP POLICY IF EXISTS "Public can view all savings" ON public.savings;
CREATE POLICY "Public can view all savings" ON public.savings
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can create savings" ON public.savings;
CREATE POLICY "Public can create savings" ON public.savings
    FOR INSERT WITH CHECK (TRUE);

-- Policies for 'loan_schemes' table
DROP POLICY IF EXISTS "Public can view all loan schemes" ON public.loan_schemes;
CREATE POLICY "Public can view all loan schemes" ON public.loan_schemes
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can create loan schemes" ON public.loan_schemes;
CREATE POLICY "Public can create loan schemes" ON public.loan_schemes
    FOR INSERT WITH CHECK (TRUE);


-- Policies for 'loans' table
DROP POLICY IF EXISTS "Public can view all loans" ON public.loans;
CREATE POLICY "Public can view all loans" ON public.loans
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can create loans" ON public.loans;
CREATE POLICY "Public can create loans" ON public.loans
    FOR INSERT WITH CHECK (TRUE);

-- Policies for 'loan_repayments' table
DROP POLICY IF EXISTS "Public can view all loan repayments" ON public.loan_repayments;
CREATE POLICY "Public can view all loan repayments" ON public.loan_repayments
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can create loan repayments" ON public.loan_repayments;
CREATE POLICY "Public can create loan repayments" ON public.loan_repayments
    FOR INSERT WITH CHECK (TRUE);

-- Policies for 'transactions' table
DROP POLICY IF EXISTS "Public can view all transactions" ON public.transactions;
CREATE POLICY "Public can view all transactions" ON public.transactions
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can create transactions" ON public.transactions;
CREATE POLICY "Public can create transactions" ON public.transactions
    FOR INSERT WITH CHECK (TRUE);
