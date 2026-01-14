# Manual Check Feature - Implementation Guide

## 🎯 Problem Solved

**Before:** Manual check sites were hardcoded in JavaScript - users had to edit code to manage them.

**After:** Users can mark any site as "Manual Check Required" directly through the UI!

## ✨ How It Works

### 1. **Adding Sites with Manual Check**
When adding a new site, users can check the "Requires Manual Check" checkbox:
- ✅ Checked = Site will skip automatic checking
- ⬜ Unchecked = Site will be checked automatically

### 2. **Excel File Structure**
The Excel file now has **3 columns**:

| Name          | URL                      | ManualCheck |
|---------------|--------------------------|-------------|
| Google        | https://www.google.com   | No          |
| Internal Site | http://intranet.local    | Yes         |
| Company API   | https://api.example.com  | No          |

### 3. **Status Display**
Sites marked for manual check:
- Show ⚠️ orange warning icon
- Display "Manual check required" message
- No "View" button (since they're not auto-checked)
- Still counted in status summary

## 🔧 Technical Implementation

### Backend (`utils/checkStatus.js`)
```javascript
// checkUrl function now accepts manualCheck parameter
async function checkUrl(name, url, retries = 3, manualCheck = false) {
    if (manualCheck) {
        return { 
            name, url, 
            status: 'caution', 
            error: 'Manual check required', 
            manualCheck: true 
        };
    }
    // ... normal checking logic
}

// addSite now saves ManualCheck to Excel
function addSite(name, url, manualCheck = false) {
    data.push({ 
        Name: name, 
        URL: url, 
        ManualCheck: manualCheck ? 'Yes' : 'No' 
    });
}
```

### Frontend (`views/index.ejs`)
```html
<label class="checkbox-label">
    <input type="checkbox" id="manualCheck">
    <span>Requires Manual Check</span>
</label>
```

### JavaScript (`public/js/app.js`)
```javascript
// Removed hardcoded cautionSites array
// Now reads from API response:
if (result.status === 'caution' || result.manualCheck) {
    // Display as manual check site
}
```

## 📊 Benefits

### ✅ User-Friendly
- No code editing required
- Visual checkbox interface
- Clear labeling

### ✅ Flexible
- Mark/unmark sites anytime by:
  1. Removing the site
  2. Re-adding with correct setting
- Or edit Excel file directly

### ✅ Persistent
- Stored in Excel file
- Survives server restarts
- Part of regular backups

### ✅ Scalable
- No hardcoded limits
- Works with any number of sites
- Easy to migrate/export

## 🎨 UI Enhancement

The checkbox has professional styling:
- Hover effects
- Visual feedback
- Accessible design
- Matches overall theme

## 📝 Usage Examples

### Example 1: Internal Authentication Portal
**Scenario:** Company intranet requires login, automatic checks fail

**Solution:**
1. Add site name: "Employee Portal"
2. Add URL: "http://intranet.company.com"
3. ✅ Check "Requires Manual Check"
4. Click "Add Site"

**Result:** Site appears with ⚠️ icon, won't be auto-checked

### Example 2: API with Rate Limiting
**Scenario:** API has strict rate limits, don't want automated checks

**Solution:**
1. Add site name: "Payment API"
2. Add URL: "https://api.payments.com/health"
3. ✅ Check "Requires Manual Check"
4. Click "Add Site"

**Result:** Site tracked but not hammered with requests

### Example 3: Site Behind VPN
**Scenario:** Site only accessible via VPN, server can't reach it

**Solution:**
1. Add the site with manual check enabled
2. Team manually verifies during business hours
3. Status stays visible in dashboard

## 🔄 Migration from Old System

If you had sites in the old `cautionSites` hardcoded array:

1. **Remove from code** (already done - array removed from app.js)
2. **Update Excel file** manually:
   - Add "ManualCheck" column if missing
   - Set to "Yes" for sites that need manual checking
   - Set to "No" for regular sites
3. **Or re-add through UI**:
   - Remove old entries
   - Add back with checkbox checked

## 🔮 Future Enhancements

Potential additions:
- [ ] Edit existing sites to toggle manual check
- [ ] Bulk import with manual check flags
- [ ] Custom check intervals per site
- [ ] Manual check reminders/notifications
- [ ] Check history for manual sites

## 🛠️ Troubleshooting

**Sites not showing as manual check:**
- Verify Excel has "ManualCheck" column
- Check value is "Yes" (case-insensitive)
- Restart server after manual Excel edits

**Checkbox not saving:**
- Check browser console for errors
- Verify API endpoint is working
- Check file permissions on Excel file

## 📄 Excel File Format

**Required Columns:**
- `Name` (text) - Site display name
- `URL` (text) - Full URL with protocol
- `ManualCheck` (text) - "Yes" or "No"

**Valid Values for ManualCheck:**
- "Yes", "yes", "YES" → Manual check
- "No", "no", "NO" → Automatic check
- Empty/missing → Treated as "No"

---

**This feature eliminates the need to edit code for managing manual check sites!** 🎉
