import { useState, useEffect } from 'react';
import { ClipboardCheck, CalendarIcon, X, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { api, PREDEFINED_LOCATIONS } from '@/services/api';

interface AddTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => void;
}

export const AddTaskDialog = ({ open, onOpenChange, onSubmit }: AddTaskDialogProps) => {
    const [dateBy, setDateBy] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [locationId, setLocationId] = useState<string>('');

    const [locations, setLocations] = useState<{ id: number; name: string }[]>([]);
    const [isCalendarByOpen, setIsCalendarByOpen] = useState(false);
    const [isCalendarToOpen, setIsCalendarToOpen] = useState(false);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const data = await api.locations.getAll();
                setLocations(data);
            } catch (error) {
                console.error("Failed to fetch locations", error);
                // Fallback to empty list or handle error UI
            }
        };
        fetchLocations();
    }, []);

    const handleSubmit = () => {
        onSubmit({
            name,
            description,
            location_id: locationId ? Number(locationId) : undefined,
            dateBy,
            dateTo,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 flex flex-row items-center gap-2 border-b">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    <DialogTitle className="text-primary text-base font-semibold">New task</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="name" className="text-primary font-medium text-xs uppercase tracking-wider">Name *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border-primary/20 focus-visible:ring-primary/20"
                        />
                    </div>

                    <div className="space-y-1">
                        <Input
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border-primary/20 focus-visible:ring-primary/20"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-primary font-medium text-xs uppercase tracking-wider">Location *</Label>
                        <Select value={locationId} onValueChange={setLocationId}>
                            <SelectTrigger className="border-primary/20 focus:ring-primary/20">
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.length > 0 ? (
                                    locations.map((loc) => (
                                        <SelectItem key={loc.id} value={loc.id.toString()}>
                                            {loc.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                        No locations found
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>



                    <div className="space-y-1">
                        <Label className="text-primary font-medium text-xs uppercase tracking-wider">By *</Label>
                        <Popover open={isCalendarByOpen} onOpenChange={setIsCalendarByOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-between text-left font-normal border-primary/20 hover:bg-transparent hover:text-foreground",
                                        !dateBy && "text-muted-foreground"
                                    )}
                                >
                                    {dateBy ? format(dateBy, "dd MMM yyyy").toLowerCase() : <span>Pick a date</span>}
                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dateBy}
                                    onSelect={(date) => {
                                        setDateBy(date);
                                        setIsCalendarByOpen(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-primary font-medium text-xs uppercase tracking-wider">To</Label>
                        <Popover open={isCalendarToOpen} onOpenChange={setIsCalendarToOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-between text-left font-normal border-primary/20 hover:bg-transparent hover:text-foreground",
                                        !dateTo && "text-muted-foreground"
                                    )}
                                >
                                    {dateTo ? format(dateTo, "dd MMM yyyy").toLowerCase() : <span>Date</span>}
                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dateTo}
                                    onSelect={(date) => {
                                        setDateTo(date);
                                        setIsCalendarToOpen(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <DialogHeader className="p-4 bg-muted/20 flex flex-row items-center justify-between border-t mt-2">
                    <Button variant="ghost" className="text-primary hover:text-primary/90 gap-2" onClick={() => onOpenChange(false)}>
                        <X className="h-4 w-4" /> Close
                    </Button>
                    <Button
                        className={cn("gap-2 transition-colors", (!name || !locationId || !dateBy) ? "bg-muted text-muted-foreground" : "")}
                        disabled={!name || !locationId || !dateBy}
                        onClick={handleSubmit}
                    >
                        Following <ArrowRight className="h-4 w-4" />
                    </Button>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
