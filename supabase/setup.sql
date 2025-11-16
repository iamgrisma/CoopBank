-- Create members table
CREATE TABLE if not exists members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    photo_url TEXT,
    join_date DATE NOT NULL,
    dob DATE,
    kyc_document_url TEXT,
    nominee_name VARCHAR(255),
    nominee_relationship VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shares table
CREATE TABLE if not exists shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    number_of_shares INT NOT NULL,
    face_value DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create savings table
CREATE TABLE if not exists savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    deposit_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, deposit_date) -- Prevent duplicate daily savings for the same member
);

-- Create loan_schemes table
CREATE TABLE if not exists loan_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    default_interest_rate DECIMAL(5, 2) NOT NULL,
    max_term_months INT NOT NULL,
    min_term_months INT NOT NULL,
    applicable_to TEXT[] NOT NULL, -- e.g., {'members', 'outsiders'}
    repayment_frequency VARCHAR(50) NOT NULL, -- e.g., 'Monthly', 'Quarterly'
    processing_fee_percentage DECIMAL(5, 2),
    late_payment_penalty DECIMAL(10, 2),
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate loan schemes
INSERT INTO loan_schemes (name, default_interest_rate, min_term_months, max_term_months, applicable_to, repayment_frequency, processing_fee_percentage, late_payment_penalty, is_active) VALUES
('General Member Loan', 10.5, 6, 36, '{"members"}', 'Monthly', 1.0, 500, TRUE),
('Personal Loan', 12.0, 12, 60, '{"members"}', 'Monthly', 1.5, 500, TRUE),
('House Building Loan', 9.5, 60, 240, '{"members"}', 'Monthly', 0.75, 1000, TRUE),
('Education Loan', 8.0, 24, 120, '{"members"}', 'Monthly', 0.5, 250, TRUE),
('Outsiders Business Loan', 14.0, 12, 48, '{"outsiders"}', 'Quarterly', 2.0, 1500, FALSE)
ON CONFLICT (name) DO NOTHING;


-- Create loans table
CREATE TABLE if not exists loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    loan_scheme_id UUID REFERENCES loan_schemes(id),
    amount DECIMAL(12, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    loan_term_months INT NOT NULL,
    disbursement_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Pending', 'Active', 'Paid Off', 'Rejected'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Create transactions table
CREATE TABLE if not exists transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    member_name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- e.g., 'Share Purchase', 'Savings Deposit', 'Loan Disbursement', 'Loan Repayment'
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Completed', 'Pending', 'Failed'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Enable Row Level Security (RLS) for all tables
alter table "public"."members" enable row level security;
alter table "public"."shares" enable row level security;
alter table "public"."savings" enable row level security;
alter table "public"."loans" enable row level security;
alter table "public"."loan_schemes" enable row level security;
alter table "public"."transactions" enable row level security;

-- Create policies to allow public read access for authenticated users
-- In a real production app, you'd likely have more granular, role-based policies.
create policy "Public read access for members" on public.members for select to authenticated using (true);
create policy "Public read access for shares" on public.shares for select to authenticated using (true);
create policy "Public read access for savings" on public.savings for select to authenticated using (true);
create policy "Public read access for loans" on public.loans for select to authenticated using (true);
create policy "Public read access for loan_schemes" on public.loan_schemes for select to authenticated using (true);
create policy "Public read access for transactions" on public.transactions for select to authenticated using (true);

-- Create policies to allow users to insert/update/delete their own data
-- This is a placeholder; you'll need more specific rules.
create policy "Allow all authenticated users to manage data" on public.members for all to authenticated using (true) with check (true);
create policy "Allow all authenticated users to manage shares" on public.shares for all to authenticated using (true) with check (true);
create policy "Allow all authenticated users to manage savings" on public.savings for all to authenticated using (true) with check (true);
create policy "Allow all authenticated users to manage loans" on public.loans for all to authenticated using (true) with check (true);
create policy "Allow all authenticated users to manage loan_schemes" on public.loan_schemes for all to authenticated using (true) with check (true);
create policy "Allow all authenticated users to manage transactions" on public.transactions for all to authenticated using (true) with check (true);
