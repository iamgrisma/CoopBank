-- Create the members table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    join_date DATE NOT NULL,
    photo_url TEXT,
    dob DATE,
    kyc_document_url TEXT,
    nominee_name VARCHAR(255),
    nominee_relationship VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the shares table
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    number_of_shares INT NOT NULL,
    face_value NUMERIC(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the savings table
CREATE TABLE IF NOT EXISTS savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    deposit_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, deposit_date)
);

-- Create the loan_schemes table
CREATE TABLE IF NOT EXISTS loan_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    default_interest_rate NUMERIC(5, 2) NOT NULL,
    max_term_months INT NOT NULL,
    min_term_months INT NOT NULL,
    applicable_to TEXT[] NOT NULL, -- e.g. {'members', 'outsiders'}
    repayment_frequency VARCHAR(50) NOT NULL,
    processing_fee_percentage NUMERIC(5, 2),
    late_payment_penalty NUMERIC(10, 2),
    offer_start_date DATE,
    offer_end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the loans table
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    loan_scheme_id UUID REFERENCES loan_schemes(id),
    amount NUMERIC(12, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    loan_term_months INT NOT NULL,
    disbursement_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g. Pending, Active, Paid Off, Rejected
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    member_name VARCHAR(255),
    type VARCHAR(100) NOT NULL, -- e.g. 'Share Purchase', 'Savings Deposit', 'Loan Disbursement'
    amount NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g. 'Completed', 'Pending'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Seed initial loan schemes
INSERT INTO loan_schemes (name, default_interest_rate, max_term_months, min_term_months, applicable_to, repayment_frequency, processing_fee_percentage, late_payment_penalty, is_active)
VALUES
    ('General Member Loan', 10.0, 36, 6, '{"members"}', 'Monthly', 1.0, 500.00, TRUE),
    ('Personal Loan', 12.5, 60, 12, '{"members"}', 'Monthly', 1.5, 750.00, TRUE),
    ('House Building Loan', 8.5, 240, 60, '{"members"}', 'Monthly', 0.75, 1000.00, TRUE),
    ('Education Loan', 9.0, 120, 24, '{"members"}', 'Monthly', 0.5, 500.00, TRUE),
    ('Outsider Business Loan', 15.0, 48, 12, '{"outsiders"}', 'Monthly', 2.0, 1500.00, FALSE)
ON CONFLICT (name) DO NOTHING;
