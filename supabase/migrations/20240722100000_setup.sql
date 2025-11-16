-- Create Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    join_date DATE NOT NULL,
    dob DATE,
    photo_url TEXT,
    kyc_document_url TEXT,
    nominee_name VARCHAR(255),
    nominee_relationship VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.members IS 'Stores information about cooperative members.';

-- Create Loan Schemes Table
CREATE TABLE IF NOT EXISTS public.loan_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    default_interest_rate DECIMAL(5, 2) NOT NULL,
    min_term_months INT NOT NULL,
    max_term_months INT NOT NULL,
    applicable_to VARCHAR(50)[] NOT NULL,
    repayment_frequency VARCHAR(50) NOT NULL,
    processing_fee_percentage DECIMAL(5, 2),
    late_payment_penalty DECIMAL(10, 2),
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.loan_schemes IS 'Defines different types of loans offered by the cooperative.';

-- Create Loans Table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    loan_scheme_id UUID REFERENCES public.loan_schemes(id),
    amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    loan_term_months INT NOT NULL,
    disbursement_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.loans IS 'Stores individual loan accounts for members.';

-- Create Shares Table
CREATE TABLE IF NOT EXISTS public.shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    number_of_shares INT NOT NULL,
    face_value DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.shares IS 'Stores share certificate information for each member.';

-- Create Savings Table
CREATE TABLE IF NOT EXISTS public.savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    deposit_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.savings IS 'Stores savings deposits made by members.';

-- Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    member_name VARCHAR(255),
    type VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.transactions IS 'A unified log of all financial transactions.';

-- Remove all existing RLS policies before creating new ones
DROP POLICY IF EXISTS "Public can view all members" ON public.members;
DROP POLICY IF EXISTS "Public can manage members" ON public.members;
DROP POLICY IF EXISTS "Public can view all loan schemes" ON public.loan_schemes;
DROP POLICY IF EXISTS "Public can manage loan schemes" ON public.loan_schemes;
DROP POLICY IF EXISTS "Public can view all loans" ON public.loans;
DROP POLICY IF EXISTS "Public can manage loans" ON public.loans;
DROP POLICY_IF_EXISTS "Public can view all shares" ON public.shares;
DROP POLICY IF EXISTS "Public can manage shares" ON public.shares;
DROP POLICY_IF_EXISTS "Public can view all savings" ON public.savings;
DROP POLICY IF EXISTS "Public can manage savings" ON public.savings;
DROP POLICY_IF_EXISTS "Public can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Public can manage transactions" ON public.transactions;

-- Enable RLS for all tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow full public access (for testing)
CREATE POLICY "Public can manage members" ON public.members FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage loan_schemes" ON public.loan_schemes FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage loans" ON public.loans FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage shares" ON public.shares FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage savings" ON public.savings FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage transactions" ON public.transactions FOR ALL TO public USING (true) WITH CHECK (true);
