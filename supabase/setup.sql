-- Create Members table
CREATE TABLE IF NOT EXISTS public.members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name character varying,
    email character varying,
    phone character varying,
    address text,
    photo_url text,
    join_date date NOT NULL,
    dob date,
    kyc_document_url text,
    nominee_name character varying,
    nominee_relationship character varying,
    CONSTRAINT members_email_key UNIQUE (email),
    CONSTRAINT members_phone_key UNIQUE (phone),
    CONSTRAINT members_pkey PRIMARY KEY (id)
);

-- Create Loan Schemes table
CREATE TABLE IF NOT EXISTS public.loan_schemes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    default_interest_rate numeric(5, 2) NOT NULL,
    max_term_months integer NOT NULL,
    min_term_months integer NOT NULL,
    applicable_to text[] NOT NULL,
    repayment_frequency character varying NOT NULL,
    processing_fee_percentage numeric(5, 2),
    late_payment_penalty numeric(10, 2),
    offer_start_date date,
    offer_end_date date,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT loan_schemes_pkey PRIMARY KEY (id)
);

-- Create Saving Schemes table
CREATE TABLE IF NOT EXISTS public.saving_schemes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    interest_rate numeric(5, 2) DEFAULT 0.00 NOT NULL,
    type character varying DEFAULT 'Daily'::character varying NOT NULL,
    lock_in_period_years integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT saving_schemes_pkey PRIMARY KEY (id)
);

-- Create Shares table
CREATE TABLE IF NOT EXISTS public.shares (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    member_id uuid NOT NULL,
    certificate_number character varying NOT NULL,
    number_of_shares integer NOT NULL,
    face_value numeric(10, 2) NOT NULL,
    purchase_date date NOT NULL,
    CONSTRAINT shares_certificate_number_key UNIQUE (certificate_number),
    CONSTRAINT shares_pkey PRIMARY KEY (id),
    CONSTRAINT shares_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE
);

-- Create Loans table
CREATE TABLE IF NOT EXISTS public.loans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    member_id uuid NOT NULL,
    loan_scheme_id uuid NOT NULL,
    amount numeric(15, 2) NOT NULL,
    interest_rate numeric(5, 2) NOT NULL,
    loan_term_months integer NOT NULL,
    disbursement_date date NOT NULL,
    status character varying DEFAULT 'Pending'::character varying NOT NULL,
    description text,
    CONSTRAINT loans_pkey PRIMARY KEY (id),
    CONSTRAINT loans_loan_scheme_id_fkey FOREIGN KEY (loan_scheme_id) REFERENCES public.loan_schemes(id),
    CONSTRAINT loans_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE
);

-- Create Loan Repayments table
CREATE TABLE IF NOT EXISTS public.loan_repayments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    loan_id uuid NOT NULL,
    payment_date date NOT NULL,
    amount_paid numeric(15, 2) NOT NULL,
    principal_paid numeric(15, 2) DEFAULT 0 NOT NULL,
    interest_paid numeric(15, 2) DEFAULT 0 NOT NULL,
    penalty_paid numeric(15, 2) DEFAULT 0 NOT NULL,
    penal_interest_paid numeric(15,2) DEFAULT 0 NOT NULL,
    notes text,
    CONSTRAINT loan_repayments_pkey PRIMARY KEY (id),
    CONSTRAINT loan_repayments_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE
);

-- Create Savings table
CREATE TABLE IF NOT EXISTS public.savings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    member_id uuid NOT NULL,
    amount numeric(15, 2) NOT NULL,
    deposit_date date NOT NULL,
    CONSTRAINT savings_pkey PRIMARY KEY (id),
    CONSTRAINT savings_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE
);

-- Add columns and constraints to Savings table if they don't exist
ALTER TABLE public.savings ADD COLUMN IF NOT EXISTS saving_scheme_id uuid;
ALTER TABLE public.savings ADD COLUMN IF NOT EXISTS notes text;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'savings' AND constraint_name = 'savings_saving_scheme_id_fkey'
    ) THEN
        ALTER TABLE public.savings 
        ADD CONSTRAINT savings_saving_scheme_id_fkey 
        FOREIGN KEY (saving_scheme_id) REFERENCES public.saving_schemes(id);
    END IF;
END;
$$;


-- Create Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    member_id uuid,
    member_name character varying,
    type character varying NOT NULL,
    amount numeric(15, 2) NOT NULL,
    date date NOT NULL,
    status character varying NOT NULL,
    description text,
    CONSTRAINT transactions_pkey PRIMARY KEY (id),
    CONSTRAINT transactions_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE SET NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saving_schemes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones
DROP POLICY IF EXISTS "Public can view all members" ON public.members;
DROP POLICY IF EXISTS "Public can view all shares" ON public.shares;
DROP POLICY IF EXISTS "Public can view all loans" ON public.loans;
DROP POLICY IF EXISTS "Public can view all loan repayments" ON public.loan_repayments;
DROP POLICY IF EXISTS "Public can view all savings" ON public.savings;
DROP POLICY IF EXISTS "Public can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Public can view all loan schemes" ON public.loan_schemes;
DROP POLICY IF EXISTS "Public can view all saving schemes" ON public.saving_schemes;

-- Policies for public access (for now, allow all access)
CREATE POLICY "Public can view all members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Public can view all shares" ON public.shares FOR SELECT USING (true);
CREATE POLICY "Public can view all loans" ON public.loans FOR SELECT USING (true);
CREATE POLICY "Public can view all loan repayments" ON public.loan_repayments FOR SELECT USING (true);
CREATE POLICY "Public can view all savings" ON public.savings FOR SELECT USING (true);
CREATE POLICY "Public can view all transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Public can view all loan schemes" ON public.loan_schemes FOR SELECT USING (true);
CREATE POLICY "Public can view all saving schemes" ON public.saving_schemes FOR SELECT USING (true);

-- Policies for data modification (for now, allow all access)
DROP POLICY IF EXISTS "Public can insert any data" ON public.members;
DROP POLICY IF EXISTS "Public can insert any data" ON public.shares;
DROP POLICY IF EXISTS "Public can insert any data" ON public.loans;
DROP POLICY IF EXISTS "Public can insert any data" ON public.loan_repayments;
DROP POLICY IF EXISTS "Public can insert any data" ON public.savings;
DROP POLICY IF EXISTS "Public can insert any data" ON public.transactions;
DROP POLICY IF EXISTS "Public can insert any data" ON public.loan_schemes;
DROPPOLICY IF EXISTS "Public can insert any data" ON public.saving_schemes;
DROP POLICY IF EXISTS "Public can update any data" ON public.members;
DROP POLICY IF EXISTS "Public can delete any data" ON public.members;

CREATE POLICY "Public can insert any data" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert any data" ON public.shares FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert any data" ON public.loans FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert any data" ON public.loan_repayments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert any data" ON public.savings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert any data" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert any data" ON public.loan_schemes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert any data" ON public.saving_schemes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update any data" ON public.members FOR UPDATE USING (true);
CREATE POLICY "Public can delete any data" ON public.members FOR DELETE USING (true);
