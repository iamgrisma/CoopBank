-- Create members table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    join_date DATE NOT NULL,
    photo_url TEXT,
    dob DATE,
    nominee_name TEXT,
    nominee_relationship TEXT,
    kyc_document_url TEXT
);

-- Create loan_schemes table
CREATE TABLE IF NOT EXISTS public.loan_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    default_interest_rate REAL NOT NULL,
    max_term_months INTEGER NOT NULL,
    min_term_months INTEGER NOT NULL,
    applicable_to TEXT[] NOT NULL,
    repayment_frequency TEXT NOT NULL,
    processing_fee_percentage REAL,
    late_payment_penalty REAL,
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN DEFAULT true
);

-- Create loans table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id),
    loan_scheme_id UUID REFERENCES public.loan_schemes(id),
    amount REAL NOT NULL,
    interest_rate REAL NOT NULL,
    loan_term_months INTEGER NOT NULL,
    disbursement_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Active', 'Paid Off', 'Rejected')),
    description TEXT
);

-- Create shares table
CREATE TABLE IF NOT EXISTS public.shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id),
    certificate_number TEXT NOT NULL UNIQUE,
    number_of_shares INTEGER NOT NULL,
    face_value REAL NOT NULL,
    purchase_date DATE NOT NULL
);

-- Create savings table
CREATE TABLE IF NOT EXISTS public.savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id),
    amount REAL NOT NULL,
    deposit_date DATE NOT NULL,
    notes TEXT,
    UNIQUE(member_id, deposit_date) -- Example constraint: one deposit per member per day
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id),
    member_name TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    description TEXT
);

-- Create loan_repayments table
CREATE TABLE IF NOT EXISTS public.loan_repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount_paid REAL NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- RLS Policies
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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

DROP POLICY IF EXISTS "Public can view all loan repayments" ON public.loan_repayments;
DROP POLICY IF EXISTS "Public can manage loan repayments" ON public.loan_repayments;

-- Create policies for public access (no auth)
CREATE POLICY "Public can view all members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Public can manage members" ON public.members FOR ALL USING (true);

CREATE POLICY "Public can view all loan schemes" ON public.loan_schemes FOR SELECT USING (true);
CREATE POLICY "Public can manage loan schemes" ON public.loan_schemes FOR ALL USING (true);

CREATE POLICY "Public can view all loans" ON public.loans FOR SELECT USING (true);
CREATE POLICY "Public can manage loans" ON public.loans FOR ALL USING (true);

CREATE POLICY "Public can view all shares" ON public.shares FOR SELECT USING (true);
CREATE POLICY "Public can manage shares" ON public.shares FOR ALL USING (true);

CREATE POLICY "Public can view all savings" ON public.savings FOR SELECT USING (true);
CREATE POLICY "Public can manage savings" ON public.savings FOR ALL USING (true);

CREATE POLICY "Public can view all transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Public can manage transactions" ON public.transactions FOR ALL USING (true);

CREATE POLICY "Public can view all loan repayments" ON public.loan_repayments FOR SELECT USING (true);
CREATE POLICY "Public can manage loan repayments" ON public.loan_repayments FOR ALL USING (true);
