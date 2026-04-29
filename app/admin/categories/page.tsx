'use client';
import { useEffect, useState } from 'react';
import { useRequireRole } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Input, Textarea } from '@/components/ui';
import type { Category } from '@/types';

const Icon = {
  Plus: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Tag: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Folder: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
};

export default function AdminCategoriesPage() {
  const { user, isAuthenticated, isLoading: roleLoading } = useRequireRole(['admin']);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [isCreating, setIsCreating]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategory, setNewCategory]   = useState({ name: '', description: '' });

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    (async () => {
      setIsLoading(true);
      try {
        const data = await apiClient.get<Category[]>(API_ENDPOINTS.categories.list);
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar categorías');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAuthenticated, user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const slug = newCategory.name
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const created = await apiClient.post<Category>(API_ENDPOINTS.categories.create, {
        ...newCategory, slug,
      });
      setCategories(prev => [...prev, created]);
      setNewCategory({ name: '', description: '' });
      setIsCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    try {
      await apiClient.delete(API_ENDPOINTS.categories.delete(id));
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  if (roleLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-slate-400">Cargando categorías</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .cat-row { transition: background .1s; }
        .cat-row:hover { background: var(--gray-50); }
        .cat-row:hover .del-btn { opacity: 1; }
        .del-btn { opacity: 0; transition: opacity .15s, background .12s; }
        .del-btn:hover { background: var(--danger-bg); }
        .inp { border: 2px solid var(--gray-300); border-radius: 0; padding: 8px 12px; font-size: 13px; width: 100%; outline: none; font-family: var(--font-body); transition: border-color .15s, box-shadow .15s; background: var(--surface); color: var(--foreground); }
        .inp:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-ghost); }
        .inp::placeholder { color: var(--gray-400); }
      `}</style>

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 py-9 space-y-6">

          {/* Header */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.12em] text-primary uppercase mb-1.5 font-mono">
                Administración
              </p>
              <h1 className="text-[28px] font-bold text-foreground tracking-tight leading-none font-display">
                Categorías
              </h1>
            </div>
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold rounded-none border-2 border-transparent hover:border-primary transition-colors"
              >
                <Icon.Plus />
                Nueva categoría
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-3.5 bg-danger-bg border-2 border-danger text-[13px] font-medium text-danger">
              {error}
            </div>
          )}

          {/* Create form */}
          {isCreating && (
            <div className="bg-surface border-2 border-primary/20 overflow-hidden" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="px-5 py-4 border-b-2 border-gray-200" style={{ background: 'var(--gray-50)' }}>
                <h2 className="text-[14px] font-semibold text-foreground">Nueva categoría</h2>
                <p className="text-[12px] text-gray-500 mt-0.5">Completa los datos para crear una nueva categoría</p>
              </div>
              <form onSubmit={handleCreate} className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 font-mono">
                    Nombre
                  </label>
                  <input
                    className="inp"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Electrónica, Moda, Hogar…"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 font-mono">
                    Descripción <span className="font-normal normal-case text-gray-400">(opcional)</span>
                  </label>
                  <textarea
                    className="inp resize-none"
                    rows={3}
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Breve descripción de la categoría…"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white text-[13px] font-semibold border-2 border-transparent transition-colors"
                  >
                    {isSubmitting ? 'Creando…' : 'Crear categoría'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsCreating(false); setNewCategory({ name: '', description: '' }); }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-semibold border-2 border-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories list */}
          <div className="bg-surface border-2 border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-gray-200">
              <h2 className="text-[14px] font-semibold text-foreground">Todas las categorías</h2>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-gray-100 text-gray-500 border-2 border-gray-200">
                {categories.length}
              </span>
            </div>

            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2.5">
                <div className="text-gray-400"><Icon.Folder /></div>
                <p className="text-[13px] text-gray-500 font-medium">Aún no hay categorías</p>
                <p className="text-[12px] text-gray-400">Crea la primera usando el botón de arriba</p>
              </div>
            ) : (
              <div className="divide-y-2 divide-gray-200">
                {categories.map((cat, index) => (
                  <div key={cat._id || index} className="cat-row flex items-center gap-4 px-5 py-3.5">
                    <div className="w-7 h-7 bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                      <Icon.Tag />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{cat.name}</p>
                      {cat.description && (
                        <p className="text-[12px] text-gray-500 truncate mt-0.5">{cat.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => cat._id && handleDelete(cat._id)}
                      className="del-btn flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold text-danger border-2 border-danger/20 rounded-none"
                    >
                      <Icon.Trash />
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}