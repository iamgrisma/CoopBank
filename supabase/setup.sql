--
-- Supabase schema setup
--

-- 1. Create all tables with IF NOT EXISTS
-- This ensures the script is safe to run multiple times without losing data.

-- members table
CREATE TABLE IF NOT EXISTS public.members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- loan_schemes table
CREATE TABLE IF NOT EXISTS public.loan_schemes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    default_interest_rate REAL NOT NULL,
    max_term_months INTEGER NOT NULL,
    min_term_months INTEGER NOT NULL,
    applicable_to TEXT[] NOT NULL, -- e.g., {'members', 'outsiders'}
    repayment_frequency VARCHAR(50) NOT NULL,
    processing_fee_percentage REAL,
    late_payment_penalty REAL,
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- shares table (references members)
CREATE TABLE IF NOT EXISTS public.shares (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
    certificate_number VARCHAR(255) NOT NULL UNIQUE,
    number_of_shares INTEGER NOT NULL,
    face_value REAL NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- savings table (references members)
CREATE TABLE IF NOT EXISTS public.savings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
    amount REAL NOT NULL,
    deposit_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, deposit_date) -- Prevents duplicate daily savings for the same member
);

-- loans table (references members and loan_schemes)
CREATE TABLE IF NOT EXISTS public.loans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
    loan_scheme_id uuid REFERENCES public.loan_schemes(id),
    amount REAL NOT NULL,
    interest_rate REAL NOT NULL,
    loan_term_months INTEGER NOT NULL,
    disbursement_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., Pending, Active, Paid Off, Rejected
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- transactions table (references members)
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
    member_name VARCHAR(255),
    type VARCHAR(100) NOT NULL, -- e.g., 'Share Purchase', 'Savings Deposit', 'Loan Disbursement'
    amount REAL NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Completed', 'Pending'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 2. Enable Row Level Security (RLS) for all tables.
-- RLS is disabled by default. This is a crucial security step.

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;


-- 3. Create security policies to allow access.
-- These policies allow any authenticated user to perform all actions.
-- For production apps, you might want more granular, role-based policies.

DROP POLICY IF EXISTS "Public access for authenticated users" ON public.members;
CREATE POLICY "Public access for authenticated users" ON public.members FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for authenticated users" ON public.shares;
CREATE POLICY "Public access for authenticated users" ON public.shares FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for authenticated users" ON public.savings;
CREATE POLICY "Public access for authenticated users" ON public.savings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for authenticated users" ON public.loan_schemes;
CREATE POLICY "Public access for authenticated users" ON public.loan_schemes FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for authenticated users" ON public.loans;
CREATE POLICY "Public access for authenticated users" ON public.loans FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for authenticated users" ON public.transactions;
CREATE POLICY "Public access for authenticated users" ON public.transactions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
