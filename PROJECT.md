# Dog Grooming App - Project Overview

## Project Status
**Live:** https://dog-grooming-app-lytart.vercel.app
**Repo:** https://github.com/MNewies/dog-grooming-app
**Tech Stack:** React + Supabase + Vercel

---

## Feature Backlog (Prioritized)

### ✅ Feature #1: Find Dog by Pet Name
- **Status:** Complete & Live
- **What it does:** Search dogs by name with real-time filtering
- **Deployed:** Production

### ✅ Feature #2: Edit Owner Record
- **Status:** Complete & Live
- **What it does:** Full CRUD for owner data (name, phone, email, address, postcode)
- **Validation:** Email format, duplicate phone warning
- **Deployed:** Production

### ✅ Feature #3: Edit Dog Record
- **Status:** Complete & Live
- **What it does:** Edit any dog field (pet name, age, breed, colour, vet, vet phone, chipped, neutered/spayed)
- **Validation:** Pet name required
- **Deployed:** Production (merged PR #3, May 4, 2026)

### ⏳ Feature #4: Create Visit with Calendar Booking
- **Status:** Not started
- **What it does:** Book grooming slots (30-min intervals), select multiple slots per dog, manage availability
- **Dependencies:** Calendar UI library, visit creation logic
- **Priority:** High

### ⏳ Feature #5: Manage Breed Master List
- **Status:** Not started
- **What it does:** Admin feature to add/update/delete breed options
- **Current count:** 516 breeds
- **Priority:** Medium

---

## Development Notes

### Code Patterns
- **Edit flows:** Use pattern from Feature #2 (Manage Owner) — state management, validation, success/error messages
- **Form handling:** Controlled components with onChange handlers
- **Database writes:** Supabase `.update().eq(id)` pattern
- **Navigation:** setScreen() for page routing

### Deployment Workflow
1. Create feature branch: `git checkout -b feature/<name>`
2. Code changes in VS Code
3. Push to branch: `git push origin feature/<name>`
4. Create Pull Request on GitHub
5. Merge PR → Vercel auto-deploys to production
6. Test live app

### Known Issues
- App.js is 270+ lines; plan component extraction before Feature #4
- No breed validation against master list yet (future enhancement)

### Security
- ✅ Supabase credentials moved to environment variables (Session 11)
- ✅ Row Level Security enabled on all three tables: owners, dogs, visits (Session 23)
  - Anon key allowed full access via RLS policy
  - No public access without valid credentials

### Database Schema
**Owners table:** id, name, phone, email, postcode, house_street, town
**Dogs table:** id, owner_id, pet_name, pet_age, breed, colour, chipped, neutered_spayed, vet, vet_phone
**Visits table:** id, dog_id, visit_number, visit_date, treatment_notes, payment_amount, payment_method, signature_of_consent, date_of_signature

---

## Next Steps
1. Plan Feature #4 (Calendar booking) scope and UI
2. Consider extracting App.js into smaller components
3. Add breed validation against master list (optional for Feature #4)