-- Enable Row Level Security
ALTER TABLE supabase_migrations.schema_migrations ENABLE ROW LEVEL SECURITY;

-- create members table
CREATE TABLE IF NOT EXISTS public.members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
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
    CONSTRAINT members_pkey PRIMARY KEY (id)
);
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- create shares table
CREATE TABLE IF NOT EXISTS public.shares (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    member_id uuid NOT NULL,
    certificate_number character varying NOT NULL,
    number_of_shares integer NOT NULL,
    face_value numeric NOT NULL,
    purchase_date date NOT NULL,
    CONSTRAINT shares_pkey PRIMARY KEY (id),
    CONSTRAINT shares_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members (id) ON DELETE CASCADE
);
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;


-- create savings table
CREATE TABLE IF NOT EXISTS public.savings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    member_id uuid NOT NULL,
    amount numeric NOT NULL,
    deposit_date date NOT NULL,
    notes text,
    CONSTRAINT savings_pkey PRIMARY KEY (id),
    CONSTRAINT savings_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members (id) ON DELETE CASCADE
);
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;

-- create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    member_id uuid,
    member_name character varying,
    "type" character varying,
    amount numeric,
    date date,
    status character varying,
    description text,
    CONSTRAINT transactions_pkey PRIMARY KEY (id),
    CONSTRAINT transactions_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members (id) ON DELETE SET NULL
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Enable read access for all users" ON public.members FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.members FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for all users" ON public.shares FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.shares FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.savings FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.savings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.transactions FOR INSERT TO authenticated WITH CHECK (true);
