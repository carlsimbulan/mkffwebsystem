-- ============================================================================
-- TEST DATA FOR DIAGNOSTIC ROOT CAUSE DELAY ANALYSIS
-- ============================================================================
-- This script generates realistic test data with various delay scenarios
-- to demonstrate the AI-powered delay analysis feature
-- ============================================================================

-- Clear existing test data (optional - comment out if you want to keep existing data)
-- DELETE FROM units WHERE assembly_no LIKE 'TEST-%';

-- ============================================================================
-- SCENARIO 1: Station 2 (Integrated Board Test) - Multiple Delayed Units
-- Common Issue: Testing equipment calibration problems
-- ============================================================================

INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at,
    s2_lora_module, s2_lora_mesh_test, s2_energy_meter, s2_power_good_test, 
    s2_voltage, s2_line1, s2_line2, s2_line3, s2_temp_reading, s2_freq_reading,
    s2_led_status_4g, s2_led_status_fast_blink, s2_sw1_off_to_led_off_duration, s2_go_no_go)
VALUES 
-- Unit stuck for 45 minutes - Voltage reading issues
('TEST-S2-001', 'Model-X', 'Rev-A', 'In Progress', 'Station2', 'Voltage reading unstable', 
    DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 45 MINUTE),
    'DETECTED', 'PASSED', 'DETECTED', 'GO', 
    '112.5', '112.3', '112.8', '112.1', '28.5', '60.2',
    'SOLID GREEN', 'GO', '3.2', 'NO GO'),

-- Unit stuck for 60 minutes - Multiple test failures
('TEST-S2-002', 'Model-X', 'Rev-A', 'In Progress', 'Station2', 'Multiple test failures', 
    DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 60 MINUTE),
    'NOT DETECTED', 'FAIL', 'DETECTED', 'NO GO', 
    '110.2', '109.8', '110.5', '110.1', '32.1', '59.8',
    'OFF', 'NO GO', '5.8', 'NO GO'),

-- Unit stuck for 35 minutes - LED status issues
('TEST-S2-003', 'Model-Y', 'Rev-B', 'In Progress', 'Station2', 'LED not responding', 
    DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 35 MINUTE),
    'DETECTED', 'PASSED', 'DETECTED', 'GO', 
    '115.2', '115.1', '115.3', '115.0', '27.8', '60.1',
    'BLINKING', 'NO GO', '4.5', 'NO GO'),

-- Unit stuck for 50 minutes - Temperature reading high
('TEST-S2-004', 'Model-X', 'Rev-A', 'In Progress', 'Station2', 'Temperature too high', 
    DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 50 MINUTE),
    'DETECTED', 'PASSED', 'DETECTED', 'GO', 
    '115.8', '115.5', '115.9', '115.6', '38.5', '60.0',
    'SOLID GREEN', 'GO', '3.1', 'NO GO');

-- ============================================================================
-- SCENARIO 2: Station 6 (Complete Unit Test/Calibration) - Calibration Issues
-- Common Issue: Calibration equipment needs recalibration
-- ============================================================================

INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at,
    s6_lora_module, s6_lora_mesh_test, s6_energy_meter, s6_power_good_test,
    s6_voltage, s6_line1, s6_line2, s6_line3, s6_temp_reading, s6_freq_reading,
    s6_led_status_4g, s6_led_status_fast_blink, s6_sw1_off_to_led_off_duration, s6_go_no_go)
VALUES
-- Unit stuck for 70 minutes - Calibration failing
('TEST-S6-001', 'Model-X', 'Rev-A', 'In Progress', 'Station6', 'Calibration out of range', 
    DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 70 MINUTE),
    'DETECTED', 'PASSED', 'DETECTED', 'GO',
    '113.2', '113.0', '113.5', '112.8', '29.2', '60.3',
    'SOLID GREEN', 'GO', '3.0', 'NO GO'),

-- Unit stuck for 55 minutes - Energy meter reading issues
('TEST-S6-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station6', 'Energy meter not responding', 
    DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 55 MINUTE),
    'DETECTED', 'PASSED', 'NOT DETECTED', 'NO GO',
    '114.8', '114.5', '114.9', '114.6', '28.8', '60.1',
    'SOLID GREEN', 'GO', '3.2', 'NO GO'),

-- Unit stuck for 80 minutes - Multiple calibration attempts
('TEST-S6-003', 'Model-X', 'Rev-A', 'In Progress', 'Station6', 'Repeated calibration failures', 
    DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 80 MINUTE),
    'DETECTED', 'FAIL', 'DETECTED', 'GO',
    '112.1', '111.8', '112.3', '111.9', '31.5', '59.9',
    'BLINKING', 'NO GO', '4.8', 'NO GO');

-- ============================================================================
-- SCENARIO 3: Station 8 (Burn-in Testing) - Long Duration Delays
-- Common Issue: Burn-in chamber capacity or equipment failure
-- ============================================================================

INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at,
    s8_power_unit_disable_lora, s8_frequency_band, s8_rsso_testing, s8_data_outage)
VALUES
-- Unit stuck for 10 hours - Burn-in chamber full
('TEST-S8-001', 'Model-X', 'Rev-A', 'In Progress', 'Station8', 'Waiting for burn-in chamber', 
    DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 10 HOUR),
    'GO', 'PASSED', 'PASSED', 'GO'),

-- Unit stuck for 12 hours - Burn-in test extended
('TEST-S8-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station8', 'Extended burn-in required', 
    DATE_SUB(NOW(), INTERVAL 14 HOUR), DATE_SUB(NOW(), INTERVAL 12 HOUR),
    'GO', 'PASSED', 'FAIL', 'NO GO'),

-- Unit stuck for 9 hours - Equipment malfunction
('TEST-S8-003', 'Model-X', 'Rev-A', 'In Progress', 'Station8', 'Burn-in equipment issue', 
    DATE_SUB(NOW(), INTERVAL 11 HOUR), DATE_SUB(NOW(), INTERVAL 9 HOUR),
    'NO GO', 'FAIL', 'PASSED', 'GO');

-- ============================================================================
-- SCENARIO 4: Station 11 (Final Functional/Connectivity Test) - Connectivity Issues
-- Common Issue: Network connectivity or final test failures
-- ============================================================================

INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at,
    s11_led_status, s11_low_range, s11_medium_range, s11_high_range)
VALUES
-- Unit stuck for 40 minutes - Connectivity test failing
('TEST-S11-001', 'Model-X', 'Rev-A', 'In Progress', 'Station11', 'Network connectivity issues', 
    DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 40 MINUTE),
    'BLINKING', 'FAIL', 'PASSED', 'PASSED'),

-- Unit stuck for 45 minutes - Range test failures
('TEST-S11-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station11', 'Range test not passing', 
    DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 45 MINUTE),
    'SOLID GREEN', 'PASSED', 'FAIL', 'FAIL'),

-- Unit stuck for 35 minutes - LED status issues
('TEST-S11-003', 'Model-X', 'Rev-A', 'In Progress', 'Station11', 'LED status inconsistent', 
    DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 35 MINUTE),
    'OFF', 'FAIL', 'FAIL', 'PASSED');

-- ============================================================================
-- SCENARIO 5: Station 1 (PCB Pairing) - Assembly Issues
-- Common Issue: Component alignment or soldering problems
-- ============================================================================

INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at,
    s1_header_seated_90_deg, s1_leads_properly_soldered)
VALUES
-- Unit stuck for 25 minutes - Header alignment issues
('TEST-S1-001', 'Model-X', 'Rev-A', 'In Progress', 'Station1', 'Header not seated properly', 
    DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 25 MINUTE),
    'NO GO', 'GO'),

-- Unit stuck for 30 minutes - Soldering issues
('TEST-S1-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station1', 'Soldering quality issues', 
    DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 30 MINUTE),
    'GO', 'NO GO'),

-- Unit stuck for 20 minutes - Multiple rework attempts
('TEST-S1-003', 'Model-X', 'Rev-A', 'In Progress', 'Station1', 'Rework required', 
    DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 20 MINUTE),
    'NO GO', 'NO GO');

-- ============================================================================
-- SCENARIO 6: Station 12 (Label Sticker Attachment) - Material Shortage
-- Common Issue: Label printer or material shortage
-- ============================================================================

INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at,
    s12_stickers_attached, s12_stickers_readable)
VALUES
-- Unit stuck for 18 minutes - Printer jam
('TEST-S12-001', 'Model-X', 'Rev-A', 'In Progress', 'Station12', 'Label printer jammed', 
    DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 18 MINUTE),
    'NO GO', 'GO'),

-- Unit stuck for 22 minutes - Label quality issues
('TEST-S12-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station12', 'Labels not readable', 
    DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 22 MINUTE),
    'GO', 'NO GO'),

-- Unit stuck for 15 minutes - Material shortage
('TEST-S12-003', 'Model-X', 'Rev-A', 'In Progress', 'Station12', 'Waiting for label stock', 
    DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 15 MINUTE),
    'NO GO', 'NO GO');

-- ============================================================================
-- SCENARIO 7: Mixed Stations - Various Issues for Comprehensive Analysis
-- ============================================================================

-- Station 3 delays
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at,
    s3_requirements, s3_remarks)
VALUES
('TEST-S3-001', 'Model-X', 'Rev-A', 'In Progress', 'Station3', 'Coating material shortage', 
    DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 15 MINUTE),
    'NO GO', 'Material not available'),
('TEST-S3-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station3', 'Coating equipment issue', 
    DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 20 MINUTE),
    'NO GO', 'Equipment malfunction');

-- Station 5 delays
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at,
    s5_requirements, s5_remarks)
VALUES
('TEST-S5-001', 'Model-X', 'Rev-A', 'In Progress', 'Station5', 'Casing alignment issues', 
    DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 30 MINUTE),
    'NO GO', 'Casing not fitting properly'),
('TEST-S5-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station5', 'Harness routing problem', 
    DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 35 MINUTE),
    'NO GO', 'Harness too short');

-- Station 10 delays
INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at,
    s10_requirements, s10_remarks)
VALUES
('TEST-S10-001', 'Model-X', 'Rev-A', 'In Progress', 'Station10', 'Hi-Pot test failing', 
    DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 25 MINUTE),
    'NO GO', 'Insulation resistance low'),
('TEST-S10-002', 'Model-Y', 'Rev-B', 'In Progress', 'Station10', 'Test equipment calibration', 
    DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 30 MINUTE),
    'NO GO', 'Equipment needs calibration');

-- ============================================================================
-- SCENARIO 8: No Good (NG) Units - Quality Issues
-- These will show up in delay analysis as quality-related delays
-- ============================================================================

INSERT INTO units (assembly_no, model, revision, status, station, remarks, created_at, updated_at,
    s2_go_no_go)
VALUES
('TEST-NG-001', 'Model-X', 'Rev-A', 'No Good (NG)', 'Station2', 'Failed final test - voltage out of spec', 
    DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 40 MINUTE),
    'NO GO'),
('TEST-NG-002', 'Model-Y', 'Rev-B', 'No Good (NG)', 'Station6', 'Failed calibration - multiple attempts', 
    DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 90 MINUTE),
    'NO GO'),
('TEST-NG-003', 'Model-X', 'Rev-A', 'No Good (NG)', 'Station11', 'Failed connectivity test', 
    DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 50 MINUTE),
    'NO GO');

-- ============================================================================
-- SUMMARY OF TEST DATA
-- ============================================================================
-- Total Units Created: 30+
-- Stations with Delays: 1, 2, 3, 5, 6, 8, 10, 11, 12
-- Delay Ranges: 15 minutes to 12 hours
-- Common Issues Simulated:
--   - Equipment calibration problems (Station 2, 6)
--   - Material shortages (Station 3, 12)
--   - Burn-in capacity issues (Station 8)
--   - Connectivity/test failures (Station 11)
--   - Assembly/quality issues (Station 1, 5)
--   - Quality control failures (NG units)
-- ============================================================================

-- Verify the test data
SELECT 
    station,
    COUNT(*) as delayed_units,
    AVG(TIMESTAMPDIFF(MINUTE, updated_at, NOW())) as avg_delay_minutes,
    MAX(TIMESTAMPDIFF(MINUTE, updated_at, NOW())) as max_delay_minutes
FROM units 
WHERE assembly_no LIKE 'TEST-%' 
    AND status IN ('In Progress', 'No Good (NG)')
GROUP BY station
ORDER BY avg_delay_minutes DESC;

-- Show all test units
SELECT 
    assembly_no,
    model,
    station,
    status,
    remarks,
    TIMESTAMPDIFF(MINUTE, updated_at, NOW()) as minutes_delayed,
    updated_at
FROM units 
WHERE assembly_no LIKE 'TEST-%'
ORDER BY station, minutes_delayed DESC;
