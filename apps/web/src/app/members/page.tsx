'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ThemeToggle } from '@/components/theme/theme-toggle';
type Member={id:string;role:'OWNER'|'ADMIN'|'MEMBER';createdAt:string;user:{id:string;email:string;displayName:string|null}};
type Invitation={id:string;email:string;role:'ADMIN'|'MEMBER';expiresAt:string};
export default function MembersPage(){
 const router=useRouter(); const {user,tenants,accessToken,isLoading,refreshSession}=useAuth(); const tenant=tenants[0];
 const [members,setMembers]=useState<Member[]>([]),[invitations,setInvitations]=useState<Invitation[]>([]);
 const [email,setEmail]=useState(''),[role,setRole]=useState<'ADMIN'|'MEMBER'>('MEMBER');
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const request=useCallback(async(path:string,init?:RequestInit)=>{
  if(!tenant||!accessToken) throw new Error('Workspace session unavailable.');
  const response=await fetch(`/api/v1/tenants/${tenant.id}/${path}`,{...init,credentials:'include',cache:'no-store',headers:{Authorization:`Bearer ${accessToken}`,...(init?.headers??{})}});
  if(!response.ok){const payload=await response.json().catch(()=>null) as {message?:string|string[]}|null;throw new Error(Array.isArray(payload?.message)?payload.message.join(' '):payload?.message||'Request failed.');}
  return response.json();
 },[tenant,accessToken]);
 const load=useCallback(async()=>{
  try{const [m,i]=await Promise.all([request('members'),request('invitations')]);setMembers(m as Member[]);setInvitations(i as Invitation[]);setError('');}
  catch(e){setError(e instanceof Error?e.message:'Could not load members.');}finally{setLoading(false);}
 },[request]);
 useEffect(()=>{if(!user) void refreshSession().then(ok=>{if(!ok)router.replace('/login');});},[user,refreshSession,router]);
 useEffect(()=>{if(user&&tenant&&accessToken) void load();},[user,tenant,accessToken,load]);
 async function invite(e:FormEvent<HTMLFormElement>){e.preventDefault();setSaving(true);setError('');setNotice('');
  try{const item=await request('invitations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,role})}) as Invitation;setInvitations(old=>[item,...old]);setEmail('');setNotice('Invitation recorded. Automated email delivery is not configured yet.');}
  catch(e){setError(e instanceof Error?e.message:'Could not create invitation.');}finally{setSaving(false);}
 }
 async function revoke(id:string){try{await request(`invitations/${id}`,{method:'DELETE'});setInvitations(old=>old.filter(x=>x.id!==id));setNotice('Invitation revoked.');}catch(e){setError(e instanceof Error?e.message:'Could not revoke invitation.');}}
 if(!user)return <main className="app-loading page-shell"><span className="brand-mark">P</span><p>{isLoading?'Restoring your session…':'Opening your workspace…'}</p></main>;
 const greeting=user.displayName||user.email,canManage=tenant?.role==='OWNER'||tenant?.role==='ADMIN';
 return <main className="app-shell"><aside className="app-sidebar">
  <Link className="brand" href="/"><span className="brand-mark">P</span><span>PanelForge</span></Link>
  <div className="sidebar-workspace"><span className="workspace-avatar">{tenant?.name?.slice(0,1).toUpperCase()??'W'}</span><span><strong>{tenant?.name??'Your workspace'}</strong><small>{tenant?.role??'Member'}</small></span></div>
  <p className="sidebar-label">WORKSPACE</p><nav className="sidebar-nav" aria-label="Workspace navigation">
   <Link className="sidebar-link" href="/app"><span>▦</span> Overview</Link><Link className="sidebar-link" href="/applications"><span>◫</span> Applications</Link><Link className="sidebar-link sidebar-link--active" href="/members" aria-current="page"><span>♧</span> Members</Link><a className="sidebar-link sidebar-link--disabled" href="#data-sources"><span>⌘</span> Data sources <span className="pf-badge">Coming soon</span></a>
  </nav><div className="sidebar-bottom"><p className="sidebar-label">ACCOUNT</p><div className="account-mini"><span className="user-avatar">{greeting.slice(0,1).toUpperCase()}</span><span><strong>{greeting}</strong><small>{user.email}</small></span></div></div>
 </aside><section className="app-main"><header className="app-topbar"><div><Link className="breadcrumb-muted" href="/app">Workspace</Link><span className="breadcrumb-divider">/</span><strong>Members</strong></div><div className="app-top-actions"><span className="topbar-user">{user.email}</span><ThemeToggle/></div></header>
 <div className="dashboard-content members-content"><div className="applications-heading"><div><p className="eyebrow">WORKSPACE ACCESS</p><h1>Members <span>& invitations.</span></h1><p>Manage who can access this workspace and track pending invitations.</p></div><span className="pf-badge pf-badge--info">{members.length} active members</span></div>
 {error&&<p className="application-error" role="alert">{error}</p>}{notice&&<p className="members-notice" role="status">{notice}</p>}
 {canManage&&<section className="members-panel"><div className="members-panel-heading"><div><h2>Invite a teammate</h2><p>Invitations expire after seven days.</p></div></div><form className="members-invite-form" onSubmit={invite}>
  <label className="pf-field"><span className="pf-label">Work email</span><input className="pf-input" type="email" required maxLength={320} placeholder="teammate@company.com" value={email} onChange={e=>setEmail(e.target.value)}/></label>
  <label className="pf-field"><span className="pf-label">Workspace role</span><select className="pf-input" value={role} onChange={e=>setRole(e.target.value as 'ADMIN'|'MEMBER')}><option value="MEMBER">Member</option><option value="ADMIN">Admin</option></select></label>
  <button className="pf-button pf-button--primary" type="submit" disabled={saving}>{saving?'Creating…':'Create invitation →'}</button></form><p className="members-delivery-note">Invitation records are stored securely. Email delivery and acceptance links will be connected in a later onboarding batch.</p></section>}
 <section className="members-panel"><div className="members-panel-heading"><div><h2>Workspace members</h2><p>People with active access to {tenant?.name??'this workspace'}.</p></div></div>
 {loading?<p className="members-empty">Loading members…</p>:members.length===0?<p className="members-empty">No active members found.</p>:<div className="members-table-wrap"><table className="members-table"><thead><tr><th>Person</th><th>Role</th><th>Joined</th></tr></thead><tbody>{members.map(m=><tr key={m.id}><td><strong>{m.user.displayName||m.user.email}</strong><small>{m.user.email}</small></td><td><span className="pf-badge pf-badge--info">{m.role}</span></td><td>{new Date(m.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}</section>
 {canManage&&<section className="members-panel"><div className="members-panel-heading"><div><h2>Pending invitations</h2><p>Invitations awaiting onboarding.</p></div></div>
 {loading?<p className="members-empty">Loading invitations…</p>:invitations.length===0?<p className="members-empty">No pending invitations.</p>:<div className="members-table-wrap"><table className="members-table"><thead><tr><th>Email</th><th>Role</th><th>Expires</th><th/></tr></thead><tbody>{invitations.map(i=><tr key={i.id}><td><strong>{i.email}</strong></td><td>{i.role}</td><td>{new Date(i.expiresAt).toLocaleDateString()}</td><td><button className="application-archive" type="button" onClick={()=>void revoke(i.id)}>Revoke</button></td></tr>)}</tbody></table></div>}</section>}
 <footer className="dashboard-footer">PanelForge <span>·</span> Secure workspace access starts here.</footer></div></section></main>;
}
