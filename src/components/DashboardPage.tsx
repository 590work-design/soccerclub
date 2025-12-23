import { useEffect, useState } from 'react';
import { Users, Calendar, Bell, UserCheck, UserX, CalendarCheck, CalendarX, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, Volunteer, Slot } from '@/services/api';

interface DashboardStats {
  totalVolunteers: number;
  bookedVolunteers: number;
  nonBookedVolunteers: number;
  activeVolunteers: number;
  inactiveVolunteers: number;
  totalSlots: number;
  confirmedSlots: number;
  pendingSlots: number;
  cancelledSlots: number;
  remindersConfigured: number;
}

interface DashboardPageProps {
  onNavigate?: (tab: string, filter?: { type: string; value: string }) => void;
}

export const DashboardPage = ({ onNavigate }: DashboardPageProps) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVolunteers: 0,
    bookedVolunteers: 0,
    nonBookedVolunteers: 0,
    activeVolunteers: 0,
    inactiveVolunteers: 0,
    totalSlots: 0,
    confirmedSlots: 0,
    pendingSlots: 0,
    cancelledSlots: 0,
    remindersConfigured: 3,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Load all volunteers (may fetch multiple pages under the hood)
      const volunteers = await api.volunteers.getAllAll();

      // Calculate volunteer stats from volunteer records only.
      // Slots API is currently disabled, so slot-level stats are left as 0.
      const bookedVolunteers = volunteers.filter(v => (v.booked_slots ?? 0) > 0).length;
      const activeVolunteers = volunteers.filter(v => v.status === 'active').length;

      const confirmedSlots = 0;
      const pendingSlots = 0;
      const cancelledSlots = 0;

      setStats({
        totalVolunteers: volunteers.length,
        bookedVolunteers,
        nonBookedVolunteers: volunteers.length - bookedVolunteers,
        activeVolunteers,
        inactiveVolunteers: volunteers.length - activeVolunteers,
        totalSlots: 0,
        confirmedSlots,
        pendingSlots,
        cancelledSlots,
        remindersConfigured: 3,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatClick = (tab: string, filterType?: string, filterValue?: string) => {
    if (onNavigate && filterType && filterValue) {
      onNavigate(tab, { type: filterType, value: filterValue });
    } else if (onNavigate) {
      onNavigate(tab);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description,
    color = 'primary',
    onClick
  }: { 
    title: string; 
    value: number; 
    icon: any;
    description?: string;
    color?: 'primary' | 'success' | 'warning' | 'destructive' | 'muted';
    onClick?: () => void;
  }) => {
    const colorClasses = {
      primary: 'bg-primary/10 text-primary',
      success: 'bg-green-500/10 text-green-600',
      warning: 'bg-yellow-500/10 text-yellow-600',
      destructive: 'bg-destructive/10 text-destructive',
      muted: 'bg-muted text-muted-foreground',
    };

    return (
      <Card 
        className={`transition-all hover:shadow-md ${onClick ? 'cursor-pointer hover:border-primary' : ''}`}
        onClick={onClick}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? '...' : value}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-full overflow-auto bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of all volunteer and slot activities</p>
        </div>

        {/* Volunteers Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Volunteers Overview
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Volunteers"
              value={stats.totalVolunteers}
              icon={Users}
              description="All registered volunteers"
              color="primary"
              onClick={() => handleStatClick('Volunteers', 'status', 'all')}
            />
            <StatCard
              title="Booked Volunteers"
              value={stats.bookedVolunteers}
              icon={UserCheck}
              description="Volunteers with booked slots"
              color="success"
              onClick={() => handleStatClick('Volunteers', 'booking', 'booked')}
            />
            <StatCard
              title="Non-Booked Volunteers"
              value={stats.nonBookedVolunteers}
              icon={UserX}
              description="Volunteers without bookings"
              color="warning"
              onClick={() => handleStatClick('Volunteers', 'booking', 'non-booked')}
            />
            <StatCard
              title="Active Volunteers"
              value={stats.activeVolunteers}
              icon={Users}
              description="Currently active"
              color="primary"
              onClick={() => handleStatClick('Volunteers', 'status', 'active')}
            />
          </div>
        </div>

        {/* Slots Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Slots Overview
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Slots"
              value={stats.totalSlots}
              icon={Calendar}
              description="All created slots"
              color="primary"
              onClick={() => handleStatClick('Slots', 'status', 'all')}
            />
            <StatCard
              title="Confirmed Slots"
              value={stats.confirmedSlots}
              icon={CalendarCheck}
              description="Scheduled and confirmed"
              color="success"
              onClick={() => handleStatClick('Slots', 'status', 'confirmed')}
            />
            <StatCard
              title="Pending Slots"
              value={stats.pendingSlots}
              icon={Clock}
              description="Awaiting confirmation"
              color="warning"
              onClick={() => handleStatClick('Slots', 'status', 'pending')}
            />
            <StatCard
              title="Cancelled Slots"
              value={stats.cancelledSlots}
              icon={CalendarX}
              description="Cancelled bookings"
              color="destructive"
              onClick={() => handleStatClick('Slots', 'status', 'cancelled')}
            />
          </div>
        </div>

        {/* Notifications Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications Overview
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Reminders Configured"
              value={stats.remindersConfigured}
              icon={Bell}
              description="Active reminder schedules"
              color="primary"
              onClick={() => handleStatClick('Settings')}
            />
            <StatCard
              title="Inactive Volunteers"
              value={stats.inactiveVolunteers}
              icon={UserX}
              description="May need engagement"
              color="muted"
              onClick={() => handleStatClick('Volunteers', 'status', 'inactive')}
            />
            <StatCard
              title="Pending Confirmations"
              value={stats.pendingSlots}
              icon={Clock}
              description="Slots awaiting response"
              color="warning"
              onClick={() => handleStatClick('Slots', 'status', 'pending')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
