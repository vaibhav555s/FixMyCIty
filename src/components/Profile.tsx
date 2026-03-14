import React from "react";
import {
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

interface ProfileProps {
  onAuthRequired: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onAuthRequired }) => {
  // Expect AuthContext to provide these
  const { user, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    { icon: Settings, label: "Settings", action: () => {} },
    { icon: Bell, label: "Notifications", action: () => {} },
    { icon: HelpCircle, label: "Help & Support", action: () => {} },
    { icon: LogOut, label: "Sign Out", action: handleLogout },
  ];

  // Safely compute display name and email
  const displayName =
    userProfile?.displayName ||
    userProfile?.fullName ||
    user?.displayName ||
    "User";

  const primaryContact =
    userProfile?.email || user?.email || userProfile?.phoneNumber || "";

  // Safely format createdAt if present (string ISO or Firestore Timestamp)
  const createdAtDate = (() => {
    const ca = (userProfile as any)?.createdAt;
    if (!ca) return null;
    if (typeof ca === "string") return new Date(ca);
    if (ca?.toDate) return ca.toDate();
    if (ca?.seconds) return new Date(ca.seconds * 1000);
    return null;
  })();

  return (
    <ProtectedRoute
      onAuthRequired={onAuthRequired}
      message="Sign in to view your profile"
    >
      <section className="px-5 pt-8 pb-20">
        <div className="max-w-lg mx-auto">
          {/* Profile Header */}
          <div className="text-center mb-10">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-zinc-900 blur-xl opacity-10 rounded-full"></div>
              <div className="w-24 h-24 bg-white border border-zinc-200/80 shadow-soft rounded-full flex items-center justify-center relative z-10 mx-auto">
                <UserIcon className="w-10 h-10 text-zinc-400" />
              </div>
            </div>
            <h1 className="text-[22px] font-bold text-zinc-900 tracking-tight mb-1">
              {displayName}
            </h1>
            <p className="text-[15px] font-medium text-zinc-500 mb-1">{primaryContact}</p>
            <p className="text-[13px] font-semibold text-zinc-400 uppercase tracking-wide mt-2">
              Member since{" "}
              {createdAtDate
                ? createdAtDate.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "Recently"}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            <div className="bg-white border border-zinc-200/60 rounded-2xl p-4 text-center shadow-sm hover:shadow-soft transition-shadow">
              <div className="text-[22px] font-bold text-zinc-900 mb-0.5 tracking-tight">
                {userProfile?.stats?.reportsSubmitted ?? 0}
              </div>
              <div className="text-[12px] font-semibold text-zinc-500 uppercase tracking-widest">Reports</div>
            </div>
            <div className="bg-white border border-zinc-200/60 rounded-2xl p-4 text-center shadow-sm hover:shadow-soft transition-shadow">
              <div className="text-[22px] font-bold text-emerald-600 mb-0.5 tracking-tight">
                {userProfile?.stats?.reportsResolved ?? 0}
              </div>
              <div className="text-[12px] font-semibold text-emerald-600/70 uppercase tracking-widest">Resolved</div>
            </div>
            <div className="bg-white border border-zinc-200/60 rounded-2xl p-4 text-center shadow-sm hover:shadow-soft transition-shadow">
              <div className="text-[22px] font-bold text-amber-600 mb-0.5 tracking-tight">
                {(userProfile?.stats?.reportsSubmitted ?? 0) -
                  (userProfile?.stats?.reportsResolved ?? 0)}
              </div>
              <div className="text-[12px] font-semibold text-amber-600/70 uppercase tracking-widest">Pending</div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between p-4.5 bg-white border border-zinc-200/60 rounded-2xl hover:border-zinc-300 hover:shadow-soft transition-all duration-300 group ${
                    item.label === "Sign Out"
                      ? "hover:bg-red-50 hover:border-red-200 mt-6"
                      : ""
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                      item.label === "Sign Out" ? "bg-red-100/50" : "bg-zinc-100"
                    }`}>
                      <Icon
                        className={`w-5 h-5 ${
                          item.label === "Sign Out"
                            ? "text-red-500"
                            : "text-zinc-600"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[16px] font-semibold tracking-tight ${
                        item.label === "Sign Out"
                          ? "text-red-600"
                          : "text-zinc-900"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span className={`text-[17px] ${item.label === "Sign Out" ? "text-red-300" : "text-zinc-300 group-hover:text-zinc-500"} transition-colors`}>→</span>
                </button>
              );
            })}
          </div>

          {/* App Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-text-secondary mb-2">
              CivicConnect v1.0.0
            </p>
            <p className="text-xs text-text-secondary">
              Making cities better, one report at a time
            </p>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
};

export default Profile;
