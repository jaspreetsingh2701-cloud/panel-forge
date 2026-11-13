'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';

export function PlatformNavSection() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (user?.platformRole !== 'SUPER_ADMIN') return null;

  const documentationActive = pathname === '/platform/docs';
  const apiReferenceActive = pathname === '/platform/api-reference';

  return (
    <>
      <p className="sidebar-label">PLATFORM</p>
      <nav className="sidebar-nav" aria-label="Platform administration">
        <Link
          className={documentationActive ? 'sidebar-link sidebar-link--active' : 'sidebar-link'}
          href="/platform/docs"
          aria-current={documentationActive ? 'page' : undefined}
        >
          <span>▤</span> Documentation
        </Link>
        <Link
          className={apiReferenceActive ? 'sidebar-link sidebar-link--active' : 'sidebar-link'}
          href="/platform/api-reference"
          aria-current={apiReferenceActive ? 'page' : undefined}
        >
          <span>⌘</span> API Reference
        </Link>
      </nav>
    </>
  );
}
