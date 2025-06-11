INSERT INTO vendors (name, address, phone, email) VALUES
('Larsen & Toubro', 'Mumbai, Maharashtra', '+91 22 6752 5656', 'contact@larsentoubro.com'),
('Tata Steel', 'Jamshedpur, Jharkhand', '+91 657 665 4444', 'info@tatasteel.com'),
('BHEL', 'New Delhi', '+91 11 2610 6151', 'contact@bhel.in'),
('Thermax', 'Pune, Maharashtra', '+91 20 6601 2345', 'info@thermaxglobal.com')
ON CONFLICT (name) DO NOTHING;
