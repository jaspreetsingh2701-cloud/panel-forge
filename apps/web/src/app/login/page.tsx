'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.replace('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    }
  }

  return (
    <main className="auth-shell page-shell">
      <header className="auth-header">
        <Link className="brand" href="/">
          <span className="brand-mark">P</span>
          <span>PanelForge</span>
        </Link>
        <ThemeToggle />
      </header>
      <section className="auth-content">
        <Card className="auth-card">
          <p className="eyebrow">WELCOME BACK</p>
          <h1 className="auth-title">
            Sign in to your <span>workspace.</span>
          </h1>
          <p className="auth-description">Pick up where your team left off.</p>
          <form onSubmit={handleSubmit}>
            <Input
              label="Work email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <div className="password-field">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="auth-submit" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'} <span aria-hidden="true">→</span>
            </Button>
          </form>
          <p className="auth-switch">
            New to PanelForge? <Link href="/register">Create an account</Link>
          </p>
        </Card>
        <p className="auth-footnote">Secure access to your team&apos;s workspace.</p>
      </section>
    </main>
  );
}
