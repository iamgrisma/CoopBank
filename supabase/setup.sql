--
-- Create the 'members' table
--
CREATE TABLE IF NOT EXISTS public.members (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name character varying,
    email character varying,
    phone character varying,
    address text,
    join_date date,
    dob date,
    nominee_name character varying,
    nominee_relationship character varying,
    photo_url text,
    kyc_document_url text,
    created_at timestamp with time zone DEFAULT now()
);

--
-- Enable RLS for 'members' table
--
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

--
-- Drop existing policies for 'members' if they exist
--
DROP POLICY IF EXISTS "Public can view all members" ON public.members;
DROP POLICY IF EXISTS "Public can manage members" ON public.members;

--
-- Create policies for 'members' table
--
CREATE POLICY "Public can view all members" ON public.members FOR SELECT TO public USING (true);
CREATE POLICY "Public can manage members" ON public.members FOR ALL TO public USING (true) WITH CHECK (true);


--
-- Create the 'loan_schemes' table
--
CREATE TABLE IF NOT EXISTS public.loan_schemes (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name character varying NOT NULL,
    default_interest_rate real NOT NULL,
    min_term_months integer NOT NULL,
    max_term_months integer NOT NULL,
    applicable_to text[] NOT NULL,
    repayment_frequency character varying,
    processing_fee_percentage real,
    late_payment_penalty real,
    offer_start_date date,
    offer_end_date date,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

--
-- Enable RLS for 'loan_schemes' table
--
ALTER TABLE public.loan_schemes ENABLE ROW LEVEL SECURITY;

--
-- Drop existing policies for 'loan_schemes' if they exist
--
DROP POLICY IF EXISTS "Public can view all loan schemes" ON public.loan_schemes;
DROP POLICY IF EXISTS "Public can manage loan schemes" ON public.loan_schemes;

--
-- Create policies for 'loan_schemes' table
--
CREATE POLICY "Public can view all loan schemes" ON public.loan_schemes FOR SELECT TO public USING (true);
CREATE POLICY "Public can manage loan schemes" ON public.loan_schemes FOR ALL TO public USING (true) WITH CHECK (true);


--
-- Create the 'loans' table
--
CREATE TABLE IF NOT EXISTS public.loans (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    member_id uuid REFERENCES public.members(id),
    loan_scheme_id uuid REFERENCES public.loan_schemes(id),
    amount real NOT NULL,
    interest_rate real NOT NULL,
    loan_term_months integer NOT NULL,
    disbursement_date date NOT NULL,
    status character varying,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

--
-- Enable RLS for 'loans' table
--
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

--
-- Drop existing policies for 'loans' if they exist
--
DROP POLICY IF EXISTS "Public can view all loans" ON public.loans;
DROP POLICY IF EXISTS "Public can manage loans" ON public.loans;

--
-- Create policies for 'loans' table
--
CREATE POLICY "Public can view all loans" ON public.loans FOR SELECT TO public USING (true);
CREATE POLICY "Public can manage loans" ON public.loans FOR ALL TO public USING (true) WITH CHECK (true);


--
-- Create the 'shares' table
--
CREATE TABLE IF NOT EXISTS public.shares (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    member_id uuid REFERENCES public.members(id),
    certificate_number character varying UNIQUE,
    number_of_shares integer,
    face_value real,
    purchase_date date,
    created_at timestamp with time zone DEFAULT now()
);

--
-- Enable RLS for 'shares' table
--
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

--
-- Drop existing policies for 'shares' if they exist
--
DROP POLICY IF EXISTS "Public can view all shares" ON public.shares;
DROP POLICY IF EXISTS "Public can manage shares" ON public.shares;


--
-- Create policies for 'shares' table
--
CREATE POLICY "Public can view all shares" ON public.shares FOR SELECT TO public USING (true);
CREATE POLICY "Public can manage shares" ON public.shares FOR ALL TO public USING (true) WITH CHECK (true);


--
-- Create the 'savings' table
--
CREATE TABLE IF NOT EXISTS public.savings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    member_id uuid REFERENCES public.members(id),
    amount real NOT NULL,
    deposit_date date NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

--
-- Enable RLS for 'savings' table
--
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;

--
-- Drop existing policies for 'savings' if they exist
--
DROP POLICY IF EXISTS "Public can view all savings" ON public.savings;
DROP POLICY IF EXISTS "Public can manage savings" ON public.savings;

--
-- Create policies for 'savings' table
--
CREATE POLICY "Public can view all savings" ON public.savings FOR SELECT TO public USING (true);
CREATE POLICY "Public can manage savings" ON public.savings FOR ALL TO public USING (true) WITH CHECK (true);


--
-- Create the 'transactions' table
--
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    member_id uuid REFERENCES public.members(id),
    member_name character varying NOT NULL,
    type character varying NOT NULL,
    amount real NOT NULL,
    date date NOT NULL,
    status character varying,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

--
-- Enable RLS for 'transactions' table
--
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--
-- Drop existing policies for 'transactions' if they exist
--
DROP POLICY IF EXISTS "Public can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Public can manage transactions" ON public.transactions;


--
-- Create policies for 'transactions' table
--
CREATE POLICY "Public can view all transactions" ON public.transactions FOR SELECT TO public USING (true);
CREATE POLICY "Public can manage transactions" ON public.transactions FOR ALL TO public USING (true) WITH CHECK (true);
