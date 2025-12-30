import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api, Volunteer } from '@/services/api';
import { Loader2, Check } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AddTaskManagerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (userId: number) => Promise<void>;
    existingManagerIds: number[];
}

export const AddTaskManagerDialog = ({ open, onOpenChange, onAdd, existingManagerIds }: AddTaskManagerDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [users, setUsers] = useState<Volunteer[]>([]);
    const [search, setSearch] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    useEffect(() => {
        if (open) {
            fetchUsers();
            setSelectedUserId(null);
            setSearch('');
        }
    }, [open]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const allUsers = await api.volunteers.getAllAll();
            setUsers(allUsers);
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    // Filter users excluding existing managers
    // We let Command handle the search filtering if we use standard behavior, 
    // but here we filter implementation-side to keep custom logic if needed.
    // However, to fix the specific "UI proper" request, integrating Command fully is best.
    // We will filter ONLY existing managers here, and let Command handle the string search.
    const availableUsers = users.filter(u => !existingManagerIds.includes(u.id));

    const handleSave = async () => {
        if (!selectedUserId) return;

        setSubmitting(true);
        try {
            await onAdd(selectedUserId);
            onOpenChange(false);
            toast.success("Manager added successfully");
        } catch (error) {
            console.error("Failed to add manager", error);
            toast.error("Failed to add manager");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
                <DialogHeader className="px-4 py-3 border-b">
                    <DialogTitle>Add Task Manager</DialogTitle>
                </DialogHeader>

                <Command shouldFilter={true} className="overflow-hidden">
                    <CommandInput
                        placeholder="Search by name or email..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList className="max-h-[350px]">
                        {loading ? (
                            <div className="flex justify-center items-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>No users found.</CommandEmpty>
                                <CommandGroup>
                                    {availableUsers.map((user) => (
                                        <CommandItem
                                            key={user.id}
                                            value={`${user.name} ${user.email}`} // Value for filtering
                                            onSelect={() => setSelectedUserId(user.id)}
                                            className="cursor-pointer aria-selected:bg-primary/5"
                                        >
                                            <div className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                selectedUserId === user.id ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                            )}>
                                                <Check className={cn("h-4 w-4")} />
                                            </div>

                                            <Avatar className="h-8 w-8 mr-3">
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>

                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.name}</span>
                                                <span className="text-xs text-muted-foreground">{user.email || 'No email'}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>

                <DialogFooter className="px-4 py-3 border-t bg-muted/5">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!selectedUserId || submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Manager
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
