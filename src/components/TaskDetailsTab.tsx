import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskTemplate, TaskManager, api } from '@/services/api';
import { FileText, Plus, Users, User, Trash2, Pencil, Settings, Globe, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { EditTaskSettingsDialog } from './EditTaskSettingsDialog';
import { EditTaskPublicationDialog } from './EditTaskPublicationDialog';
import { EditTaskConditionsDialog } from './EditTaskConditionsDialog';
import { AddTaskManagerDialog } from './AddTaskManagerDialog';
import { toast } from 'sonner';

interface TaskDetailsTabProps {
    task: TaskTemplate;
    onUpdate: (id: number, data: Partial<TaskTemplate>) => Promise<void>;
}

export const TaskDetailsTab = ({ task, onUpdate }: TaskDetailsTabProps) => {
    const [isEditSettingsOpen, setIsEditSettingsOpen] = useState(false);
    const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);
    const [managers, setManagers] = useState<TaskManager[]>([]);
    const [loadingManagers, setLoadingManagers] = useState(false);
    const [isEditPublicationOpen, setIsEditPublicationOpen] = useState(false);
    const [isEditConditionsOpen, setIsEditConditionsOpen] = useState(false);
    const [locations, setLocations] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        if (task.id) {
            fetchManagers();
        }
    }, [task.id]);

    useEffect(() => {
        const loadLocations = async () => {
            try {
                const data = await api.locations.getAll();
                setLocations(data);
            } catch (err) {
                console.error("Failed to load locations", err);
            }
        };
        loadLocations();
    }, []);

    // Helper to get location name
    const getLocationName = () => {
        if (task.location_name) return task.location_name;
        if (task.location_id) {
            const loc = locations.find(l => l.id === task.location_id);
            return loc ? loc.name : 'Unknown Location';
        }
        return '-';
    };

    const fetchManagers = async () => {
        setLoadingManagers(true);
        try {
            const data = await api.taskTemplates.getManagers(task.id);
            setManagers(data);
        } catch (error) {
            console.error("Failed to load task managers", error);
        } finally {
            setLoadingManagers(false);
        }
    };

    const handleAddManager = async (userId: number) => {
        try {
            const newManager = await api.taskTemplates.addManager(task.id, userId);
            setManagers(prev => [...prev, newManager]);
        } catch (error) {
            throw error;
        }
    };

    const handleRemoveManager = async (userId: number) => {
        if (!confirm('Are you sure you want to remove this manager?')) return;

        try {
            await api.taskTemplates.removeManager(task.id, userId);
            setManagers(prev => prev.filter(m => m.id !== userId));
            toast.success("Manager removed");
        } catch (error) {
            console.error("Failed to remove manager", error);
            toast.error("Failed to remove manager");
        }
    };

    // Helper to render a data row
    const DataRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
        <div className="grid grid-cols-[200px_1fr] py-2 border-b last:border-0 border-border/40">
            <div className="text-sm text-muted-foreground font-medium">{label}</div>
            <div className="text-sm text-foreground truncate block">{value || '-'}</div>
        </div>
    );

    const handleSave = async (id: number, data: Partial<TaskTemplate>) => {
        await onUpdate(id, data);
        setIsEditSettingsOpen(false);
        setIsEditConditionsOpen(false);
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
            {/* 1. Task Settings */}
            <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b bg-muted/5 shrink-0">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                        <Settings className="h-4 w-4" /> Task settings
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => setIsEditSettingsOpen(true)}
                    >
                        <Pencil className="h-3 w-3" /> Change
                    </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-8 pt-4 flex-1">
                    <div className="space-y-1">
                        <DataRow label="Name" value={task.name} />
                        <DataRow label="Description" value={task.description} />
                        <DataRow label="Location" value={getLocationName()} />
                        <DataRow label="Start date" value={task.start_date ? format(new Date(task.start_date), 'dd MMM yyyy') : '-'} />
                        <DataRow label="End date" value={task.end_date ? format(new Date(task.end_date), 'dd MMM yyyy') : '-'} />
                    </div>
                    <div className="space-y-1">
                        <DataRow label="Calendar color" value={
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-4 w-12 rounded border"
                                    style={{ backgroundColor: task.calendar_color || '#fbbf24' }}
                                ></div>
                            </div>
                        } />
                        <DataRow label="Points to earn" value={task.task_value?.toString() ?? '3'} />
                        <DataRow label="Default task duration" value={`${task.default_task_duration ?? 3} `} />
                        <DataRow label="Min volunteers" value={`${task.min_volunteers ?? 1} `} />
                        <DataRow label="Max volunteers" value={`${task.max_volunteers ?? 1} `} />
                    </div>
                </CardContent>
            </Card>

            <EditTaskSettingsDialog
                open={isEditSettingsOpen}
                onOpenChange={setIsEditSettingsOpen}
                task={task}
                onSave={handleSave}
            />

            {/* 2. Task Conditions */}
            <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b bg-muted/5 shrink-0">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                        <FileText className="h-4 w-4" /> Task conditions
                    </CardTitle>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setIsEditConditionsOpen(true)}>
                        <Pencil className="h-3 w-3" /> Change
                    </Button>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col flex-1">
                    <div className="grid grid-cols-2 gap-x-8 mb-4 flex-1">
                        <div className="space-y-1">
                            <DataRow label="Minimum age" value={`${task.minimum_age ?? 16} `} />
                            <DataRow label="Gender" value={task.gender === 'M' ? 'Male' : task.gender === 'F' ? 'Female' : 'Both'} />
                            <DataRow label="Target audience" value={task.target_audience ?? 'Both'} />
                        </div>
                        <div className="space-y-1">
                            <DataRow label="Diploma (association)" value={task.required_diploma_association} />
                            <DataRow label="Diploma (bond)" value={task.required_diploma_bond} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100 mt-auto shrink-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                        Only persons who meet the above task conditions will be assigned to this task.
                    </div>
                </CardContent>
            </Card>

            <EditTaskConditionsDialog
                open={isEditConditionsOpen}
                onOpenChange={setIsEditConditionsOpen}
                task={task}
                onSave={handleSave}
            />

            {/* 3. Task Managers */}
            <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b bg-muted/5 shrink-0">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                        <Users className="h-4 w-4" /> Task Managers
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs gap-1 ml-2 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => setIsAddManagerOpen(true)}
                    >
                        <Plus className="h-3 w-3" /> Add Manager
                    </Button>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                    <div className="grid grid-cols-[40px_1fr_1fr_100px_40px] gap-2 items-center p-2 text-xs font-medium text-muted-foreground border-b bg-muted/50">
                        <div></div>
                        <div>Name</div>
                        <div className="truncate">Email</div>
                        <div>Role</div>
                        <div className="text-center">Del</div>
                    </div>
                    {/* Fixed height container for managers list to prevent one card from being huge if many managers */}
                    <div className="overflow-y-auto max-h-[160px]">
                        {loadingManagers ? (
                            <div className="p-4 text-center text-xs text-muted-foreground">Loading...</div>
                        ) : managers.length === 0 ? (
                            <div className="p-4 text-center text-xs text-muted-foreground">
                                No task managers assigned.
                            </div>
                        ) : (
                            managers.map((manager) => (
                                <div key={manager.id} className="grid grid-cols-[40px_1fr_1fr_100px_40px] gap-2 items-center p-2 text-xs border-b last:border-0 hover:bg-muted/5 transition-colors">
                                    <div className="flex justify-center">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px]">
                                            <User className="h-3 w-3" />
                                        </div>
                                    </div>
                                    <div className="font-medium truncate">{manager.name}</div>
                                    <div className="text-muted-foreground truncate" title={manager.email}>{manager.email}</div>
                                    <div className="truncate">{manager.role || 'Manager'}</div>
                                    <div className="flex justify-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRemoveManager(manager.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <AddTaskManagerDialog
                open={isAddManagerOpen}
                onOpenChange={setIsAddManagerOpen}
                onAdd={handleAddManager}
                existingManagerIds={managers.map(m => m.id)}
            />

            {/* 4. Task Publication */}
            <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b bg-muted/5 shrink-0">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                        <Globe className="h-4 w-4" /> Task publication
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => setIsEditPublicationOpen(true)}
                    >
                        <Pencil className="h-3 w-3" /> Change
                    </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-8 pt-4 flex-1">
                    <div className="space-y-1">
                        <DataRow label="Publish on website/TV" value={task.publish_on_website ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-slate-300" />} />
                        <DataRow label="Publish in mobile app" value={task.publish_on_mobile ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-slate-300" />} />
                    </div>
                    <div className="space-y-1">
                        <DataRow label="Allow registration" value={task.allow_registration ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-slate-300" />} />
                        <DataRow label="Allow swapping" value={task.allow_swapping ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-slate-300" />} />
                    </div>
                </CardContent>
            </Card>

            <EditTaskPublicationDialog
                open={isEditPublicationOpen}
                onOpenChange={setIsEditPublicationOpen}
                task={task}
                onSaveSuccess={() => {
                    window.location.reload();
                }}
            />
        </div>
    );
};
