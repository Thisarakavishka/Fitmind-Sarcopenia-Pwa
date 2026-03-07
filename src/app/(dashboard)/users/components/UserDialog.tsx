"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../../components/shared/Button";

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  mode: "view" | "edit" | "delete";
  onSave: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBan: (id: string, status: boolean) => Promise<void>;
}

export function UserDialog({
  isOpen,
  onClose,
  user,
  mode,
  onSave,
  onDelete,
  onBan,
}: UserDialogProps) {
  const [formData, setFormData] = useState({ first_name: "", last_name: "", role: "user" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role || "user",
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // --- MODE 1: DELETE CONFIRMATION ---
  if (mode === "delete") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="w-full max-w-sm bg-[#0f0f0f] border border-red-500/30 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Delete User?</h3>
              <p className="text-sm text-muted mt-1">
                Permanently remove <span className="text-white font-bold">{user.email}</span>?
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button 
                onClick={async () => {
                  setLoading(true);
                  await onDelete(user.id);
                  setLoading(false);
                  onClose();
                }} 
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none"
              >
                {loading ? "..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MODE 2 & 3: VIEW / EDIT ---
  const isEditing = mode === "edit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-surface">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? "Edit User" : "User Details"}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-white">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary border border-primary/20">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{user.email}</p>
              <p className="text-xs font-mono text-muted">ID: {user.id.slice(0, 8)}...</p>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3">
             {/* Name Fields (Visible if Editing OR if Data Exists) */}
             {(isEditing || formData.first_name) && (
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted">First Name</label>
                    <input 
                      disabled={!isEditing}
                      value={formData.first_name}
                      placeholder="Not Set"
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none disabled:opacity-50"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted">Last Name</label>
                    <input 
                      disabled={!isEditing}
                      value={formData.last_name}
                      placeholder="Not Set"
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none disabled:opacity-50"
                    />
                 </div>
               </div>
             )}

             {/* Role & Status */}
             <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                 <label className="text-[10px] uppercase font-bold text-muted">Role</label>
                 {isEditing ? (
                   <select 
                     value={formData.role}
                     onChange={(e) => setFormData({...formData, role: e.target.value})}
                     className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none"
                   >
                     <option value="user">User</option>
                     <option value="admin">Admin</option>
                   </select>
                 ) : (
                   <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white capitalize">{user.role}</div>
                 )}
               </div>

               <div className="space-y-1">
                 <label className="text-[10px] uppercase font-bold text-muted">Status</label>
                 {isEditing ? (
                   <button 
                     onClick={() => onBan(user.id, user.is_banned)}
                     className={`w-full px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${user.is_banned ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}
                   >
                     {user.is_banned ? "Unban User" : "Ban User"}
                   </button>
                 ) : (
                   <div className={`px-3 py-2 rounded-lg border text-sm font-bold ${user.is_banned ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"}`}>
                     {user.is_banned ? "BANNED" : "ACTIVE"}
                   </div>
                 )}
               </div>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        {isEditing && (
          <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} className="text-xs">Cancel</Button>
            <Button 
              onClick={async () => {
                setLoading(true);
                await onSave(user.id, formData);
                setLoading(false);
                onClose();
              }} 
              disabled={loading}
              className="bg-primary text-black font-bold text-xs"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}