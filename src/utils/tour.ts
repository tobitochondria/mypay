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
          description: 'Your simple daily earnings tracker. Let’s take a quick tour to see how it works!',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-currency-settings',
        popover: {
          title: '1. Currency Settings',
          description: 'Set the currency symbol shown next to every amount you log.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#tour-calendar-card',
        popover: {
          title: '2. Interactive Calendar & Day Logger',
          description: 'Click on any day to log how much you earned that day, plus an optional note.',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#tour-stats-summary',
        popover: {
          title: '3. Real-Time Earnings Summary',
          description: 'View your Total Earned, Days Logged, and Average per Logged Day for the current view.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-import-export-actions',
        popover: {
          title: '4. Import & Export Data',
          description: 'Export your monthly earnings to CSV spreadsheet format, download full JSON backups, or click "Import Data" to restore backups.',
          side: 'bottom',
          align: 'end'
        }
      }
    ]
  });

  driverObj.drive();
}
