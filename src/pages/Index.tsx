import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { VolunteerList } from '@/components/VolunteerList';
import { VolunteerDetailPanel } from '@/components/VolunteerDetailPanel';
import { ManageTasks } from '@/components/ManageTasks';
import { TaskDetailView } from '@/components/TaskDetailView';
import { SettingsPage } from '@/components/SettingsPage';
import { DashboardPage } from '@/components/DashboardPage';
import { api, Volunteer, Slot, TaskTemplate } from '@/services/api';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [allVolunteers, setAllVolunteers] = useState<Volunteer[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(30); // show 30 volunteers per page
  const [loadingPage, setLoadingPage] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskViewMode, setTaskViewMode] = useState('Rooster'); // Lifted state for task sub-views
  const [loading, setLoading] = useState(true);
  const [volunteerFilter, setVolunteerFilter] = useState<{ type: string; value: string } | undefined>();
  const [slotFilter, setSlotFilter] = useState<{ type: string; value: string } | undefined>();
  // Use intersection type correctly for enriched slots
  const [allSlots, setAllSlots] = useState<(Slot & { volunteer?: Volunteer })[]>([]);

  useEffect(() => {
    // ADDED: Check for authentication token
    const token = sessionStorage.getItem('token');
    if (!token) {
      // If no token, redirect to login page
      navigate('/');
      return;
    }

    const loadAll = async () => {
      setLoading(true);
      try {
        // Load volunteers first - critical
        const volunteersData = await api.volunteers.getAllAll();

        setAllVolunteers(volunteersData);
        setVolunteers(volunteersData.slice(0, pageSize));

        setAllSlots([]); // Set to empty array since we disabled fetching

        setCurrentPage(0);
        setHasMore(volunteersData.length > pageSize);
      } catch (err) {
        console.error('Failed to load all volunteers', err);
        toast.error('Failed to load volunteers. Please check your API connection.');
      } finally {
        setLoading(false);
      }
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Client-side paginate over the already-loaded `allVolunteers` array
  const fetchVolunteersPage = async (pageIndex: number) => {
    if (loadingPage) return;
    setLoadingPage(true);
    try {
      const start = pageIndex * pageSize;
      const page = allVolunteers.slice(start, start + pageSize);
      setVolunteers(page);
      setCurrentPage(pageIndex);
      setHasMore(allVolunteers.length > (pageIndex + 1) * pageSize);
    } catch (err) {
      console.error('Error paginating volunteers', err);
    } finally {
      setLoadingPage(false);
    }
  };

  const handleNextPage = async () => {
    if (!hasMore || loadingPage) return;
    await fetchVolunteersPage(currentPage + 1);
  };

  const handlePrevPage = async () => {
    if (currentPage <= 0 || loadingPage) return;
    await fetchVolunteersPage(currentPage - 1);
  };

  const handleSelectVolunteer = (volunteerId: number) => {
    if (selectedVolunteerId === volunteerId) {
      setSelectedVolunteerId(null);
    } else {
      setSelectedVolunteerId(volunteerId);
      setActiveTab('Volunteers');
    }
  };

  const handleClosePanel = () => {
    setSelectedVolunteerId(null);
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setTaskViewMode('Rooster'); // Reset to default view when opening a task
  };

  const handleBackFromTaskDetail = () => {
    setSelectedTask(null);
  };

  const handleDashboardNavigate = (tab: string, filter?: { type: string; value: string }) => {
    if (tab === 'Volunteers') {
      setVolunteerFilter(filter);
      setSlotFilter(undefined);
    } else if (tab === 'Manage Tasks') {
      setSlotFilter(filter);
      setVolunteerFilter(undefined);
    } else {
      setVolunteerFilter(undefined);
      setSlotFilter(undefined);
    }
    setActiveTab(tab);
  };

  const handleTabChange = (tab: string) => {
    // Always clear selected task when changing main tabs (including clicking 'Manage Tasks' itself again)
    // This allows clicking the "Manage Tasks" sidebar item to act as a "Back to List" button
    setSelectedTask(null);

    // Clear filters when manually changing tabs
    setVolunteerFilter(undefined);
    setSlotFilter(undefined);
    setActiveTab(tab);
  };

  const handleTaskUpdate = async (id: number, data: Partial<TaskTemplate>) => {
    try {
      const updatedTask = await api.taskTemplates.update(id, data);

      // Update local state if the task is selected
      if (selectedTask && selectedTask.id === id) {
        setSelectedTask(updatedTask);
      }

      // Optionally refresh list if we had one (not currently stored in Index for tasks)
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Failed to update task", error);
      toast.error("Failed to update task");
      throw error; // Re-throw so the dialog knows to stay open or handle error
    }
  };

  const selectedVolunteer = volunteers.find(v => v.id === selectedVolunteerId) || null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        // New props for task sub-navigation
        selectedTask={selectedTask}
        taskViewMode={taskViewMode}
        onTaskViewChange={setTaskViewMode}
      />

      {/* Main Content Area - Shifted right by sidebar width (w-64) */}
      <main className="flex-1 ml-64 h-full overflow-hidden">
        {activeTab === 'Dashboard' ? (
          <div className="w-full h-full">
            <DashboardPage onNavigate={handleDashboardNavigate} />
          </div>
        ) : activeTab === 'Volunteers' ? (
          <div className="flex h-full w-full">
            {/* Left side: Volunteer list */}
            <div className={`h-full overflow-hidden transition-all duration-300 ${selectedVolunteer ? 'w-2/5' : 'w-full'}`}>
              <VolunteerList
                volunteers={volunteers}
                loading={loading}
                selectedVolunteerId={selectedVolunteerId}
                onSelectVolunteer={handleSelectVolunteer}
                initialFilter={volunteerFilter}
                onLoadMore={undefined}
                hasMore={hasMore}
                loadingMore={loadingPage}
                onNextPage={handleNextPage}
                onPrevPage={handlePrevPage}
                currentPage={currentPage}
                totalVolunteers={allVolunteers.length}
              />
            </div>
            {/* Right side: Volunteer detail panel */}
            {selectedVolunteer && (
              <div className="w-3/5 h-full border-l border-border bg-card">
                <VolunteerDetailPanel
                  volunteer={selectedVolunteer}
                  onClose={handleClosePanel}
                />
              </div>
            )}
          </div>
        ) : activeTab === 'Manage Tasks' ? (
          <div className="w-full h-full">
            {selectedTask ? (
              <TaskDetailView
                task={selectedTask}
                onBack={handleBackFromTaskDetail}
                onTaskUpdate={handleTaskUpdate}
                // Pass view mode props
                activeTab={taskViewMode}
                onTabChange={setTaskViewMode}
              />
            ) : (
              <ManageTasks
                slots={allSlots}
                onAddClick={() => toast.info('Add task not implemented yet')}
                onDeleteClick={(id) => toast.info(`Delete task ${id} not implemented yet`)}
                onSlotClick={handleTaskClick}
              />
            )}
          </div>
        ) : activeTab === 'Settings' ? (
          <div className="w-full h-full">
            <SettingsPage />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-background">
            <p className="text-muted-foreground">
              {activeTab} view coming soon...
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
