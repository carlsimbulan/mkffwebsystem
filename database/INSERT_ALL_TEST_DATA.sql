-- ============================================================================
-- COPY AND PASTE THIS ENTIRE FILE TO phpMyAdmin SQL TAB
-- Simple version - only uses basic columns that exist in all databases
-- ============================================================================

-- Station 2 - Testing Issues (4 units, 35-60 min delays)
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at) VALUES 
('TEST-S2-001', 'Model-X', 'Rev-A', 'In Progress', 'Station2', 'Voltage reading unstable', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
('TEST-S2-002', 'Model-X', 'Rev-A', 'In Progress', 'Station2', 'Multiple test failures', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 60 MINUTE)),
('TEST-S2-003', 'Model-Y', 'Rev-B', 'In Progress', 'Station2', 'LED not responding', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
('TEST-S2-004', 'Model-X', 'Rev-A', 'In Progress', 'Station2', 'Temperature too high', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 50 MINUTE));

-- Station 6 - Calibration Issues (3 units, 55-80 min delays)
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at) VALUES
('TEST-S6-001', 'Model-X', 'Rev-A', 'In Progress', 'Station6', 'Calibration out of range', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 70 MINUTE)),
('TEST-S6-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station6', 'Energy meter not responding', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 55 MINUTE)),
('TEST-S6-003', 'Model-X', 'Rev-A', 'In Progress', 'Station6', 'Repeated calibration failures', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 80 MINUTE));

-- Station 8 - Burn-in Delays (3 units, 9-12 HOUR delays!)
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at) VALUES
('TEST-S8-001', 'Model-X', 'Rev-A', 'In Progress', 'Station8', 'Waiting for burn-in chamber', DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 10 HOUR)),
('TEST-S8-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station8', 'Extended burn-in required', DATE_SUB(NOW(), INTERVAL 14 HOUR), DATE_SUB(NOW(), INTERVAL 12 HOUR)),
('TEST-S8-003', 'Model-X', 'Rev-A', 'In Progress', 'Station8', 'Burn-in equipment issue', DATE_SUB(NOW(), INTERVAL 11 HOUR), DATE_SUB(NOW(), INTERVAL 9 HOUR));

-- Station 11 - Connectivity Issues (3 units, 35-45 min delays)
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at) VALUES
('TEST-S11-001', 'Model-X', 'Rev-A', 'In Progress', 'Station11', 'Network connectivity issues', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
('TEST-S11-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station11', 'Range test not passing', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
('TEST-S11-003', 'Model-X', 'Rev-A', 'In Progress', 'Station11', 'LED status inconsistent', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 35 MINUTE));

-- Station 1 - Assembly Issues (3 units, 20-30 min delays)
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at) VALUES
('TEST-S1-001', 'Model-X', 'Rev-A', 'In Progress', 'Station1', 'Header not seated properly', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
('TEST-S1-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station1', 'Soldering quality issues', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('TEST-S1-003', 'Model-X', 'Rev-A', 'In Progress', 'Station1', 'Rework required', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 20 MINUTE));

-- Station 12 - Label Issues (3 units, 15-22 min delays)
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at) VALUES
('TEST-S12-001', 'Model-X', 'Rev-A', 'In Progress', 'Station12', 'Label printer jammed', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 18 MINUTE)),
('TEST-S12-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station12', 'Labels not readable', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 22 MINUTE)),
('TEST-S12-003', 'Model-X', 'Rev-A', 'In Progress', 'Station12', 'Waiting for label stock', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 15 MINUTE));

-- Station 3 - Coating Issues (2 units, 15-20 min delays)
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at) VALUES
('TEST-S3-001', 'Model-X', 'Rev-A', 'In Progress', 'Station3', 'Coating material shortage', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
('TEST-S3-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station3', 'Coating equipment issue', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 20 MINUTE));

-- Station 5 - Casing Issues (2 units, 30-35 min delays)
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at) VALUES
('TEST-S5-001', 'Model-X', 'Rev-A', 'In Progress', 'Station5', 'Casing alignment issues', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('TEST-S5-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station5', 'Harness routing problem', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 35 MINUTE));

-- Station 10 - Hi-Pot Test Issues (2 units, 25-30 min delays)
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at) VALUES
('TEST-S10-001', 'Model-X', 'Rev-A', 'In Progress', 'Station10', 'Hi-Pot test failing', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
('TEST-S10-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station10', 'Test equipment calibration', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- Station 4 - RTV Application Issues (2 units, 18-25 min delays)
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at) VALUES
('TEST-S4-001', 'Model-X', 'Rev-A', 'In Progress', 'Station4', 'RTV material curing slowly', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
('TEST-S4-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station4', 'Application equipment issue', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 18 MINUTE));

-- Station 7 - Pre BI Hi-Pot Issues (2 units, 12-16 min delays)
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at) VALUES
('TEST-S7-001', 'Model-X', 'Rev-A', 'In Progress', 'Station7', 'Hi-Pot test equipment warm-up', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 16 MINUTE)),
('TEST-S7-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station7', 'Insulation test failing', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 12 MINUTE));

-- No Good Units (3 units with quality issues)
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at) VALUES
('TEST-NG-001', 'Model-X', 'Rev-A', 'No Good (NG)', 'Station2', 'Failed final test - voltage out of spec', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
('TEST-NG-002', 'Model-Y', 'Rev-B', 'No Good (NG)', 'Station6', 'Failed calibration - multiple attempts', DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
('TEST-NG-003', 'Model-X', 'Rev-A', 'No Good (NG)', 'Station11', 'Failed connectivity test', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 50 MINUTE));

-- ============================================================================
-- SUMMARY: 33 test units created across 11 stations
-- ============================================================================
-- Station 1: 3 units (20-30 min delays)
-- Station 2: 4 units (35-60 min delays) 
-- Station 3: 2 units (15-20 min delays)
-- Station 4: 2 units (18-25 min delays)
-- Station 5: 2 units (30-35 min delays)
-- Station 6: 3 units (55-80 min delays)
-- Station 7: 2 units (12-16 min delays)
-- Station 8: 3 units (9-12 HOUR delays!)
-- Station 10: 2 units (25-30 min delays)
-- Station 11: 3 units (35-45 min delays)
-- Station 12: 3 units (15-22 min delays)
-- NG Units: 3 units (quality failures)
-- ============================================================================

-- To verify the data:
SELECT 
    station,
    COUNT(*) as delayed_units,
    ROUND(AVG(TIMESTAMPDIFF(MINUTE, updated_at, NOW()))) as avg_delay_minutes,
    MAX(TIMESTAMPDIFF(MINUTE, updated_at, NOW())) as max_delay_minutes
FROM units 
WHERE assembly_no LIKE 'TEST-%' 
    AND status IN ('In Progress', 'No Good (NG)')
GROUP BY station
ORDER BY avg_delay_minutes DESC;

-- To delete test data after demo:
-- DELETE FROM units WHERE assembly_no LIKE 'TEST-%';
