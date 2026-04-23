# Denoise X — Project Audit (CLAUDE.md)

> Last updated: 2026-04-24
> Scope: Major missing features & known faults only.

---

## 🚨 MISSING FEATURES (Not Built Yet)

### 1. Sign-In / Auth System — `frontend/src/app/signin/page.tsx`
- The Sign In page is a **placeholder** ("Sign In — coming soon.").
- There is **no authentication at all** — no JWT, no session, no user accounts.
- The backend has zero auth middleware; any user can hit `/api/denoise` without credentials.

### 2. Feedback Page — `frontend/src/app/feedback/page.tsx`
- The Feedback page is a **placeholder** ("Feedback page — coming soon.").
- No form, no backend endpoint, no storage for user feedback.

### 3. Batch Processing / Multi-File Upload
- The denoise page accepts **only one file at a time**.
- The About page and README both advertise "batch processing of entire DICOM studies" — this is **not implemented** in the UI or API.

### 4. Progress / Upload Streaming
- `api.ts` defines an `onProgress` callback parameter in `denoiseImage()` but it is **never wired up** — no real upload progress bar exists. Large files show no progress feedback.

### 5. No `.env` / Environment Config for Production
- `API_BASE_URL` is hardcoded to `http://localhost:8000` with no `.env.example` or deployment guide.
- CORS in the backend only allows `localhost:3000/3001` — **production deployment will break** without changes.

### 6. No Docker / Deployment Setup
- No `Dockerfile`, no `docker-compose.yml`, no CI/CD pipeline.
- Deployment entirely relies on manual local setup steps in README.

---

## ⚠️ KNOWN FAULTS / BUGS

### 7. DICOM Client-Side Parser is Fragile
- The custom DICOM → canvas parser in `denoise/page.tsx` (lines 19–71) is a **hand-rolled byte scanner** that:
  - Assumes little-endian byte order always.
  - Falls back silently to `URL.createObjectURL` (blank for DICOM) on any error.
  - Does NOT use the `dicom-parser` npm package that is already installed as a dependency — wasted install.
- Real-world DICOM files with compressed transfer syntaxes (JPEG 2000, RLE) will silently fail.

### 8. U-Net Output Card Not Shown in Results
- The API returns `unet_b64` (raw U-Net output before CLAHE), but the 3-card result view in the denoise page only shows: **Original → Noise Map → Enhanced Result**.
- The raw U-Net output is **fetched but never displayed** to the user, even though the About page describes it as part of the pipeline.

### 9. Noise Threshold is Hardcoded — No User Control
- The gateway threshold is fixed at `8.0` variance in the backend.
- There is no UI slider or API parameter exposed to the frontend to adjust sensitivity per scan type (e.g., portable vs. standard X-ray).

### 10. No Rate Limiting or File Abuse Protection on Backend
- Any request can upload up to 50 MB files with no throttle.
- No IP-based rate limiting, no API key. Can be trivially abused to overload the model.

### 11. `checkHealth()` Silently Returns `false` on Network Error
- In `api.ts`, `checkHealth()` swallows all errors and returns `false`, making it impossible to distinguish "backend offline" from "network error" from "CORS blocked".

### 12. `package-lock.json` in `backend/` with No Node Dependencies
- `backend/package-lock.json` (86 bytes) exists but the backend is pure Python/FastAPI. This is a stray file that should be removed.

---

## 🔧 TECHNICAL DEBT

### 13. No Frontend Unit or Integration Tests
- The backend has a solid `test_api.py` suite, but the **frontend has zero tests** (no Jest, no Playwright, no Cypress).

### 14. `next-themes` Installed But Never Used
- Dark mode theming package is in `package.json` but no `ThemeProvider` or theme toggle exists anywhere in the app.

### 15. `LungScene3D.tsx` Component Exists But Is Never Imported
- `frontend/src/components/LungScene3D.tsx` (5 KB, Three.js 3D lung scene) is built but **never used** on any page.

### 16. `DotGrid.tsx` Component Unused
- `frontend/src/components/DotGrid.tsx` (9 KB) is also present but **not imported or rendered** anywhere in the current pages.

---

## 📋 PRIORITY ORDER (Recommended)

| Priority | Item |
|----------|------|
| 🔴 HIGH | Sign-In / Auth (#1) |
| 🔴 HIGH | Fix fragile DICOM parser — use `dicom-parser` package (#7) |
| 🟠 MEDIUM | Feedback page implementation (#2) |
| 🟠 MEDIUM | Show U-Net output card in results (#8) |
| 🟠 MEDIUM | Batch file upload (#3) |
| 🟡 LOW | Wire up `onProgress` for upload feedback (#4) |
| 🟡 LOW | Add `.env.example` and production CORS config (#5) |
| 🟡 LOW | Docker / deployment setup (#6) |
| 🟡 LOW | Remove unused components / stray files (#12, #15, #16) |
