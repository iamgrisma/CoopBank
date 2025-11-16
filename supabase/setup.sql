-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    join_date DATE NOT NULL,
    dob DATE,
    nominee_name VARCHAR(255),
    nominee_relationship VARCHAR(100),
    photo_url TEXT,
    kyc_document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shares table
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    number_of_shares INTEGER NOT NULL CHECK (number_of_shares > 0),
    face_value NUMERIC(10, 2) NOT NULL CHECK (face_value > 0),
    purchase_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create savings table
CREATE TABLE IF NOT EXISTS savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    deposit_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, deposit_date) -- Prevents multiple deposits for the same member on the same day
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    member_name VARCHAR(255),
    type VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create policies for RLS
-- Members
CREATE POLICY "Allow authenticated users to view members" ON members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert members" ON members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update members" ON members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete members" ON members FOR DELETE TO authenticated USING (true);

-- Shares
CREATE POLICY "Allow authenticated users to view shares" ON shares FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert shares" ON shares FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update shares" ON shares FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete shares" ON shares FOR DELETE TO authenticated USING (true);

-- Savings
CREATE POLICY "Allow authenticated users to view savings" ON savings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert savings" ON savings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update savings" ON savings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete savings" ON savings FOR DELETE TO authenticated USING (true);

-- Transactions
CREATE POLICY "Allow authenticated users to view transactions" ON transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update transactions" ON transactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete transactions" ON transactions FOR DELETE TO authenticated USING (true);
