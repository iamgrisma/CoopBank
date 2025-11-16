-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    join_date DATE NOT NULL,
    photo_url TEXT,
    dob DATE,
    nominee_name TEXT,
    nominee_relationship TEXT,
    kyc_document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    member_name TEXT, -- denormalized for easy display
    type TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Completed', 'Pending')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create shares table
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    certificate_number TEXT NOT NULL UNIQUE,
    number_of_shares INT NOT NULL,
    face_value NUMERIC(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_transactions_member_id ON transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_shares_member_id ON shares(member_id);


-- Function to insert a sample member and return their id
CREATE OR REPLACE FUNCTION insert_sample_member(
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    join_date DATE,
    dob DATE
) RETURNS UUID AS $$
DECLARE
    member_id UUID;
BEGIN
    INSERT INTO members (name, email, phone, address, join_date, dob)
    VALUES (name, email, phone, address, join_date, dob)
    RETURNING id INTO member_id;
    RETURN member_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add sample transactions for a member
CREATE OR REPLACE PROCEDURE add_sample_transactions(
    member_id UUID,
    member_name TEXT
) AS $$
BEGIN
    INSERT INTO transactions (member_id, member_name, type, amount, date, status)
    VALUES
        (member_id, member_name, 'Share Purchase', 5000.00, CURRENT_DATE - INTERVAL '90 days', 'Completed'),
        (member_id, member_name, 'Savings Deposit', 10000.00, CURRENT_DATE - INTERVAL '60 days', 'Completed'),
        (member_id, member_name, 'Loan Disbursement', 50000.00, CURRENT_DATE - INTERVAL '30 days', 'Completed'),
        (member_id, member_name, 'Loan Repayment', 2500.00, CURRENT_DATE, 'Pending');
END;
$$ LANGUAGE plpgsql;

-- Function to add sample shares for a member
CREATE OR REPLACE PROCEDURE add_sample_shares(
    member_id UUID
) AS $$
BEGIN
    INSERT INTO shares (member_id, certificate_number, number_of_shares, face_value, purchase_date)
    VALUES
        (member_id, 'CERT-001-' || substr(member_id::text, 1, 4), 50, 100.00, CURRENT_DATE - INTERVAL '1 year'),
        (member_id, 'CERT-002-' || substr(member_id::text, 1, 4), 25, 100.00, CURRENT_DATE - INTERVAL '6 months');
END;
$$ LANGUAGE plpgsql;


-- Seed data
DO $$
DECLARE
    -- Member 1: Grisma Pokharel
    member1_id UUID;

    -- Member 2: Anjali Sharma
    member2_id UUID;

    -- Member 3: Bikram Rai
    member3_id UUID;
    
    -- Member 4: Sunita Lama
    member4_id UUID;

BEGIN
    -- Clear existing data to prevent duplicates
    TRUNCATE members, transactions, shares RESTART IDENTITY CASCADE;

    -- Insert members and get their IDs
    member1_id := insert_sample_member('Grisma Pokharel', 'iamgrisma@gmail.com', '9841234567', 'Kathmandu, Nepal', '2022-01-15', '1990-05-20');
    member2_id := insert_sample_member('Anjali Sharma', 'anjali.sharma@example.com', '9808765432', 'Pokhara, Nepal', '2022-03-22', '1992-08-10');
    member3_id := insert_sample_member('Bikram Rai', 'bikram.rai@example.com', '9860123456', 'Dharan, Nepal', '2023-07-10', '1988-11-25');
    member4_id := insert_sample_member('Sunita Lama', 'sunita.lama@example.com', '9818987654', 'Bhaktapur, Nepal', '2023-11-01', '1995-02-28');

    -- Add transactions for members
    CALL add_sample_transactions(member1_id, 'Grisma Pokharel');
    CALL add_sample_transactions(member2_id, 'Anjali Sharma');
    CALL add_sample_transactions(member3_id, 'Bikram Rai');

    -- Add shares for members
    CALL add_sample_shares(member1_id);
    CALL add_sample_shares(member2_id);
    CALL add_sample_shares(member3_id);
    CALL add_sample_shares(member4_id);

END $$;
