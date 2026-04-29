'use client';
import { useEffect, useState } from 'react';
import { useRequireRole } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type { User } from '@/types';
import { Spinner } from '@/components/ui';

const ROLE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  admin:  { label: 'Admin',    bg: 'var(--warning-bg)', text: 'var(--warning)', border: 'var(--warning)', dot: 'var(--warning)' },
  seller: { label: 'Vendedor', bg: 'var(--success-bg)', text: 'var(--success)', border: 'var(--success)', dot: 'var(--success)' },
  user:   { label: 'Usuario',  bg: 'var(--gray-100)', text: 'var(--gray-600)', border: 'var(--gray-300)', dot: 'var(--gray-400)' },
};

function getInitials(name?: string, email?: string) {
  return (name || email || '?')
    .split(/\s+|@/).slice(0, 2)
    .map(s => s[0]?.toUpperCase() ?? '').join('');
}

function RoleBadge({ role }: { role?: string }) {
  const key = role?.toLowerCase() ?? 'user';
  const cfg = ROLE_CONFIG[key] ?? ROLE_CONFIG.user;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-medium uppercase tracking-wider border-2" style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
      <span className="w-1.5 h-1.5" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

export default function AdminUsersPage() {
  const { user, isAuthenticated, isLoading: roleLoading } = useRequireRole(['admin']);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    (async () => {
      setIsLoading(true);
      try {
        const data = await apiClient.get<User[]>(API_ENDPOINTS.users.list);
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAuthenticated, user]);

  const filtered = search.trim()
    ? users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
    const r = u.role?.toLowerCase() ?? 'user';
    acc[r] = (acc[r] ?? 0) + 1;
    return acc;
  }, {});

  if (roleLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner />
        <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Cargando usuarios</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 relative">
        <div className="absolute -left-4 top-0 w-1 h-full bg-primary" />
        <p className="text-xs font-mono text-primary uppercase tracking-wider mb-1">Administración</p>
        <h1 className="h1 text-3xl md:text-4xl text-foreground">Usuarios</h1>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-3 border-2 border-danger bg-danger-bg font-mono text-xs uppercase tracking-wider text-danger">
          {error}
        </div>
      )}

      {/* Summary + Search */}
      {users.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-wider shrink-0">
              {users.length} usuarios
            </span>
            <span className="text-gray-200">|</span>
            {Object.entries(roleCounts).map(([role, count]) => {
              const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.user;
              return (
                <span key={role} className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider border-2" style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
                  {count} {cfg.label}{count !== 1 ? 's' : ''}
                </span>
              );
            })}
          </div>

          <div className="relative sm:ml-auto">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 bg-surface font-body text-sm focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-ghost)] focus:outline-none transition-all duration-200"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar nombre o email…"
            />
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="industrial-card rounded-none bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b-2 border-gray-200 flex items-center justify-between">
          <h2 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">Todos los usuarios</h2>
          <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-gray-100 text-gray-500 border-2 border-gray-200">
            {filtered.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <span className="text-3xl">👥</span>
            <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              {search ? 'Sin resultados' : 'No hay usuarios'}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((u, idx) => (
              <div
                key={u._id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors duration-150"
                style={{ borderBottom: idx < filtered.length - 1 ? '2px solid var(--gray-200)' : 'none' }}
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-[11px] font-display font-bold text-primary shrink-0">
                  {getInitials(u.name, u.email)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{u.name || u.email}</p>
                  {u.name && <p className="text-[11px] text-gray-400 truncate">{u.email}</p>}
                </div>

                {/* Role */}
                <RoleBadge role={u.role} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
