-- Create custom ENUM types for transactions if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM (
            'Loan Repayment',
            'Savings Deposit',
            'Share Purchase',
            'Loan Disbursement',
            'Savings Withdrawal',
            'Fixed Deposit'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM (
            'Completed',
            'Pending'
        );
    END IF;
END$$;


-- Create the transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_name TEXT NOT NULL,
    type transaction_type NOT NULL,
    status transaction_status NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    join_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Clear existing data to prevent duplicate key errors on re-run
-- TRUNCATE public.transactions, public.members RESTART IDENTITY;

-- Insert sample data for transactions (only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.transactions) THEN
        INSERT INTO public.transactions (member_name, type, status, date, amount) VALUES
        ('Aarav Sharma', 'Loan Repayment', 'Completed', '2024-07-29', 15000.00),
        ('Sunita Rai', 'Savings Deposit', 'Completed', '2024-07-29', 5000.00),
        ('Bikram Thapa', 'Share Purchase', 'Completed', '2024-07-28', 10000.00),
        ('Priya Gurung', 'Loan Disbursement', 'Pending', '2024-07-28', 200000.00),
        ('Rajesh K.C.', 'Savings Withdrawal', 'Completed', '2024-07-27', 2500.00),
        ('Anita Lama', 'Fixed Deposit', 'Completed', '2024-07-27', 50000.00);
    END IF;
END$$;

-- Insert sample data for members (only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.members) THEN
        INSERT INTO public.members (name, email, phone, address, join_date) VALUES
        ('Aarav Sharma', 'aarav.sharma@example.com', '9801234567', 'Kathmandu, Nepal', '2023-01-15'),
        ('Sunita Rai', 'sunita.rai@example.com', '9802345678', 'Pokhara, Nepal', '2023-02-20'),
        ('Bikram Thapa', 'bikram.thapa@example.com', '9803456789', 'Lalitpur, Nepal', '2023-03-10'),
        ('Priya Gurung', 'priya.gurung@example.com', '9804567890', 'Bhaktapur, Nepal', '2023-04-05'),
        ('Rajesh K.C.', 'rajesh.kc@example.com', '9805678901', 'Chitwan, Nepal', '2023-05-25'),
        ('Anita Lama', 'anita.lama@example.com', '9806789012', 'Dhading, Nepal', '2023-06-18'),
        ('Hari Prasad', 'hari.prasad@example.com', '9807890123', 'Gorkha, Nepal', '2023-07-22'),
        ('Sita Devi', 'sita.devi@example.com', '9808901234', 'Kavre, Nepal', '2023-08-30'),
        ('Gopal Singh', 'gopal.singh@example.com', '9809012345', 'Nuwakot, Nepal', '2023-09-12'),
        ('Manju Bhandari', 'manju.bhandari@example.com', '9810123456', 'Sindhupalchok, Nepal', '2023-10-01');
    END IF;
END$$;


-- RLS (Row Level Security) Setup
-- It's safer to drop and recreate policies to ensure they are correctly defined.

-- Policies for 'members' table
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.members;
CREATE POLICY "Allow authenticated read access" ON public.members FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.members;
CREATE POLICY "Allow authenticated insert access" ON public.members FOR INSERT TO authenticated WITH CHECK (true);

-- Policies for 'transactions' table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.transactions;
CREATE POLICY "Allow authenticated read access" ON public.transactions FOR SELECT TO authenticated USING (true);
