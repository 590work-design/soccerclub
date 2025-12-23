import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { VolunteerList } from '@/components/VolunteerList';
import { VolunteerDetailPanel } from '@/components/VolunteerDetailPanel';
import { AllSlotsView } from '@/components/AllSlotsView';
import { SlotDetailView } from '@/components/SlotDetailView';
import { SettingsPage } from '@/components/SettingsPage';
import { DashboardPage } from '@/components/DashboardPage';
import { api, Volunteer } from '@/services/api';
import { toast } from 'sonner';

const Index = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [allVolunteers, setAllVolunteers] = useState<Volunteer[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(30); // show 30 volunteers per page
  const [loadingPage, setLoadingPage] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // track in-flight state (not used for full-load flow)
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [volunteerFilter, setVolunteerFilter] = useState<{ type: string; value: string } | undefined>();
  const [slotFilter, setSlotFilter] = useState<{ type: string; value: string } | undefined>();

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const all = await api.volunteers.getAllAll();
        setAllVolunteers(all);
        setVolunteers(all.slice(0, pageSize));
        setCurrentPage(0);
        setHasMore(all.length > pageSize);
      } catch (err) {
        console.error('Failed to load all volunteers', err);
        toast.error('Failed to load volunteers. Please check your API connection.');
      } finally {
        setLoading(false);
      }
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSlotClick = (slot: any) => {
    setSelectedSlot(slot);
  };

  const handleBackFromSlotDetail = () => {
    setSelectedSlot(null);
  };

  const handleDashboardNavigate = (tab: string, filter?: { type: string; value: string }) => {
    if (tab === 'Volunteers') {
      setVolunteerFilter(filter);
      setSlotFilter(undefined);
    } else if (tab === 'Slots') {
      setSlotFilter(filter);
      setVolunteerFilter(undefined);
    } else {
      setVolunteerFilter(undefined);
      setSlotFilter(undefined);
    }
    setActiveTab(tab);
  };

  const handleTabChange = (tab: string) => {
    // Clear filters when manually changing tabs
    setVolunteerFilter(undefined);
    setSlotFilter(undefined);
    setActiveTab(tab);
  };

  const selectedVolunteer = volunteers.find(v => v.id === selectedVolunteerId) || null;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="flex flex-1 overflow-hidden pt-16">
        {activeTab === 'Dashboard' ? (
          <div className="w-full h-full">
            <DashboardPage onNavigate={handleDashboardNavigate} />
          </div>
        ) : activeTab === 'Volunteers' ? (
          <>
            {/* Left side: Volunteer list */}
            <div className={`h-full overflow-hidden ${selectedVolunteer ? 'w-2/5' : 'w-full'}`}>
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
              <div className="w-3/5 h-full">
                <VolunteerDetailPanel
                  volunteer={selectedVolunteer}
                  onClose={handleClosePanel}
                />
              </div>
            )}
          </>
        ) : activeTab === 'Slots' ? (
          <div className="w-full h-full">
            {selectedSlot ? (
              <SlotDetailView 
                slot={selectedSlot} 
                onBack={handleBackFromSlotDetail}
              />
            ) : (
              <AllSlotsView 
                onSlotClick={handleSlotClick} 
                initialFilter={slotFilter}
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
      </div>
    </div>
  );
};

export default Index;
