import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function startAppTour() {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(15, 23, 42, 0.65)',
    steps: [
      {
        element: '.app-header',
        popover: {
          title: '👋 Welcome to MyPay Calculator',
          description: 'Your personal wage, salary, overtime, and payday tracker. Let’s take a quick tour to see how it works!',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-profile-selector',
        popover: {
          title: '1. Source of Income & Job Profiles',
          description: 'Create and switch between multiple job profiles. Toggle between **Regular** (includes 200% double pay & 130% premium holiday multipliers) and **Contractual** (fixed daily rate).',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#tour-wage-settings',
        popover: {
          title: '2. Daily Wage & Shift Configuration',
          description: 'Set your daily wage rate, standard shift length, payment frequency (Semi-Monthly on 15th/End of Month or Monthly), and payday rules.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#tour-work-schedule',
        popover: {
          title: '3. Work Schedule Preset',
          description: 'Choose your weekly work schedule (Mon-Fri, Mon-Sat, or Custom). Scheduled work days are automatically flagged on the calendar.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#tour-deductions',
        popover: {
          title: '4. Tax & Itemized Deductions',
          description: 'Add percentage or fixed amount deductions (e.g., Tax, SSS, PhilHealth). Deductions are automatically subtracted to calculate net take-home pay.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#tour-holidays',
        popover: {
          title: '5. Auto-Detected Holidays',
          description: 'Detects official holidays based on your selected country code. You can also add custom company holidays.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#tour-calendar-card',
        popover: {
          title: '6. Interactive Calendar & Day Logger',
          description: 'Click on any day cell to open the Day Log. Mark attendance, log overtime/undertime, select Paid Leave (SL/VL), add notes, or set manual income overrides!',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#tour-stats-summary',
        popover: {
          title: '7. Real-Time Pay & Earnings Summary',
          description: 'View your calculated Gross Earnings, Total Deductions, Net Take-Home Pay, and Days Rendered. Click "View Itemized Breakdown" for a full summary table.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-import-export-actions',
        popover: {
          title: '8. Import & Export Data',
          description: 'Export your monthly payroll report to CSV spreadsheet format, download full JSON backups, or click "Import Data" to restore backups.',
          side: 'bottom',
          align: 'end'
        }
      }
    ]
  });

  driverObj.drive();
}
