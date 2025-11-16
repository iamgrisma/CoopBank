-- Create members table
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    join_date DATE NOT NULL,
    photo_url TEXT,
    dob DATE,
    nominee_name VARCHAR(255),
    nominee_relationship VARCHAR(100),
    kyc_document_url TEXT
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id),
    member_name VARCHAR(255),
    type VARCHAR(50),
    amount DECIMAL(15, 2),
    date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50)
);

-- Create shares table
CREATE TABLE shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id),
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    number_of_shares INT NOT NULL,
    face_value DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL
);

-- Insert sample data into members
INSERT INTO members (name, email, phone, address, join_date, photo_url, dob, nominee_name, nominee_relationship, kyc_document_url) VALUES
('Grisma Pokharel', 'iamgrisma@gmail.com', '9841234567', 'Kathmandu, Nepal', '2023-01-15', 'https://images.unsplash.com/photo-1521119989659-a83eee488004?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80', '1990-05-20', 'Aarav Pokharel', 'Spouse', 'https://picsum.photos/seed/kyc1/600/400'),
('Ramesh Sharma', 'ramesh.sharma@example.com', '9801112233', 'Pokhara, Nepal', '2023-02-20', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80', '1985-11-10', 'Sunita Sharma', 'Spouse', 'https://picsum.photos/seed/kyc2/600/400'),
('Sita Rai', 'sita.rai@example.com', '9860445566', 'Dharan, Nepal', '2023-03-10', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80', '1992-03-15', 'Gopal Rai', 'Father', 'https://picsum.photos/seed/kyc3/600/400'),
('Hari Thapa', 'hari.thapa@example.com', '9845778899', 'Butwal, Nepal', '2023-04-05', null, '1988-09-01', 'Bina Thapa', 'Mother', null);

-- Insert sample data into transactions
INSERT INTO transactions (member_id, member_name, type, amount, date, status)
SELECT id, name, 'Savings Deposit', 15000.00, NOW() - interval '2 day', 'Completed' FROM members WHERE email = 'iamgrisma@gmail.com';

INSERT INTO transactions (member_id, member_name, type, amount, date, status)
SELECT id, name, 'Loan Repayment', 25000.00, NOW() - interval '5 day', 'Completed' FROM members WHERE email = 'ramesh.sharma@example.com';

INSERT INTO transactions (member_id, member_name, type, amount, date, status)
SELECT id, name, 'Share Purchase', 50000.00, NOW() - interval '10 day', 'Completed' FROM members WHERE email = 'sita.rai@example.com';

INSERT INTO transactions (member_id, member_name, type, amount, date, status)
SELECT id, name, 'Withdrawal', 5000.00, NOW() - interval '1 day', 'Pending' FROM members WHERE email = 'iamgrisma@gmail.com';

-- Insert sample share data
INSERT INTO shares (member_id, certificate_number, number_of_shares, face_value, purchase_date)
SELECT id, 'SH-001', 100, 100.00, '2023-01-15' FROM members WHERE email = 'iamgrisma@gmail.com';

INSERT INTO shares (member_id, certificate_number, number_of_shares, face_value, purchase_date)
SELECT id, 'SH-002', 200, 100.00, '2023-02-20' FROM members WHERE email = 'ramesh.sharma@example.com';

INSERT INTO shares (member_id, certificate_number, number_of_shares, face_value, purchase_date)
SELECT id, 'SH-003', 150, 100.00, '2023-03-10' FROM members WHERE email = 'sita.rai@example.com';

INSERT INTO shares (member_id, certificate_number, number_of_shares, face_value, purchase_date)
SELECT id, 'SH-004', 50, 100.00, '2023-04-05' FROM members WHERE email = 'hari.thapa@example.com';
