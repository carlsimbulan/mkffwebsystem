-- ============================================================================
-- QUICK TEST DATA - For Fast Demo/Testing
-- ============================================================================
-- This creates a minimal set of delayed units for quick testing
-- Run this if you just want to see the delay analysis feature quickly
-- ============================================================================

-- Station 2 - 3 delayed units with test failures
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at,
    s2_lora_module, s2_energy_meter, s2_voltage, s2_go_no_go)
VALUES 
('DEMO-001', 'Model-X', 'Rev-A', 'In Progress', 'Station2', 'Voltage unstable', 
    DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 45 MINUTE),
    'DETECTED', 'DETECTED', '112.5', 'NO GO'),
('DEMO-002', 'Model-X', 'Rev-A', 'In Progress', 'Station2', 'Test failure', 
    DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 60 MINUTE),
    'NOT DETECTED', 'DETECTED', '110.2', 'NO GO'),
('DEMO-003', 'Model-Y', 'Rev-B', 'In Progress', 'Station2', 'LED issue', 
    DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 35 MINUTE),
    'DETECTED', 'DETECTED', '115.2', 'NO GO');

-- Station 6 - 2 delayed units with calibration issues
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at,
    s6_lora_module, s6_energy_meter, s6_voltage, s6_go_no_go)
VALUES
('DEMO-004', 'Model-X', 'Rev-A', 'In Progress', 'Station6', 'Calibration failing', 
    DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 70 MINUTE),
    'DETECTED', 'DETECTED', '113.2', 'NO GO'),
('DEMO-005', 'Model-Y', 'Rev-B', 'In Progress', 'Station6', 'Energy meter issue', 
    DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 55 MINUTE),
    'DETECTED', 'NOT DETECTED', '114.8', 'NO GO');

-- Station 8 - 1 long delay (burn-in)
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at,
    s8_power_unit_disable_lora, s8_rsso_testing)
VALUES
('DEMO-006', 'Model-X', 'Rev-A', 'In Progress', 'Station8', 'Burn-in chamber full', 
    DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 10 HOUR),
    'GO', 'PASSED');

-- Verify
SELECT 
    assembly_no,
    station,
    remarks,
    TIMESTAMPDIFF(MINUTE, updated_at, NOW()) as minutes_delayed
FROM units 
WHERE assembly_no LIKE 'DEMO-%'
ORDER BY station;
