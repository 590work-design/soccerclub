import { Volunteer } from '@/services/api';

interface VolunteerCardProps {
  volunteer: Volunteer;
  isSelected: boolean;
  onClick: () => void;
}

export const VolunteerCard = ({ volunteer, isSelected, onClick }: VolunteerCardProps) => {
  return (
    <div
      className={`cursor-pointer rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:shadow-md ${
        isSelected ? 'border-primary bg-primary/5 shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
            {volunteer.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground truncate">{volunteer.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{volunteer.phone}</p>
          </div>
        </div>
        <span className="text-sm font-medium text-muted-foreground shrink-0">
          {volunteer.points || 0} pts
        </span>
      </div>
    </div>
  );
};
