-- Create the members table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    join_date DATE NOT NULL,
    dob DATE,
    photo_url TEXT,
    kyc_document_url TEXT,
    nominee_name VARCHAR(255),
    nominee_relationship VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    member_name VARCHAR(255), -- Denormalized for easy display
    type VARCHAR(50) NOT NULL, -- e.g., 'Share Purchase', 'Loan Repayment', 'Savings Deposit'
    amount DECIMAL(15, 2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Completed', -- e.g., 'Completed', 'Pending', 'Failed'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for members table
CREATE TRIGGER set_timestamp_members
BEFORE UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies for members table
-- Allow authenticated users to view all members
CREATE POLICY "Allow authenticated users to view all members"
ON members
FOR SELECT
TO authenticated
USING (true);

-- Allow users to insert new members
CREATE POLICY "Allow authenticated users to insert new members"
ON members
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update their own member info (future use)
CREATE POLICY "Allow users to update their own info"
ON members
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policies for transactions table
-- Allow authenticated users to view all transactions
CREATE POLICY "Allow authenticated users to view all transactions"
ON transactions
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert transactions
CREATE POLICY "Allow authenticated users to insert transactions"
ON transactions
FOR INSERT
TO authenticated
WITH CHECK (true);


-- Insert some sample members
INSERT INTO members (name, email, phone, address, join_date, dob) VALUES
('Grisma Pokharel', 'iamgrisma@gmail.com', '9841234567', 'Kathmandu, Nepal', '2023-01-15', '1990-05-20'),
('Sunil Thapa', 'sunil.thapa@example.com', '9851098765', 'Pokhara, Nepal', '2023-02-20', '1988-11-30'),
('Priya Gurung', 'priya.gurung@example.com', '9803456789', 'Butwal, Nepal', '2023-03-10', '1995-02-10');

-- Insert some sample transactions
INSERT INTO transactions (member_id, member_name, type, amount, date, status) VALUES
((SELECT id FROM members WHERE email = 'iamgrisma@gmail.com'), 'Grisma Pokharel', 'Savings Deposit', 5000.00, '2024-05-01', 'Completed'),
((SELECT id FROM members WHERE email = 'sunil.thapa@example.com'), 'Sunil Thapa', 'Share Purchase', 10000.00, '2024-05-03', 'Completed'),
((SELECT id FROM members WHERE email = 'priya.gurung@example.com'), 'Priya Gurung', 'Loan Repayment', 2500.00, '2024-05-05', 'Pending'),
((SELECT id FROM members WHERE email = 'iamgrisma@gmail.com'), 'Grisma Pokharel', 'Share Purchase', 2000.00, '2024-05-10', 'Completed');
