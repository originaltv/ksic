-- Insert stations
INSERT INTO stations (name, count, change_from_previous) VALUES
('Inspection', 245, 12),
('Dyeing', 189, -8),
('FWH', 156, 15),
('FMG', 312, 25),
('Showroom Inward', 156, 5)
ON CONFLICT (name) DO UPDATE SET
count = EXCLUDED.count,
change_from_previous = EXCLUDED.change_from_previous,
last_updated = NOW();

-- Insert sample sarees
INSERT INTO sarees (
  saree_id, article_number, length, weaver_name, fabric_type, color, design, weight,
  current_station, status, progress, start_date, estimated_completion
) VALUES
('NSW-12345', 'KS-001', '6.5 meters', 'Ravi Kumar', 'Pure Silk', 'Royal Blue', 'Traditional Mysore', '650 grams', 'Dyeing', 'In Progress', 40, '2024-01-14', '2024-01-18'),
('OSW-67891', 'KS-002', '5.5 meters', 'Priya Sharma', 'Cotton Silk', 'Emerald Green', 'Kanchipuram', '580 grams', 'FWH', 'In Progress', 60, '2024-01-12', '2024-01-16'),
('NSW-23456', 'KS-003', '6.0 meters', 'Suresh Reddy', 'Pure Cotton', 'Maroon', 'Bandhani', '520 grams', 'FMG', 'In Progress', 80, '2024-01-10', '2024-01-15'),
('OSW-78912', 'KS-004', '7.0 meters', 'Lakshmi Devi', 'Silk Cotton', 'Golden Yellow', 'Banarasi', '720 grams', 'Showroom Inward', 'Completed', 100, '2024-01-16', '2024-01-21'),
('NSW-34567', 'KS-005', '6.5 meters', 'Mohan Lal', 'Pure Silk', 'Deep Purple', 'Paithani', '680 grams', 'Inspection', 'In Progress', 20, '2024-01-15', '2024-01-20'),
('OSW-89123', 'KS-006', '5.8 meters', 'Anita Singh', 'Handloom Cotton', 'Coral Pink', 'Chanderi', '540 grams', 'Dyeing', 'In Progress', 40, '2024-01-13', '2024-01-17'),
('NSW-45678', 'KS-007', '6.2 meters', 'Rajesh Gupta', 'Pure Silk', 'Navy Blue', 'Traditional Mysore', '640 grams', 'FWH', 'In Progress', 60, '2024-01-11', '2024-01-16'),
('OSW-56789', 'KS-008', '5.9 meters', 'Sunita Devi', 'Cotton Silk', 'Forest Green', 'Kanchipuram', '590 grams', 'FMG', 'In Progress', 80, '2024-01-09', '2024-01-14'),
('NSW-67890', 'KS-009', '6.8 meters', 'Vikram Singh', 'Pure Cotton', 'Burgundy', 'Bandhani', '560 grams', 'Showroom Inward', 'Inwarded', 100, '2024-01-08', '2024-01-13'),
('OSW-78901', 'KS-010', '6.3 meters', 'Meera Patel', 'Silk Cotton', 'Turquoise', 'Banarasi', '670 grams', 'Inspection', 'In Progress', 20, '2024-01-17', '2024-01-22')
ON CONFLICT (saree_id) DO NOTHING;

-- Insert sample transactions
INSERT INTO transactions (transaction_id, saree_id, from_station, to_station, timestamp) VALUES
('TXN001', 'NSW-12345', 'Inspection', 'Dyeing', '2024-01-15 10:30:00+00'),
('TXN002', 'OSW-67891', 'Dyeing', 'FWH', '2024-01-15 11:15:00+00'),
('TXN003', 'NSW-23456', 'FWH', 'FMG', '2024-01-15 12:00:00+00'),
('TXN004', 'OSW-78912', 'FMG', 'Showroom Inward', '2024-01-15 12:30:00+00'),
('TXN005', 'NSW-34567', 'Inspection', 'Dyeing', '2024-01-15 13:00:00+00'),
('TXN006', 'OSW-89123', 'Inspection', 'Dyeing', '2024-01-14 09:15:00+00'),
('TXN007', 'NSW-45678', 'Dyeing', 'FWH', '2024-01-14 14:20:00+00'),
('TXN008', 'OSW-56789', 'FWH', 'FMG', '2024-01-14 16:45:00+00'),
('TXN009', 'NSW-67890', 'FMG', 'Showroom Inward', '2024-01-13 11:30:00+00'),
('TXN010', 'OSW-78901', 'Inspection', 'Dyeing', '2024-01-17 08:00:00+00')
ON CONFLICT (transaction_id) DO NOTHING;
