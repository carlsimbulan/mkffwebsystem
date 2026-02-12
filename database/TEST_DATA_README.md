# Test Data for Diagnostic Root Cause Delay Analysis

## Overview
This folder contains SQL scripts to generate realistic test data for demonstrating the AI-powered "Diagnostic Root Cause Delay" feature in the Stations Overview page.

## Files

### 1. `test_data_delayed_units.sql` (COMPREHENSIVE)
**Purpose:** Full test dataset with 30+ units across multiple stations
**Use Case:** For comprehensive demo, thesis defense, or thorough testing
**Execution Time:** ~2-3 seconds

**What it creates:**
- **Station 2** (4 units): Voltage, LED, and test failures (35-60 min delays)
- **Station 6** (3 units): Calibration issues (55-80 min delays)
- **Station 8** (3 units): Burn-in chamber delays (9-12 hour delays)
- **Station 11** (3 units): Connectivity test failures (35-45 min delays)
- **Station 1** (3 units): Assembly/soldering issues (20-30 min delays)
- **Station 12** (3 units): Label printer/material issues (15-22 min delays)
- **Stations 3, 5, 10** (6 units): Various delays (15-35 min delays)
- **NG Units** (3 units): Quality failures with extended delays

**Total:** 30+ delayed units simulating real production bottlenecks

### 2. `QUICK_TEST_DATA.sql` (MINIMAL)
**Purpose:** Quick demo with minimal data
**Use Case:** For quick testing or when you just want to see the feature work
**Execution Time:** <1 second

**What it creates:**
- **Station 2** (3 units): 35-60 minute delays
- **Station 6** (2 units): 55-70 minute delays  
- **Station 8** (1 unit): 10 hour delay

**Total:** 6 delayed units for quick demonstration

## How to Use

### Option 1: Quick Test (Recommended for first-time testing)
```sql
-- Run this in your MySQL/phpMyAdmin
source database/QUICK_TEST_DATA.sql;
-- OR copy-paste the contents
```

### Option 2: Comprehensive Test (For thesis defense/full demo)
```sql
-- Run this in your MySQL/phpMyAdmin
source database/test_data_delayed_units.sql;
-- OR copy-paste the contents
```

### Option 3: Using phpMyAdmin
1. Open phpMyAdmin
2. Select your database (e.g., `mkff`)
3. Click on "SQL" tab
4. Copy and paste the contents of either SQL file
5. Click "Go" to execute

## Verifying the Data

After running the script, verify the data was created:

```sql
-- Check delayed units by station
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

-- View all test units
SELECT 
    assembly_no,
    station,
    status,
    remarks,
    TIMESTAMPDIFF(MINUTE, updated_at, NOW()) as minutes_delayed
FROM units 
WHERE assembly_no LIKE 'TEST-%'
ORDER BY minutes_delayed DESC;
```

## Viewing the Analysis

1. **Login as Administrator**
2. **Go to Stations Overview** (Sidebar → Stations)
3. **Look for "Diagnostic Root Cause Delay" section** at the top
4. **Click "ANALYZE HOTSPOTS"** button
5. **Wait 5-10 seconds** for AI analysis
6. **View the results** showing:
   - Root Cause (Diagnosis)
   - Impact Forecast
   - Recommended Actions (Prescription)

## Expected Results

### With Comprehensive Data:
- Multiple stations will show as "delay hotspots"
- Station 2 and 6 will likely be flagged for equipment issues
- Station 8 will show capacity/burn-in issues
- AI will provide specific recommendations for each station

### With Quick Data:
- 2-3 stations will show delays
- Focused analysis on testing and calibration issues
- Clear recommendations for immediate action

## Cleaning Up Test Data

To remove all test data after your demo:

```sql
-- Remove comprehensive test data
DELETE FROM units WHERE assembly_no LIKE 'TEST-%';

-- Remove quick test data
DELETE FROM units WHERE assembly_no LIKE 'DEMO-%';

-- Verify deletion
SELECT COUNT(*) FROM units WHERE assembly_no LIKE 'TEST-%' OR assembly_no LIKE 'DEMO-%';
-- Should return 0
```

## Tips for Thesis Defense

1. **Before Defense:**
   - Run `test_data_delayed_units.sql` 1-2 hours before
   - Verify data is showing in Stations Overview
   - Test the "ANALYZE HOTSPOTS" button works

2. **During Demo:**
   - Show the delay hotspots visualization
   - Click "ANALYZE HOTSPOTS" and explain the AI is analyzing
   - Walk through the three sections: Diagnosis, Forecast, Prescription
   - Highlight how it helps identify root causes automatically

3. **After Defense:**
   - Clean up test data using the DELETE queries above
   - Keep the SQL files for future reference

## Troubleshooting

**Problem:** No delays showing up
- **Solution:** Check if units have `status = 'In Progress'` and `updated_at` is in the past

**Problem:** AI analysis not working
- **Solution:** Check if Gemini API key is configured in `backend/api/gemini.php`

**Problem:** Delays too short/long
- **Solution:** Adjust the `DATE_SUB()` intervals in the SQL script

## Notes

- Test data uses assembly numbers starting with `TEST-` or `DEMO-` for easy identification
- All delays are calculated relative to current time using `DATE_SUB(NOW(), ...)`
- Data includes realistic failure scenarios based on actual production issues
- Safe to run multiple times (will create duplicate entries unless you delete first)

## Support

If you encounter issues:
1. Check MySQL error logs
2. Verify database connection
3. Ensure `units` table structure matches the INSERT statements
4. Check that all referenced columns exist in your schema
