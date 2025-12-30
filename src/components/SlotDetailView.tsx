
import { useState } from 'react';
import { ArrowLeft, ClipboardCheck, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react'; // Icon fallback if needed, though screenshot shows standard buttons
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'; // Assuming you have shadcn tabs, if not I'll just use divs
import { Card } from '@/components/ui/card';

// Since I haven't checked for Tabs component existence, I will build a simple tab system to be safe or use standard shadcn imports if available.
// I saw "Tabs" in the file list earlier? Yes 'tabs.tsx'.

interface SlotDetailViewProps {
  slot: any;
  onBack: () => void;
}

export const SlotDetailView = ({ slot, onBack }: SlotDetailViewProps) => {
  const [activeTab, setActiveTab] = useState('Rooster');
  const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Week');

  // Hardcoded for the screenshot look "December 22 - 28"
  const weekDays = [
    { label: 'Tue 22 Dec', active: false },
    { label: 'December 23', active: false },
    { label: 'Wo 24 Dec', active: false },
    { label: 'From December 25th', active: false },
    { label: 'Vr 26 Dec', active: true },
    { label: 'Sun 27 Dec', active: false },
    { label: 'Dec 28', active: false },
  ];

  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 to 23:00

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Top Blue Header Bar - simplified, assumed managed by parent or generic header, 
          but here we need the specific Breadcrumb/Header "Taken > Bar service..." from screenshot? 
          Actually screenshot shows standard blue bar at top "Taken", then this white content area. 
          So we build the white content area. 
      */}

      {/* 1. Header Section */}
      <div className="border-b border-border bg-card px-6 py-4">
        {/* Back / Title Row */}
        <div className="flex items-start gap-4">
          <div className="mt-1 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              {slot.description || "Bar service"}
            </h1>
            <div className="flex items-center text-sm text-muted-foreground gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-400"></span>
              {/* Location placeholder - typical in these apps */}
              Sports Park Molenzicht - Bar service
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Rooster, Details...) */}
        <div className="mt-6 flex gap-6 text-sm font-medium border-b border-white">
          {/* We use border-white to not double border with container, 
                Tabs usually sit right on the line. 
                Active tab has blue text and blue border bottom.
            */}
          {['Rooster', 'Details', 'Assigned persons', 'E-mail template'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 border-b-2 transition-colors px-1",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 overflow-auto bg-slate-50/50 p-6">
        {activeTab === 'Rooster' && (
          <div className="bg-card rounded-lg border shadow-sm h-full flex flex-col">
            {/* Calendar Toolbar */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex bg-muted/20 p-1 rounded-md">
                {['Month', 'Week', 'Day'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    className={cn(
                      "px-3 py-1 text-sm rounded-sm font-medium transition-all",
                      viewMode === mode
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="text-lg font-semibold text-foreground">
                December 22 – 28
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  Today
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-[60px_1fr] h-full min-w-[800px]">
                {/* Time Column */}
                <div className="border-r bg-muted/5">
                  <div className="h-10 border-b"></div> {/* Header spacer */}
                  {hours.map(hour => (
                    <div key={hour} className="h-12 border-b text-xs text-muted-foreground flex items-center justify-center relative">
                      <span className="-top-2 relative bg-card px-1">{hour.toString().padStart(2, '0')}:00</span>
                    </div>
                  ))}
                </div>

                {/* Days Columns */}
                <div className="flex flex-col h-full">
                  {/* Days Header */}
                  <div className="grid grid-cols-7 h-10 border-b">
                    {weekDays.map((day, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "px-2 flex items-center justify-center text-sm border-r last:border-r-0",
                          day.active
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        <span className="truncate">{day.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Grid Body */}
                  <div className="grid grid-cols-7 flex-1 relative">
                    {/* Render vertical lines for columns */}
                    {weekDays.map((day, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "border-r last:border-r-0 h-full relative",
                          day.active ? "bg-blue-50/30" : ""
                        )}
                      >
                        {/* Render horizontal lines for hours inside each column */}
                        {hours.map((h, hIdx) => (
                          <div key={hIdx} className="h-12 border-b border-dashed border-gray-100 w-full"></div>
                        ))}

                        {/* Mock GREEN Line as in screenshot (current time indicator?) or just a visual */}
                        {day.active && (
                          <div className="absolute top-[45%] w-full border-t border-green-400 z-10"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Details' && (
          <div className="p-4 text-muted-foreground">Details view not implemented in this demo.</div>
        )}
        {activeTab === 'Assigned persons' && (
          <div className="p-4 text-muted-foreground">Assigned persons view not implemented in this demo.</div>
        )}

        <div className="mt-4">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to list
          </Button>
        </div>
      </div>
    </div>
  );
};
