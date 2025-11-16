-- Enable pgcrypto extension for gen_random_uuid()
create extension if not exists pgcrypto with schema extensions;

-- Members Table
drop table if exists members;
create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  phone text,
  address text,
  join_date date not null default current_date,
  dob date, -- Date of Birth
  nominee_name text,
  nominee_relationship text,
  photo_url text,
  kyc_document_url text, -- URL for KYC document
  created_at timestamptz default now()
);

-- Transactions Table
drop table if exists transactions;
create table transactions (
    id uuid primary key default gen_random_uuid(),
    member_name text not null,
    type text not null,
    status text not null check (status in ('Completed', 'Pending')),
    date date not null default current_date,
    amount numeric(15, 2) not null,
    created_at timestamptz default now()
);

-- Insert sample data into members table
insert into members (name, email, phone, address, join_date, dob, nominee_name, nominee_relationship, photo_url, kyc_document_url) values
('Aarav Sharma', 'aarav.sharma@example.com', '9801234567', 'Kathmandu, Nepal', '2023-01-15', '1990-05-20', 'Priya Sharma', 'Spouse', 'https://picsum.photos/seed/1/200/200', 'https://picsum.photos/seed/101/400/300'),
('Saanvi Joshi', 'saanvi.joshi@example.com', '9812345678', 'Pokhara, Nepal', '2023-02-20', '1985-11-12', 'Rohan Joshi', 'Brother', 'https://picsum.photos/seed/2/200/200', null),
('Vivaan Thapa', 'vivaan.thapa@example.com', '9823456789', 'Lalitpur, Nepal', '2023-03-10', '1995-02-28', 'Anaya Thapa', 'Daughter', 'https://picsum.photos/seed/3/200/200', 'https://picsum.photos/seed/103/400/300'),
('Anaya Gurung', 'anaya.gurung@example.com', '9834567890', 'Bhaktapur, Nepal', '2023-04-05', '2000-08-10', 'Aarav Gurung', 'Father', 'https://picsum.photos/seed/4/200/200', null),
('Reyansh Adhikari', 'reyansh.adhikari@example.com', '9845678901', 'Kathmandu, Nepal', '2023-05-21', '1992-07-22', 'Mira Adhikari', 'Spouse', 'https://picsum.photos/seed/5/200/200', 'https://picsum.photos/seed/105/400/300');


-- Insert sample data into transactions table
insert into transactions (member_name, type, status, date, amount) values
('Aarav Sharma', 'Share Purchase', 'Completed', '2024-05-01', 50000.00),
('Saanvi Joshi', 'Savings Deposit', 'Completed', '2024-05-02', 10000.00),
('Vivaan Thapa', 'Loan Repayment', 'Completed', '2024-05-03', 15000.00),
('Anaya Gurung', 'Savings Deposit', 'Pending', '2024-05-04', 5000.00),
('Reyansh Adhikari', 'Share Purchase', 'Completed', '2024-05-05', 25000.00),
('Aarav Sharma', 'Loan Disbursement', 'Completed', '2024-05-06', 100000.00),
('Saanvi Joshi', 'Share Purchase', 'Completed', '2024-05-07', 30000.00),
('Vivaan Thapa', 'Savings Deposit', 'Completed', '2024-05-08', 20000.00),
('Anaya Gurung', 'Loan Repayment', 'Pending', '2024-05-09', 7500.00),
('Reyansh Adhikari', 'Savings Deposit', 'Completed', '2024-05-10', 12000.00);

-- Set up Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table members;
alter publication supabase_realtime add table transactions;
