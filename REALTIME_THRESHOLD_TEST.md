# Real-Time Threshold Update Testing Guide

## Problema na Naayos
- Operator dashboard hindi nag-update ng notifications in real-time pag binago ang threshold sa admin
- Kailangan pa mag-refresh para makita ang bagong notifications

## Mga Pagbabago
1. **Polling interval**: 3 seconds → 1 second (mas mabilis na detection)
2. **Cache duration**: 5 seconds → 2 seconds (mas fresh ang data)
3. **Added dedicated threshold change effect** sa operator dashboard
4. **Enhanced logging** para makita ang flow ng updates

## Paano Mag-Test

### Setup
1. Buksan ang **Admin Panel** sa isang browser tab
2. Buksan ang **Operator Dashboard** sa ibang tab (same browser or different)
3. Buksan ang **Browser Console** (F12) sa both tabs

### Test Steps

#### Test 1: Basic Threshold Update
1. Sa **Admin Panel**:
   - Go to Stations Overview
   - Click "MANAGE TARGET TIMES"
   - Change threshold ng Station1 from 6 to 2 minutes
   - Click Save

2. Sa **Console** (Admin), dapat makita mo:
   ```
   🎯 [TARGET TIME UPDATE] Saving new thresholds: {...}
   ✅ [TARGET TIME UPDATE] Thresholds saved to backend
   📢 [TARGET TIME UPDATE] Broadcasting to all tabs via localStorage
   🔔 [TARGET TIME UPDATE] Notifying listener
   ✅ [TARGET TIME UPDATE] All listeners notified
   ```

3. Sa **Console** (Operator), dapat makita mo within 1-2 seconds:
   ```
   🔄 [POLLING] Thresholds changed detected!
   🔄 [POLLING] Old: {...}
   🔄 [POLLING] New: {...}
   📢 [POLLING] Broadcasting change to all tabs
   ✅ [POLLING] All listeners notified
   🔔 [useTargetTimes] Received threshold update: {...}
   🎯 [THRESHOLD CHANGE] Thresholds updated, re-checking notifications immediately
   🎯 [THRESHOLD CHANGE] New thresholds: {...}
   🔍 [NOTIFICATION CHECK] Station: Station1
   🎯 [NOTIFICATION CHECK] Threshold for Station1: 2
   ```

4. Sa **Operator Dashboard**:
   - Dapat mag-appear ang notification bell (kung may delayed units)
   - Hindi na kailangan mag-refresh!

#### Test 2: Cross-Tab Update (localStorage)
1. Buksan ang **2 Operator Dashboard tabs**
2. Sa **Admin Panel**, change threshold
3. Sa **both Operator tabs**, dapat sabay-sabay mag-update ang notifications
4. Check console - dapat makita ang localStorage event:
   ```
   📢 [STORAGE EVENT] Received cross-tab threshold update
   📢 [STORAGE EVENT] New thresholds: {...}
   ✅ [STORAGE EVENT] Applying new thresholds
   ✅ [STORAGE EVENT] All listeners notified
   ```

#### Test 3: Notification Timing
1. May unit na "In Progress" sa Station1
2. Set threshold to 1 minute
3. Wait 2 minutes
4. Dapat automatic na mag-appear ang notification sa operator
5. Change threshold to 5 minutes
6. Notification dapat mawala agad (kasi hindi na delayed)

### Expected Console Logs

#### Operator Dashboard Startup
```
🎯 [useTargetTimes] Hook initialized
🔔 [SUBSCRIBE] New listener registered. Total listeners: 1
🔄 [SUBSCRIBE] First listener added, starting polling
🔄 [POLLING] Starting target time polling (every 1 second)
🎯 [useTargetTimes] Initial thresholds loaded: {...}
```

#### When Threshold Changes
```
🔄 [POLLING] Thresholds changed detected!
🔔 [useTargetTimes] Received threshold update: {...}
🎯 [THRESHOLD CHANGE] Thresholds updated, re-checking notifications immediately
🔍 [NOTIFICATION CHECK] Station: Station1
📊 [UNIT CHECK] Unit ABC123: {...}
⏱️ [TIME CHECK] Unit ABC123: 3 mins elapsed (threshold: 2 mins)
🔔 [NOTIFICATION CREATED] Unit ABC123 is delayed!
🔔 [NOTIFICATION SUMMARY] Total notifications: 1
```

### Troubleshooting

#### Kung hindi pa rin nag-update:
1. Check console kung may errors
2. Verify na nag-start ang polling:
   - Dapat may "Starting target time polling" message
3. Check kung nag-trigger ang threshold change effect:
   - Dapat may "Thresholds updated, re-checking notifications" message
4. Verify station name format:
   - Check kung "Station1" or "Station 1" ang gamit
   - Both formats dapat gumana na

#### Kung may errors:
1. Check network tab - dapat successful ang POST sa target_times.php
2. Check localStorage - dapat may "targetTimesUpdate" entry
3. Verify na naka-login ang operator sa tamang station

## Technical Details

### Polling Mechanism
- Every 1 second, nag-fetch ng latest thresholds from backend
- Pag may change, nag-broadcast via localStorage
- All tabs naka-listen sa localStorage changes

### Notification Check Triggers
1. **Global unit list changes** (every 2 seconds)
2. **Threshold changes** (immediate via useEffect)
3. **Manual refresh** (pag nag-switch ng tabs)

### Station Name Matching
Nag-try ng 3 formats:
1. Exact match: "Station1"
2. Without space: "Station1" → "Station1"
3. With space: "Station1" → "Station 1"

## Success Criteria
✅ Operator sees notifications within 1-2 seconds of threshold change
✅ No refresh needed
✅ Works across multiple tabs
✅ Console logs show proper flow
✅ Notifications appear/disappear based on new thresholds
