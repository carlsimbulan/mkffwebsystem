# Operators Real-Time Notification Fix

## Problema
Ang notification system sa Operators ay hindi real-time. Kailangan pa i-refresh ang page para makita ang delay at error notifications. Dapat automatic na mag-pop up kapag may delayed units.

**Additional Issue:** May 2-3 minutes delay bago mag-appear ang notification kahit na nag-exceed na ang threshold time.

## Root Cause

### Issue 1: No Real-Time Monitoring
Ang notification checking ay naka-depend lang sa changes ng `globalUnitList` state. Pero ang time-based delay calculation ay hindi automatic na nag-uupdate - kahit walang changes sa unit list, ang elapsed time ay patuloy na tumataas.

### Issue 2: Wrong Comparison Operator
Ang delay checking ay gumagamit ng `>` (greater than) instead of `>=` (greater than or equal):
```javascript
// BEFORE (Wrong - may 1-2 minutes delay)
if (elapsedMinutes > thresholdMinutes) {
    // Mag-trigger lang kapag 11 minutes na (kung threshold = 10)
}

// AFTER (Correct - mag-trigger agad sa exact threshold)
if (elapsedMinutes >= thresholdMinutes) {
    // Mag-trigger agad kapag exactly 10 minutes na
}
```

**Why this causes delay:**
- Kung threshold = 10 minutes
- `Math.floor()` rounds down: 10.9 minutes = 10 minutes
- With `>` operator: Need 11 minutes bago mag-trigger
- With `>=` operator: Mag-trigger agad sa exactly 10 minutes

## Solution

### 1. Added Real-Time Interval Checking (Every 1 Second)
```javascript
// --- REAL-TIME NOTIFICATION CHECK EFFECT (Every 1 second) ---
useEffect(() => {
    // Initial check
    if (globalUnitList.length > 0) {
        checkDelayedUnitsForNotifications(globalUnitList);
    }

    // Set up interval for real-time checking every 1 second
    const notificationInterval = setInterval(() => {
        if (globalUnitList.length > 0) {
            checkDelayedUnitsForNotifications(globalUnitList);
        }
    }, 1000); // Check every 1 second for real-time updates

    return () => clearInterval(notificationInterval);
}, [globalUnitList, checkDelayedUnitsForNotifications]);
```

### 2. Fixed Comparison Operator (Changed `>` to `>=`)

**Files Updated:**
- `frontend/src/Operators/StationDashboard.jsx` - Main notification logic
- `frontend/src/admin/AdminPage.jsx` - Admin notification logic
- `frontend/src/admin/components/views/Dashboard.jsx` - Dashboard delay checking
- `frontend/src/admin/components/views/StationsOverview.jsx` - Stations overview delay checking (2 locations)
- `frontend/src/Operators/components/UnitListTable.jsx` - Unit list delay checking
- `frontend/src/Operators/components/StationHomeDashboard.jsx` - Home dashboard delay checking

**Changed from:**
```javascript
if (minutesInStation > threshold) // Wrong - needs threshold + 1
if (minutesInStation > threshold * 3) // Wrong - needs (threshold * 3) + 1
```

**Changed to:**
```javascript
if (minutesInStation >= threshold) // Correct - triggers at exact threshold
if (minutesInStation >= threshold * 3) // Correct - triggers at exact critical threshold
```

### 3. Optimized Notification State Updates
```javascript
// Only update notifications if there's a change to prevent unnecessary re-renders
setNotifications(prev => {
    const prevIds = prev.map(n => n.id).sort().join(',');
    const newIds = newDelayedNotifications.map(n => n.id).sort().join(',');
    
    // If notification IDs are the same, don't update
    if (prevIds === newIds) return prev;
    
    return newDelayedNotifications;
});
```

## How It Works Now

1. **Initial Check** - Pag-load ng page, agad na nag-check ng delayed units
2. **Continuous Monitoring** - Every 1 second, nag-check ulit ng elapsed time ng bawat unit
3. **Immediate Trigger** - Kapag exactly sa threshold na (e.g., 10 minutes), agad na mag-trigger ang notification
4. **Smart Updates** - Nag-update lang ng notifications kapag may actual changes (new delay, resolved delay)
5. **Automatic Pop-up** - Kapag may unit na nag-exceed ng threshold, automatic na lalabas ang notification sa bell icon

## Benefits

✅ **Real-time notifications** - Walang kailangan i-refresh, automatic na lalabas  
✅ **Immediate trigger** - Mag-trigger agad sa exact threshold time (no more 2-3 minutes delay)  
✅ **Accurate elapsed time** - Updated every second ang time calculation  
✅ **Better performance** - Smart state updates prevent unnecessary re-renders  
✅ **Consistent behavior** - Same logic across Admin and Operator panels  
✅ **Accurate delay levels** - MODERATE at exactly threshold, CRITICAL at exactly 3x threshold  

## Testing Checklist

- [ ] Login as Operator
- [ ] Create a unit with "In Progress" status
- [ ] Wait for the threshold time to pass (e.g., 10 minutes for Station1)
- [ ] **Verify notification appears IMMEDIATELY at 10 minutes (not 11 or 12)**
- [ ] Verify notification bell shows count without refresh
- [ ] Click notification bell to see delay details
- [ ] Verify notification updates every second
- [ ] Complete the unit and verify notification disappears automatically
- [ ] **Test CRITICAL level: Verify it triggers at exactly 3x threshold (e.g., 30 minutes)**

## Files Modified

### Notification Logic
- `frontend/src/Operators/StationDashboard.jsx`
  - Added real-time interval checking (every 1 second)
  - Changed `>` to `>=` for immediate trigger
  - Optimized notification state updates

- `frontend/src/admin/AdminPage.jsx`
  - Changed `>` to `>=` for immediate trigger

### Delay Checking Functions
- `frontend/src/admin/components/views/Dashboard.jsx`
  - Changed `>` to `>=` in `checkUnitDelay` function
  
- `frontend/src/admin/components/views/StationsOverview.jsx`
  - Changed `>` to `>=` in `checkUnitDelay` function
  - Changed `>` to `>=` in inline delay filter

- `frontend/src/Operators/components/UnitListTable.jsx`
  - Changed `>` to `>=` in `checkUnitDelay` function

- `frontend/src/Operators/components/StationHomeDashboard.jsx`
  - Changed `>` to `>=` in `checkUnitDelay` function

## Technical Details

### Polling Strategy
- **Global Unit List**: Every 2 seconds (for sidebar counts)
- **Notification Check**: Every 1 second (for real-time delay monitoring)
- **Unit List (per tab)**: Every 1 second (for table updates)

### Delay Calculation
```javascript
const elapsedMinutes = Math.floor((now - startTime) / (1000 * 60));

// MODERATE delay: elapsedMinutes >= threshold
// CRITICAL delay: elapsedMinutes >= threshold * 3
```

### Performance Optimization
- Smart state comparison prevents unnecessary re-renders
- Cleanup intervals on component unmount
- Memoized calculations where applicable

## Example Timeline (Threshold = 10 minutes)

**BEFORE (Wrong):**
- 10:00 - Unit starts
- 10:10 - 10 minutes elapsed, NO notification (needs > 10)
- 10:11 - 11 minutes elapsed, notification appears ❌ (1 minute late)

**AFTER (Correct):**
- 10:00 - Unit starts
- 10:10 - 10 minutes elapsed, notification appears immediately ✅
- 10:30 - 30 minutes elapsed, changes to CRITICAL level ✅

## Notes

Ang fix na ito ay consistent sa existing architecture ng system:
- Uses same polling intervals as admin panel
- Maintains separation of concerns (data fetching vs notification checking)
- Follows React best practices for intervals and cleanup
- Ensures accurate and immediate delay notifications across all components
