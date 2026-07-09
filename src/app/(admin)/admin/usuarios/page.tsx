"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Users, UserPlus, RefreshCw, Trash2, Eye, EyeOff, RefreshCcw, ShieldCheck, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed: boolean;
  user_metadata: { name?: string };
  rolId?: string;
}

function generatePassword(length = 14): string {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function formatDate(iso: string | null): string {
  if (!iso) return "Nunca";
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getInitials(user: AdminUser): string {
  const name = user.user_metadata?.name;
  if (name && name.trim()) return name.trim().slice(0, 2).toUpperCase();
  return (user.email ?? "??").slice(0, 2).toUpperCase();
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generatePassword());
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [rolId, setRolId] = useState("ADMIN");

  // Password update states
  const [updatingPasswordUserId, setUpdatingPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [updatingPw, setUpdatingPw] = useState(false);

  const handleUpdateRole = async (userId: string, newRolId: string) => {
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, rolId: newRolId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al actualizar rol");
      } else {
        toast.success("✓ Rol de usuario actualizado con éxito");
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, rolId: newRolId } : u))
        );
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleUpdatePassword = async () => {
    if (!updatingPasswordUserId || newPassword.length < 6) return;
    setUpdatingPw(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: updatingPasswordUserId, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al actualizar contraseña");
      } else {
        toast.success("✓ Contraseña actualizada con éxito");
        setUpdatingPasswordUserId(null);
        setNewPassword("");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setUpdatingPw(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/usuarios");
      const data = await res.json();
      if (data.users) setUsers(data.users);
      else toast.error("Error al cargar usuarios");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, rolId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al crear usuario");
      } else {
        toast.success(`✓ Usuario ${email} creado exitosamente con el rol seleccionado.`);
        setName(""); setEmail(""); setPassword(generatePassword()); setRolId("ADMIN");
        fetchUsers();
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    setDeletingId(id); setConfirmDelete(null);
    try {
      const res = await fetch(`/api/admin/usuarios?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Error al eliminar");
      else { toast.success("Usuario eliminado"); setUsers(p => p.filter(u => u.id !== id)); }
    } catch { toast.error("Error de conexión"); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-8">

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-900 dark:text-white mb-1">
            Gestión de Administradores
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Crea y gestiona los usuarios con acceso al panel de control.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-4 py-2 rounded-full">
          <Users className="h-3.5 w-3.5" />
          {users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── TWO COLUMN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">

        {/* ── CREATE FORM CARD ── */}
        <Card className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <UserPlus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="font-heading font-bold text-base text-slate-900 dark:text-white">
              Nuevo Usuario / Colaborador
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleCreate} className="space-y-5">

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Nombre completo <span className="normal-case font-normal opacity-70">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                  placeholder="Ej: María García"
                  autoComplete="off"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Correo electrónico <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                  placeholder="admin@smartist.pe"
                  required
                  autoComplete="off"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Contraseña <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full h-10 pl-3 pr-10 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPassword(generatePassword())}
                    title="Generar contraseña segura"
                    className="flex items-center gap-1.5 h-10 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                  >
                    <RefreshCcw className="h-3 w-3" /> Auto
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  💡 Comparte esta contraseña de forma segura con el nuevo usuario.
                </p>
              </div>

              {/* Rol Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Rol del Usuario <span className="text-red-400">*</span>
                </label>
                <select
                  value={rolId}
                  onChange={(e) => setRolId(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all font-semibold"
                >
                  <option value="ADMIN">Administrador (Acceso Completo)</option>
                  <option value="VENDEDOR">Vendedor (Catálogo Propio)</option>
                  <option value="CLIENTE">Cliente (Sin Acceso al Panel)</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={creating}
                className="w-full h-11 font-heading font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5"
              >
                {creating ? (
                  <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Creando...</>
                ) : (
                  <><UserPlus className="h-4 w-4 mr-2" /> Crear Usuario</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── USERS LIST CARD ── */}
        <Card className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl">
          <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="font-heading font-bold text-base text-slate-900 dark:text-white flex-1">
              Administradores Activos
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              title="Actualizar lista"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingUsers ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loadingUsers ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(n => (
                  <div key={n} className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/5 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
                      <div className="h-2.5 w-2/5 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-16 text-slate-400 dark:text-slate-500">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                  <Users className="h-8 w-8 opacity-50" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sin administradores</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Crea el primero con el formulario de la izquierda.</p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
                {users.map(user => (
                  <li key={user.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-extrabold font-heading flex-shrink-0 shadow-md shadow-indigo-500/20">
                      {getInitials(user)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {user.user_metadata?.name || "Sin nombre"}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                      <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">
                        Último acceso: {formatDate(user.last_sign_in_at)}
                      </p>
                    </div>

                    {/* Status + Delete */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                        user.confirmed
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                      }`}>
                        {user.confirmed ? "✓ Activo" : "⏳ Pendiente"}
                      </span>

                      {/* Dropdown to change role */}
                      <select
                        value={user.rolId || "CLIENTE"}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        className="text-[11px] bg-slate-55 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
                      >
                        <option value="CLIENTE">Cliente</option>
                        <option value="VENDEDOR">Vendedor</option>
                        <option value="ADMIN">Admin</option>
                      </select>

                      <button
                        onClick={() => {
                          setUpdatingPasswordUserId(user.id);
                          setNewPassword(generatePassword());
                        }}
                        className="h-8 w-8 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        title="Cambiar contraseña"
                      >
                        <Key className="h-3.5 w-3.5" />
                      </button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                        className={`h-8 transition-all ${
                          confirmDelete === user.id
                            ? "w-auto px-3 text-[10px] font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 rounded-lg"
                            : "w-8 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                        }`}
                        title={confirmDelete === user.id ? "Haz clic para confirmar" : "Eliminar usuario"}
                      >
                        {deletingId === user.id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : confirmDelete === user.id ? (
                          "¿Confirmar?"
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>

          {/* Footer */}
          {users.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              Los usuarios son administrados a través de Supabase Auth.
            </div>
          )}
        </Card>

      </div>

      {/* ── UPDATE PASSWORD DIALOG ── */}
      {updatingPasswordUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-slate-900 rounded-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                <Key className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Cambiar Contraseña
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Se asignará una nueva contraseña de ingreso para el usuario: <strong className="text-slate-800 dark:text-slate-200">{users.find(u => u.id === updatingPasswordUserId)?.email}</strong>
              </p>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Nueva contraseña <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full h-10 pl-3 pr-10 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewPassword(generatePassword())}
                    className="flex items-center gap-1.5 h-10 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                  >
                    <RefreshCcw className="h-3 w-3" /> Auto
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                <Button 
                  variant="ghost" 
                  onClick={() => { setUpdatingPasswordUserId(null); setNewPassword(""); }}
                  className="rounded-xl h-10 px-4 text-xs font-bold border border-slate-200 dark:border-white/5"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpdatePassword}
                  disabled={updatingPw || newPassword.length < 6}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 px-4 rounded-xl text-xs flex items-center gap-1.5"
                >
                  {updatingPw ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  Actualizar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
