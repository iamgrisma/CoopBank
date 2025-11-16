-- Create the members table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    photo_url TEXT,
    kyc_document_url TEXT,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    dob DATE,
    nominee_name TEXT,
    nominee_relationship TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the loan_schemes table
CREATE TABLE IF NOT EXISTS public.loan_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    default_interest_rate NUMERIC(5, 2) NOT NULL,
    min_term_months INT NOT NULL,
    max_term_months INT NOT NULL,
    applicable_to TEXT[] NOT NULL,
    repayment_frequency TEXT NOT NULL,
    processing_fee_percentage NUMERIC(5, 2),
    late_payment_penalty NUMERIC(10, 2),
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the loans table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    loan_scheme_id UUID NOT NULL REFERENCES public.loan_schemes(id),
    amount NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    loan_term_months INT NOT NULL,
    disbursement_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Active', 'Paid Off', 'Rejected')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the shares table
CREATE TABLE IF NOT EXISTS public.shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    certificate_number TEXT NOT NULL UNIQUE,
    number_of_shares INT NOT NULL,
    face_value NUMERIC(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the savings table
CREATE TABLE IF NOT EXISTS public.savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    deposit_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(member_id, deposit_date)
);

-- Create the transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    member_name TEXT, -- Denormalized for easy display
    type TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security for all tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones to avoid conflicts
DROP POLICY IF EXISTS "Public can view all members" ON public.members;
DROP POLICY IF EXISTS "Public can manage members" ON public.members;
DROP POLICY IF EXISTS "Public can view all loan schemes" ON public.loan_schemes;
DROP POLICY IF EXISTS "Public can manage loan schemes" ON public.loan_schemes;
DROP POLICY IF EXISTS "Public can view all loans" ON public.loans;
DROP POLICY IF EXISTS "Public can manage loans" ON public.loans;
DROP POLICY IF EXISTS "Public can view all shares" ON public.shares;
DROP POLICY IF EXISTS "Public can manage shares" ON public.shares;
DROP POLICY IF EXISTS "Public can view all savings" ON public.savings;
DROP POLICY IF EXISTS "Public can manage savings" ON public.savings;
DROP POLICY IF EXISTS "Public can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Public can manage transactions" ON public.transactions;


-- Create policies to allow public access (for testing without auth)
CREATE POLICY "Public can view all members" ON public.members FOR SELECT TO public USING (true);
CREATE POLICY "Public can manage members" ON public.members FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public can view all loan schemes" ON public.loan_schemes FOR SELECT TO public USING (true);
CREATE POLICY "Public can manage loan schemes" ON public.loan_schemes FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public can view all loans" ON public.loans FOR SELECT TO public USING (true);
CREATE POLICY "Public can manage loans" ON public.loans FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public can view all shares" ON public.shares FOR SELECT TO public USING (true);
CREATE POLICY "Public can manage shares" ON public.shares FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public can view all savings" ON public.savings FOR SELECT TO public USING (true);
CREATE POLICY "Public can manage savings" ON public.savings FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public can view all transactions" ON public.transactions FOR SELECT TO public USING (true);
CREATE POLICY "Public can manage transactions" ON public.transactions FOR ALL TO public USING (true) WITH CHECK (true);
