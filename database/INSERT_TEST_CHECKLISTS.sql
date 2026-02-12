-- ============================================================================
-- TEST CHECKLISTS DATA FOR ALL STATIONS
-- Run this AFTER INSERT_ALL_TEST_DATA.sql
-- ============================================================================
-- This creates checklist entries for test units to make the demo more realistic
-- ============================================================================

-- Get unit_id for test units (you'll need to run this after units are created)
-- For now, we'll use assembly_no to link

-- ============================================================================
-- STATION 1 CHECKLISTS (PCB Pairing)
-- ============================================================================
INSERT INTO station1_checklists (unit_id, assembly_no, header_seated_90_deg, leads_properly_soldered, created_at)
SELECT id, assembly_no, 'NO GO', 'GO', created_at 
FROM units WHERE assembly_no = 'TEST-S1-001'
UNION ALL
SELECT id, assembly_no, 'GO', 'NO GO', created_at 
FROM units WHERE assembly_no = 'TEST-S1-002'
UNION ALL
SELECT id, assembly_no, 'NO GO', 'NO GO', created_at 
FROM units WHERE assembly_no = 'TEST-S1-003';

-- ============================================================================
-- STATION 2 CHECKLISTS (Integrated Board Test)
-- ============================================================================
INSERT INTO station2_checklists (unit_id, assembly_no, lora_module, lora_mesh_test, energy_meter, power_good_test, 
    voltage, line1, line2, line3, temp_reading, freq_reading, led_status_4g, led_status_fast_blink, go_no_go, sw1_off_to_led_off_duration, created_at)
SELECT id, assembly_no, 'Detected', 'Passed', 'Detected', 'GO', 
    112.5, 112.3, 112.8, 112.1, 'FAIL', 'NO GO', 'SOLID GREEN', 'GO', 'NO GO', 3, created_at
FROM units WHERE assembly_no = 'TEST-S2-001'
UNION ALL
SELECT id, assembly_no, 'Not Detected', 'Fail', 'Detected', 'NO GO', 
    110.2, 109.8, 110.5, 110.1, 'FAIL', 'NO GO', 'OFF', 'NO GO', 'NO GO', 5, created_at
FROM units WHERE assembly_no = 'TEST-S2-002'
UNION ALL
SELECT id, assembly_no, 'Detected', 'Passed', 'Detected', 'GO', 
    115.2, 115.1, 115.3, 115.0, 'PASS', 'GO', 'BLINKING', 'NO GO', 'NO GO', 4, created_at
FROM units WHERE assembly_no = 'TEST-S2-003'
UNION ALL
SELECT id, assembly_no, 'Detected', 'Passed', 'Detected', 'GO', 
    115.8, 115.5, 115.9, 115.6, 'FAIL', 'GO', 'SOLID GREEN', 'GO', 'NO GO', 3, created_at
FROM units WHERE assembly_no = 'TEST-S2-004'
UNION ALL
SELECT id, assembly_no, 'Not Detected', 'Fail', 'Detected', 'NO GO', 
    112.5, 0, 0, 0, 'FAIL', 'NO GO', 'OFF', 'NO GO', 'NO GO', 0, created_at
FROM units WHERE assembly_no = 'TEST-NG-001';

-- ============================================================================
-- STATION 3 CHECKLISTS (Main Board Conformal Coating)
-- ============================================================================
INSERT INTO station3_checklists (unit_id, assembly_no, requirements, remarks, created_at)
SELECT id, assembly_no, 'Not Passed', 'Material not available', created_at 
FROM units WHERE assembly_no = 'TEST-S3-001'
UNION ALL
SELECT id, assembly_no, 'Not Passed', 'Equipment malfunction', created_at 
FROM units WHERE assembly_no = 'TEST-S3-002';

-- ============================================================================
-- STATION 4 CHECKLISTS (RTV Application)
-- ============================================================================
INSERT INTO station4_checklists (unit_id, assembly_no, requirements, remarks, created_at)
SELECT id, assembly_no, 'Not Passed', 'RTV curing slowly', created_at 
FROM units WHERE assembly_no = 'TEST-S4-001'
UNION ALL
SELECT id, assembly_no, 'Not Passed', 'Application equipment issue', created_at 
FROM units WHERE assembly_no = 'TEST-S4-002';

-- ============================================================================
-- STATION 5 CHECKLISTS (Casing/Harnessing)
-- ============================================================================
INSERT INTO station5_checklists (unit_id, assembly_no, requirements, remarks, created_at)
SELECT id, assembly_no, 'Not Passed', 'Casing not fitting properly', created_at 
FROM units WHERE assembly_no = 'TEST-S5-001'
UNION ALL
SELECT id, assembly_no, 'Not Passed', 'Harness too short', created_at 
FROM units WHERE assembly_no = 'TEST-S5-002';

-- ============================================================================
-- STATION 6 CHECKLISTS (Complete Unit Test/Calibration)
-- ============================================================================
INSERT INTO station6_checklists (unit_id, assembly_no, lora_module, lora_mesh_test, energy_meter, power_good_test,
    voltage, line1, line2, line3, temp_reading, freq_reading, led_status_4g, led_status_fast_blink, go_no_go, sw1_off_to_led_off_duration, created_at)
SELECT id, assembly_no, 'Detected', 'Passed', 'Detected', 'GO',
    113.2, 113.0, 113.5, 112.8, 'PASS', 'GO', 'SOLID GREEN', 'GO', 'NO GO', 3, created_at
FROM units WHERE assembly_no = 'TEST-S6-001'
UNION ALL
SELECT id, assembly_no, 'Detected', 'Passed', 'Not Detected', 'NO GO',
    114.8, 114.5, 114.9, 114.6, 'PASS', 'GO', 'SOLID GREEN', 'GO', 'NO GO', 3, created_at
FROM units WHERE assembly_no = 'TEST-S6-002'
UNION ALL
SELECT id, assembly_no, 'Detected', 'Fail', 'Detected', 'GO',
    112.1, 111.8, 112.3, 111.9, 'FAIL', 'NO GO', 'BLINKING', 'NO GO', 'NO GO', 4, created_at
FROM units WHERE assembly_no = 'TEST-S6-003'
UNION ALL
SELECT id, assembly_no, 'Detected', 'Fail', 'Not Detected', 'NO GO',
    110.5, 0, 0, 0, 'FAIL', 'NO GO', 'OFF', 'NO GO', 'NO GO', 0, created_at
FROM units WHERE assembly_no = 'TEST-NG-002';

-- ============================================================================
-- STATION 7 CHECKLISTS (Pre BI Hi-Pot Test)
-- ============================================================================
INSERT INTO station7_checklists (unit_id, assembly_no, requirements, remarks, created_at)
SELECT id, assembly_no, 'Not Passed', 'Equipment warming up', created_at 
FROM units WHERE assembly_no = 'TEST-S7-001'
UNION ALL
SELECT id, assembly_no, 'Not Passed', 'Insulation resistance low', created_at 
FROM units WHERE assembly_no = 'TEST-S7-002';

-- ============================================================================
-- STATION 8 CHECKLISTS (Burn-in Testing)
-- ============================================================================
INSERT INTO station8_checklists (unit_id, assembly_no, power_unit_disable_lora, frequency_band, rsso_testing, data_outage, created_at)
SELECT id, assembly_no, 'GO', 'Passed', 'Passed', 'GO', created_at 
FROM units WHERE assembly_no = 'TEST-S8-001'
UNION ALL
SELECT id, assembly_no, 'GO', 'Passed', 'Fail', 'NO GO', created_at 
FROM units WHERE assembly_no = 'TEST-S8-002'
UNION ALL
SELECT id, assembly_no, 'NO GO', 'Fail', 'Passed', 'GO', created_at 
FROM units WHERE assembly_no = 'TEST-S8-003';

-- ============================================================================
-- STATION 10 CHECKLISTS (Post BI Hi-Pot Test)
-- ============================================================================
INSERT INTO station10_checklists (unit_id, assembly_no, requirements, remarks, created_at)
SELECT id, assembly_no, 'Not Passed', 'Insulation resistance low', created_at 
FROM units WHERE assembly_no = 'TEST-S10-001'
UNION ALL
SELECT id, assembly_no, 'Not Passed', 'Equipment needs calibration', created_at 
FROM units WHERE assembly_no = 'TEST-S10-002';

-- ============================================================================
-- STATION 11 CHECKLISTS (Final Functional/Connectivity Test)
-- ============================================================================
INSERT INTO station11_checklists (unit_id, assembly_no, led_status, low_range, medium_range, high_range, created_at)
SELECT id, assembly_no, 'BLINKING', 'Fail', 'Passed', 'Passed', created_at 
FROM units WHERE assembly_no = 'TEST-S11-001'
UNION ALL
SELECT id, assembly_no, 'SOLID GREEN', 'Passed', 'Fail', 'Fail', created_at 
FROM units WHERE assembly_no = 'TEST-S11-002'
UNION ALL
SELECT id, assembly_no, 'OFF', 'Fail', 'Fail', 'Passed', created_at 
FROM units WHERE assembly_no = 'TEST-S11-003'
UNION ALL
SELECT id, assembly_no, 'OFF', 'Fail', 'Fail', 'Fail', created_at 
FROM units WHERE assembly_no = 'TEST-NG-003';

-- ============================================================================
-- STATION 12 CHECKLISTS (Label Sticker Attachment)
-- ============================================================================
INSERT INTO station12_checklists (unit_id, assembly_no, stickers_attached, stickers_readable, created_at)
SELECT id, assembly_no, 'NO GO', 'GO', created_at 
FROM units WHERE assembly_no = 'TEST-S12-001'
UNION ALL
SELECT id, assembly_no, 'GO', 'NO GO', created_at 
FROM units WHERE assembly_no = 'TEST-S12-002'
UNION ALL
SELECT id, assembly_no, 'NO GO', 'NO GO', created_at 
FROM units WHERE assembly_no = 'TEST-S12-003';

-- ============================================================================
-- STATION 13 CHECKLISTS (FVI - Final Visual Inspection)
-- ============================================================================
-- Note: No test units are currently at Station 13, but adding structure for completeness
-- INSERT INTO station13_checklists (unit_id, assembly_no, requirements, remarks, created_at)
-- VALUES (...);

-- ============================================================================
-- STATION 14 CHECKLISTS (Packing)
-- ============================================================================
-- Note: No test units are currently at Station 14, but adding structure for completeness
-- INSERT INTO station14_checklists (unit_id, assembly_no, requirements, remarks, created_at)
-- VALUES (...);

-- ============================================================================
-- DONE! Checklist data created for test units
-- ============================================================================

-- Verify the checklist data
SELECT 'Station 1' as station, COUNT(*) as checklist_count FROM station1_checklists WHERE assembly_no LIKE 'TEST-%'
UNION ALL
SELECT 'Station 2', COUNT(*) FROM station2_checklists WHERE assembly_no LIKE 'TEST-%'
UNION ALL
SELECT 'Station 3', COUNT(*) FROM station3_checklists WHERE assembly_no LIKE 'TEST-%'
UNION ALL
SELECT 'Station 4', COUNT(*) FROM station4_checklists WHERE assembly_no LIKE 'TEST-%'
UNION ALL
SELECT 'Station 5', COUNT(*) FROM station5_checklists WHERE assembly_no LIKE 'TEST-%'
UNION ALL
SELECT 'Station 6', COUNT(*) FROM station6_checklists WHERE assembly_no LIKE 'TEST-%'
UNION ALL
SELECT 'Station 7', COUNT(*) FROM station7_checklists WHERE assembly_no LIKE 'TEST-%'
UNION ALL
SELECT 'Station 8', COUNT(*) FROM station8_checklists WHERE assembly_no LIKE 'TEST-%'
UNION ALL
SELECT 'Station 10', COUNT(*) FROM station10_checklists WHERE assembly_no LIKE 'TEST-%'
UNION ALL
SELECT 'Station 11', COUNT(*) FROM station11_checklists WHERE assembly_no LIKE 'TEST-%'
UNION ALL
SELECT 'Station 12', COUNT(*) FROM station12_checklists WHERE assembly_no LIKE 'TEST-%';

-- To delete test checklist data after demo:
-- DELETE FROM station1_checklists WHERE assembly_no LIKE 'TEST-%';
-- DELETE FROM station2_checklists WHERE assembly_no LIKE 'TEST-%';
-- DELETE FROM station3_checklists WHERE assembly_no LIKE 'TEST-%';
-- DELETE FROM station4_checklists WHERE assembly_no LIKE 'TEST-%';
-- DELETE FROM station5_checklists WHERE assembly_no LIKE 'TEST-%';
-- DELETE FROM station6_checklists WHERE assembly_no LIKE 'TEST-%';
-- DELETE FROM station7_checklists WHERE assembly_no LIKE 'TEST-%';
-- DELETE FROM station8_checklists WHERE assembly_no LIKE 'TEST-%';
-- DELETE FROM station10_checklists WHERE assembly_no LIKE 'TEST-%';
-- DELETE FROM station11_checklists WHERE assembly_no LIKE 'TEST-%';
-- DELETE FROM station12_checklists WHERE assembly_no LIKE 'TEST-%';
