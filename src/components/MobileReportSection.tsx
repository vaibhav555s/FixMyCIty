// components/MobileReportSection.tsx
import React, { useState } from "react";
import {
  Camera,
  MapPin,
  ArrowLeft,
  Construction,
  Droplets,
  Lightbulb,
  Trash2,
  Trees,
  Shield,
  Upload,
  Send,
  CheckCircle2,
  Loader2,
  BrainCircuit,
  X,
} from "lucide-react";
import ProtectedRoute from './auth/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

export interface MobileReportSectionProps {
  onBack: () => void;
  onAuthRequired: () => void;
  onNavigate?: (tab: string) => void;
  setPendingReport?: (report: any) => void;
}

const MobileReportSection: React.FC<MobileReportSectionProps> = ({
  onBack,
  onAuthRequired,
  onNavigate,
  setPendingReport,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");
  const { user } = useAuth();

  // AI Pipeline State
  const [aiState, setAiState] = useState<"idle" | "analyzing" | "complete">("idle");
  const [pipelineStep, setPipelineStep] = useState<number>(0);

  const AI_STEPS = [
    "Image Quality Validation",
    "Metadata Verification",
    "YOLOv8 Infrastructure Detection",
    "Duplicate Issue Detection",
    "Fraud / Manipulation Check",
    "Severity Classification",
    "Smart Prioritization Engine"
  ];


  // ✅ UPDATED CATEGORIES - Now matches department authentication exactly
  const categories = [
    {
      id: "roads",
      title: "Roads & Transportation",
      department: "Public Works Department", // ✅ Matches authentication context
      icon: Construction,
      color: "bg-blue-100 text-blue-600",
      examples: "Potholes, damaged roads, traffic signals",
    },
    {
      id: "water",
      title: "Water & Utilities",
      department: "Water & Utilities Department", // ✅ Matches authentication context
      icon: Droplets,
      color: "bg-cyan-100 text-cyan-600",
      examples: "Water leaks, drainage issues, sewer problems",
    },
    {
      id: "lighting",
      title: "Street Lighting",
      department: "Street Lighting Department", // ✅ Matches authentication context
      icon: Lightbulb,
      color: "bg-yellow-100 text-yellow-600",
      examples: "Broken street lights, dark areas",
    },
    {
      id: "waste",
      title: "Waste Management",
      department: "Waste Management Department", // ✅ Matches authentication context
      icon: Trash2,
      color: "bg-green-100 text-green-600",
      examples: "Garbage collection, overflowing bins",
    },
    {
      id: "parks",
      title: "Parks & Recreation",
      department: "Parks & Recreation Department",
      icon: Trees,
      color: "bg-emerald-100 text-emerald-600",
      examples: "Damaged benches, playground equipment",
    },
    {
      id: "safety",
      title: "Public Safety",
      department: "Public Safety Department",
      icon: Shield,
      color: "bg-red-100 text-red-600",
      examples: "Unsafe structures, security concerns",
    },
  ];

  // Auto-proceed when AI scanning is complete
  React.useEffect(() => {
    if (aiState === "complete") {
      proceedToAnalysis();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiState]);

  const proceedToAnalysis = () => {
    const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory);
    const assignedDepartment = selectedCategoryData?.department || "General";

    if (setPendingReport && user) {
      setPendingReport({
        title: title.trim(),
        description: description.trim(),
        selectedCategory,
        selectedCategoryData,
        assignedDepartment,
        selectedImages,
        imagePreviews,
        location,
        user,
      });
    }

    // Reset local form state
    setTitle("");
    setDescription("");
    setSelectedCategory("");
    setSelectedImages([]);
    setImagePreviews([]);
    setLocation(null);
    setLocationPermissionStatus("idle");

    if (onNavigate) {
      onNavigate("ai");
    } else {
      onBack();
    }
  };

  // Handle multiple image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newImages = [...selectedImages];
      const newPreviews = [...imagePreviews];

      files.forEach((file) => {
        if (newImages.length < 5) {
          // Maximum 5 photos
          newImages.push(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            newPreviews.push(e.target?.result as string);
            setImagePreviews([...newPreviews]);
          };
          reader.readAsDataURL(file);
        }
      });

      setSelectedImages(newImages);
    }
  };

  // Remove specific image
  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Enhanced location function
  const getCurrentLocation = async () => {
    setLocationPermissionStatus("requesting");
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setLocationPermissionStatus("denied");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationPermissionStatus("granted");
        const { latitude, longitude } = position.coords;

        try {
          // Using multiple geocoding APIs for better address details
          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`
          );
          const nominatimData = await nominatimResponse.json();

          const bigDataResponse = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const bigDataData = await bigDataResponse.json();

          const address = nominatimData.address || {};

          const detailedLocation = {
            lat: latitude,
            lng: longitude,
            houseNumber: address.house_number || "",
            street: address.road || address.street || bigDataData.street || "",
            neighbourhood: address.neighbourhood || address.suburb || bigDataData.locality || "",
            area: address.suburb || address.village || address.town || "",
            city: address.city || address.town || address.village || bigDataData.city || "",
            district: address.state_district || bigDataData.principalSubdivision || "",
            state: address.state || bigDataData.principalSubdivision || "",
            postcode: address.postcode || bigDataData.postcode || "",
            country: address.country || bigDataData.countryName || "India",
            shortAddress: "",
            fullAddress: "",
            displayAddress: "",
          };

          // Create formatted addresses
          const addressParts = [];

          if (detailedLocation.houseNumber) addressParts.push(detailedLocation.houseNumber);
          if (detailedLocation.street) addressParts.push(detailedLocation.street);
          if (detailedLocation.neighbourhood && detailedLocation.neighbourhood !== detailedLocation.area) {
            addressParts.push(detailedLocation.neighbourhood);
          } else if (detailedLocation.area) {
            addressParts.push(detailedLocation.area);
          }
          if (detailedLocation.city) addressParts.push(detailedLocation.city);
          if (detailedLocation.state && detailedLocation.state !== detailedLocation.city) {
            addressParts.push(detailedLocation.state);
          }
          if (detailedLocation.postcode) addressParts.push(detailedLocation.postcode);

          detailedLocation.shortAddress = [
            detailedLocation.street,
            detailedLocation.area || detailedLocation.city,
          ].filter(Boolean).join(", ");

          detailedLocation.fullAddress = addressParts.join(", ");
          detailedLocation.displayAddress = detailedLocation.fullAddress || detailedLocation.shortAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          setLocation(detailedLocation);
        } catch (error) {
          console.error("Geocoding error:", error);
          const fallbackLocation = {
            lat: latitude,
            lng: longitude,
            displayAddress: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          };
          setLocation(fallbackLocation);
        }

        setLocationLoading(false);
      },
      (error) => {
        console.error("Location error:", error);
        setLocationPermissionStatus("denied");
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000,
      }
    );
  };

  // Form submission handled by AI Dashboard now
  const handleSubmitPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title || !selectedCategory || !user) return;
    
    setAiState("analyzing");
    setPipelineStep(0);

    const runStep = (step: number) => {
      if (step < AI_STEPS.length) {
        setPipelineStep(step);
        setTimeout(() => runStep(step + 1), 700 + Math.random() * 300); // 700-1000ms delay
      } else {
        setTimeout(() => setAiState("complete"), 600);
      }
    };
    
    runStep(0);
  };

  // Mobile Report Section renders the form

  // AI Pipeline Overlay
  if (aiState === "analyzing" || aiState === "complete") {
    return (
      <ProtectedRoute onAuthRequired={onAuthRequired} message="Sign in to report issues">
        <section style={{ background: '#0F0F13', minHeight: '100%', fontFamily: "'Inter', sans-serif" }} className="px-5 pt-10 pb-8 flex flex-col">
           {/* Header */}
           <div className="mb-8 animate-fade-in">
             <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#7C6FFF' }}>
               <BrainCircuit className="w-6 h-6 text-white" />
             </div>
             <h1 className="text-[2rem] font-black text-white leading-[1.1] tracking-tight mb-2" style={{ letterSpacing: '-0.04em' }}>
               {aiState === "analyzing" ? "AI Analysis" : "Analysis Complete"}
             </h1>
             <p className="text-[15px] font-medium text-zinc-500 tracking-tight">
               {aiState === "analyzing" ? "Processing issue data securely..." : "Review infrastructure assessment"}
             </p>
           </div>

           {aiState === "analyzing" && (
             <div className="flex-1 space-y-4 animate-fade-in-delay">
               {AI_STEPS.map((step, index) => {
                 const isCompleted = pipelineStep > index;
                 const isCurrent = pipelineStep === index;
                 
                 return (
                   <div key={index} className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 ${isCurrent ? 'bg-white shadow-soft border border-zinc-200/50' : 'opacity-60'}`}>
                     <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                       {isCompleted ? (
                         <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                       ) : isCurrent ? (
                         <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                       ) : (
                         <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                       )}
                     </div>
                     <span className={`text-[15px] font-semibold tracking-tight ${isCurrent ? 'text-zinc-900' : 'text-zinc-500'}`}>
                       {step}
                     </span>
                   </div>
                 );
               })}
             </div>
           )}

           {aiState === "complete" && (
             <div className="flex-1 animate-fade-in space-y-5 flex flex-col items-center justify-center mt-12 pb-12">
               <Loader2 className="w-10 h-10 text-[#7C6FFF] animate-spin mb-4" />
               <p className="text-[17px] font-bold text-white tracking-tight">AI Analysis Ready</p>
               <p className="text-[14px] text-zinc-500 font-medium">Redirecting to Dashboard...</p>
             </div>
           )}
           
           <style>{`
             @keyframes fade-in {
               from { opacity: 0; transform: translateY(12px); }
               to { opacity: 1; transform: translateY(0); }
             }
             .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
             .animate-fade-in-delay { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
           `}</style>
        </section>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute
      onAuthRequired={onAuthRequired}
      message="Sign in to report issues"
    >
      <section style={{ background: '#0F0F13', minHeight: '100%', fontFamily: "'Inter', sans-serif" }}>
        <div className="max-w-lg mx-auto">
          {/* Sticky dark header with back button */}
          <div className="flex items-center justify-between p-5 sticky top-0 z-10" style={{ background: 'rgba(15,15,19,0.97)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <button
              onClick={onBack}
              className="p-2.5 rounded-full transition-colors active:scale-95"
              style={{ background: '#1C1C24' }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-[17px] font-bold text-white tracking-tight">Report Issue</h1>
            <div className="w-10"></div>
          </div>

          <form onSubmit={handleSubmitPrompt} className="px-5 pb-8 animate-fade-in-delay">
            {/* Issue Title */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                What's the issue?
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title..."
                  className="w-full text-2xl font-bold bg-transparent border-none outline-none pb-3 transition-colors tracking-tight"
                  style={{ color: 'white', borderBottom: '2px solid rgba(255,255,255,0.15)', caretColor: '#7C6FFF' }}
                  required
                />
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Select Category</label>
              <div className="grid grid-cols-1 gap-2.5">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className="p-4 rounded-2xl transition-all duration-200 text-left active:scale-[0.98]"
                      style={{ background: isSelected ? 'rgba(124,111,255,0.15)' : '#1C1C24', border: isSelected ? '1.5px solid rgba(124,111,255,0.6)' : '1.5px solid transparent' }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.color} bg-opacity-20`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold tracking-tight text-[15px] mb-0.5 ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                            {category.title}
                          </div>
                          <div className="text-[11px] text-zinc-600 font-medium">
                            {category.examples}
                          </div>
                          <div className="text-[10px] font-bold mt-1 px-2 py-0.5 rounded-md inline-block" style={{ background: 'rgba(124,111,255,0.15)', color: '#7C6FFF' }}>
                            📨 {category.department}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                Detailed Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-28 p-4 rounded-2xl resize-none outline-none transition-all text-[15px] placeholder-zinc-700"
                style={{ background: '#1C1C24', color: 'white', border: '1.5px solid rgba(255,255,255,0.08)' }}
                placeholder="Provide more context (e.g., how long, exact spot, safety hazards)..."
              />
            </div>

            {/* Multiple Photo Upload */}
            <div>
              <label className="block text-[13px] font-bold text-zinc-500 uppercase tracking-widest mb-4">
                Add Photos <span className="text-zinc-400">({selectedImages.length}/5)</span>
              </label>

              {/* Photo Grid */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden border border-borders"
                    >
                      <img
                        src={preview}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Photo Button */}
              {selectedImages.length < 5 && (
                <button
                  type="button"
                  onClick={() => setShowPhotoOptions(true)}
                  className="w-full p-5 rounded-2xl flex flex-col items-center justify-center space-y-3 cursor-pointer transition-colors active:scale-[0.98]"
                  style={{ border: '2px dashed rgba(255,255,255,0.12)', background: '#1C1C24' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(124,111,255,0.15)' }}>
                    <Camera className="w-5 h-5" style={{ color: '#7C6FFF' }} />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-zinc-300 tracking-tight">Capture or Upload</div>
                    <div className="text-[13px] text-zinc-600 font-medium">JPEG, PNG • Up to 10MB</div>
                  </div>
                </button>
              )}

              {/* Mobile Photo Options Modal */}
              {showPhotoOptions && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                  <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 space-y-3">
                    <div className="text-center mb-4">
                      <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
                      <h3 className="font-semibold text-accent">Add Photo</h3>
                      <p className="text-sm text-text-secondary">
                        Choose how to add your photo
                      </p>
                    </div>

                    {/* Camera Option */}
                    <label className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Camera className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-accent">Take Photo</div>
                        <div className="text-sm text-text-secondary">Use camera to capture</div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          handleImageSelect(e);
                          setShowPhotoOptions(false);
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Gallery Option */}
                    <label className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Upload className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-accent">Choose from Gallery</div>
                        <div className="text-sm text-text-secondary">Select existing photos</div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          handleImageSelect(e);
                          setShowPhotoOptions(false);
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Cancel */}
                    <button
                      type="button"
                      onClick={() => setShowPhotoOptions(false)}
                      className="w-full p-4 text-center text-text-secondary hover:text-accent transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Photo Instructions */}
              <p className="text-xs text-text-secondary mt-3">
                📸 Upload up to 5 photos • Clear images help authorities resolve issues faster
              </p>
            </div>

            {/* Enhanced Location */}
            <div>
              <label className="block text-caption mb-4">Location</label>

              {locationPermissionStatus === "requesting" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-900 mb-2">
                      Requesting Location Permission
                    </div>
                    <div className="text-xs text-blue-700">
                      Please allow location access in your browser
                    </div>
                  </div>
                </div>
              )}

              {locationPermissionStatus === "denied" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="text-center">
                    <div className="text-sm font-medium text-red-900 mb-2">
                      Location Permission Denied
                    </div>
                    <div className="text-xs text-red-700 mb-3">
                      Please enable location in your browser settings and try again
                    </div>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {!location &&
                locationPermissionStatus !== "requesting" &&
                locationPermissionStatus !== "denied" && (
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="w-full p-4 border border-borders rounded-xl hover:border-accent transition-colors text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-accent">
                          {locationLoading ? "Getting location..." : "Use Current Location"}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {locationLoading ? "Please wait..." : "Tap to capture your exact location"}
                        </div>
                      </div>
                    </div>
                  </button>
                )}

              {location && (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mt-1">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-emerald-900 mb-2">📍 Location Captured</div>
                        <div className="text-sm text-emerald-700">
                          {location.displayAddress || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLocation(null);
                        setLocationPermissionStatus("idle");
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Submit Button */}
            <button
              type="submit"
              disabled={aiState !== "idle" || !title || !selectedCategory}
              className="w-full bg-zinc-900 text-white font-semibold py-4 rounded-2xl text-[17px] tracking-tight disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-md hover:bg-zinc-800 active:scale-[0.98] transition-all"
            >
              {aiState !== "idle" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Custom animations */}
        <style>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.6s ease-out;
          }
        `}</style>
      </section>
    </ProtectedRoute>
  );
};

export default MobileReportSection;
