Development Workflow — How We Build Features
This guide keeps code coherent as we add features. Follow this process every time.

The 4-Step Feature Workflow
Step 1: Define the Feature (Before You Code)
Write a brief spec. Use this template in a GitHub Issue:
## Feature: [Name]

**What it does:**
[1-2 sentences describing user action]

**Acceptance criteria:**
- [ ] User can [do X]
- [ ] System shows [result Y]
- [ ] Error handling for [edge case Z]

**Data involved:**
- Reads: [which tables/fields]
- Writes: [which tables/fields]
- Validates: [what rules]

**Where in UI:**
[Which screen(s) does this appear on?]

**Known constraints:**
[Any tech debt or limits this bumps into?]
Example (Find dog by pet name):
## Feature: Find dog by pet name

**What it does:**
User enters partial or full dog name, sees matching results instantly.

**Acceptance criteria:**
- [ ] User can type in search box on "Find/Add Dog" screen
- [ ] Results filter in real-time as they type
- [ ] Clicking a result shows that dog's visit history
- [ ] Shows "No dogs found" if no matches
- [ ] Search is case-insensitive

**Data involved:**
- Reads: dogs.pet_name, dogs.owner_id (via owners)
- Writes: none
- Validates: input not empty

**Where in UI:**
Screen: "Find/Add Dog" (existing)
New element: Search input + filtered list

**Known constraints:**
- App.js is getting large; consider extracting "FindDog" to component
- No debouncing (might lag if 1000+ dogs, but OK for now)

Step 2: Create a Git Branch
Before coding, create a feature branch:
bashgit checkout -b feature/find-dog-by-name
Branch naming:

feature/[what-it-does] — New capability
bugfix/[what-breaks] — Fix
refactor/[what-improves] — Code quality


Step 3: Code & Commit
Commit frequently. Each commit = one logical change.
Commit message format:
[SCOPE] Brief description

Optional longer explanation if needed.

Closes #123 (if fixing a GitHub issue)
Examples:
[FEATURE] Add pet name search to FindDog screen

User can now type a dog name and see real-time results.
Implemented via local filtering (no new API calls).

Closes #15

---

[REFACTOR] Extract FindDog into separate component

App.js was 400+ lines. Moved FindDog screen logic to 
src/screens/FindDog.js to reduce complexity.

---

[BUGFIX] Handle empty search input gracefully

Previously crashed if user submitted empty search.
Now shows "Enter a name" message.
Code style:

Use same indentation as existing code (2 spaces)
Function names: camelCase
Component names: PascalCase
State: descriptive names (not x, data, result)


Step 4: Test & Submit PR
Before pushing:

Test manually in browser

Does it work?
Does it break existing features?
Does it handle empty inputs, errors?


Check for console errors (F12 → Console tab)
Push to GitHub

bash   git push origin feature/find-dog-by-name

Create a Pull Request (PR)

Title: Same as your feature name
Description: Link the issue (#123)
Request review if needed


Merge to main (or ask for review first)


Code Locations & Responsibilities
Current Structure (as of Jan 28, 2026)
src/
├── App.js          ← ALL logic lives here (will refactor)
├── App.css         ← Styling
├── App.test.js     ← Tests (if any)
├── index.js        ← Entry point (don't touch)
└── logo.svg        ← Asset (don't touch)

public/
├── index.html      ← HTML shell (don't touch)
└── favicon.ico     ← Icon

.env.local         ← Secrets (CREATE THIS in future)
.gitignore         ← Files to NOT commit
package.json       ← Dependencies
Where to Add New Features
Feature TypeFileNotesNew screen (e.g., calendar)Add to App.js logic + UI (temporary)Extract to separate component once App.js > 500 linesNew API call (e.g., search dogs)Add function in App.js → move to src/api/ laterKeep Supabase calls in one placeStyling for new featureAdd to App.css with commentUse class names like .find-dog-input, .search-resultsTest for featureCreate src/FeatureName.test.jsNot required for MVP, but do it if you can

Example: Adding "Find Dog by Pet Name"
Step 1: GitHub Issue
## Feature: Find dog by pet name

What it does: User enters dog name, sees matching dogs instantly.

Acceptance criteria:
- [ ] Search input on "Find/Add Dog" screen
- [ ] Real-time filter as user types
- [ ] Case-insensitive matching
- [ ] Shows "No dogs found" when empty
- [ ] Clicking result loads dog visit history

Data involved:
- Reads: dogs.pet_name
- Writes: none

Where: FindDog screen (modify existing)

Constraints: App.js is 270 lines; refactor to component after this.
Step 2: Create branch
bashgit checkout -b feature/find-dog-by-name
Step 3: Code changes (pseudocode)
In App.js, modify the "Find/add dog screen" section:
javascript// Add new state for search
const [dogNameSearch, setDogNameSearch] = useState('');

// Filter dogs based on search (case-insensitive)
const filteredDogs = selectedOwner 
  ? dogs.filter(dog => 
      dog.pet_name.toLowerCase().includes(dogNameSearch.toLowerCase())
    )
  : [];

// In UI: Add search input before dog list
<input 
  type="text" 
  placeholder="Search dog name..." 
  value={dogNameSearch}
  onChange={(e) => setDogNameSearch(e.target.value)}
/>

// Show filtered results
{filteredDogs.length > 0 ? (
  <div className="dog-list">
    {filteredDogs.map(dog => (...))}
  </div>
) : dogNameSearch ? (
  <p>No dogs found with that name</p>
) : (
  <p>Type a name to search</p>
)}
Step 4: Test

Open browser, go to Find/Add Dog
Type in search box
Verify results filter in real-time
Try edge cases: empty, no results, special characters
Check console for errors

Step 5: Commit
bashgit add .
git commit -m "[FEATURE] Add pet name search on FindDog screen

User can now search for dogs by typing pet name.
Search is case-insensitive and filters in real-time.

Closes #15"

git push origin feature/find-dog-by-name

When Code Gets Messy
Current app.js: ~270 lines. Plan refactors when:

Any file > 400 lines
You have >5 related functions that belong together
You want to reuse a screen in multiple places

Refactor pattern:

Create new file: src/screens/FindDog.js
Move screen component to new file
Keep state in App.js (for now)
Import and call from App.js
Test that nothing breaks


Rules That Keep Integrity

One feature per branch — Don't mix "find by name" + "find by phone" in same PR
Write the spec first — Never code without knowing what done looks like
Commit messages explain WHY, not WHAT — "Add pet name search" is what. "Users need to find dogs faster" is why
Test manually before pushing — No CI tests yet; you're the test
Reference GitHub issues in commits — Creates traceability (Closes #15)


Help!
If you're stuck:

Check existing code for similar patterns
Look at your wireframe (PROJECT.md references it)
Ask Claude in a new chat, paste the error + relevant code
GitHub Issues are your rubber duck — writing them clearly often solves the problem


Next Steps:

Create GitHub Issue using the template above
Create branch: git checkout -b feature/find-dog-by-name
Make changes to App.js
Test in browser
Commit with message format above
Push & merge

Ready to build the first feature?
