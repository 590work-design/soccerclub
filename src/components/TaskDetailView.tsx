import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, ClipboardCheck, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TaskTemplate, Slot, api } from '@/services/api';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, parse, differenceInMinutes, startOfDay } from 'date-fns';
import { TaskDetailsTab } from '@/components/TaskDetailsTab';
import { TaskAssignedTab } from '@/components/TaskAssignedTab';
import { TaskEmailTab } from '@/components/TaskEmailTab';
import { SlotDetailPanel } from '@/components/SlotDetailPanel';
import { toast } from 'sonner';

interface TaskDetailViewProps {
    task: TaskTemplate;
    onBack: () => void;
    onTaskUpdate?: (id: number, data: Partial<TaskTemplate>) => Promise<void>;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export const TaskDetailView = ({
    task: initialTask,
    onBack,
    onTaskUpdate,
    activeTab: initialActiveTab = 'Rooster',
    onTabChange
}: TaskDetailViewProps) => {
    const [task, setTask] = useState<TaskTemplate>(initialTask);
    const [loading, setLoading] = useState(false);

    // Internal tab state if not controlled
    const [localActiveTab, setLocalActiveTab] = useState(initialActiveTab);
    const activeTab = onTabChange ? initialActiveTab : localActiveTab;
    const handleTabChange = (tab: string) => {
        if (onTabChange) onTabChange(tab);
        else setLocalActiveTab(tab);
    };

    const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Week');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Slots state
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

    // Fetch fresh task details on mount
    useEffect(() => {
        const fetchTaskDetails = async () => {
            // If we have an ID, fetch the latest details
            if (initialTask.id) {
                setLoading(true);
                try {
                    const freshTask = await api.taskTemplates.getById(initialTask.id);
                    setTask(freshTask);
                } catch (error) {
                    console.error("Failed to fetch task details", error);
                    toast.error("Failed to load latest task details");
                } finally {
                    setLoading(false);
                }
            }
        };

        const fetchSlots = async () => {
            setLoadingSlots(true);
            try {
                // Determine volunteer ID if needed or just fetch all slots for this task context
                // For layout demo, we'll fetch all slots and filter client-side if API doesn't support by task
                // The prompt says "Task Layout", so we assume slots belong to this Task Type eventually.
                // Current mock API might not link slots to task_template_id directly, so we might need to mock it.

                let allSlots: Slot[] = [];
                // Disabled fetching per user request (404 issues)
                // allSlots = await api.slots.getAll();



                // Filter slots that 'belong' to this task.
                // If API doesn't return task_template_id on slots, we might show all for demo or randomly assign.
                // For this demo, let's assume all slots are relevant or just show them to populate the calendar.
                // In a real app: const relevantSlots = allSlots.filter(s => s.task_template_id === task.id);
                setSlots(allSlots);
            } catch (error) {
                console.error("Failed to fetch slots", error);
            } finally {
                setLoadingSlots(false);
            }
        }

        fetchTaskDetails();
        fetchSlots();
    }, [initialTask.id]);


    // Update local state if calling parent update (optimistic or synced)
    const handleLocalUpdate = async (id: number, data: Partial<TaskTemplate>) => {
        if (onTaskUpdate) {
            await onTaskUpdate(id, data);
            // Re-fetch or merge to ensure we have latest
            const updated = { ...task, ...data };
            setTask(updated as TaskTemplate);
        }
    };

    // Generate days for the current view
    const days = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
        return Array.from({ length: 7 }, (_, i) => {
            const date = addDays(start, i);
            return {
                date,
                label: format(date, 'EEE d MMM'), // e.g., "Mon 26 Dec"
                iso: format(date, 'yyyy-MM-dd'),
                isToday: isSameDay(date, new Date()),
            };
        });
    }, [currentDate]);

    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 to 23:00

    const handlePrev = () => setCurrentDate(d => subWeeks(d, 1));
    const handleNext = () => setCurrentDate(d => addWeeks(d, 1));
    const handleToday = () => setCurrentDate(new Date());

    // Helper to calculate slot position
    const getSlotPosition = (slot: Slot) => {
        // Parse time string "19:30 - 22:00"
        try {
            const [startTimeStr, endTimeStr] = slot.time.split(' - ');
            if (!startTimeStr) return null;

            const [startHour, startMin] = startTimeStr.split(':').map(Number);
            const [endHour, endMin] = endTimeStr ? endTimeStr.split(':').map(Number) : [startHour + 1, startMin];

            // Start of calendar is 06:00
            const calendarStartHour = 6;

            const startMinutesFromBase = (startHour - calendarStartHour) * 60 + startMin;
            const durationMinutes = ((endHour * 60 + endMin) - (startHour * 60 + startMin));

            // 1 hour = 48px height (h-12 is 3rem = 48px)
            const pixelsPerMinute = 48 / 60;

            return {
                top: Math.max(0, startMinutesFromBase * pixelsPerMinute),
                height: Math.max(24, durationMinutes * pixelsPerMinute) // Min height
            };

        } catch (e) {
            console.warn("Invalid slot time format", slot.time);
            return null;
        }
    };

    const handleAddNewSlot = (initialDate?: Date, initialTimeStr?: string) => {
        const dateStr = initialDate ? format(initialDate, 'yyyy-MM-dd') : format(currentDate, 'yyyy-MM-dd');
        const timeStr = initialTimeStr || '09:00 - 12:00';

        const newSlot: Slot = {
            id: 0, // 0 indicates new
            volunteer_id: 0,
            date: dateStr,
            time: timeStr,
            description: 'New Shift',
            status: 'pending',
            task_template_id: task.id
        };
        setSelectedSlot(newSlot);
    };

    const handleGridClick = (e: React.MouseEvent<HTMLDivElement>, date: Date) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const pixelsPerMinute = 48 / 60;
        const minutesFromStart = y / pixelsPerMinute;

        const startHourBase = 6;
        const totalMinutes = startHourBase * 60 + minutesFromStart;

        // Round to nearest 30 mins
        const roundedMinutes = Math.round(totalMinutes / 30) * 30;

        const startH = Math.floor(roundedMinutes / 60);
        const startM = roundedMinutes % 60;

        // Default duration 3 hours
        const endMinutes = roundedMinutes + 180;
        const endH = Math.floor(endMinutes / 60);
        const endM = endMinutes % 60;

        const formatTime = (h: number, m: number) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const timeStr = `${formatTime(startH, startM)} - ${formatTime(endH, endM)}`;

        handleAddNewSlot(date, timeStr);
    };

    const handleSaveSlot = async (updatedSlot: Slot) => {
        try {
            const timeParts = updatedSlot.time.split(' - ');
            const start_time = timeParts[0] ? timeParts[0].trim() : "09:00";
            const end_time = timeParts[1] ? timeParts[1].trim() : "10:00";

            // Map repetition UI string to backend enum/string
            // 'Every week', 'Every 2 weeks', 'Every month', 'Does not repeat'
            // Assumed mapping, verify with backend values if possible
            let repetition = 'none';
            if (updatedSlot.repetition === 'Every week') repetition = 'weekly';
            if (updatedSlot.repetition === 'Every 2 weeks') repetition = 'biweekly';
            if (updatedSlot.repetition === 'Every month') repetition = 'monthly';

            const payload = {
                start_date: updatedSlot.date, // format YYYY-MM-DD handled by usage
                start_time: start_time,
                end_time: end_time,
                all_day: false, // UI switch not fully bound in SlotDetailPanel yet, default false
                repetition: repetition,
                repeat_until: repetition !== 'none' ? '2025-12-31' : null, // hardcoded or need field from UI
                name: updatedSlot.description,
                location_id: 1, // Default or select from UI
                repetition_id: 0
            };

            console.log("Generating schedule with payload:", payload);
            await api.taskTemplates.generateSchedule(task.id, payload);

            toast.success("Schedule generated successfully");
            setIsSlotPanelOpen(false);
            // We cannot fetch slots because the endpoint is broken (404). 
            // So we won't see the new slot immediately on the calendar unless we manually add it to state.
            // For now, adhering to 'do not work on slots' means we don't try to fetch.

        } catch (error: any) {
            console.error("Failed to save slot/schedule", error);
            toast.error(error.message || "Failed to save slot");
        }
    };

    const handleDeleteSlot = async (id: number) => {
        setSlots(prev => prev.filter(s => s.id !== id));
        try {
            await api.slots.delete(id);
            toast.success("Slot deleted");
            setSelectedSlot(null);
        } catch (e) {
            toast.error("Failed to delete slot");
        }
    }


    if (loading && !task) {
        return <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden relative">
            {/* 1. Header Section */}
            {/* Blue Header Strip */}
            <div className="bg-[#2c3e50] text-primary-foreground p-4 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="text-primary-foreground hover:bg-white/10 h-8 w-8"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="h-6 w-px bg-white/20 mx-1"></div>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-white/10">
                            <ClipboardCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-tight flex items-center gap-2">
                                {task.name}
                                {loading && <Loader2 className="h-3 w-3 animate-spin opacity-70" />}
                            </h2>
                            <div className="text-xs text-primary-foreground/70 flex items-center gap-1">
                                <span>Sports Park Molenzicht - Bar service</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Tabs Navigation */}
            <div className="bg-background border-b px-6 pt-2">
                <div className="flex gap-6">
                    {['Rooster', 'Details', 'Assigned persons', 'E-mail template'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={cn(
                                "pb-3 border-b-2 text-sm font-medium transition-colors px-1",
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
            <div className="flex-1 overflow-auto bg-slate-50 p-6">
                {activeTab === 'Rooster' && (
                    <div className="bg-background rounded-lg border shadow-sm h-full flex flex-col overflow-hidden">
                        {/* Calendar Toolbar */}
                        <div className="flex items-center justify-center relative p-4 border-b">
                            {/* Left: View Toggle */}
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex bg-slate-100 p-1 rounded-md">
                                {['Month', 'Week', 'Day'].map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode as any)}
                                        className={cn(
                                            "px-4 py-1.5 text-xs rounded-sm font-medium transition-all",
                                            viewMode === mode
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground hover:bg-slate-100"
                                        )}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>

                            {/* Center: Date Range */}
                            <div className="text-base font-semibold text-primary">
                                {format(days[0].date, 'MMMM d')} – {format(days[6].date, 'MMMM dd')}
                            </div>

                            {/* Right: Actions */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={handlePrev}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={handleNext}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-full border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                                    onClick={handleToday}
                                >
                                    Today
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-full px-4 gap-1 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground transform transition-all hover:scale-105 shadow-sm"
                                    onClick={() => handleAddNewSlot()}
                                >
                                    <Plus className="h-3 w-3" /> Add
                                </Button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="flex-1 overflow-auto">
                            <div className="grid grid-cols-[60px_1fr] h-full min-w-[1000px]">
                                {/* Time Column */}
                                <div className="border-r border-slate-200 sticky left-0 z-20 bg-background">
                                    <div className="h-10 border-b border-slate-200 bg-slate-50 sticky top-0 z-30"></div> {/* Header spacer */}
                                    {hours.map(hour => (
                                        <div key={hour} className="h-12 border-b border-slate-300 text-[10px] text-slate-500 font-bold flex items-start justify-center pt-1 bg-slate-50/50">
                                            {hour.toString().padStart(2, '0')}:00
                                        </div>
                                    ))}
                                </div>

                                {/* Days Columns */}
                                <div className="flex flex-col h-full min-w-0 bg-white">
                                    {/* Days Header */}
                                    <div className="grid grid-cols-7 h-10 border-b border-slate-200 sticky top-0 bg-slate-50 z-10 shadow-sm">
                                        {days.map((day, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "px-2 flex items-center justify-center text-xs border-r border-slate-300 last:border-r-0 font-bold uppercase tracking-wider",
                                                    day.isToday
                                                        ? "text-blue-700 bg-blue-100"
                                                        : "text-slate-700 bg-slate-50"
                                                )}
                                            >
                                                <span className="truncate">{day.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Grid Body */}
                                    <div className="grid grid-cols-7 flex-1 relative min-h-0">
                                        {/* Render vertical lines for columns */}
                                        {days.map((day, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "border-r border-slate-300 last:border-r-0 h-full relative group cursor-pointer hover:bg-black/[0.02] transition-colors",
                                                    day.isToday ? "bg-blue-50/30" : ""
                                                )}
                                                onClick={(e) => handleGridClick(e, day.date)}
                                            >
                                                {/* Render horizontal lines for hours inside each column */}
                                                {hours.map((h, hIdx) => (
                                                    <div key={hIdx} className="h-12 border-b border-slate-300 w-full"></div>
                                                ))}

                                                {/* Slots Rendering */}
                                                {slots.filter(s => {
                                                    // Simple date matching. Mock slots usually have 'YYYY-MM-DD'
                                                    return isSameDay(parse(s.date, 'yyyy-MM-dd', new Date()), day.date);
                                                }).map(slot => {
                                                    const pos = getSlotPosition(slot);
                                                    if (!pos) return null;

                                                    const isSelected = selectedSlot?.id === slot.id;

                                                    return (
                                                        <div
                                                            key={slot.id}
                                                            className={cn(
                                                                "absolute left-1 right-1 rounded px-2 py-1 text-xs cursor-pointer transition-all border shadow-sm overflow-hidden",
                                                                isSelected
                                                                    ? "bg-[#ffcc00] border-[#e6b800] ring-2 ring-primary ring-offset-1 z-10"
                                                                    : "bg-[#ffeb3b] border-[#fdd835] hover:brightness-95"
                                                            )}
                                                            style={{
                                                                top: pos.top,
                                                                height: pos.height,
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedSlot(slot);
                                                            }}
                                                        >
                                                            <div className="font-semibold text-slate-800 truncate leading-none mb-0.5">
                                                                {slot.time}
                                                            </div>
                                                            <div className="text-slate-700 font-medium truncate leading-tight">
                                                                {slot.description}
                                                            </div>
                                                            <div className="text-[10px] text-slate-600 truncate mt-0.5 opacity-80">
                                                                {slot.time}
                                                            </div>
                                                        </div>
                                                    )
                                                })}

                                                {/* Current Time Indicator (if today) */}
                                                {day.isToday && (
                                                    <div
                                                        className="absolute w-full border-t-2 border-green-500 z-10 pointer-events-none"
                                                        style={{
                                                            top: `${((new Date().getHours() - 6) * 60 + new Date().getMinutes()) / (18 * 60) * 100}%`
                                                        }}
                                                    >
                                                    </div>
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
                    <div className="h-full">
                        <TaskDetailsTab task={task} onUpdate={handleLocalUpdate} />
                    </div>
                )}
                {activeTab === 'Assigned persons' && (
                    <div className="h-full">
                        <TaskAssignedTab taskId={task.id} taskName={task.name} />
                    </div>
                )}
                {activeTab === 'E-mail template' && (
                    <div className="h-full">
                        <TaskEmailTab taskId={task.id} />
                    </div>
                )}

            </div>

            {/* Slide-over Slot Detail Panel */}
            <SlotDetailPanel
                slot={selectedSlot}
                isOpen={!!selectedSlot}
                onClose={() => setSelectedSlot(null)}
                onSave={handleSaveSlot}
                onDelete={handleDeleteSlot}
            />
        </div >
    );
};

