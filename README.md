<div align="center">
  <img src="public/MyPay.svg" width="120" height="120" alt="MyPay Calculator Logo">
  <h1>MyPay Calculator</h1>
  <p><b>Personal Salary, Wage & Payday Tracker</b></p>

  [![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-6-purple.svg?logo=vite)](https://vitejs.dev/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](#license)
</div>

---

## 📌 Overview

**MyPay Calculator** is a full-featured web application designed to help workers, freelancers, contractual employees, and regular corporate staff track their daily wages, overtime, undertime, paid leaves, holiday bonuses, tax deductions, and net take-home pay across multiple job profiles.

Whether you earn a fixed daily rate or receive holiday double pay (200%) & premium pay (130%) multipliers, **MyPay Calculator** calculates your exact payroll, tracks target paydays, and generates spreadsheet reports with complete precision.

---

## 🛠️ Tech Stack

- **Core Framework**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS (Custom Tokens, CSS Grid/Flexbox, Glassmorphism & Light Theme System)
- **Typography**: [Inter Font](https://fonts.google.com/specimen/Inter)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Interactive Tour**: [Driver.js](https://driverjs.com/)
- **Date Utilities**: [date-fns](https://date-fns.org/) & [date-holidays](https://www.npmjs.com/package/date-holidays)

---

## ✨ Features

### 💼 1. Multi-Job Profile Management
- Create and switch between multiple job profiles seamlessly.
- **Regular Employment**: Includes official holiday multipliers (Double Pay 200% & Special Non-Working 130%).
- **Contractual Employment**: Uses fixed standard daily rates without holiday multipliers.
- Configurable start and optional end dates per profile.

### ⚙️ 2. Wage & Shift Configuration
- **Daily Rate & Shift Length**: Input base daily wage rate and shift length in hours.
- **Payment Frequency**: Support for **Semi-Monthly** (15th & End of Month) and **Monthly** schedules.
- **Payday Rules**: Configure weekend/holiday payday rules (*On or Before Payday*, *Exact Date*, or *After Payday*).

### 📅 3. Interactive Monthly Calendar & Day Logger
- **Work Schedule Presets**: Quick select Mon-Fri, Mon-Sat, or 7-Day work weeks.
- **Attendance & Work Status**: Log base shift, Overtime (+OT hours), Undertime (-UT hours), Paid Leave (SL/VL), Absent, or Rest Day Off.
- **Manual Earned Income Override**: Manually override any daily earnings calculation with custom amounts.
- **Undo Logged Day**: Easily clear and revert any logged day back to its unedited default schedule.
- **Daily Notes**: Attach custom notes to specific calendar dates.

### 🇵🇭 4. Auto-Detected Country Holidays
- Automatically fetches official national holidays based on country code (e.g. Philippines `PH`).
- Add custom company-specific holidays with custom multiplier rates.

### 📊 5. Real-Time Pay & Earnings Summary
- Dynamic calculation of **Gross Pay**, **Overtime Pay**, **Undertime Deductions**, **Holiday Bonuses**, **Tax & Itemized Deductions**, and **Net Take-Home Pay**.
- **Itemized Breakdown Modal**: View full payroll summary tables with breakdown per day rendered.

### 🧭 6. Interactive Guided Tour ("Take a Tour")
- Built-in interactive onboarding walkthrough powered by **Driver.js** that highlights UI elements step-by-step to explain all application features to new users.

### 💾 7. Data Backup & CSV Export
- **CSV Report Export**: Download formatted payroll reports compatible with Microsoft Excel & Google Sheets.
- **JSON Full Backup & Restore**: Export multi-profile data snapshots and restore backups anytime via the **Import Data** header action.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/mypay.git
   cd mypay
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 📁 Project Structure

```text
mypay/
├── public/
│   ├── MyPay.svg             # Application logo & favicon
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Calendar/         # Calendar grid, header, cell & DayModal
│   │   ├── Export/           # CSV/JSON Export & Import Modal
│   │   ├── Sidebar/          # Profile selector, wage settings, schedule picker, deductions
│   │   ├── Stats/            # Pay summary stats & itemized breakdown modal
│   │   └── UI/               # Header navigation & brand components
│   ├── types/                # TypeScript interfaces & domain types
│   ├── utils/                # Pay calculations, date utilities, storage & tour helpers
│   ├── App.css               # Main layout & component styling
│   ├── App.tsx               # Primary application state orchestration
│   ├── index.css             # CSS Tokens & global style rules
│   └── main.tsx              # Application entry point
├── package.json
├── README.md
└── vite.config.ts
```

---

## 📄 License

This project is licensed under the MIT License.
