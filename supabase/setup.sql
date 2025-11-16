-- Create members table
CREATE TABLE if not exists members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    join_date DATE NOT NULL,
    dob DATE,
    nominee_name VARCHAR(255),
    nominee_relationship VARCHAR(100),
    photo_url TEXT,
    kyc_document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shares table
CREATE TABLE if not exists shares (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid REFERENCES members(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    number_of_shares INT NOT NULL,
    face_value NUMERIC(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create savings table
CREATE TABLE if not exists savings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid REFERENCES members(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    deposit_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, deposit_date)
);

-- Create loan_schemes table
CREATE TABLE if not exists loan_schemes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    default_interest_rate NUMERIC(5, 2) NOT NULL,
    min_term_months INT,
    max_term_months INT,
    applicable_to TEXT[], -- e.g., {'members', 'outsiders'}
    repayment_frequency VARCHAR(50),
    processing_fee_percentage NUMERIC(5, 2),
    late_payment_penalty NUMERIC(10, 2),
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create loans table
CREATE TABLE if not exists loans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid REFERENCES members(id) ON DELETE CASCADE,
    loan_scheme_id uuid REFERENCES loan_schemes(id),
    amount NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    loan_term_months INT NOT NULL,
    disbursement_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE if not exists transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid REFERENCES members(id) ON DELETE SET NULL,
    member_name VARCHAR(255),
    type VARCHAR(100) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
-- Enable RLS for all tables
alter table members enable row level security;
alter table shares enable row level security;
alter table savings enable row level security;
alter table loan_schemes enable row level security;
alter table loans enable row level security;
alter table transactions enable row level security;

-- Create policies to allow public read and authenticated write access
drop policy if exists "Public access for members" on members;
create policy "Public access for members" on members for all using (true);

drop policy if exists "Public access for shares" on shares;
create policy "Public access for shares" on shares for all using (true);

drop policy if exists "Public access for savings" on savings;
create policy "Public access for savings" on savings for all using (true);

drop policy if exists "Public access for loan_schemes" on loan_schemes;
create policy "Public access for loan_schemes" on loan_schemes for all using (true);

drop policy if exists "Public access for loans" on loans;
create policy "Public access for loans" on loans for all using (true);

drop policy if exists "Public access for transactions" on transactions;
create policy "Public access for transactions" on transactions for all using (true);

-- Seed initial loan schemes
INSERT INTO loan_schemes (name, default_interest_rate, min_term_months, max_term_months, applicable_to, repayment_frequency, processing_fee_percentage, late_payment_penalty, is_active)
VALUES 
    ('Personal Loan', 14.5, 12, 60, '{"members"}', 'Monthly', 1.0, 500, true),
    ('Business Loan', 13.0, 24, 120, '{"members"}', 'Monthly', 1.5, 1000, true),
    ('Emergency Loan', 16.0, 6, 24, '{"members", "outsiders"}', 'One-Time', 0.5, 250, true)
ON CONFLICT (name) DO NOTHING;
