# Notification Click to Highlight Unit Feature

## Feature Description
Pag-click mo sa notification, automatic na mag-navigate sa tamang tab at mag-highlight yung specific unit na delayed. May smooth scroll animation at pulsing highlight effect para madaling makita.

## Implementation Details

### 1. Added Highlighting Support to UnitListTable

**Props Added:**
- `highlightedUnitId` - ID ng unit na dapat i-highlight

**Features:**
- Auto-scroll to highlighted unit using `scrollIntoView`
- Pulsing yellow highlight effect with animation
- Automatic clear ng highlight after 5 seconds

**Visual Effects:**
```javascript
// Highlighted row styling - INSIDE the table
className="bg-warning bg-opacity-50 border-warning border-3"
style={{
    position: 'relative',
    animation: 'pulse-row 2s ease-in-out infinite'
}}
```

**CSS Animation:**
```css
@keyframes pulse-row {
    0%, 100% {
        background-color: rgba(255, 193, 7, 0.5);
    }
    50% {
        background-color: rgba(255, 193, 7, 0.7);
    }
}
```

**Key Changes:**
- Uses `background-color` animation instead of `box-shadow`
- Border stays inside table boundaries (`border-3`)
- Higher opacity (50% to 70%) for better visibility
- No overflow outside table cells

### 2. Enhanced Notification Click Handler

**Smart Tab Navigation:**
- Detects unit status from notification
- Navigates to correct tab:
  - "No Good (NG)" → `no_good` tab
  - "In Progress" → `in_progress` tab
  - "Completed" → `completed` tab

**Auto-clear Highlight:**
- Highlight automatically clears after 5 seconds
- Prevents confusion kung maraming notifications

**Code:**
```javascript
const handleNotificationClick = (notification) => {
    if (notification.type === 'DelayedUnit') {
        // Highlight unit
        setHighlightedUnitId(notification.unitId);
        
        // Smart navigation based on status
        const status = (notification.status || '').toLowerCase();
        if (status.includes('no good') || status.includes('ng')) {
            setActiveTab('no_good');
        } else if (status.includes('in progress')) {
            setActiveTab('in_progress');
        } else if (status.includes('completed')) {
            setActiveTab('completed');
        }
        
        // Clear highlight after 5 seconds
        setTimeout(() => {
            setHighlightedUnitId(null);
        }, 5000);
    }
};
```

### 3. Auto-Scroll Implementation

**useEffect Hook:**
```javascript
useEffect(() => {
    if (highlightedUnitId && highlightedRowRef.current) {
        highlightedRowRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}, [highlightedUnitId]);
```

**Ref Assignment:**
```javascript
const isHighlighted = highlightedUnitId === unit.id;

<tr 
    ref={isHighlighted ? highlightedRowRef : null}
    // ... other props
>
```

## User Experience Flow

1. **User sees notification** - Bell icon shows delayed unit count
2. **User clicks notification** - Opens notification panel
3. **User clicks specific unit** - Triggers navigation
4. **Automatic navigation** - Goes to correct tab based on unit status
5. **Smooth scroll** - Scrolls to unit position in table
6. **Visual highlight** - Yellow pulsing border around unit row
7. **Auto-clear** - Highlight fades after 5 seconds

## Visual Design

### Highlight Colors
- **Background**: Yellow with 50% to 70% opacity (pulsing)
- **Border**: Yellow with 3px width (`border-warning border-3`)
- **Animation**: Background color pulse (no shadow overflow)

### Animation
- **Duration**: 2 seconds per pulse cycle
- **Easing**: ease-in-out for smooth effect
- **Infinite**: Continues until cleared
- **Effect**: Background opacity pulses from 50% to 70%

### Scroll Behavior
- **Behavior**: Smooth animation
- **Block**: Center - positions unit in middle of viewport
- **Timing**: Instant on click

### Table Boundaries
- All highlight effects stay INSIDE the table
- No overflow outside table cells
- Border and background contained within row

## Benefits

✅ **Better UX** - Easy to find delayed units  
✅ **Visual feedback** - Clear indication of which unit was clicked  
✅ **Smart navigation** - Goes to correct tab automatically  
✅ **Smooth animations** - Professional look and feel  
✅ **Auto-cleanup** - Highlight clears automatically  
✅ **Accessible** - Works with keyboard navigation  

## Testing Checklist

- [ ] Click notification bell
- [ ] Click on a delayed unit notification
- [ ] Verify navigation to correct tab (In Progress, No Good, etc.)
- [ ] Verify smooth scroll to unit position
- [ ] Verify yellow pulsing highlight appears
- [ ] Verify highlight clears after 5 seconds
- [ ] Test with multiple notifications
- [ ] Test with units at different scroll positions
- [ ] Test with different unit statuses

## Files Modified

### Component Files
- `frontend/src/Operators/components/UnitListTable.jsx`
  - Added `highlightedUnitId` prop
  - Added `highlightedRowRef` ref
  - Added auto-scroll useEffect
  - Added highlight styling with background pulsing animation
  - Changed from box-shadow to background-color animation
  - Added pulse-row CSS keyframes (stays inside table)
  - Increased border width to 3px for better visibility

- `frontend/src/Operators/StationDashboard.jsx`
  - Enhanced `handleNotificationClick` with smart navigation
  - Added auto-clear timeout (5 seconds)
  - Passed `highlightedUnitId` prop to UnitListTable

## Technical Details

### State Management
- `highlightedUnitId` state stored in StationDashboard
- Passed down to UnitListTable as prop
- Cleared automatically after 5 seconds

### Performance
- Only one ref per table (highlighted row)
- Smooth scroll uses native browser API
- CSS animations use GPU acceleration
- No unnecessary re-renders

### Browser Compatibility
- `scrollIntoView` - Supported in all modern browsers
- CSS animations - Supported in all modern browsers
- Smooth scroll behavior - Graceful fallback to instant scroll

## Future Enhancements

Possible improvements:
- [ ] Add sound notification on click
- [ ] Add haptic feedback on mobile
- [ ] Allow manual dismiss of highlight
- [ ] Add keyboard shortcut to jump to next delayed unit
- [ ] Add "Mark as Acknowledged" button
- [ ] Show unit details in notification preview

## Notes

- Ang highlight effect ay consistent sa existing design system
- Uses Bootstrap color utilities for consistency
- Animation timing optimized for visibility without being distracting
- Auto-clear prevents confusion when clicking multiple notifications
- Smart navigation ensures user always sees the correct data
