import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PanelForge',
  description: 'Build the admin application your team needs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
