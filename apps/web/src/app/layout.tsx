import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'PanelForge',
  description: 'Build the admin application your team needs.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
