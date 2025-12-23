# Volunteer Management Dashboard

A production-ready React.js dashboard for managing volunteers and their scheduled slots, connected to a FastAPI backend.

## Features

- **Volunteer Management**: View, search, and manage volunteer profiles
- **Slot Scheduling**: Create, edit, and delete volunteer time slots
- **Real-time Updates**: Refresh data and track slot status (Confirmed/Pending/Cancelled)
- **Communication Tools**: Send WhatsApp and email reminders directly from the dashboard
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Professional UI**: Clean, modern design with smooth transitions and loading states

## Technology Stack

- **Frontend**: React.js 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **UI Components**: Shadcn UI
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Fetch API
- **Backend**: FastAPI (separate repository)

## Prerequisites

- Node.js 18+ and npm
- FastAPI backend running (see backend documentation)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your API base URL:
```
VITE_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:8080`

## API Integration

The dashboard connects to your FastAPI backend using these endpoints:

### Volunteer Endpoints
- `GET /api/volunteers` - Get all volunteers
- `GET /api/volunteers/{id}` - Get volunteer details
- `PUT /api/volunteers/{id}` - Update volunteer
- `DELETE /api/volunteers/{id}` - Delete volunteer

### Slot Endpoints
- `GET /api/volunteers/{id}/slots` - Get volunteer's slots
- `POST /api/slots` - Create new slot
- `PUT /api/slots/{id}` - Update slot
- `DELETE /api/slots/{id}` - Delete slot
- `POST /api/slots/{id}/send-whatsapp` - Send WhatsApp reminder
- `POST /api/slots/{id}/send-email` - Send email reminder

## Project Structure

```
src/
├── components/
│   ├── Header.tsx              # Top navigation header
│   ├── VolunteerList.tsx       # Left panel - volunteer list
│   ├── VolunteerCard.tsx       # Individual volunteer card
│   ├── SlotPanel.tsx           # Right panel - slot management
│   ├── SlotTable.tsx           # Slot data table
│   ├── AddSlotModal.tsx        # Create slot modal
│   ├── EditSlotModal.tsx       # Edit slot modal
│   └── DeleteConfirmDialog.tsx # Delete confirmation
├── services/
│   └── api.ts                  # API service layer
├── utils/
│   └── constants.ts            # App constants
├── pages/
│   └── Index.tsx               # Main dashboard page
└── index.css                   # Global styles & design system
```

## Usage

1. **View Volunteers**: The left panel displays all volunteers with search functionality
2. **Select Volunteer**: Click on a volunteer to expand details and view their slots
3. **Manage Slots**: 
   - Click "Add New Slot" to create a new time slot
   - Use action buttons to edit, delete, or send reminders
   - Filter slots by All/Upcoming/Past tabs
4. **Communication**: Send WhatsApp or email reminders with one click

## Design System

The dashboard uses a professional blue/gray color scheme:
- Primary: Blue (#2563eb)
- Background: Light gray (#f8fafc)
- Success: Green (for confirmed slots)
- Warning: Yellow (for pending slots)
- Destructive: Red (for cancelled slots)

## Error Handling

- API errors display user-friendly toast notifications
- Loading states with skeleton loaders
- Retry mechanisms for failed requests
- Network error handling

## Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

Built with ❤️ using React and Tailwind CSS
