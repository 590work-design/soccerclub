import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Save, Send, UserX, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface ReminderSetting {
  days: number;
  hours: number;
}

export const SettingsPage = () => {
  const [reminders, setReminders] = useState<ReminderSetting[]>([
    { days: 15, hours: 5 },
    { days: 10, hours: 2 },
    { days: 2, hours: 1 },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  const handleReminderChange = (index: number, field: 'days' | 'hours', value: string) => {
    const numValue = parseInt(value) || 0;
    setReminders(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: Math.max(0, numValue) };
      return updated;
    });
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // This will call your backend API to save reminder settings
      // await api.settings.updateReminders(reminders);
      console.log('Saving reminder settings:', reminders);
      toast.success('Reminder settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendNotification = async () => {
    setIsSendingNotification(true);
    try {
      // This will call your backend API to send notifications to non-booked volunteers
      // await api.notifications.sendToNonBooked();
      console.log('Sending notification to non-booked volunteers');
      toast.success('Notification sent to volunteers without bookings');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsSendingNotification(false);
    }
  };

  return (
    <div className="h-full overflow-auto bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Blue Header Strip */}
        <div className="bg-primary text-primary-foreground p-4 rounded-md flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            <h2 className="text-xl font-bold">Settings</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm opacity-90">
              <span>Manage application configuration</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Side - Reminder Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Reminder Notifications</CardTitle>
              </div>
              <CardDescription>
                Configure when to send reminder notifications to volunteers before their booked slots.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {reminders.map((reminder, index) => (
                <div key={index} className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {index + 1}
                    </span>
                    <Label className="text-sm font-medium">
                      Reminder {index + 1}
                    </Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`days-${index}`} className="text-xs text-muted-foreground">
                        Days Before
                      </Label>
                      <Input
                        id={`days-${index}`}
                        type="number"
                        min="0"
                        value={reminder.days}
                        onChange={(e) => handleReminderChange(index, 'days', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`hours-${index}`} className="text-xs text-muted-foreground">
                        Hours Before
                      </Label>
                      <Input
                        id={`hours-${index}`}
                        type="number"
                        min="0"
                        max="23"
                        value={reminder.hours}
                        onChange={(e) => handleReminderChange(index, 'hours', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Reminder will be sent {reminder.days} day{reminder.days !== 1 ? 's' : ''} and {reminder.hours} hour{reminder.hours !== 1 ? 's' : ''} before the slot
                  </p>
                </div>
              ))}

              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Reminder Settings'}
              </Button>
            </CardContent>
          </Card>

          {/* Right Side - Non-Booked Volunteer Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-primary" />
                <CardTitle>Non-Booked Volunteer Notifications</CardTitle>
              </div>
              <CardDescription>
                Send notification to volunteers who have not booked any slots yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border bg-muted/30 p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Send className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Send Booking Reminder</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      This will send a notification to all volunteers who haven't booked any slots, encouraging them to make a booking.
                    </p>
                  </div>
                  <Button
                    onClick={handleSendNotification}
                    disabled={isSendingNotification}
                    className="w-full"
                    variant="default"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSendingNotification ? 'Sending...' : 'Send Notification'}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Note</h4>
                <p className="text-xs text-muted-foreground">
                  Notifications will be sent via the configured notification channels (WhatsApp, Email) to all volunteers with zero booked slots.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
