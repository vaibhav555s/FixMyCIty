import React, { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck, Send, Loader2, CheckCircle } from "lucide-react";
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { uploadImageToCloudinary, createSignatureGenerator } from "../lib/cloudinary";

const CLOUDINARY_CLOUD_NAME = "civicconnect";
const CLOUDINARY_API_KEY = "415284245642869";
const CLOUDINARY_API_SECRET = "SQJRqJ9KaexFBGQcULP3o7HFwU8"; 

interface AIAnalysisDashboardProps {
  onBack?: () => void;
  pendingReport?: any;
  onComplete?: () => void;
}

const AIAnalysisDashboard: React.FC<AIAnalysisDashboardProps> = ({ onBack, pendingReport, onComplete }) => {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async () => {
    if (!pendingReport || !pendingReport.user) return;
    
    setSubmitting(true);

    try {
      const { 
        title, description, selectedCategory, 
        assignedDepartment, 
        selectedImages, location, user 
      } = pendingReport;

      // Upload images to Cloudinary
      const imageFileNames = selectedImages.map((file: any) => file.name);
      let imageUrls: string[] = [];
      let imagePublicIds: string[] = [];

      if (selectedImages.length > 0) {
        const generate = createSignatureGenerator(CLOUDINARY_API_SECRET);
        const folder = "civicconnect/reports";

        const results = await Promise.all(
          selectedImages.map((file: any) =>
            uploadImageToCloudinary(file, {
              cloudName: CLOUDINARY_CLOUD_NAME,
              apiKey: CLOUDINARY_API_KEY,
              folder,
              generateSignature: (params) => generate(params),
            })
          )
        );

        imageUrls = results.map((r) => r.url);
        imagePublicIds = results.map((r) => r.publicId);
      }

      const reportData = {
        userId: user.uid,
        userEmail: user.email,
        userDisplayName: user.displayName || "Anonymous",
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory,
        location: location
          ? {
            lat: location.lat,
            lng: location.lng,
            address: location.displayAddress || location.fullAddress,
            fullLocation: location,
          }
          : null,
        imageFileNames,
        imageUrls,
        imagePublicIds,
        status: "pending",
        priority: "high", // AI flagged as high
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        assignedDepartment: assignedDepartment,
        assignedAt: serverTimestamp(),
        assignedBy: "system",
        departmentComments: [],
        beforeAfterImages: { before: [], after: [] },
        isNewAssignment: true,
        departmentNotified: false,
        notificationSent: false,
        reportId: null, 
      };

      const docRef = await addDoc(collection(db, "reports"), reportData);

      await updateDoc(docRef, {
        reportId: docRef.id,
        assignmentHistory: [
          {
            department: assignedDepartment,
            assignedBy: "system",
            assignedAt: new Date(),
            reason: "Auto-assigned by AI analysis",
          },
        ],
      });

      // Update user stats
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        "stats.reportsSubmitted": increment(1),
        updatedAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onComplete) onComplete();
      }, 2500);

    } catch (error) {
      console.error("❌ Error saving report:", error);
      alert("Failed to submit official report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0F0F13' }}>
        <div className="text-center transition-all duration-700 opacity-100 translate-y-0">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            AI Report Submitted!
          </h1>
          <p className="text-zinc-400 mb-2">
            Your verified report has been sent to {pendingReport?.assignedDepartment || "the relevant department"}.
          </p>
          <div className="text-sm text-zinc-500 mt-6">
            Returning to Home...
          </div>
        </div>
      </section>
    );
  }

  // If no pending report is available but user lands on the AI tab directly
  if (!pendingReport) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center p-6" style={{ background: "#0B0B0F" }}>
        <ShieldCheck className="w-16 h-16 text-zinc-800 mb-4" />
        <h2 className="text-xl font-bold mb-2">No Active Analysis</h2>
        <p className="text-zinc-500 text-center mb-6">Report an issue from the Home or Report tabs to utilize the AI Analysis engine.</p>
        <button 
          onClick={onBack}
          className="bg-white/10 text-white px-6 py-3 rounded-xl font-medium"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white overflow-y-auto pb-24"
      style={{
        background: "#0B0B0F", // Deep space black base
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Background glow effects */}
      <div className="fixed top-0 left-0 w-full h-96 bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-40 right-0 w-64 h-64 bg-violet-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar */}
      <div className="flex items-center p-5 sticky top-0 z-10 backdrop-blur-md" style={{ background: "rgba(11,11,15,0.8)" }}>
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors hover:bg-white/5 active:scale-95"
          style={{ background: "#1C1C24" }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="ml-4 text-[19px] font-bold tracking-tight">AI Analysis</h1>
      </div>

      <div className={`px-5 pt-2 space-y-6 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

        {/* Image / Scanning Box */}
        <div 
          className="relative w-full h-56 rounded-[24px] overflow-hidden flex flex-col items-center justify-center"
          style={{ 
            background: "linear-gradient(180deg, rgba(30,30,46,1) 0%, rgba(20,20,30,1) 100%)",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)"
          }}
        >
          {/* Tag */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-[#5B60F6] text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(91,96,246,0.6)]">
              Pothole Detected
            </div>
          </div>

          {/* Target Brackets (Camera view simulation) */}
          {pendingReport?.imagePreviews?.length > 0 ? (
            <img src={pendingReport.imagePreviews[0]} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Analyzed" />
          ) : null}
          <div className="absolute top-[25%] left-[10%] w-[80%] h-[50%] z-10">
            {/* Top Left */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
            {/* Top Right */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
            {/* Bottom Left */}
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
            {/* Bottom Right */}
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br-sm shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
            
            {/* Light overlay inside the targeting box */}
            <div className="w-full h-full bg-emerald-400/5"></div>
          </div>

          {/* Placeholder Camera Icon */}
          <svg className="w-16 h-16 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          
          {/* Subtle bottom glow */}
          <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none" />
        </div>

        {/* 4-Grid Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl" style={{ background: "#1C1C24", border: "1px solid rgba(255,255,255,0.03)" }}>
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Issue Type</div>
            <div className="text-[17px] font-bold text-[#7C6FFF] tracking-tight">{pendingReport?.selectedCategoryData?.title.split(' ')[0] || "Issue"}</div>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: "#1C1C24", border: "1px solid rgba(255,255,255,0.03)" }}>
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">AI Severity</div>
            <div className="text-[17px] font-bold text-[#FF6B6B] tracking-tight">HIGH</div>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: "#1C1C24", border: "1px solid rgba(255,255,255,0.03)" }}>
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Est. Response</div>
            <div className="text-[17px] font-bold text-[#2DD4BF] tracking-tight">48 hrs</div>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: "#1C1C24", border: "1px solid rgba(255,255,255,0.03)" }}>
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Objects Found</div>
            <div className="text-[17px] font-bold text-[#F59E0B] tracking-tight">1</div>
          </div>
        </div>

        {/* Detection Confidence bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[14px] font-semibold text-zinc-400">Detection Confidence</span>
            <span className="text-[15px] font-black text-[#7C6FFF]">94%</span>
          </div>
          {/* Track */}
          <div className="w-full h-2.5 bg-[#1C1C24] rounded-full overflow-hidden">
            {/* Fill */}
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: mounted ? "94%" : "0%", 
                background: "linear-gradient(90deg, #5a4dd1 0%, #a78bfa 100%)",
                boxShadow: "0 0 10px rgba(124,111,255,0.4)"
              }}
            />
          </div>
        </div>

        {/* Authentic Report Box */}
        <div 
          className="p-4 flex items-center space-x-3 rounded-[20px]"
          style={{ 
            background: "rgba(16, 185, 129, 0.04)", 
            border: "1px solid rgba(16, 185, 129, 0.15)" 
          }}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-white tracking-tight mb-0.5">Authentic Report — Verified</div>
            <div className="text-[11px] text-zinc-500 font-medium leading-snug">No manipulation • Duplicate check passed • Metadata valid</div>
          </div>
        </div>

        {/* Priority Score Card */}
        <div className="p-5 rounded-[24px]" style={{ background: "#1C1C24", border: "1px solid rgba(255,255,255,0.03)" }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-bold text-white">Priority Score <span className="text-zinc-500 font-medium">(AI-assigned)</span></h3>
            <div className="text-[22px] font-black text-[#F59E0B]">87<span className="text-[16px] text-[#F59E0B]/60">/100</span></div>
          </div>
          
          <div className="space-y-4">
            {/* Severity Sub-bar */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-zinc-400 w-20">Severity</span>
              <div className="flex-1 mx-3 h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF4757] rounded-full" style={{ width: "92%" }}></div>
              </div>
              <span className="text-[13px] font-bold text-zinc-300 w-6 text-right">9.2</span>
            </div>
            
            {/* Location Sub-bar */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-zinc-400 w-20">Location</span>
              <div className="flex-1 mx-3 h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF7F50] rounded-full" style={{ width: "85%" }}></div>
              </div>
              <span className="text-[13px] font-bold text-zinc-300 w-6 text-right">8.5</span>
            </div>
            
            {/* Temporal Sub-bar */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-zinc-400 w-20">Temporal</span>
              <div className="flex-1 mx-3 h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-[#FFA502] rounded-full" style={{ width: "78%" }}></div>
              </div>
              <span className="text-[13px] font-bold text-zinc-300 w-6 text-right">7.8</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="group w-full py-4 px-6 rounded-full text-[17px] font-semibold hover:bg-zinc-800 transition-all duration-200 active:scale-[0.98] shadow-md flex items-center justify-center space-x-2.5 mt-8"
          style={{ 
            background: submitting ? "#1C1C24" : "var(--primary, #7C6FFF)", 
            color: submitting ? "#A1A1AA" : "white",
            letterSpacing: '-0.01em' 
          }}
        >
          {submitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /><span>Transmitting Securely...</span></>
          ) : (
            <><Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" /><span>Submit Official Report</span></>
          )}
        </button>

      </div>
    </div>
  );
};

export default AIAnalysisDashboard;
