-- Create members table
create table members (
  id uuid default gen_random_uuid() primary key,
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

-- Create shares table
create table shares (
    id uuid default gen_random_uuid() primary key,
    member_id uuid references members(id) not null,
    certificate_number text not null unique,
    number_of_shares integer not null,
    face_value numeric not null,
    purchase_date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create savings table
create table savings (
    id uuid default gen_random_uuid() primary key,
    member_id uuid references members(id) not null,
    amount numeric not null,
    deposit_date date not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(member_id, deposit_date) -- Assuming one daily saving entry per member per day
);

-- Create loan_schemes table
create table loan_schemes (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    default_interest_rate numeric not null,
    max_term_months integer not null,
    min_term_months integer not null,
    applicable_to text[] not null, -- e.g., {'members', 'outsiders'}
    repayment_frequency text not null, -- e.g., 'Monthly', 'Quarterly'
    processing_fee_percentage numeric,
    late_payment_penalty numeric,
    offer_start_date date,
    offer_end_date date,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create loans table
create table loans (
    id uuid default gen_random_uuid() primary key,
    member_id uuid references members(id) not null,
    loan_scheme_id uuid references loan_schemes(id) not null,
    amount numeric not null,
    interest_rate numeric not null,
    loan_term_months integer not null,
    disbursement_date date not null,
    status text not null, -- e.g., 'Pending', 'Active', 'Paid Off', 'Rejected'
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table
create table transactions (
    id uuid default gen_random_uuid() primary key,
    member_id uuid references members(id),
    member_name text,
    type text not null, -- e.g., 'Share Purchase', 'Savings Deposit', 'Loan Disbursement'
    amount numeric not null,
    date date not null,
    status text not null, -- e.g., 'Completed', 'Pending'
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- Seed initial loan schemes
insert into loan_schemes 
(name, default_interest_rate, min_term_months, max_term_months, applicable_to, repayment_frequency, processing_fee_percentage, late_payment_penalty, is_active)
values
('Members General Loan', 10.0, 6, 60, '{"members"}', 'Monthly', 1.0, 500, true),
('Personal Loan', 12.5, 12, 48, '{"members"}', 'Monthly', 1.5, 500, true),
('House Loan', 8.5, 60, 240, '{"members"}', 'Monthly', 0.75, 1000, true),
('Education Loan', 9.0, 24, 120, '{"members"}', 'Monthly', 0.5, 250, true),
('Outsiders Business Loan', 15.0, 12, 36, '{"outsiders"}', 'Quarterly', 2.0, 1500, true);

-- Enable Row Level Security
alter table members enable row level security;
alter table shares enable row level security;
alter table savings enable row level security;
alter table loans enable row level security;
alter table loan_schemes enable row level security;
alter table transactions enable row level security;

-- Create policies for authenticated users
create policy "Authenticated users can view all data." on members for select to authenticated using (true);
create policy "Authenticated users can insert members." on members for insert to authenticated with check (true);
create policy "Authenticated users can update members." on members for update to authenticated using (true);
create policy "Authenticated users can delete members." on members for delete to authenticated using (true);

create policy "Authenticated users can view all data." on shares for select to authenticated using (true);
create policy "Authenticated users can insert shares." on shares for insert to authenticated with check (true);
create policy "Authenticated users can update shares." on shares for update to authenticated using (true);
create policy "Authenticated users can delete shares." on shares for delete to authenticated using (true);

create policy "Authenticated users can view all data." on savings for select to authenticated using (true);
create policy "Authenticated users can insert savings." on savings for insert to authenticated with check (true);
create policy "Authenticated users can update savings." on savings for update to authenticated using (true);
create policy "Authenticated users can delete savings." on savings for delete to authenticated using (true);

create policy "Authenticated users can view all data." on loans for select to authenticated using (true);
create policy "Authenticated users can insert loans." on loans for insert to authenticated with check (true);
create policy "Authenticated users can update loans." on loans for update to authenticated using (true);
create policy "Authenticated users can delete loans." on loans for delete to authenticated using (true);

create policy "Authenticated users can view all data." on loan_schemes for select to authenticated using (true);
create policy "Authenticated users can insert loan_schemes." on loan_schemes for insert to authenticated with check (true);
create policy "Authenticated users can update loan_schemes." on loan_schemes for update to authenticated using (true);
create policy "Authenticated users can delete loan_schemes." on loan_schemes for delete to authenticated using (true);

create policy "Authenticated users can view all data." on transactions for select to authenticated using (true);
create policy "Authenticated users can insert transactions." on transactions for insert to authenticated with check (true);
create policy "Authenticated users can update transactions." on transactions for update to authenticated using (true);
create policy "Authenticated users can delete transactions." on transactions for delete to authenticated using (true);
