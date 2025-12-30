import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, ClipboardCheck, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TaskTemplate, Slot, api } from '@/services/api';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { TaskDetailsTab } from '@/components/TaskDetailsTab';
import { TaskAssignedTab } from '@/components/TaskAssignedTab';
import { TaskEmailTab } from '@/components/TaskEmailTab';
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
    activeTab = 'Rooster',
    onTabChange
}: TaskDetailViewProps) => {
    const [task, setTask] = useState<TaskTemplate>(initialTask);
    const [loading, setLoading] = useState(false);
    // Removed internal activeTab state
    const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Week');
    const [currentDate, setCurrentDate] = useState(new Date());

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

        fetchTaskDetails();
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

    // Effect to handle view mode in parent if needed, currently locally managed for Rooster view

    if (loading && !task) {
        return <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden">
            {/* 1. Header Section */}
            {/* Blue Header Strip */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shrink-0 shadow-sm">
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
                        <div className="p-1.5 rounded-full bg-white/10">
                            <ClipboardCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-tight flex items-center gap-2">
                                {task.name}
                                {loading && <Loader2 className="h-3 w-3 animate-spin opacity-70" />}
                            </h2>
                            <div className="text-xs text-primary-foreground/80 flex items-center gap-1">
                                <span>Manage Tasks</span>
                                <span className="opacity-50">/</span>
                                <span>{task.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Content Area */}
            <div className="flex-1 overflow-auto bg-muted/10 p-6">
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
                                {format(days[0].date, 'MMMM d')} – {format(days[6].date, 'd, yyyy')}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="h-8" onClick={handleToday}>
                                    Today
                                </Button>
                                <Button variant="default" size="sm" className="h-8 gap-1">
                                    <Plus className="h-3 w-3" /> Add Shift
                                </Button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="flex-1 overflow-auto">
                            <div className="grid grid-cols-[60px_1fr] h-full min-w-[800px]">
                                {/* Time Column */}
                                <div className="border-r bg-muted/5 sticky left-0 z-20">
                                    <div className="h-10 border-b bg-card sticky top-0 z-30"></div> {/* Header spacer */}
                                    {hours.map(hour => (
                                        <div key={hour} className="h-12 border-b text-xs text-muted-foreground flex items-center justify-center relative bg-muted/5">
                                            <span className="-top-2 relative bg-card px-1">{hour.toString().padStart(2, '0')}:00</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Days Columns */}
                                <div className="flex flex-col h-full min-w-0">
                                    {/* Days Header */}
                                    <div className="grid grid-cols-7 h-10 border-b sticky top-0 bg-card z-10 shadow-sm">
                                        {days.map((day, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "px-2 flex items-center justify-center text-sm border-r last:border-r-0 font-medium",
                                                    day.isToday
                                                        ? "text-primary bg-primary/5"
                                                        : "text-muted-foreground"
                                                )}
                                            >
                                                <span className="truncate">{format(day.date, 'EEE d MMM')}</span>
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
                                                    "border-r last:border-r-0 h-full relative group",
                                                    day.isToday ? "bg-primary/5" : ""
                                                )}
                                            >
                                                {/* Render horizontal lines for hours inside each column */}
                                                {hours.map((h, hIdx) => (
                                                    <div key={hIdx} className="h-12 border-b border-dashed border-border/40 w-full group-hover:bg-muted/30 transition-colors"></div>
                                                ))}

                                                {/* Current Time Indicator (if today) */}
                                                {day.isToday && (
                                                    <div
                                                        className="absolute w-full border-t-2 border-primary z-10 pointer-events-none"
                                                        style={{
                                                            top: `${((new Date().getHours() - 6) * 60 + new Date().getMinutes()) / (18 * 60) * 100}%`
                                                        }}
                                                    >
                                                        <div className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-primary ring-2 ring-background"></div>
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
        </div>
    );
};
