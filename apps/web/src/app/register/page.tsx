'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      await register({ displayName, email, password, tenantName: workspaceName });
      router.replace('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your workspace. Please try again.');
    }
  }

  return (
    <main className="auth-shell page-shell">
      <header className="auth-header">
        <Link className="brand" href="/"><span className="brand-mark">P</span><span>PanelForge</span></Link>
        <ThemeToggle />
      </header>
      <section className="auth-content">
        <Card className="auth-card auth-card--wide">
          <p className="eyebrow">GET STARTED</p>
          <h1 className="auth-title">Create your <span>workspace.</span></h1>
          <p className="auth-description">One account, one workspace, and a clean slate to build from.</p>
          <form onSubmit={handleSubmit}>
            <Input label="Your name" name="displayName" autoComplete="name" placeholder="Jaspreet Singh" required maxLength={120} value={displayName} onChange={event => setDisplayName(event.target.value)} />
            <Input label="Work email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required maxLength={320} value={email} onChange={event => setEmail(event.target.value)} />
            <Input label="Workspace name" name="workspaceName" placeholder="e.g. Acme Operations" required maxLength={120} value={workspaceName} onChange={event => setWorkspaceName(event.target.value)} />
            <div className="password-field">
              <Input label="Password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 12 characters" required minLength={12} maxLength={128} hint="Use at least 12 characters." value={password} onChange={event => setPassword(event.target.value)} />
              <button className="password-toggle" type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <Button type="submit" size="lg" className="auth-submit" disabled={isLoading}>{isLoading ? 'Creating workspace…' : 'Create workspace'} <span aria-hidden="true">→</span></Button>
          </form>
          <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
        </Card>
        <p className="auth-footnote">Your first account becomes the workspace owner.</p>
      </section>
    </main>
  );
}
