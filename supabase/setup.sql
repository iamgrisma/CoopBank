-- This script can be used to set up the database schema for the application.
-- It is designed to be idempotent and can be run multiple times without causing errors.

-- Create Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name character varying,
    email character varying,
    phone character varying,
    address character varying,
    join_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    photo_url character varying,
    dob date,
    nominee_name character varying,
    nominee_relationship character varying,
    kyc_document_url character varying
);
-- Create Shares Table
CREATE TABLE IF NOT EXISTS public.shares (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    certificate_number character varying UNIQUE,
    number_of_shares integer NOT NULL,
    face_value numeric(10, 2) NOT NULL,
    purchase_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
-- Create Savings Table
CREATE TABLE IF NOT EXISTS public.savings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    amount numeric(10, 2) NOT NULL,
    deposit_date date NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Loan Schemes Table
CREATE TABLE IF NOT EXISTS public.loan_schemes (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name character varying NOT NULL UNIQUE,
    default_interest_rate numeric(5, 2) NOT NULL,
    max_term_months integer NOT NULL,
    min_term_months integer NOT NULL,
    applicable_to text[] NOT NULL, -- e.g., {'members', 'outsiders'}
    repayment_frequency character varying NOT NULL, -- e.g., 'Monthly', 'Quarterly'
    processing_fee_percentage numeric(5, 2),
    late_payment_penalty numeric(10, 2),
    offer_start_date date,
    offer_end_date date,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Loans Table
CREATE TABLE IF NOT EXISTS public.loans (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    loan_scheme_id uuid NOT NULL REFERENCES public.loan_schemes(id),
    amount numeric(12, 2) NOT NULL,
    interest_rate numeric(5, 2) NOT NULL,
    loan_term_months integer NOT NULL,
    disbursement_date date NOT NULL,
    status character varying NOT NULL, -- e.g., 'Pending', 'Active', 'Paid Off', 'Rejected'
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
    member_name character varying NOT NULL,
    type character varying NOT NULL,
    amount numeric(12, 2) NOT NULL,
    date date NOT NULL,
    status character varying NOT NULL, -- e.g., 'Completed', 'Pending'
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


-- Grant permissions
grant delete, insert, references, select, trigger, truncate, update on table public.members to service_role;
grant delete, insert, references, select, trigger, truncate, update on table public.shares to service_role;
grant delete, insert, references, select, trigger, truncate, update on table public.savings to service_role;
grant delete, insert, references, select, trigger, truncate, update on table public.loan_schemes to service_role;
grant delete, insert, references, select, trigger, truncate, update on table public.loans to service_role;
grant delete, insert, references, select, trigger, truncate, update on table public.transactions to service_role;

-- Enable Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create Policies to allow public read access for authenticated users
DROP POLICY IF EXISTS "Public read access for members" ON public.members;
CREATE POLICY "Public read access for members" ON public.members FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow all access for members" ON public.members;
CREATE POLICY "Allow all access for members" ON public.members FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read access for shares" ON public.shares;
CREATE POLICY "Public read access for shares" ON public.shares FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow all access for shares" ON public.shares;
CREATE POLICY "Allow all access for shares" ON public.shares FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read access for savings" ON public.savings;
CREATE POLICY "Public read access for savings" ON public.savings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow all access for savings" ON public.savings;
CREATE POLICY "Allow all access for savings" ON public.savings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read access for loan_schemes" ON public.loan_schemes;
CREATE POLICY "Public read access for loan_schemes" ON public.loan_schemes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow all access for loan_schemes" ON public.loan_schemes;
CREATE POLICY "Allow all access for loan_schemes" ON public.loan_schemes FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read access for loans" ON public.loans;
CREATE POLICY "Public read access for loans" ON public.loans FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow all access for loans" ON public.loans;
CREATE POLICY "Allow all access for loans" ON public.loans FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read access for transactions" ON public.transactions;
CREATE POLICY "Public read access for transactions" ON public.transactions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow all access for transactions" ON public.transactions;
CREATE POLICY "Allow all access for transactions" ON public.transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
