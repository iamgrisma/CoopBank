-- supabase/setup.sql

-- Enable the pgcrypto extension if it's not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the members table if it doesn't exist
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    join_date DATE NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add columns to members table if they don't exist
-- This ensures that older versions of the table get updated correctly
ALTER TABLE members ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT 'Default Name';
ALTER TABLE members ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS nominee_name VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS nominee_relationship VARCHAR(100);
ALTER TABLE members ADD COLUMN IF NOT EXISTS kyc_document_url TEXT;

-- Create a custom type for transaction status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM ('Completed', 'Pending');
    END IF;
END$$;


-- Create the transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    member_name VARCHAR(255),
    type VARCHAR(100),
    amount NUMERIC(15, 2) NOT NULL,
    date DATE NOT NULL,
    status transaction_status DEFAULT 'Completed',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the shares table if it doesn't exist
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    number_of_shares INT NOT NULL,
    face_value NUMERIC(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed data for members
-- Using ON CONFLICT DO NOTHING to prevent errors on re-running the script
INSERT INTO members (id, name, email, phone, address, join_date, photo_url, dob, nominee_name, nominee_relationship) VALUES
('4b5c0c7a-9c3e-4d5a-8b1a-2e3f4c5d6e7f', 'Aarav Sharma', 'aarav.sharma@example.com', '9801234567', 'Kathmandu, Nepal', '2022-01-15', 'https://picsum.photos/seed/1/200/200', '1990-05-20', 'Priya Sharma', 'Spouse'),
('f4b3c2d1-e0a9-4b8c-8a7d-6f5e4d3c2b1a', 'Grisma Pokharel', 'iamgrisma@gmail.com', '9802345678', 'Pokhara, Nepal', '2022-03-22', 'https://picsum.photos/seed/2/200/200', '1992-08-12', 'Suman Pokharel', 'Brother'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Rohan Thapa', 'rohan.thapa@example.com', '9803456789', 'Lalitpur, Nepal', '2022-06-10', 'https://picsum.photos/seed/3/200/200', '1985-11-30', 'Anjali Thapa', 'Daughter'),
('123e4567-e89b-12d3-a456-426614174000', 'Sunita Gurung', 'sunita.gurung@example.com', '9804567890', 'Bhaktapur, Nepal', '2023-02-28', 'https://picsum.photos/seed/4/200/200', '1995-02-14', 'Bikash Gurung', 'Husband'),
('234e5678-f90c-23d4-b567-537725285111', 'Nabin Lama', 'nabin.lama@example.com', '9805678901', 'Dhulikhel, Nepal', '2023-05-18', 'https://picsum.photos/seed/5/200/200', '1998-07-22', 'Sabina Lama', 'Sister')
ON CONFLICT (id) DO NOTHING;

-- Seed data for transactions
INSERT INTO transactions (id, member_id, member_name, type, amount, date, status) VALUES
('c7d8e9f0-a1b2-4c3d-8e9f-0a1b2c3d4e5f', '4b5c0c7a-9c3e-4d5a-8b1a-2e3f4c5d6e7f', 'Aarav Sharma', 'Share Purchase', 5000.00, '2023-01-15', 'Completed'),
('d8e9f0a1-b2c3-4d5e-9f0a-1b2c3d4e5f6a', 'f4b3c2d1-e0a9-4b8c-8a7d-6f5e4d3c2b1a', 'Grisma Pokharel', 'Share Purchase', 10000.00, '2023-03-22', 'Completed'),
('e9f0a1b2-c3d4-5e6f-0a1b-2c3d4e5f6a7b', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Rohan Thapa', 'Loan Repayment', 2500.00, '2023-06-10', 'Completed'),
('f0a1b2c3-d4e5-6f7a-1b2c-3d4e5f6a7b8c', '123e4567-e89b-12d3-a456-426614174000', 'Sunita Gurung', 'Savings Deposit', 20000.00, '2023-02-28', 'Completed'),
('0a1b2c3d-4e5f-7a8b-2c3d-4e5f6a7b8c9d', '234e5678-f90c-23d4-b567-537725285111', 'Nabin Lama', 'Share Purchase', 7500.00, '2023-05-18', 'Completed'),
('b1c2d3e4-f5a6-8b9c-3d4e-5f6a7b8c9d0e', '4b5c0c7a-9c3e-4d5a-8b1a-2e3f4c5d6e7f', 'Aarav Sharma', 'Savings Deposit', 15000.00, '2023-07-01', 'Completed'),
('c2d3e4f5-a6b7-9c0d-4e5f-6a7b8c9d0e1f', 'f4b3c2d1-e0a9-4b8c-8a7d-6f5e4d3c2b1a', 'Grisma Pokharel', 'Loan Disbursement', 50000.00, '2023-08-15', 'Pending'),
('d3e4f5a6-b7c8-0d1e-5f6a-7b8c9d0e1f2a', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Rohan Thapa', 'Share Purchase', 3000.00, '2023-09-05', 'Completed'),
('e4f5a6b7-c8d9-1e2f-6a7b-8c9d0e1f2a3b', '123e4567-e89b-12d3-a456-426614174000', 'Sunita Gurung', 'Savings Withdrawal', 5000.00, '2023-10-20', 'Completed'),
('f5a6b7c8-d9e0-2f3a-7b8c-9d0e1f2a3b4c', '234e5678-f90c-23d4-b567-537725285111', 'Nabin Lama', 'Loan Repayment', 1200.00, '2023-11-30', 'Completed')
ON CONFLICT (id) DO NOTHING;

-- Seed data for shares
INSERT INTO shares (id, member_id, certificate_number, number_of_shares, face_value, purchase_date) VALUES
('a01', '4b5c0c7a-9c3e-4d5a-8b1a-2e3f4c5d6e7f', 'SH-001', 50, 100.00, '2022-01-15'),
('a02', 'f4b3c2d1-e0a9-4b8c-8a7d-6f5e4d3c2b1a', 'SH-002', 100, 100.00, '2022-03-22'),
('a03', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'SH-003', 75, 100.00, '2022-06-10'),
('a04', '123e4567-e89b-12d3-a456-426614174000', 'SH-004', 120, 100.00, '2023-02-28'),
('a05', '234e5678-f90c-23d4-b567-537725285111', 'SH-005', 80, 100.00, '2023-05-18')
ON CONFLICT (id) DO NOTHING;
