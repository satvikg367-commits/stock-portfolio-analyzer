USE stock_portfolio;

-- Delete watchlists associated with stocks to be removed
DELETE w FROM watchlists w
JOIN stock s ON w.stock_id = s.id
WHERE s.symbol IN ('AAPL', 'MSFT', 'RELIANCE');

-- Delete transactions associated with stocks to be removed
DELETE t FROM transactions t
JOIN stock s ON t.stock_id = s.id
WHERE s.symbol IN ('AAPL', 'MSFT', 'RELIANCE');

-- Delete the stocks
DELETE FROM stock WHERE symbol IN ('AAPL', 'MSFT', 'RELIANCE');

-- Insert new popular Indian stocks
INSERT INTO stock (symbol, companyname, sector, currentprice) VALUES
('ZOMATO', 'Zomato Ltd.', 'Food Delivery', 150),
('PAYTM', 'One97 Communications', 'Fintech', 400),
('JIOFIN', 'Jio Financial Services', 'Finance', 350),
('HAL', 'Hindustan Aeronautics', 'Defense', 3000),
('BEL', 'Bharat Electronics', 'Defense', 200),
('IRFC', 'Indian Railway Finance', 'Finance', 150),
('BHEL', 'Bharat Heavy Electricals', 'Capital Goods', 250),
('TRENT', 'Trent Ltd.', 'Retail', 4000),
('DMART', 'Avenue Supermarts', 'Retail', 4500),
('VBL', 'Varun Beverages', 'FMCG', 1400),
('TVSMOTOR', 'TVS Motor Company', 'Automobile', 2000),
('CHOLAFIN', 'Cholamandalam Investment', 'Finance', 1200),
('PNB', 'Punjab National Bank', 'Finance', 130),
('BANKBARODA', 'Bank of Baroda', 'Finance', 260),
('CANBK', 'Canara Bank', 'Finance', 120),
('RVNL', 'Rail Vikas Nigam', 'Infrastructure', 250),
('PFC', 'Power Finance Corp', 'Finance', 450),
('RECLTD', 'REC Ltd.', 'Finance', 500),
('GAIL', 'GAIL (India) Ltd.', 'Energy', 200),
('PIDILITIND', 'Pidilite Industries', 'Chemicals', 3000),
('GODREJCP', 'Godrej Consumer Products', 'FMCG', 1200),
('DABUR', 'Dabur India Ltd.', 'FMCG', 500),
('SIEMENS', 'Siemens Ltd.', 'Capital Goods', 5000),
('ABB', 'ABB India Ltd.', 'Capital Goods', 6000)
ON DUPLICATE KEY UPDATE currentprice = currentprice;
