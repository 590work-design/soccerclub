# Volunteer Management Dashboard - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Pages & Components](#pages--components)
4. [API Integration Guide](#api-integration-guide)
5. [Data Structures](#data-structures)
6. [FastAPI Backend Setup](#fastapi-backend-setup)
7. [Step-by-Step Integration](#step-by-step-integration)

---

## Project Overview

A React.js volunteer management dashboard that connects to a Python FastAPI backend. The application manages volunteers, their slot bookings, and notification reminders.

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: React Query, React useState/useEffect
- **Routing**: React Router DOM
- **Backend**: Python FastAPI (to be connected)

---

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── Header.tsx             # Navigation header with tabs
│   ├── DashboardPage.tsx      # Main dashboard with statistics
│   ├── VolunteerList.tsx      # Volunteer list with filters
│   ├── VolunteerCard.tsx      # Individual volunteer card
│   ├── VolunteerDetailPanel.tsx # Volunteer detail view
│   ├── SlotPanel.tsx          # Slots for selected volunteer
│   ├── SlotTable.tsx          # Slot data table
│   ├── SlotDetailView.tsx     # Individual slot details
│   ├── AllSlotsView.tsx       # All slots with filters
│   ├── AddSlotModal.tsx       # Create new slot
│   ├── EditSlotModal.tsx      # Edit existing slot
│   ├── DeleteConfirmDialog.tsx # Delete confirmation
│   ├── SettingsPage.tsx       # Notification settings
│   └── ProfilePanel.tsx       # User profile
├── pages/
│   ├── Login.tsx              # Login page
│   ├── Index.tsx              # Main dashboard layout
│   └── NotFound.tsx           # 404 page
├── services/
│   ├── api.ts                 # API service configuration
│   └── mockData.ts            # Mock data for development
├── hooks/
│   └── use-mobile.tsx         # Mobile detection hook
└── lib/
    └── utils.ts               # Utility functions
```

---

## Pages & Components

### 1. Login Page (`/`)
**File**: `src/pages/Login.tsx`

**Fields**:
- Email
- Password

**API Integration Point**:
```typescript
// Replace the setTimeout with actual API call
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const response = await api.auth.login({
      email: formData.email,
      password: formData.password
    });
    
    // Store JWT token
    sessionStorage.setItem('token', response.token);
    sessionStorage.setItem('user', JSON.stringify(response.user));
    
    toast.success('Welcome back!');
    navigate('/dashboard');
  } catch (error) {
    toast.error('Invalid credentials');
  } finally {
    setIsLoading(false);
  }
};
```

---

### 2. Dashboard Page (`/dashboard`)
**File**: `src/components/DashboardPage.tsx`

**Features**:
- Total volunteers count
- Booked vs Non-booked volunteers
- Total slots count
- Slot status breakdown (Confirmed, Pending, Cancelled)
- Clickable cards that navigate to filtered views

**Data Required**:
- All volunteers list
- All slots list

---

### 3. Volunteers Tab
**Files**: 
- `src/components/VolunteerList.tsx` - List with search and filters
- `src/components/VolunteerCard.tsx` - Individual card
- `src/components/VolunteerDetailPanel.tsx` - Detail view

**Filters**:
- Search by name/email
- Status filter (Active, Inactive, All)
- Booking filter (Booked, Non-booked, All)

---

### 4. Slots Tab
**Files**:
- `src/components/AllSlotsView.tsx` - All slots with filters
- `src/components/SlotTable.tsx` - Table display
- `src/components/SlotDetailView.tsx` - Detail view
- `src/components/AddSlotModal.tsx` - Create slot
- `src/components/EditSlotModal.tsx` - Edit slot

**Filters**:
- Search by volunteer name/location
- Status filter (Confirmed, Pending, Cancelled, All)

---

### 5. Settings Tab
**File**: `src/components/SettingsPage.tsx`

**Features**:
- Reminder notifications (WhatsApp/Email toggle)
- Reminder timing configuration
- Non-booked volunteer notifications

---

## API Integration Guide

### Main API File: `src/services/api.ts`

This is the **PRIMARY FILE** where all API endpoints are configured.

### Step 1: Configure Base URL

```typescript
// src/services/api.ts - Line 1-5

// Set your FastAPI backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Set to false to use real API instead of mock data
const USE_MOCK_DATA = false;
```

### Step 2: Create Environment File

Create `.env` file in project root:
```env
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK_DATA=false
```

### Step 3: Add Authentication Endpoints

Add to `src/services/api.ts`:

```typescript
// Authentication API
auth: {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },
  
  logout: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    return handleResponse(response);
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
},
```

### Step 4: Add JWT Token to Requests

Add this helper function to `src/services/api.ts`:

```typescript
// Helper to get auth headers with JWT token
const getAuthHeaders = (): HeadersInit => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};
```

### Step 5: Add Reminder/Notification Endpoints

```typescript
// Reminders/Notifications API
reminders: {
  getSettings: async (): Promise<ReminderSettings> => {
    const response = await fetch(`${API_BASE_URL}/api/reminders/settings`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  updateSettings: async (settings: ReminderSettings): Promise<ReminderSettings> => {
    const response = await fetch(`${API_BASE_URL}/api/reminders/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    return handleResponse(response);
  },
  
  sendToNonBooked: async (message: string): Promise<{ sent: number }> => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/non-booked`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message })
    });
    return handleResponse(response);
  }
},
```

---

## Complete API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/login` | User login | `{ email, password }` | `{ token, user }` |
| POST | `/api/auth/logout` | User logout | - | `{ message }` |
| GET | `/api/auth/me` | Get current user | - | `User` |

### Volunteer Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/volunteers` | Get all volunteers | - | `Volunteer[]` |
| GET | `/api/volunteers/:id` | Get volunteer by ID | - | `Volunteer` |
| PUT | `/api/volunteers/:id` | Update volunteer | `Partial<Volunteer>` | `Volunteer` |
| DELETE | `/api/volunteers/:id` | Delete volunteer | - | `{ message }` |

### Slot Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/volunteers/:id/slots` | Get slots for volunteer | - | `Slot[]` |
| GET | `/api/slots` | Get all slots | - | `Slot[]` |
| POST | `/api/slots` | Create new slot | `CreateSlotData` | `Slot` |
| PUT | `/api/slots/:id` | Update slot | `UpdateSlotData` | `Slot` |
| DELETE | `/api/slots/:id` | Delete slot | - | `{ message }` |
| POST | `/api/slots/:id/whatsapp` | Send WhatsApp reminder | - | `{ message }` |
| POST | `/api/slots/:id/email` | Send Email reminder | - | `{ message }` |

### Reminder/Notification Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/reminders/settings` | Get reminder settings | - | `ReminderSettings` |
| PUT | `/api/reminders/settings` | Update reminder settings | `ReminderSettings` | `ReminderSettings` |
| POST | `/api/notifications/non-booked` | Send to non-booked | `{ message }` | `{ sent: number }` |

---

## Data Structures

### TypeScript Interfaces (Frontend)

```typescript
// Volunteer
interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  joinedDate: string;
  totalSlots: number;
  avatar?: string;
}

// Slot
interface Slot {
  id: number;
  date: string;
  time: string;
  location: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  volunteerId: number;
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone: string;
  notes?: string;
}

// Create Slot
interface CreateSlotData {
  volunteerId: number;
  date: string;
  time: string;
  location: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  notes?: string;
}

// Update Slot
interface UpdateSlotData {
  date?: string;
  time?: string;
  location?: string;
  status?: 'Confirmed' | 'Pending' | 'Cancelled';
  notes?: string;
}

// Reminder Settings
interface ReminderSettings {
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  reminderTime: string; // e.g., "24h", "1h", "30m"
}

// Auth Response
interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name?: string;
  };
}
```

### Python Models (Backend)

```python
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class Volunteer(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    status: Literal['Active', 'Inactive']
    joined_date: str
    total_slots: int
    avatar: Optional[str] = None

class Slot(BaseModel):
    id: int
    date: str
    time: str
    location: str
    status: Literal['Confirmed', 'Pending', 'Cancelled']
    volunteer_id: int
    volunteer_name: str
    volunteer_email: str
    volunteer_phone: str
    notes: Optional[str] = None

class CreateSlotData(BaseModel):
    volunteer_id: int
    date: str
    time: str
    location: str
    status: Literal['Confirmed', 'Pending', 'Cancelled']
    notes: Optional[str] = None

class UpdateSlotData(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    status: Optional[Literal['Confirmed', 'Pending', 'Cancelled']] = None
    notes: Optional[str] = None

class ReminderSettings(BaseModel):
    whatsapp_enabled: bool
    email_enabled: bool
    reminder_time: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    user: dict
```

---

## FastAPI Backend Setup

### Basic FastAPI Server Example

```python
# main.py
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta
from typing import List, Optional

app = FastAPI(title="Volunteer Management API")

# CORS Configuration - Allow your frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Vite dev server
        "http://localhost:3000",      # Alternative port
        "https://your-production-url.com"  # Production URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

# Helper Functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ AUTHENTICATION ENDPOINTS ============

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    # TODO: Validate against your database
    # Example validation:
    # user = db.get_user_by_email(request.email)
    # if not user or not verify_password(request.password, user.password_hash):
    #     raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": request.email})
    return {
        "token": token,
        "user": {
            "id": 1,
            "email": request.email
        }
    }

@app.post("/api/auth/logout")
async def logout(payload: dict = Depends(verify_token)):
    # Optionally invalidate token in database/cache
    return {"message": "Logged out successfully"}

@app.get("/api/auth/me")
async def get_current_user(payload: dict = Depends(verify_token)):
    return {
        "id": 1,
        "email": payload["sub"]
    }

# ============ VOLUNTEER ENDPOINTS ============

@app.get("/api/volunteers", response_model=List[Volunteer])
async def get_volunteers(payload: dict = Depends(verify_token)):
    # TODO: Fetch from database
    return []

@app.get("/api/volunteers/{volunteer_id}", response_model=Volunteer)
async def get_volunteer(volunteer_id: int, payload: dict = Depends(verify_token)):
    # TODO: Fetch from database
    pass

@app.put("/api/volunteers/{volunteer_id}", response_model=Volunteer)
async def update_volunteer(volunteer_id: int, data: dict, payload: dict = Depends(verify_token)):
    # TODO: Update in database
    pass

@app.delete("/api/volunteers/{volunteer_id}")
async def delete_volunteer(volunteer_id: int, payload: dict = Depends(verify_token)):
    # TODO: Delete from database
    return {"message": "Volunteer deleted"}

# ============ SLOT ENDPOINTS ============

@app.get("/api/slots", response_model=List[Slot])
async def get_all_slots(payload: dict = Depends(verify_token)):
    # TODO: Fetch all slots from database
    return []

@app.get("/api/volunteers/{volunteer_id}/slots", response_model=List[Slot])
async def get_volunteer_slots(volunteer_id: int, payload: dict = Depends(verify_token)):
    # TODO: Fetch slots for volunteer from database
    return []

@app.post("/api/slots", response_model=Slot)
async def create_slot(data: CreateSlotData, payload: dict = Depends(verify_token)):
    # TODO: Create in database
    pass

@app.put("/api/slots/{slot_id}", response_model=Slot)
async def update_slot(slot_id: int, data: UpdateSlotData, payload: dict = Depends(verify_token)):
    # TODO: Update in database
    pass

@app.delete("/api/slots/{slot_id}")
async def delete_slot(slot_id: int, payload: dict = Depends(verify_token)):
    # TODO: Delete from database
    return {"message": "Slot deleted"}

@app.post("/api/slots/{slot_id}/whatsapp")
async def send_whatsapp_reminder(slot_id: int, payload: dict = Depends(verify_token)):
    # TODO: Integrate WhatsApp API
    return {"message": "WhatsApp reminder sent"}

@app.post("/api/slots/{slot_id}/email")
async def send_email_reminder(slot_id: int, payload: dict = Depends(verify_token)):
    # TODO: Integrate Email service
    return {"message": "Email reminder sent"}

# ============ REMINDER/NOTIFICATION ENDPOINTS ============

@app.get("/api/reminders/settings", response_model=ReminderSettings)
async def get_reminder_settings(payload: dict = Depends(verify_token)):
    # TODO: Fetch from database
    return {
        "whatsapp_enabled": True,
        "email_enabled": True,
        "reminder_time": "24h"
    }

@app.put("/api/reminders/settings", response_model=ReminderSettings)
async def update_reminder_settings(settings: ReminderSettings, payload: dict = Depends(verify_token)):
    # TODO: Update in database
    return settings

@app.post("/api/notifications/non-booked")
async def send_to_non_booked(data: dict, payload: dict = Depends(verify_token)):
    # TODO: Get non-booked volunteers and send notifications
    return {"sent": 5}  # Number of notifications sent

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## Step-by-Step Integration

### 1. Setup Environment
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env
```

### 2. Update api.ts
- Set `USE_MOCK_DATA = false`
- Add authentication endpoints
- Add `getAuthHeaders()` helper
- Add reminder endpoints

### 3. Update Login.tsx
Replace mock login with actual API call:
```typescript
// In handleSubmit function
try {
  const response = await api.auth.login({
    email: formData.email,
    password: formData.password
  });
  sessionStorage.setItem('token', response.token);
  sessionStorage.setItem('user', JSON.stringify(response.user));
  navigate('/dashboard');
} catch (error) {
  toast.error('Invalid credentials');
}
```

### 4. Update Header.tsx (Logout)
```typescript
// In handleLogout function
const handleLogout = async () => {
  try {
    await api.auth.logout();
  } catch (error) {
    console.error('Logout error:', error);
  }
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  navigate('/');
};
```

### 5. Update SettingsPage.tsx
```typescript
// Load settings on mount
useEffect(() => {
  const loadSettings = async () => {
    const settings = await api.reminders.getSettings();
    setWhatsappEnabled(settings.whatsappEnabled);
    setEmailEnabled(settings.emailEnabled);
    setReminderTime(settings.reminderTime);
  };
  loadSettings();
}, []);

// Save settings
const handleSave = async () => {
  await api.reminders.updateSettings({
    whatsappEnabled,
    emailEnabled,
    reminderTime
  });
  toast.success('Settings saved');
};
```

---

## Files That Need Backend Connection

### Priority 1 (Critical)
| File | What to Update |
|------|----------------|
| `src/services/api.ts` | Add auth endpoints, set API_BASE_URL, disable mock data |
| `src/pages/Login.tsx` | Replace setTimeout with api.auth.login() |

### Priority 2 (Core Features)
| File | What to Update |
|------|----------------|
| `src/components/Header.tsx` | Add api.auth.logout() to logout handler |
| `src/components/VolunteerList.tsx` | Uses api.volunteers.getAll() - already configured |
| `src/components/AllSlotsView.tsx` | Uses api.slots - already configured |

### Priority 3 (Settings)
| File | What to Update |
|------|----------------|
| `src/components/SettingsPage.tsx` | Add api.reminders calls for settings |

---

## Running the Project

### Development Mode
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Start FastAPI Backend
```bash
# Install Python dependencies
pip install fastapi uvicorn python-jose[cryptography] pydantic

# Run the server
python main.py
# Or
uvicorn main:app --reload --port 8000
```

---

## Troubleshooting

### CORS Errors
Ensure your FastAPI backend includes the correct CORS origins.

### 401 Unauthorized
Check that the JWT token is being sent in the Authorization header.

### Network Errors
Verify the API_BASE_URL matches your FastAPI server address.

### Mock Data Still Showing
Ensure `USE_MOCK_DATA = false` in api.ts.
