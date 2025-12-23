# Volunteer Management Dashboard - Complete Project Guide

## Overview

This is a React.js-based Volunteer Management Dashboard that allows admins to manage volunteers, their booked slots, and send reminder notifications. The frontend is built with React, Tailwind CSS, and TypeScript, designed to connect with a Python FastAPI backend.

---

## Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components (buttons, inputs, dialogs, etc.)
│   ├── Header.tsx             # Navigation header with tabs and profile dropdown
│   ├── ProfilePanel.tsx       # User profile editing panel
│   ├── VolunteerList.tsx      # List of all volunteers with search
│   ├── VolunteerCard.tsx      # Individual volunteer card component
│   ├── VolunteerDetailPanel.tsx # Right-side panel showing volunteer details
│   ├── AllSlotsView.tsx       # Full view of all slots with filtering
│   ├── SlotDetailView.tsx     # Detailed view of a single slot
│   ├── SlotPanel.tsx          # Slot panel for volunteer
│   ├── SlotTable.tsx          # Table displaying slot information
│   ├── SettingsPage.tsx       # Admin settings for reminder notifications
│   ├── AddSlotModal.tsx       # Modal for adding new slots
│   ├── EditSlotModal.tsx      # Modal for editing slots
│   └── DeleteConfirmDialog.tsx # Confirmation dialog for deletions
├── pages/
│   ├── Index.tsx              # Main dashboard page
│   ├── Login.tsx              # Login page
│   └── NotFound.tsx           # 404 page
├── services/
│   ├── api.ts                 # API service with all endpoint definitions
│   └── mockData.ts            # Mock data for development
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions
└── utils/                     # Constants and helpers
```

---

## Pages & Features

### 1. Login Page (`/`)
- **File:** `src/pages/Login.tsx`
- **Purpose:** Entry point for authentication
- **Fields:** Name, Email, Password
- **Backend Connection Required:** YES

**Where to add your API:**
```typescript
// In src/pages/Login.tsx, find the form submission handler
// Replace the navigation logic with your authentication API call

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ADD YOUR LOGIN API HERE
  // Example:
  // const response = await fetch('YOUR_API_URL/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ name, email, password })
  // });
  // const data = await response.json();
  // Store token/session as needed
  
  navigate('/dashboard');
};
```

---

### 2. Dashboard Page (`/dashboard`)
- **File:** `src/pages/Index.tsx`
- **Purpose:** Main dashboard with tab navigation
- **Tabs:** Volunteers, Slots, Settings, Reports

---

### 3. Volunteers Tab
- **Files:** 
  - `src/components/VolunteerList.tsx` - List display
  - `src/components/VolunteerCard.tsx` - Individual cards
  - `src/components/VolunteerDetailPanel.tsx` - Detail panel (right side)

**Features:**
- Search volunteers by name
- Click volunteer to see details (Prefer Task & Schedule Task)
- Two-panel layout (list on left, details on right)

---

### 4. Slots Tab
- **Files:**
  - `src/components/AllSlotsView.tsx` - Main slots view
  - `src/components/SlotDetailView.tsx` - Individual slot details
  - `src/components/SlotTable.tsx` - Slots table

**Features:**
- View all slots (available and booked)
- Filter by status
- Search functionality
- Click slot for detailed view
- Message/reminder functionality

---

### 5. Settings Tab
- **File:** `src/components/SettingsPage.tsx`
- **Purpose:** Configure reminder notification times

**Features:**
- 3 reminder fields (days + hours before slot)
- Example: Reminder 1: 15 days, 5 hours before

**Where to add your API:**
```typescript
// In src/components/SettingsPage.tsx, find the handleSave function (around line 40-60)

const handleSave = async () => {
  const settings = {
    reminder1: reminders[0],
    reminder2: reminders[1],
    reminder3: reminders[2],
  };
  
  // ADD YOUR SETTINGS API HERE
  // Example:
  // const response = await fetch('YOUR_API_URL/settings/reminders', {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(settings)
  // });
  
  console.log('Settings to save:', settings);
  toast.success('Reminder settings saved successfully!');
};
```

---

## API Service Configuration

### Main API File: `src/services/api.ts`

This is the **PRIMARY FILE** where all your backend API connections should be configured.

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://your-api-url.com/api
VITE_USE_MOCK_DATA=false
```

### API Configuration (Lines 1-50 in api.ts)

```typescript
// Change this line to your API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Set to false to use real API
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
```

---

## Required Backend API Endpoints

Your FastAPI backend should implement these endpoints:

### Volunteers Endpoints

| Method | Endpoint | Description | File Location |
|--------|----------|-------------|---------------|
| GET | `/api/volunteers` | Get all volunteers | api.ts line ~70 |
| GET | `/api/volunteers/{id}` | Get volunteer by ID | api.ts line ~85 |
| PUT | `/api/volunteers/{id}` | Update volunteer | api.ts line ~100 |
| DELETE | `/api/volunteers/{id}` | Delete volunteer | api.ts line ~115 |

### Slots Endpoints

| Method | Endpoint | Description | File Location |
|--------|----------|-------------|---------------|
| GET | `/api/slots` | Get all slots | api.ts line ~130 |
| GET | `/api/volunteers/{id}/slots` | Get slots by volunteer | api.ts line ~145 |
| POST | `/api/slots` | Create new slot | api.ts line ~160 |
| PUT | `/api/slots/{id}` | Update slot | api.ts line ~175 |
| DELETE | `/api/slots/{id}` | Delete slot | api.ts line ~190 |
| POST | `/api/slots/{id}/remind/whatsapp` | Send WhatsApp reminder | api.ts line ~205 |
| POST | `/api/slots/{id}/remind/email` | Send email reminder | api.ts line ~215 |

### Settings Endpoints (You need to create)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/reminders` | Get reminder settings |
| PUT | `/api/settings/reminders` | Update reminder settings |

### Authentication Endpoints (You need to create)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update user profile |

---

## Data Structures

### Volunteer Interface
```typescript
interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  totalSlots: number;
  completedSlots: number;
}
```

### Slot Interface
```typescript
interface Slot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'available' | 'booked' | 'completed' | 'cancelled';
  volunteerId?: number;
  volunteerName?: string;
  volunteerPhone?: string;
  task: string;
  notes?: string;
}
```

### Reminder Settings Interface
```typescript
interface ReminderSettings {
  reminder1: { days: number; hours: number };
  reminder2: { days: number; hours: number };
  reminder3: { days: number; hours: number };
}
```

---

## Step-by-Step Backend Integration Guide

### Step 1: Configure Environment

1. Create `.env` file in project root
2. Add your API URL:
```env
VITE_API_BASE_URL=https://your-fastapi-backend.com/api
VITE_USE_MOCK_DATA=false
```

### Step 2: Update API Service

**File:** `src/services/api.ts`

1. Ensure `USE_MOCK_DATA` is set to `false`
2. Verify `API_BASE_URL` points to your backend

### Step 3: Implement Authentication

**File:** `src/pages/Login.tsx`

Add your login API call in the `handleSubmit` function.

**File:** `src/components/Header.tsx`

Add logout functionality:
```typescript
// In the Logout DropdownMenuItem onClick handler
const handleLogout = async () => {
  // Call your logout API
  // Clear session/token
  // Navigate to login page
};
```

### Step 4: Connect Profile Panel

**File:** `src/components/ProfilePanel.tsx`

Update `handleSave` function to call your profile update API.

### Step 5: Connect Settings

**File:** `src/components/SettingsPage.tsx`

1. Add `useEffect` to fetch existing settings on load
2. Update `handleSave` to call your settings API

### Step 6: Test All Endpoints

1. Volunteers CRUD operations
2. Slots CRUD operations
3. Reminder sending (WhatsApp/Email)
4. Settings save/load
5. Authentication flow

---

## FastAPI Backend Example

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Volunteer(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    status: str
    joinedDate: str
    totalSlots: int
    completedSlots: int

class Slot(BaseModel):
    id: int
    date: str
    startTime: str
    endTime: str
    location: str
    status: str
    volunteerId: Optional[int]
    volunteerName: Optional[str]
    task: str

class ReminderSettings(BaseModel):
    reminder1: dict
    reminder2: dict
    reminder3: dict

# Volunteers Endpoints
@app.get("/api/volunteers", response_model=List[Volunteer])
async def get_volunteers():
    # Your database query here
    pass

@app.get("/api/volunteers/{volunteer_id}", response_model=Volunteer)
async def get_volunteer(volunteer_id: int):
    # Your database query here
    pass

@app.put("/api/volunteers/{volunteer_id}", response_model=Volunteer)
async def update_volunteer(volunteer_id: int, volunteer: Volunteer):
    # Your database update here
    pass

@app.delete("/api/volunteers/{volunteer_id}")
async def delete_volunteer(volunteer_id: int):
    # Your database delete here
    pass

# Slots Endpoints
@app.get("/api/slots", response_model=List[Slot])
async def get_slots():
    # Your database query here
    pass

@app.post("/api/slots", response_model=Slot)
async def create_slot(slot: Slot):
    # Your database insert here
    pass

@app.put("/api/slots/{slot_id}", response_model=Slot)
async def update_slot(slot_id: int, slot: Slot):
    # Your database update here
    pass

@app.delete("/api/slots/{slot_id}")
async def delete_slot(slot_id: int):
    # Your database delete here
    pass

# Reminder Endpoints
@app.post("/api/slots/{slot_id}/remind/whatsapp")
async def send_whatsapp_reminder(slot_id: int):
    # Your WhatsApp integration here
    pass

@app.post("/api/slots/{slot_id}/remind/email")
async def send_email_reminder(slot_id: int):
    # Your email integration here
    pass

# Settings Endpoints
@app.get("/api/settings/reminders", response_model=ReminderSettings)
async def get_reminder_settings():
    # Your database query here
    pass

@app.put("/api/settings/reminders", response_model=ReminderSettings)
async def update_reminder_settings(settings: ReminderSettings):
    # Your database update here
    pass

# Authentication Endpoints
@app.post("/api/auth/login")
async def login(credentials: dict):
    # Your authentication logic here
    pass

@app.post("/api/auth/logout")
async def logout():
    # Your logout logic here
    pass
```

---

## Files That Need Your Backend Connection

| File | What to Add | Priority |
|------|-------------|----------|
| `.env` | API base URL | HIGH |
| `src/services/api.ts` | Verify API URL, set USE_MOCK_DATA=false | HIGH |
| `src/pages/Login.tsx` | Login API call | HIGH |
| `src/components/Header.tsx` | Logout API call | HIGH |
| `src/components/ProfilePanel.tsx` | Profile update API | MEDIUM |
| `src/components/SettingsPage.tsx` | Settings save/load API | MEDIUM |

---

## Running the Project

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Update `VITE_API_BASE_URL` with your backend URL
3. Set `VITE_USE_MOCK_DATA=false` for production

---

## Support

For any questions about this dashboard implementation, refer to:
- `API_CONFIGURATION.md` - Detailed API setup guide
- `DASHBOARD_DOCUMENTATION.md` - Component documentation
- `src/services/api.ts` - All API endpoint definitions
