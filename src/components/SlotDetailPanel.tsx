import React from 'react';
import { X, Trash2, Check, Calendar as CalendarIcon, MapPin, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Slot } from '@/services/api';

interface SlotDetailPanelProps {
    slot: Slot | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedSlot: Slot) => void;
    onDelete: (slotId: number) => void;
}

export const SlotDetailPanel: React.FC<SlotDetailPanelProps> = ({
    slot,
    isOpen,
    onClose,
    onSave,
    onDelete,
}) => {
    if (!isOpen || !slot) return null;

    // Local state for form fields - in a real app, use react-hook-form
    // For this UI demo, we'll just display values or simple uncontrolled inputs where clear
    const [formData, setFormData] = React.useState<Slot>(slot);

    React.useEffect(() => {
        setFormData(slot);
    }, [slot]);

    // Mock data for dropdowns to match screenshot
    const repetitions = ['Every week', 'Every 2 weeks', 'Every month', 'Does not repeat'];

    return (
        <div className={cn(
            "fixed inset-y-0 right-0 w-[400px] bg-background border-l shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col",
            isOpen ? "translate-x-0" : "translate-x-full"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:bg-slate-100">
                        <X className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold text-sm text-foreground truncate max-w-[200px]">
                        {formData.id === 0 ? "New Shift" : (formData.description || "Shift Details")}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {formData.id !== 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 px-3 text-xs gap-1 opacity-90 hover:opacity-100"
                            onClick={() => onDelete(formData.id)}
                        >
                            <Trash2 className="h-3 w-3" /> Remove
                        </Button>
                    )}
                    <Button
                        variant="default"
                        size="sm"
                        className="h-8 px-4 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        onClick={() => onSave(formData)}
                    >
                        <Check className="h-3 w-3" /> {formData.id === 0 ? "Create" : "Save"}
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* Date & Time Section */}
                <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" /> Date & time
                    </h3>

                    <div className="grid gap-4 pl-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="all-day" className="text-sm font-normal text-muted-foreground">All day</Label>
                            <Switch id="all-day" />
                        </div>

                        <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                            <Label className="text-sm font-normal text-muted-foreground">By</Label>
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                                {/* Mock Date Picker Look */}
                                <div className="border rounded-md px-3 py-2 text-sm flex items-center justify-between bg-white">
                                    <span>{format(new Date(formData.date || new Date()), 'EEE d MMM yyyy')}</span>
                                    <CalendarIcon className="h-3 w-3 opacity-50" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                            <Label className="text-sm font-normal text-muted-foreground">Time</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={formData.time?.split(' - ')[0] || "00:00"}
                                    className="h-9 w-24 text-center"
                                    onChange={(e) => {
                                        const parts = formData.time.split(' - ');
                                        setFormData({ ...formData, time: `${e.target.value} - ${parts[1] || ''}` })
                                    }}
                                />
                                <span className="text-muted-foreground">-</span>
                                <Input
                                    value={formData.time?.split(' - ')[1] || "00:00"}
                                    className="h-9 w-24 text-center"
                                    onChange={(e) => {
                                        const parts = formData.time.split(' - ');
                                        setFormData({ ...formData, time: `${parts[0] || ''} - ${e.target.value}` })
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                            <Label className="text-sm font-normal text-muted-foreground">To</Label>
                            <div className="border rounded-md px-3 py-2 text-sm flex items-center justify-between bg-white">
                                <span>{format(new Date(formData.date || new Date()), 'EEE d MMM yyyy')}</span>
                                <CalendarIcon className="h-3 w-3 opacity-50" />
                            </div>
                        </div>

                        <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                            <Label className="text-sm font-normal text-muted-foreground">Repetition</Label>
                            <Select defaultValue={repetitions[0]}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {repetitions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                            <Label className="text-sm font-normal text-muted-foreground">Repeat until</Label>
                            <div className="border rounded-md px-3 py-2 text-sm flex items-center justify-between bg-white">
                                <span>di 30 jun 2026</span>
                                <CalendarIcon className="h-3 w-3 opacity-50" />
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-border/50" />

                {/* Activity Section */}
                <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px]">A</div>
                        Activity
                    </h3>

                    <div className="grid gap-4 pl-2">
                        <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                            <Label className="text-sm font-normal text-muted-foreground">Name</Label>
                            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="h-9" />
                        </div>

                        <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                            <Label className="text-sm font-normal text-muted-foreground">Location</Label>
                            <Select defaultValue="1">
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Sports park Molenzicht</SelectItem>
                                    <SelectItem value="2">Clubhouse</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                            <Label className="text-sm font-normal text-muted-foreground">Calendar</Label>
                            <div className="text-sm text-foreground">{formData.description}</div>
                        </div>
                    </div>
                </section>

                <hr className="border-border/50" />

                {/* Assigned Persons Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                            <UserPlus className="h-4 w-4" /> Assigned persons
                        </h3>
                        <Button variant="outline" size="sm" className="h-6 gap-1 rounded-full text-xs">
                            <UserPlus className="h-3 w-3" /> Add
                        </Button>
                    </div>

                    <div className="min-h-[100px] flex items-center justify-center border border-dashed rounded-md bg-muted/20">
                        <p className="text-sm text-muted-foreground">No data known</p>
                    </div>
                </section>

            </div>
        </div>
    );
};
