import React, { useState, useEffect } from "react";
import { Search, ThumbsUp, MessageCircle, MapPin, Heart } from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../lib/firebase"; // Adjust path as needed
import { useAuth } from "../contexts/AuthContext"; // Assuming you have auth context

const CommunityFeed = () => {
  const { user } = useAuth(); // Get current user for upvoting
  const [activeFilter, setActiveFilter] = useState("all");
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { id: "all", label: "📋 All", icon: "📋" },
    { id: "pending", label: "⏳ Pending", icon: "⏳" },
    { id: "resolved", label: "✅ Resolved", icon: "✅" },
    { id: "trending", label: "🔥 Trending", icon: "🔥" },
  ];

  // Fetch reports from Firebase with real-time updates
  useEffect(() => {
    console.log("Setting up community feed listener for filter:", activeFilter);

    let q;

    if (activeFilter === "all") {
      q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    } else if (activeFilter === "pending") {
      q = query(
        collection(db, "reports"),
        where("status", "in", ["pending", "assigned", "in-progress"]),
        orderBy("createdAt", "desc")
      );
    } else if (activeFilter === "resolved") {
      q = query(
        collection(db, "reports"),
        where("status", "==", "resolved"),
        orderBy("createdAt", "desc")
      );
    } else if (activeFilter === "trending") {
      q = query(
        collection(db, "reports"),
        orderBy("upvoteCount", "desc"),
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("Community feed data received:", snapshot.docs.length);

        const items = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Ensure upvote fields exist with defaults
            upvoteCount: data.upvoteCount || 0,
            upvotedBy: data.upvotedBy || [],
            // Format time ago
            timeAgo: getTimeAgo(data.createdAt?.toDate() || new Date()),
            // Get location from address
            location: extractLocation(
              data.location?.displayAddress ||
              data.location?.address ||
              "Unknown Location"
            ),
            // Determine status display
            statusDisplay: getStatusDisplay(data.status || "pending"),
            // Get category info
            categoryInfo: getCategoryInfo(data.category || "other"),
            // Check if current user has upvoted
            hasUpvoted: user
              ? (data.upvotedBy || []).includes(user.uid)
              : false,
          };
        });

        setFeedItems(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching community feed:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [activeFilter, user?.uid]);

  // Handle upvote functionality
  const handleUpvote = async (reportId, hasUpvoted) => {
    if (!user) {
      alert("Please log in to upvote");
      return;
    }

    try {
      const reportRef = doc(db, "reports", reportId);

      if (hasUpvoted) {
        // Remove upvote
        await updateDoc(reportRef, {
          upvoteCount: increment(-1),
          upvotedBy: arrayRemove(user.uid),
          updatedAt: new Date(),
        });
      } else {
        // Add upvote
        await updateDoc(reportRef, {
          upvoteCount: increment(1),
          upvotedBy: arrayUnion(user.uid),
          updatedAt: new Date(),
        });
      }

      console.log("Upvote updated successfully");
    } catch (error) {
      console.error("Error updating upvote:", error);
      alert("Failed to update upvote. Please try again.");
    }
  };

  // Helper functions
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffHours = Math.abs(now - date) / (1000 * 60 * 60);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.floor(diffHours)}h`;
    if (diffHours < 24 * 7) return `${Math.floor(diffHours / 24)}d`;
    return `${Math.floor(diffHours / (24 * 7))}w`;
  };

  const extractLocation = (address) => {
    if (!address || address === "Unknown Location") return "Unknown";
    const parts = address.split(",");
    return parts[0]?.trim() || "Unknown";
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: { label: "Pending", color: "text-amber-600", emoji: "⏳" },
      assigned: { label: "Assigned", color: "text-blue-600", emoji: "📋" },
      "in-progress": {
        label: "In Progress",
        color: "text-purple-600",
        emoji: "🔄",
      },
      resolved: { label: "Resolved", color: "text-emerald-600", emoji: "✅" },
      closed: { label: "Closed", color: "text-gray-600", emoji: "🔒" },
    };
    return statusMap[status] || statusMap["pending"];
  };

  const getCategoryInfo = (category) => {
    const categoryMap = {
      roads: {
        icon: "🛣️",
        label: "Roads",
        color: "bg-amber-100 text-amber-800",
      },
      lighting: {
        icon: "💡",
        label: "Lighting",
        color: "bg-yellow-100 text-yellow-800",
      },
      water: { icon: "💧", label: "Water", color: "bg-blue-100 text-blue-800" },
      utilities: {
        icon: "⚡",
        label: "Utilities",
        color: "bg-blue-100 text-blue-800",
      },
      waste: {
        icon: "🗑️",
        label: "Waste",
        color: "bg-green-100 text-green-800",
      },
      parks: {
        icon: "🌳",
        label: "Parks",
        color: "bg-emerald-100 text-emerald-800",
      },
      safety: { icon: "🚨", label: "Safety", color: "bg-red-100 text-red-800" },
      other: { icon: "📝", label: "Other", color: "bg-gray-100 text-gray-800" },
    };
    return categoryMap[category] || categoryMap["other"];
  };

  const getDefaultEmoji = (category) => {
    const emojiMap = {
      roads: "🕳️",
      lighting: "💡",
      water: "💧",
      utilities: "⚡",
      waste: "🗑️",
      parks: "🌳",
      safety: "🚨",
      other: "📝",
    };
    return emojiMap[category] || "📸";
  };

  if (loading) {
    return (
      <section className="px-4 pt-6 pb-12">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            <span className="ml-4 text-text-secondary">
              Loading community feed...
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ background: '#0F0F13', minHeight: '100%', fontFamily: "'Inter', sans-serif" }} className="px-4 pt-6 pb-6">
      <div className="max-w-lg mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[2rem] font-black text-white" style={{ letterSpacing: '-0.04em' }}>Community Feed</h1>
          <button className="p-2.5 rounded-full transition-colors" style={{ background: '#1C1C24' }}>
            <Search className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all duration-200 ${
                activeFilter === filter.id
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              style={activeFilter === filter.id ? { background: '#7C6FFF' } : { background: '#1C1C24' }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Feed Items */}
        {feedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-accent mb-2">
              No Reports Yet
            </h3>
            <p className="text-text-secondary">
              {activeFilter === "pending"
                ? "No pending issues in your area"
                : activeFilter === "resolved"
                  ? "No resolved issues to show"
                  : "Be the first to report a civic issue!"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedItems.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl"
                style={{ background: '#1C1C24' }}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center mr-3" style={{ background: '#2A2A35' }}>
                      <span className="text-sm">👤</span>
                    </div>
                    <div>
                      <div className="text-[15px] font-semibold text-white tracking-tight leading-none mb-1">
                        {item.userDisplayName || "Anonymous Citizen"}
                      </div>
                      <div className="text-[12px] font-medium text-zinc-500 tracking-tight">
                        📍 {item.location} • {item.timeAgo}
                      </div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${item.categoryInfo.color}`}>
                    {item.categoryInfo.icon} <span className="ml-1">{item.categoryInfo.label}</span>
                  </div>
                </div>

                {/* Issue Image */}
                <div className="px-4 pb-4">
                  <div className="w-full h-48 rounded-xl flex items-center justify-center overflow-hidden relative" style={{ background: '#2A2A35' }}>
                    {item.imageUrls && item.imageUrls.length > 0 ? (
                      <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : null}
                    {(!item.imageUrls || item.imageUrls.length === 0) && (
                      <span className="text-5xl opacity-60">{getDefaultEmoji(item.category)}</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 pb-4">
                  <h3 className="text-[17px] font-semibold text-white mb-2 tracking-tight leading-snug">{item.title}</h3>
                  {item.description && (
                    <p className="text-[14px] text-zinc-500 mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpvote(item.id, item.hasUpvoted)}
                        className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 transition-colors font-medium text-[13px] ${
                          item.hasUpvoted ? 'text-red-400' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                        style={{ background: item.hasUpvoted ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)' }}
                        disabled={!user}
                      >
                        <Heart className={`w-4 h-4 ${item.hasUpvoted ? 'fill-current' : ''}`} />
                        <span>{item.upvoteCount}</span>
                      </button>
                      <button className="flex items-center space-x-1.5 rounded-lg px-3 py-1.5 transition-colors text-zinc-400" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-[13px] font-medium">{Math.floor(Math.random() * 10) + 1}</span>
                      </button>
                    </div>
                    <div className={`text-[11px] font-bold tracking-tight uppercase ${item.statusDisplay.color} flex items-center space-x-1 px-2 py-1 rounded-md`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <span>{item.statusDisplay.emoji}</span>
                      <span className="ml-1">{item.statusDisplay.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button (optional) */}
        {feedItems.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-subtle text-text-secondary rounded-xl hover:bg-borders transition-colors">
              Load More Issues
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CommunityFeed;
