# PLS NOTE THAT THIS MVP IS STILL IN PRODUCTION PHASE,SO SOME OF THE FEATURES MENTIONED ARE STILL NOT COMMITED YET


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).


# 💰 Salary Access MVP (Fintech)

Early Salary Access platform built for hackathons, allowing employees to withdraw earned salary before payday — inspired by products like Earned Wage Access (EWA).

🔗 **Live Demo:**  
https://salary-access-mvp.web.app/

---

## 🚀 Features

- Employer & Employee login (Firebase Auth)
- Role-based dashboards
- Real-time data using Firestore (Google Cloud)
- Withdraw-ready salary model (earned vs available)
- Dark-mode fintech UI
- Deployed on Firebase Hosting

---

## 🏗️ Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS
- **Backend / Infra:** Firebase (GCP)
  - Authentication
  - Firestore Database
  - Hosting
- **Deployment:** Firebase Hosting
- **Language:** JavaScript

---

## 🧠 How It Works (MVP Flow)

1. User logs in as Employer or Employee  
2. Employer dashboard shows company data  
3. Employee dashboard shows:
   - Monthly salary
   - Earned salary
   - Available amount to withdraw  
4. (Next step) Withdrawals are recorded in Firestore

---

## 📦 Project Structure

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
or simply click on https://salary-access-mvp.web.app
https://salary-access-mvp.web.app/

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
