# API Configuration Guide - Complete Backend Integration

## Quick Start: Connect Your Backend

### Step 1: Set Your API Base URL
**File:** `src/services/api.ts` (Line 3)

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

Create a `.env` file in the project root:
```env
VITE_API_URL=https://your-aws-api-endpoint.amazonaws.com
```

### Step 2: Disable Mock Data
**File:** `src/services/api.ts` (Line 4)

Change from:
```typescript
const USE_MOCK_DATA = true;
```
To:
```typescript
const USE_MOCK_DATA = false;
```

---

## Complete API Endpoints Reference

### 1. Authentication APIs (Add to `src/services/api.ts`)

Add these after line 221 (before the closing bracket):

```typescript
auth: {
  login: async (email: string, password: string): Promise<{ access_token: string; user: any }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },
  
  logout: async (): Promise<void> => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Logout failed');
    localStorage.removeItem('access_token');
  },
  
  refreshToken: async (): Promise<{ access_token: string }> => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
  },
  
  getCurrentUser: async (): Promise<any> => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
  },
},
```

### 2. Reminder APIs (Add to `src/services/api.ts`)

Add after auth section:

```typescript
reminders: {
  getSettings: async (): Promise<ReminderSettings> => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/reminders/settings`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
  },
  
  updateSettings: async (settings: ReminderSettings): Promise<ReminderSettings> => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/reminders/settings`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
    return handleResponse(response);
  },
  
  sendManualReminder: async (slotId: number, type: 'email' | 'whatsapp'): Promise<{ message: string }> => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/reminders/send`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ slot_id: slotId, type }),
    });
    return handleResponse(response);
  },
},
```

### 3. Add JWT Token to All Existing Requests

Modify the helper function at line 42:

```typescript
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    // Token expired - redirect to login
    localStorage.removeItem('access_token');
    window.location.href = '/';
    throw new Error('Session expired. Please login again.');
  }
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
```

Then update all fetch calls to use `getAuthHeaders()`:
```typescript
const response = await fetch(`${API_BASE_URL}/api/volunteers`, {
  headers: getAuthHeaders(),
});
```

---

## File-by-File Integration Guide

### File: `src/pages/Login.tsx`
**Purpose:** Handle user authentication
**What to modify:**

```typescript
// Line ~35: Replace the mock login with real API call
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await api.auth.login(formData.email, formData.password);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    navigate('/dashboard');
  } catch (error) {
    toast({
      title: "Login Failed",
      description: "Invalid email or password",
      variant: "destructive",
    });
  }
};
```

### File: `src/components/Header.tsx`
**Purpose:** Handle logout
**What to modify:**

```typescript
// Find the Logout DropdownMenuItem and add onClick handler:
<DropdownMenuItem 
  className="text-destructive"
  onClick={async () => {
    await api.auth.logout();
    navigate('/');
  }}
>
  <LogOut className="mr-2 h-4 w-4" />
  Logout
</DropdownMenuItem>
```

### File: `src/components/SettingsPage.tsx`
**Purpose:** Save reminder settings to backend
**What to modify:**

```typescript
// Replace the handleSave function with:
const handleSave = async () => {
  try {
    await api.reminders.updateSettings({
      reminder1: { days: reminders.reminder1.days, hours: reminders.reminder1.hours },
      reminder2: { days: reminders.reminder2.days, hours: reminders.reminder2.hours },
      reminder3: { days: reminders.reminder3.days, hours: reminders.reminder3.hours },
    });
    toast({
      title: "Settings Saved",
      description: "Reminder settings updated successfully",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to save settings",
      variant: "destructive",
    });
  }
};

// Add useEffect to load settings on mount:
useEffect(() => {
  const loadSettings = async () => {
    const settings = await api.reminders.getSettings();
    setReminders(settings);
  };
  loadSettings();
}, []);
```

---

## Required FastAPI Backend Endpoints

Your FastAPI backend must implement these endpoints:

### Authentication Endpoints
```
POST   /api/auth/login          - Login with email/password, returns JWT token
POST   /api/auth/logout         - Invalidate current token
POST   /api/auth/refresh        - Refresh JWT token
GET    /api/auth/me             - Get current user info
```

### Volunteer Endpoints
```
GET    /api/volunteers          - Get all volunteers
GET    /api/volunteers/{id}     - Get specific volunteer
PUT    /api/volunteers/{id}     - Update volunteer
DELETE /api/volunteers/{id}     - Delete volunteer
```

### Slot Endpoints
```
GET    /api/volunteers/{id}/slots  - Get slots for a volunteer
POST   /api/slots                  - Create new slot
PUT    /api/slots/{id}             - Update slot
DELETE /api/slots/{id}             - Delete slot
POST   /api/slots/{id}/send-whatsapp - Send WhatsApp reminder
POST   /api/slots/{id}/send-email    - Send email reminder
```

### Reminder Settings Endpoints
```
GET    /api/reminders/settings   - Get reminder settings
PUT    /api/reminders/settings   - Update reminder settings
POST   /api/reminders/send       - Send manual reminder
```

---

## Data Structures (TypeScript ↔ Python)

### Volunteer
```typescript
// Frontend (TypeScript)
interface Volunteer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  group: number;
  points: number;
  booked_slots: number;
  status: 'active' | 'inactive';
}
```

```python
# Backend (Python/FastAPI)
class Volunteer(BaseModel):
    id: int
    name: str
    phone: str
    email: str
    address: str
    group: int
    points: int
    booked_slots: int
    status: str  # 'active' or 'inactive'
```

### Slot
```typescript
// Frontend (TypeScript)
interface Slot {
  id: number;
  volunteer_id: number;
  date: string;
  time: string;
  description: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}
```

```python
# Backend (Python/FastAPI)
class Slot(BaseModel):
    id: int
    volunteer_id: int
    date: str
    time: str
    description: str
    status: str  # 'confirmed', 'pending', 'cancelled'
```

### Reminder Settings
```typescript
// Frontend (TypeScript)
interface ReminderSettings {
  reminder1: { days: number; hours: number };
  reminder2: { days: number; hours: number };
  reminder3: { days: number; hours: number };
}
```

```python
# Backend (Python/FastAPI)
class ReminderTime(BaseModel):
    days: int
    hours: int

class ReminderSettings(BaseModel):
    reminder1: ReminderTime
    reminder2: ReminderTime
    reminder3: ReminderTime
```

### Auth Response
```typescript
// Frontend (TypeScript)
interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}
```

```python
# Backend (Python/FastAPI)
class LoginResponse(BaseModel):
    access_token: str
    user: UserInfo

class UserInfo(BaseModel):
    id: int
    name: str
    email: str
    role: str
```

---

## FastAPI Backend Example

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta

app = FastAPI()
security = HTTPBearer()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth Endpoints
@app.post("/api/auth/login")
async def login(email: str, password: str):
    # Your database authentication logic
    user = authenticate_user(email, password)  # Implement this
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"user_id": user.id, "email": user.email})
    return {"access_token": token, "user": user}

@app.get("/api/auth/me")
async def get_current_user(payload: dict = Depends(verify_token)):
    # Return current user from token
    return get_user_by_id(payload["user_id"])  # Implement this

# Volunteer Endpoints
@app.get("/api/volunteers")
async def get_volunteers(payload: dict = Depends(verify_token)):
    # Your database query
    return db.query(Volunteer).all()

@app.get("/api/volunteers/{id}")
async def get_volunteer(id: int, payload: dict = Depends(verify_token)):
    volunteer = db.query(Volunteer).filter(Volunteer.id == id).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    return volunteer

# Slot Endpoints
@app.get("/api/volunteers/{volunteer_id}/slots")
async def get_volunteer_slots(volunteer_id: int, payload: dict = Depends(verify_token)):
    return db.query(Slot).filter(Slot.volunteer_id == volunteer_id).all()

@app.post("/api/slots")
async def create_slot(slot: SlotCreate, payload: dict = Depends(verify_token)):
    new_slot = Slot(**slot.dict())
    db.add(new_slot)
    db.commit()
    return new_slot

# Reminder Settings Endpoints
@app.get("/api/reminders/settings")
async def get_reminder_settings(payload: dict = Depends(verify_token)):
    return db.query(ReminderSettings).first()

@app.put("/api/reminders/settings")
async def update_reminder_settings(settings: ReminderSettingsUpdate, payload: dict = Depends(verify_token)):
    db_settings = db.query(ReminderSettings).first()
    for key, value in settings.dict().items():
        setattr(db_settings, key, value)
    db.commit()
    return db_settings
```

---

## Checklist: Before Going Live

1. [ ] Set `VITE_API_URL` in `.env` file
2. [ ] Change `USE_MOCK_DATA` to `false` in `src/services/api.ts`
3. [ ] Implement all required endpoints in your FastAPI backend
4. [ ] Enable CORS on your FastAPI server
5. [ ] Set up JWT secret key securely
6. [ ] Test login → dashboard flow
7. [ ] Test all CRUD operations for volunteers and slots
8. [ ] Test reminder settings save/load
9. [ ] Test WhatsApp and Email reminder sending

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Add your frontend URL to FastAPI `allow_origins` |
| 401 Unauthorized | Check JWT token is being sent in headers |
| Network errors | Verify API_BASE_URL is correct |
| Data not loading | Check `USE_MOCK_DATA` is `false` |
| Token expired | Implement token refresh logic |
