import React from 'react';
import { ArrowLeft, Share, ThumbsUp, MessageCircle, MapPin } from 'lucide-react';

interface IssueDetailProps {
  onBack: () => void;
}

const IssueDetail: React.FC<IssueDetailProps> = ({ onBack }) => {
  const timelineSteps = [
    {
      id: 1,
      title: 'Report Submitted',
      description: 'Today at 2:30 PM',
      status: 'completed',
      icon: '✓'
    },
    {
      id: 2,
      title: 'Under Review',
      description: 'Assigned to Public Works Dept',
      status: 'current',
      icon: '⏳'
    },
    {
      id: 3,
      title: 'In Progress',
      description: 'Repair work will begin',
      status: 'pending',
      icon: '○'
    },
    {
      id: 4,
      title: 'Resolved',
      description: 'Issue marked as completed',
      status: 'pending',
      icon: '○'
    }
  ];

  return (
    <section className="min-h-screen bg-surface">
      <div className="max-w-lg mx-auto pb-20">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-zinc-200/60 shadow-sm rounded-full hover:bg-zinc-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-600" />
          </button>
          <h1 className="text-[17px] font-semibold text-zinc-900 tracking-tight">Issue Details</h1>
          <button className="p-2.5 bg-white border border-zinc-200/60 shadow-sm rounded-full hover:bg-zinc-50 transition-colors">
            <Share className="w-5 h-5 text-zinc-600" />
          </button>
        </div>
        
        {/* Hero Image */}
        <div className="h-72 bg-zinc-100 flex items-center justify-center relative border-b border-zinc-200/50">
          <span className="text-7xl opacity-80 shadow-sm">🕳️</span>
        </div>
        
        {/* Content */}
        <div className="p-6">
          
          {/* Title & Meta */}
          <div className="flex items-start justify-between mb-6">
            <div className="pr-4">
              <h2 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight leading-tight">Pothole on Main Street</h2>
              <div className="flex items-center text-[13px] font-medium text-zinc-500 mb-2">
                <MapPin className="w-4 h-4 mr-1.5" />
                <span>Near Coffee Shop Junction</span>
              </div>
              <div className="text-[12px] font-semibold text-zinc-400">⏰ Reported 2 hours ago</div>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold tracking-tight uppercase bg-amber-100 text-amber-800 shadow-sm whitespace-nowrap">
              ⏳ In Review
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-8">
            <p className="text-[15px] text-zinc-700 leading-relaxed tracking-tight">Large pothole causing traffic issues near the main intersection. Multiple vehicles are swerving to avoid it which creates safety hazard for pedestrians and other vehicles.</p>
          </div>
          
          {/* Progress Timeline */}
          <div className="mb-8 card-premium p-6">
            <h3 className="text-[16px] font-semibold text-zinc-900 mb-5 tracking-tight">Progress Timeline</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
              {timelineSteps.map((step) => (
                <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                    step.status === 'completed' 
                      ? 'bg-emerald-500 text-white' 
                      : step.status === 'current'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-400'
                  }`}>
                    <span className="text-[11px] font-bold">{step.icon}</span>
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:group-odd:text-right md:group-even:text-left">
                    <div className={`font-semibold tracking-tight text-[15px] mb-0.5 ${
                      step.status === 'pending' ? 'text-zinc-400' : 'text-zinc-900'
                    }`}>
                      {step.title}
                    </div>
                    <div className={`text-[13px] font-medium leading-tight ${
                      step.status === 'pending' ? 'text-zinc-400' : 'text-zinc-500'
                    }`}>
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Community Engagement */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold text-zinc-900 tracking-tight">Community</h3>
              <div className="text-[13px] font-medium text-zinc-500">24 people affected</div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center justify-center p-3 bg-white border border-zinc-200/60 rounded-2xl hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm">
                <ThumbsUp className="w-5 h-5 text-zinc-600 mb-2" />
                <span className="text-[12px] font-semibold text-zinc-700">Upvote (24)</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 bg-white border border-zinc-200/60 rounded-2xl hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm">
                <MessageCircle className="w-5 h-5 text-zinc-600 mb-2" />
                <span className="text-[12px] font-semibold text-zinc-700">Comment (8)</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 bg-zinc-900 rounded-2xl hover:bg-zinc-800 transition-all shadow-sm text-white">
                <MapPin className="w-5 h-5 mb-2" />
                <span className="text-[12px] font-semibold">Directions</span>
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default IssueDetail;