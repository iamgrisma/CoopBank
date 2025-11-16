-- Initial schema for CoopBank

-- Enable pgcrypto extension for UUIDs
create extension if not exists pgcrypto with schema extensions;

-- Members table
create table if not exists public.members (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text unique,
    phone text,
    address text,
    join_date date not null,
    dob date,
    photo_url text,
    kyc_document_url text,
    nominee_name text,
    nominee_relationship text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.members is 'Stores information about each member of the cooperative.';

-- Shares table
create table if not exists public.shares (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.members(id) on delete cascade,
    certificate_number text not null unique,
    number_of_shares integer not null check (number_of_shares > 0),
    face_value numeric not null check (face_value > 0),
    purchase_date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.shares is 'Stores share purchase records for each member.';

-- Savings table
create table if not exists public.savings (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.members(id) on delete cascade,
    amount numeric not null check (amount > 0),
    deposit_date date not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(member_id, deposit_date)
);
comment on table public.savings is 'Stores daily savings deposits for each member.';

-- Loan Schemes table
create table if not exists public.loan_schemes (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    description text,
    default_interest_rate numeric not null,
    max_term_months integer not null
);
comment on table public.loan_schemes is 'Defines the different types of loans available.';

-- Loans table
create table if not exists public.loans (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.members(id) on delete cascade,
    loan_scheme_id uuid not null references public.loan_schemes(id),
    amount numeric not null,
    interest_rate numeric not null,
    loan_term_months integer not null,
    disbursement_date date not null,
    status text not null, -- e.g., 'Pending', 'Active', 'Paid Off', 'Rejected'
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.loans is 'Stores individual loan account information.';

-- Transactions table
create table if not exists public.transactions (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.members(id) on delete cascade,
    member_name text,
    type text not null, -- e.g., 'Share Purchase', 'Savings Deposit', 'Loan Disbursement', 'Loan Repayment'
    amount numeric not null,
    date date not null,
    status text not null, -- e.g. 'Completed', 'Pending'
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.transactions is 'A log of all financial transactions.';

-- Pre-populate loan schemes
insert into public.loan_schemes (name, description, default_interest_rate, max_term_months)
values
    ('General Loan', 'A general purpose loan for members.', 12.5, 24),
    ('Personal Loan', 'For personal expenses like marriage, travel, etc.', 14.0, 36),
    ('House Loan', 'For purchasing or constructing a house.', 10.0, 180),
    ('Education Loan', 'For financing higher education.', 9.5, 120),
    ('Outsiders Loan', 'A special loan category for non-members, if applicable.', 16.0, 12)
on conflict (name) do nothing;
