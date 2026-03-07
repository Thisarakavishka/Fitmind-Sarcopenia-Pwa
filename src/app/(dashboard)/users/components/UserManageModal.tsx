"use client";

import { Button } from "../../../../components/shared/Button";

interface UserManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onBan: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
  onRoleChange: (id: string, currentRole: string) => void;
}

export function UserManageModal({
  isOpen,
  onClose,
  user,
  onBan,
  onDelete,
  onRoleChange,
}: UserManageModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header with Avatar */}
        <div className="p-6 flex flex-col items-center border-b border-white/5 bg-surface relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted hover:text-white"
          >
            ✕
          </button>

          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold mb-4 border border-primary/20">
            {user.email?.charAt(0).toUpperCase()}
          </div>

          <h2 className="text-xl font-bold text-white">
            {user.first_name
              ? `${user.first_name} ${user.last_name}`
              : user.email?.split("@")[0]}
          </h2>
          <p className="text-sm text-muted">{user.email}</p>

          <div className="flex gap-2 mt-3">
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded border ${user.role === "admin" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-white/5 text-muted border-white/10"}`}
            >
              {user.role.toUpperCase()}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded border ${user.is_banned ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"}`}
            >
              {user.is_banned ? "BANNED" : "ACTIVE"}
            </span>
          </div>
        </div>

        {/* Details List */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted">User ID</span>
            <span className="text-white font-mono text-xs">
              {user.id.slice(0, 8)}...
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Joined</span>
            <span className="text-white">
              {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Last Login</span>
            <span className="text-white">
              {user.last_sign_in
                ? new Date(user.last_sign_in).toLocaleDateString()
                : "Never"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-white/5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => onRoleChange(user.id, user.role)}
              className="w-full text-xs h-9"
            >
              {user.role === "admin" ? "Demote to User" : "Promote to Admin"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onBan(user.id, user.is_banned)}
              className={`w-full text-xs h-9 ${user.is_banned ? "text-green-400 border-green-500/20" : "text-orange-400 border-orange-500/20"}`}
            >
              {user.is_banned ? "Unban User" : "Ban User"}
            </Button>
          </div>

          <Button
            onClick={() => onDelete(user.id)}
            className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 h-9 text-xs font-bold"
          >
            Delete User Permanently
          </Button>
        </div>
      </div>
    </div>
  );
}
