import React, { useState, useEffect } from "react";
import {
  Bell,
  MapPin,
  BarChart3,
  Map,
  Cpu,
  AlertCircle,
  Sun,
  Trash2,
} from "lucide-react";

interface MobileHomeProps {
  onNavigate: (tab: string) => void;
  onAuthRequired: () => void;
}

const NEARBY_ISSUES = [
  {
    id: 1,
    title: "Large Pothole",
    subtitle: "SV Road, Andheri West",
    severity: "CRITICAL",
    status: "IN PROGRESS",
    time: "2 hours ago",
    confidence: 94,
    severityColor: "bg-red-500/20 text-red-400",
    statusColor: "bg-violet-500/20 text-violet-300",
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
    Icon: AlertCircle,
  },
  {
    id: 2,
    title: "Broken Streetlight",
    subtitle: "Lokhandwala Circle, Andheri",
    severity: "MEDIUM",
    status: "ASSIGNED",
    time: "1 day ago",
    confidence: 88,
    severityColor: "bg-amber-500/20 text-amber-400",
    statusColor: "bg-blue-500/20 text-blue-300",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    Icon: Sun,
  },
  {
    id: 3,
    title: "Overflowing Garbage Bin",
    subtitle: "Juhu Beach Road, Mumbai",
    severity: "LOW",
    status: "PENDING",
    time: "3 days ago",
    confidence: 81,
    severityColor: "bg-emerald-500/20 text-emerald-400",
    statusColor: "bg-zinc-500/20 text-zinc-400",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    Icon: Trash2,
  },
];

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good Morning";
  if (h >= 12 && h < 17) return "Good Afternoon";
  if (h >= 17 && h < 21) return "Good Evening";
  return "Good Night";
};

const MobileHome: React.FC<MobileHomeProps> = ({ onNavigate, onAuthRequired }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div style={{ background: "#0F0F13", fontFamily: "'Inter', sans-serif", paddingBottom: '1.5rem' }}>
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <span
          className="text-[22px] font-black tracking-tight text-white"
          style={{ letterSpacing: "-0.03em" }}
        >
          CivicConnect
        </span>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: "#1C1C24" }}>
          <Bell className="w-5 h-5 text-zinc-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0F0F13]" />
        </button>
      </div>

      {/* ── Greeting ── */}
      <div className={`px-5 mb-5 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        <p className="text-[13px] font-medium text-zinc-500 mb-0.5">{getTimeOfDay()}</p>
        <h1 className="text-[26px] font-black text-white tracking-tight" style={{ letterSpacing: "-0.03em" }}>
          Welcome back,{" "}
          <span style={{ color: "#7C6FFF" }}>Citizen</span>
        </h1>
      </div>

      {/* ── Stats Card ── */}
      <div className="px-5 mb-7">
        <div
          className="rounded-2xl p-5 flex items-center"
          style={{
            background: "linear-gradient(135deg, #6B5CF2 0%, #7C6FFF 40%, #8B5CF6 100%)",
          }}
        >
          <StatItem value="14" label="Reports" border />
          <StatItem value="11" label="Resolved" border />
          <StatItem value="78%" label="Success" />
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="px-5 mb-7">
        <h2 className="text-[16px] font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction
            Icon={AlertCircle}
            iconColor="#7C6FFF"
            iconBg="rgba(124,111,255,0.12)"
            label="Report Issue"
            onClick={onAuthRequired}
          />
          <QuickAction
            Icon={BarChart3}
            iconColor="#10B981"
            iconBg="rgba(16,185,129,0.12)"
            label="My Reports"
            onClick={() => onNavigate("reports")}
          />
          <QuickAction
            Icon={Map}
            iconColor="#F59E0B"
            iconBg="rgba(245,158,11,0.12)"
            label="Heatmap"
            onClick={() => onNavigate("feed")}
          />
          <QuickAction
            Icon={Cpu}
            iconColor="#F97316"
            iconBg="rgba(249,115,22,0.12)"
            label="AI Engine"
            onClick={() => onNavigate("report")}
          />
        </div>
      </div>

      {/* ── Nearby Issues ── */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-white" style={{ letterSpacing: "-0.02em" }}>
            Nearby Issues
          </h2>
          <button
            onClick={() => onNavigate("feed")}
            className="text-[13px] font-semibold"
            style={{ color: "#7C6FFF" }}
          >
            See all
          </button>
        </div>

        <div className="space-y-3">
          {NEARBY_ISSUES.map((issue) => (
            <button
              key={issue.id}
              onClick={() => onNavigate("feed")}
              className="w-full flex items-center space-x-4 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
              style={{ background: "#1C1C24" }}
            >
              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${issue.iconBg}`}
              >
                <issue.Icon className={`w-5 h-5 ${issue.iconColor}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[15px] font-bold text-white truncate" style={{ letterSpacing: "-0.02em" }}>
                    {issue.title}
                  </span>
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  <MapPin className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                  <span className="text-[12px] text-zinc-500 truncate font-medium">{issue.subtitle}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${issue.severityColor}`}>
                    {issue.severity}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${issue.statusColor}`}>
                    {issue.status}
                  </span>
                </div>
                <div className="mt-1.5 text-[11px] text-zinc-600 font-medium">
                  {issue.time} &nbsp;·&nbsp; AI: {issue.confidence}% confident
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes cc-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

/* ── Helpers ── */
const StatItem: React.FC<{ value: string; label: string; border?: boolean }> = ({ value, label, border }) => (
  <div className={`flex-1 text-center ${border ? "border-r border-white/20 mr-1 pr-1" : ""}`}>
    <div className="text-[26px] font-black text-white leading-none mb-1" style={{ letterSpacing: "-0.04em" }}>
      {value}
    </div>
    <div className="text-[11px] font-semibold text-white/60 uppercase tracking-widest">{label}</div>
  </div>
);

const QuickAction: React.FC<{
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  onClick: () => void;
}> = ({ Icon, iconColor, iconBg, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center space-y-2 p-3 rounded-2xl transition-all active:scale-95"
    style={{ background: "#1C1C24" }}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center"
      style={{ background: iconBg }}
    >
      <Icon className="w-5 h-5" style={{ color: iconColor }} />
    </div>
    <span className="text-[10px] font-semibold text-zinc-400 text-center leading-tight">{label}</span>
  </button>
);

export default MobileHome;
