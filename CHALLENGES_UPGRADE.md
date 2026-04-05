# CHALLENGES SYSTEM - UPGRADE REPORT
## April 5, 2026

### COMPLETED

✅ **HTML Enhancements**
- Added new "📊 Progression" tab to challenges modal
- Added challenge scope selector (🏰 Confrérie vs 🌍 Global)
- Updated challenge creation form UI

✅ **Files Added**
- `js/challenges_ui.js` - Standalone challenge UI functions
  - `setChallengeScope(scope)` - Toggle between confrérie/global
  - `displayChallengeProgress()` - Visualize sperm race animation
  - `deleteChallenge(id)` - Placeholder for deletion

✅ **Challenge Progress Visualization**
- Race track with "spermatozoids" advancing toward finish line
- Each participant = one "sperm" advancing at their BR percentage
- Gold color with spermatozoid shape (clip-path polygon)
- Green finish line at 100%
- Leader info displayed below track

✅ **Auto-Participation**
- All users automatically added as participants when challenge created
- Challenge creation uses `currentChallengeScope` variable
- No manual opponent selection needed

✅ **Challenge Deletion**
- Only creator can see delete button
- Onclick handler properly exposed to global scope
- Delete button is red (🗑️ Supprimer)

### IN PROGRESS / TO DO

🟡 **Critical Fixes Needed**
1. **Delete Challenge Bug** - Function needs proper implementation
   - Issue: window.deleteChallenge needs actual Firestore deletion
   - Fix: Update challenges_ui.js to call actual app.js deleteChallenge

2. **Challenge Progress Tab Integration**
   - Need to call displayChallengeProgress() when tab clicked
   - Update switchChallengeTab to recognize 'challenge-progress'

3. **Scope Selection in Creation**
   - HTML buttons ready but need functionality
   - currentChallengeScope not stored in database
   - Need to add "scope" field to challenge doc

🔴 **Architecture Changes Needed**

#### 1. Challenge Structure Update
```firestore
challenges/{challengeId}
├── ... existing fields ...
├── scope: "confrerie" | "global"  // NEW
├── approvalStatus: "pending" | "approved" | "rejected"  // NEW for global
├── approvedBy: userId  // NEW for admin approval
└── createdAt: timestamp
```

#### 2. Admin Approval for Global Challenges
- New collection: `challengeApprovals/{id}`
- Admin Dashboard view
- Approve/Reject buttons
- Auto-publish on approval

#### 3. Confrérie Filtering
- If scope === "confrerie": filter participants by confrérie
- Only members of creator's confrérie
- Changed from hardcoded all-users

#### 4. BR Window Auto-Increment
- Listen for new BR creations
- Check BR.createdAt within challenge.startDate → challenge.endDate
- Auto-increment participants[currentUser].br
- Already partially implemented

#### 5. Spermatozoid Animation Enhancement
- Smoother transitions (currently 0.3s)
- Photo overlay on "sperm" (circle background-image)
- Pulsing animation at finish line
- Leader highlight

### FILES MODIFIED

**index.html**
```html
<!-- NEW onglet added -->
<button class="challenge-tab-btn" data-tab="challenge-progress">📊 Progression</button>

<!-- NEW onglet content -->
<div id="tab-challenge-progress" class="challenge-tab-content">

<!-- NEW scope selector in create -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
    <button type="button" id="challenge-scope-confr" onclick="setChallengeScope('confrerie')">🏰 Confrérie</button>
    <button type="button" id="challenge-scope-global" onclick="setChallengeScope('global')">🌍 Global</button>
</div>
```

**js/challenges_ui.js** (NEW)
- Standalone module loaded after app.js
- IIFE pattern for scope safety
- Functions exposed to window for onclick

### NEXT IMMEDIATE STEPS

1. **Fix delete** 
   - Implement actual Firestore deleteDoc call
   - Test onclick trigger

2. **Test progression tab**
   - Verify displayChallengeProgress() renders correctly
   - Check sperm animation smoothness

3. **Implement scope selection**
   - Store scope in challenge doc
   - Filter participants by confrérie if scope === 'confrerie'

4. **Admin approval flow**
   - Create admin dashboard tab
   - Pending challenges list
   - Approve/reject buttons

### TECHNICAL NOTES

**Why separate files?**
- Avoid module scope issues with onclick handlers
- Simpler debugging of UI functions
- Easy to test independently

**Why IIFE?**
- Prevents global namespace pollution
- Keeps functions organized
- Cleaner than direct assignments

**Why spermatozoid shape?**
- Playful, memorable visualization
- Immediately obvious what advancing
- Different from typical progress bar
- Matches the "competitive" tone

---

**Status**: 70% Complete
**Estimated Time to Full Feature**: 2-3 hours
**Risk Level**: Low (UI only, no breaking changes)
