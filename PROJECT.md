# Dog Grooming Client Management Tool — Project Charter

## What This App Does

Digital client management system for a dog grooming salon. Replaces paper forms.

**Current MVP (Live):**
- Register owners (name, phone, email, address)
- Register dogs (pet name, age, breed, colour, vet, chipped, neutered/spayed status)
- Record grooming visits (date, notes, payment, signature)
- Look up owners & dogs
- View visit history for each dog

**Tech Stack:**
- Frontend: React (Create React App)
- Backend: Supabase (PostgreSQL + auth)
- Hosting: Vercel (auto-deploys from main branch)
- Live URL: https://dog-grooming-app-lytart.vercel.app

**Data:**
- 82 owners, 92 dogs, 190 visits imported from paper records (Jan 2026)

---

## What's In Scope (Next Phase)

1. **Find dog by pet name** — Search across all dogs
2. **Find dog by phone** — Look up via owner phone
3. **Find dog by postcode** — Look up via owner postcode
4. **Book an appointment** — Calendar slot selection + booking flow

---

## What's NOT in Scope (Yet)

- Multi-user login / role-based access
- Groomer scheduling / staff management
- Automated SMS/email notifications
- Payment integration (cash/card only, manual entry)
- Mobile app (web-responsive only)
- Analytics/reporting dashboard
- Integration with vet systems

---

## Known Issues & Tech Debt

### 🔴 Security
- **Supabase secret key in source code** (PARTIALLY FIXED)
  - Old key deleted from Supabase (Jan 28, 2026)
  - New key added to App.js (temporary workaround)
  - **Action needed:** Move to `.env.local` + Vercel secrets (future chat)

### 🟡 Architecture
- All state in App.js (will become unmaintainable >500 lines)
  - **Plan:** Extract screens to separate components before adding 4 new features
- No error handling for network failures
- No loading states during fetch

### 🟡 Data
- No validation on form inputs (e.g., phone format, postcode format)
- No unique constraints on owner phone/email (duplicates possible)

---

## Key Decisions

| Decision | Reason | Date |
|----------|--------|------|
| React + Supabase | Non-coder friendly, fast to build, low cost | Jan 2026 |
| Vercel auto-deploy | No CI/CD setup needed, deploys on every git push | Jan 2026 |
| Paper forms first, then digital entry | Wife can use paper in salon, import data later | Jan 2026 |
| Only publishable key in frontend code | Supabase Row Level Security (RLS) protects data | Jan 2026 |

---

## How To Report Issues

Use GitHub Issues. Tag as:
- `bug` — Something broken
- `feature` — New capability
- `tech-debt` — Code quality, architecture
- `security` — Safety concern

---

## References

- **Wireframe:** DIY_Test_Wire_Frame_2026.pdf (in project root)
- **Data schema:** MASTER_DOGS_TABLE_4.csv, MASTER_VISITS_TABLE_4.csv
- **Repo:** https://github.com/MNewies/dog-grooming-app
