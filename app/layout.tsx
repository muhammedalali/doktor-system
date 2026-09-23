import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { DataProvider } from '@/context/DataContext';

export const metadata = {
  title: 'Doktor Takip Sistemi',
  description: 'Klinik ve Doktor Çalışma Planı Sistemi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <ThemeProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}