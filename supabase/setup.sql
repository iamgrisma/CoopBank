
-- Drop tables in reverse order of creation to handle foreign key constraints
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.loan_repayments;
DROP TABLE IF EXISTS public.loans;
DROP TABLE IF EXISTS public.loan_schemes;
DROP TABLE IF EXISTS public.savings;
DROP TABLE IF EXISTS public.shares;
DROP TABLE IF EXISTS public.members;

-- 1. Members Table
CREATE TABLE public.members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying NOT NULL,
    email character varying,
    phone character varying,
    address character varying,
    join_date date NOT NULL,
    dob date,
    photo_url character varying,
    kyc_document_url character varying,
    nominee_name character varying,
    nominee_relationship character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all members" ON public.members;
CREATE POLICY "Public can view all members" ON public.members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own members" ON public.members;
CREATE POLICY "Users can insert their own members" ON public.members FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update their own members" ON public.members;
CREATE POLICY "Users can update their own members" ON public.members FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Users can delete their own members" ON public.members;
CREATE POLICY "Users can delete their own members" ON public.members FOR DELETE USING (true);

-- 2. Shares Table
CREATE TABLE public.shares (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    certificate_number character varying UNIQUE NOT NULL,
    number_of_shares integer NOT NULL,
    face_value numeric NOT NULL,
    purchase_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all shares" ON public.shares;
CREATE POLICY "Public can view all shares" ON public.shares FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own shares" ON public.shares;
CREATE POLICY "Users can insert their own shares" ON public.shares FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update their own shares" ON public.shares;
CREATE POLICY "Users can update their own shares" ON public.shares FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Users can delete their own shares" ON public.shares;
CREATE POLICY "Users can delete their own shares" ON public.shares FOR DELETE USING (true);

-- 3. Savings Table
CREATE TABLE public.savings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    deposit_date date NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(member_id, deposit_date, amount) -- To prevent duplicate entries
);
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all savings" ON public.savings;
CREATE POLICY "Public can view all savings" ON public.savings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own savings" ON public.savings;
CREATE POLICY "Users can insert their own savings" ON public.savings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update their own savings" ON public.savings;
CREATE POLICY "Users can update their own savings" ON public.savings FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Users can delete their own savings" ON public.savings;
CREATE POLICY "Users can delete their own savings" ON public.savings FOR DELETE USING (true);

-- 4. Loan Schemes Table
CREATE TABLE public.loan_schemes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying NOT NULL,
    default_interest_rate numeric NOT NULL,
    max_term_months integer NOT NULL,
    min_term_months integer NOT NULL,
    applicable_to text[] NOT NULL,
    repayment_frequency character varying NOT NULL,
    processing_fee_percentage numeric,
    late_payment_penalty numeric,
    offer_start_date date,
    offer_end_date date,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.loan_schemes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all loan_schemes" ON public.loan_schemes;
CREATE POLICY "Public can view all loan_schemes" ON public.loan_schemes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own loan_schemes" ON public.loan_schemes;
CREATE POLICY "Users can insert their own loan_schemes" ON public.loan_schemes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update their own loan_schemes" ON public.loan_schemes;
CREATE POLICY "Users can update their own loan_schemes" ON public.loan_schemes FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Users can delete their own loan_schemes" ON public.loan_schemes;
CREATE POLICY "Users can delete their own loan_schemes" ON public.loan_schemes FOR DELETE USING (true);

-- 5. Loans Table
CREATE TABLE public.loans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    loan_scheme_id uuid NOT NULL REFERENCES public.loan_schemes(id),
    amount numeric NOT NULL,
    interest_rate numeric NOT NULL,
    loan_term_months integer NOT NULL,
    disbursement_date date NOT NULL,
    status character varying NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all loans" ON public.loans;
CREATE POLICY "Public can view all loans" ON public.loans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own loans" ON public.loans;
CREATE POLICY "Users can insert their own loans" ON public.loans FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update their own loans" ON public.loans;
CREATE POLICY "Users can update their own loans" ON public.loans FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Users can delete their own loans" ON public.loans;
CREATE POLICY "Users can delete their own loans" ON public.loans FOR DELETE USING (true);

-- 6. Loan Repayments Table
CREATE TABLE public.loan_repayments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_id uuid NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    amount_paid numeric NOT NULL,
    payment_date date NOT NULL,
    notes text,
    principal_paid numeric NOT NULL DEFAULT 0,
    interest_paid numeric NOT NULL DEFAULT 0,
    penal_interest_paid numeric NOT NULL DEFAULT 0,
    penalty_paid numeric NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all loan_repayments" ON public.loan_repayments;
CREATE POLICY "Public can view all loan_repayments" ON public.loan_repayments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own loan_repayments" ON public.loan_repayments;
CREATE POLICY "Users can insert their own loan_repayments" ON public.loan_repayments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update their own loan_repayments" ON public.loan_repayments;
CREATE POLICY "Users can update their own loan_repayments" ON public.loan_repayments FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Users can delete their own loan_repayments" ON public.loan_repayments;
CREATE POLICY "Users can delete their own loan_repayments" ON public.loan_repayments FOR DELETE USING (true);

-- 7. Transactions Table
CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
    member_name character varying NOT NULL,
    type character varying NOT NULL,
    amount numeric NOT NULL,
    date date NOT NULL,
    status character varying NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all transactions" ON public.transactions;
CREATE POLICY "Public can view all transactions" ON public.transactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (true);
