"use client";

import { useEffect, useState } from "react";
import { fetchAllUsers, deleteUser, banUser, updateUser } from "../../actions/admins"; 
import { Button } from "../../../components/shared/Button";
import { UserDialog } from "./components/UserDialog"; 

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "edit" | "delete">("view");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (e) {
      console.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (filter === "ALL") return true;
    if (filter === "ADMIN") return u.role === "admin";
    if (filter === "USER") return u.role === "user";
    return true;
  });

  const handleSave = async (id: string, data: any) => {
    await updateUser(id, data);
    loadUsers(); 
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      loadUsers();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleBan = async (id: string, isBanned: boolean) => {
    try {
      await banUser(id, !isBanned);
      loadUsers(); 
    } catch (error: any) {
      alert(error.message);
    }
  };

  const openModal = (user: any, mode: "view" | "edit" | "delete") => {
    setSelectedUser(user);
    setDialogMode(mode);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto px-5 pb-24 md:px-8">
      
      {/* 1. Header */}
      <div className="mt-6 flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-xs text-muted">Total Users: {users.length}</p>
        </div>
        <Button onClick={loadUsers} variant="outline" className="text-xs h-8 gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
           Refresh
        </Button>
      </div>

      {/* 2. Filters */}
      <div className="flex gap-2 pb-2 border-b border-white/10 overflow-x-auto">
        {["ALL", "ADMIN", "USER"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 text-xs font-bold transition-colors border-b-2 ${
              filter === tab ? "border-primary text-primary" : "border-transparent text-muted hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. TABLE */}
      <div className="bg-[#0f1014] border border-white/5 rounded-xl overflow-hidden">
        
        {/* Header */}
        <div className="hidden md:grid grid-cols-12 bg-white/5 p-4 text-[10px] font-bold text-muted uppercase tracking-wider">
          <div className="col-span-4">User (Email)</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Last Active</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
             <div className="p-10 text-center text-muted text-sm">Loading users...</div>
          ) : filteredUsers.map((u) => {
            const isRestricted = u.role === 'admin';

            return (
              <div key={u.id} className="grid grid-cols-1 md:grid-cols-12 p-4 items-center gap-4 md:gap-0 hover:bg-white/5 transition-colors">
                
                {/* 1. Email Only (No Name) */}
                <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-white/5">
                    {u.email?.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-white text-sm font-medium truncate">{u.email}</p>
                </div>

                {/* 2. Role */}
                <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-start">
                   <span className="md:hidden text-xs text-muted font-bold uppercase">Role:</span>
                   <span className={`text-[10px] font-bold px-2 py-1 rounded border ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-white/5 text-muted border-white/10'}`}>
                      {u.role.toUpperCase()}
                   </span>
                </div>

                {/* 3. Status */}
                <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-start">
                   <span className="md:hidden text-xs text-muted font-bold uppercase">Status:</span>
                   <span className={`text-[10px] font-bold px-2 py-1 rounded border ${u.is_banned ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                      {u.is_banned ? 'BANNED' : 'ACTIVE'}
                   </span>
                </div>

                {/* 4. Last Active */}
                <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-start">
                   <span className="md:hidden text-xs text-muted font-bold uppercase">Last Login:</span>
                   <p className="text-xs text-white/70">
                     {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString() : 'Never'}
                   </p>
                </div>

                {/* 5. ACTIONS (ICONS ONLY) */}
                <div className="col-span-1 md:col-span-2 flex justify-end gap-1">
                  
                  {/* View Icon */}
                  <button 
                    onClick={() => openModal(u, "view")}
                    className="p-2 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors"
                    title="View Details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>

                  {!isRestricted && (
                    <>
                      {/* Edit Icon */}
                      <button 
                        onClick={() => openModal(u, "edit")}
                        className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Edit User"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>

                      {/* Delete Icon */}
                      <button 
                        onClick={() => openModal(u, "delete")}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete User"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 4. UNIFIED DIALOG */}
      <UserDialog 
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        mode={dialogMode}
        onSave={handleSave}
        onDelete={handleDelete}
        onBan={handleBan}
      />
    </div>
  );
}