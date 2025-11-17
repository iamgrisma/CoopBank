-- Initial schema for CoopBank

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Members table
CREATE TABLE IF NOT EXISTS public.members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name character varying,
    email character varying,
    phone character varying,
    address text,
    join_date date NOT NULL,
    photo_url text,
    dob date,
    kyc_document_url text,
    nominee_name character varying,
    nominee_relationship character varying,
    is_active boolean DEFAULT true,
    account_number character varying NOT NULL,
    district_code character varying(2) DEFAULT '01'::character varying NOT NULL,
    local_level_code character varying(2) DEFAULT '01'::character varying NOT NULL,
    province_code character varying(1) DEFAULT '1'::character varying NOT NULL
);

ALTER TABLE public.members ADD PRIMARY KEY (id);
ALTER TABLE public.members ADD CONSTRAINT members_account_number_key UNIQUE (account_number);


-- 3. Shares table
CREATE TABLE IF NOT EXISTS public.shares (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    member_id uuid NOT NULL,
    certificate_number character varying NOT NULL,
    number_of_shares integer NOT NULL,
    face_value numeric(10,2) NOT NULL,
    purchase_date date NOT NULL
);

ALTER TABLE public.shares ADD PRIMARY KEY (id);
ALTER TABLE public.shares ADD CONSTRAINT shares_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;
ALTER TABLE public.shares ADD CONSTRAINT shares_certificate_number_key UNIQUE (certificate_number);

-- 4. Saving Schemes table
CREATE TABLE IF NOT EXISTS public.saving_schemes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    interest_rate numeric(5, 2) DEFAULT 0.00 NOT NULL,
    type character varying DEFAULT 'Daily'::character varying NOT NULL,
    lock_in_period_years integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.saving_schemes ADD PRIMARY KEY (id);

-- Insert a default saving scheme
INSERT INTO public.saving_schemes (id, name, interest_rate, type)
VALUES ('00000000-0000-0000-0000-000000000001', 'General Savings', 4.5, 'Daily')
ON CONFLICT (id) DO NOTHING;


-- 5. Savings table
CREATE TABLE IF NOT EXISTS public.savings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    member_id uuid NOT NULL,
    amount numeric(15,2) NOT NULL,
    deposit_date date NOT NULL,
    saving_scheme_id uuid NOT NULL,
    notes text
);

ALTER TABLE public.savings ADD PRIMARY KEY (id);
ALTER TABLE public.savings ADD CONSTRAINT savings_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;
ALTER TABLE public.savings ADD CONSTRAINT savings_saving_scheme_id_fkey FOREIGN KEY (saving_scheme_id) REFERENCES public.saving_schemes(id);

-- Make sure existing savings have a default scheme
UPDATE public.savings SET saving_scheme_id = '00000000-0000-0000-0000-000000000001' WHERE saving_scheme_id IS NULL;


-- 6. Loan Schemes table
CREATE TABLE IF NOT EXISTS public.loan_schemes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    default_interest_rate numeric(5, 2) NOT NULL,
    max_term_months integer NOT NULL,
    min_term_months integer,
    repayment_frequency character varying,
    processing_fee_percentage numeric(5, 2),
    late_payment_penalty numeric(10, 2),
    offer_start_date date,
    offer_end_date date,
    is_active boolean DEFAULT true,
    applicable_to text[],
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.loan_schemes ADD PRIMARY KEY (id);


-- 7. Loans table
CREATE TABLE IF NOT EXISTS public.loans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    member_id uuid NOT NULL,
    loan_scheme_id uuid NOT NULL,
    amount numeric(15,2) NOT NULL,
    interest_rate numeric(5,2) NOT NULL,
    loan_term_months integer NOT NULL,
    disbursement_date date NOT NULL,
    status character varying NOT NULL,
    description text
);

ALTER TABLE public.loans ADD PRIMARY KEY (id);
ALTER TABLE public.loans ADD CONSTRAINT loans_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;
ALTER TABLE public.loans ADD CONSTRAINT loans_loan_scheme_id_fkey FOREIGN KEY (loan_scheme_id) REFERENCES public.loan_schemes(id);


-- 8. Loan Repayments table
CREATE TABLE IF NOT EXISTS public.loan_repayments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    loan_id uuid NOT NULL,
    payment_date date NOT NULL,
    amount_paid numeric(15,2) NOT NULL,
    principal_paid numeric(15,2) DEFAULT 0 NOT NULL,
    interest_paid numeric(15,2) DEFAULT 0 NOT NULL,
    penal_interest_paid numeric(15,2) DEFAULT 0 NOT NULL,
    penalty_paid numeric(15,2) DEFAULT 0 NOT NULL,
    notes text
);

ALTER TABLE public.loan_repayments ADD PRIMARY KEY (id);
ALTER TABLE public.loan_repayments ADD CONSTRAINT loan_repayments_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE;


-- 9. Transactions table (for general ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    member_id uuid,
    member_name character varying,
    type character varying NOT NULL,
    amount numeric(15,2) NOT NULL,
    date date NOT NULL,
    status character varying,
    description text
);

ALTER TABLE public.transactions ADD PRIMARY KEY (id);
ALTER TABLE public.transactions ADD CONSTRAINT transactions_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE SET NULL;
