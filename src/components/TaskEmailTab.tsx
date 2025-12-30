import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Link, Mail } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom'; // Assuming we can get param if needed, or pass prop

// Currently TaskEmailTab is rendered inside TaskDetailView without ID prop.
// We need to pass the ID to it.
// Let's assume TaskDetailView passes it or we get it from context/url.
// TaskDetailView has `task` object. It passed `taskId` to TaskAssignedTab.
// It should pass `taskId` to TaskEmailTab as well.

interface TaskEmailTabProps {
    taskId?: number;
}

export const TaskEmailTab = ({ taskId }: TaskEmailTabProps) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        sender: 'no-reply@sportlinkservices.nl',
        subject: '',
        content: '',
    });

    useEffect(() => {
        if (taskId) {
            loadTemplate();
        }
    }, [taskId]);

    const loadTemplate = async () => {
        setLoading(true);
        try {
            // Mock or Real API depending on env
            // Ensure api method exists (we just added it)
            if (api.taskTemplates.getEmailTemplate) {
                const data = await api.taskTemplates.getEmailTemplate(taskId!);
                if (data) {
                    setFormData({
                        sender: data.sender || 'no-reply@sportlinkservices.nl',
                        subject: data.subject || '',
                        content: data.body_html || '',
                    });
                }
            }
        } catch (error) {
            console.error("Failed to load email template", error);
            // Don't toast on 404 if it just means "not created yet"
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!taskId) return;
        setSaving(true);
        try {
            await api.taskTemplates.updateEmailTemplate(taskId, {
                sender: formData.sender,
                subject: formData.subject,
                body_html: formData.content
            });
            toast.success("Email template saved");
        } catch (error) {
            console.error("Failed to save email template", error);
            toast.error("Failed to save email template");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!taskId) return <div>No task selected</div>;
    if (loading) return <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;

    return (
        <div className="space-y-4 max-w-5xl mx-auto h-full flex flex-col">
            <div className='flex items-center justify-between border-b pb-4'>
                <div className="flex items-center gap-2 font-semibold text-lg text-primary">
                    <Mail className="h-5 w-5" /> Email template for assignments
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => loadTemplate()} disabled={saving}>Revert</Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </div>
            </div>

            <Card className="flex-1 flex flex-col">
                <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                    {/* Header Inputs */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground uppercase font-bold">Sender</Label>
                            <Input
                                value={formData.sender}
                                onChange={(e) => handleChange('sender', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground uppercase font-bold">Subject</Label>
                            <Input
                                value={formData.subject}
                                onChange={(e) => handleChange('subject', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Editor Toolbar (Mock but visual) */}
                    <div className="flex flex-wrap items-center gap-1 border rounded-md p-1 bg-muted/20">
                        <Select defaultValue="normal">
                            <SelectTrigger className="w-[100px] h-8 text-xs border-0"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="normal">Normal</SelectItem></SelectContent>
                        </Select>
                        <Select defaultValue="arial">
                            <SelectTrigger className="w-[100px] h-8 text-xs border-0"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="arial">Arial</SelectItem></SelectContent>
                        </Select>
                        <div className="w-[1px] h-6 bg-border mx-1"></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Bold className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Italic className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Underline className="h-4 w-4" /></Button>
                        <div className="w-[1px] h-6 bg-border mx-1"></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><AlignLeft className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><AlignCenter className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><AlignRight className="h-4 w-4" /></Button>
                        <div className="w-[1px] h-6 bg-border mx-1"></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><List className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Link className="h-4 w-4" /></Button>
                    </div>

                    {/* Content Area - Simple Textarea for now but styled to look like editor content */}
                    <div className="flex-1 border rounded-md p-0 bg-background overflow-hidden flex flex-col">
                        <textarea
                            className="w-full h-full p-4 resize-none focus:outline-none text-sm leading-relaxed"
                            value={formData.content}
                            onChange={(e) => handleChange('content', e.target.value)}
                            placeholder="Enter email content here..."
                            style={{ minHeight: '300px' }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
