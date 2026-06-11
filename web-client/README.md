# CSBank Underwrite Web Client

A modern, responsive Next.js frontend client for the **CSBank Loan Underwriting Decision System**. 

This portal enables loan officers to assess loan eligibility, inspect feature importance using SHAP explainability reasons, and audit past underwriting decisions.

---

## 🎨 Design & Tech Stack

* **Framework**: Next.js (App Router, TypeScript)
* **Styling**: Tailwind CSS
* **Icons**: `lucide-react`
* **Features**:
  * **Branded Interface**: Custom slate dark theme with emerald glow effects.
  * **Modular Navigation**: Common authenticated `Navbar` component with links to Calculator and Audits.
  * **Interactive Calculator**: Real-time validation and submission of applicant data.
  * **Decision Audit Log**: Review historical predictions, eligibility, and confidence scores.
  * **SHAP Explainability View**: Visual highlights of features that increased or decreased approval probability.

---

## ⚙️ Getting Started

### 1. Installation

Install dependencies using `pnpm`. On Windows systems, bypass compilation failures for native packages by utilizing `--ignore-scripts`:

```bash
pnpm install --ignore-scripts
```

### 2. Run the Development Server

Start the local server on port `4000` to avoid conflicts:

```bash
pnpm dev --port 4000
```

Open [http://127.0.0.1:4000](http://127.0.0.1:4000) in your browser.

### 3. Register a Loan Officer Account

Because the database contains **no pre-seeded credentials**, navigate to **Sign Up** first to register a new user account.

---

## 📁 Directory Structure

```
web-client/
├── src/
│   ├── app/
│   │   ├── history/            # Audit history logs view
│   │   │   ├── [id]/           # Individual log inspection (SHAP explanations)
│   │   │   └── page.tsx        
│   │   ├── login/              # Sign In screen
│   │   ├── register/           # Account registration screen
│   │   ├── page.tsx            # Loan Eligibility Calculator (Home)
│   │   ├── layout.tsx          
│   │   └── globals.css         
│   ├── components/
│   │   └── Navbar.tsx          # Authenticated common header
│   └── utils/
│       └── api.ts              # API fetch wrappers and session handling
```
