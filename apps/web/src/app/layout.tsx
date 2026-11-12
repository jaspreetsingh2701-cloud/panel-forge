import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { ThemeProvider, type Theme } from '@/components/theme/theme-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'PanelForge',
  description: 'Build the admin application your team needs.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const savedTheme = cookieStore.get('panelforge-theme')?.value;
  const initialTheme: Theme = savedTheme === 'light' ? 'light' : 'dark';

  return (
    <html lang="en" data-theme={initialTheme}>
      <body>
        <ThemeProvider initialTheme={initialTheme}>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
