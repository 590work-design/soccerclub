# Volunteer Dashboard - Complete Documentation

## Overview
This is a Volunteer Management Dashboard built with React.js, designed to connect to a Python FastAPI backend hosted on AWS.

---

## Pages

### 1. Login Page (`/`)
**File:** `src/pages/Login.tsx`

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| Name | Text Input | User's display name |
| Email | Email Input | User's email address |
| Password | Password Input | User's password (with show/hide toggle) |

**Components Used:**
- `Card`, `CardHeader`, `CardContent` - Container styling
- `Input` - Form input fields
- `Label` - Field labels
- `Button` - Submit button

**Functionality:**
- Form validation (required fields, email format)
- Password visibility toggle
- Redirects to `/dashboard` on successful login
- Stores user info in sessionStorage

---

### 2. Dashboard Page (`/dashboard`)
**File:** `src/pages/Index.tsx`

**Layout:** Two-panel design
- **Left Panel (40%):** Volunteer list
- **Right Panel (60%):** Context-based view (volunteer details or slot views)

**State Variables:**
| Variable | Type | Description |
|----------|------|-------------|
| `activeTab` | string | Current navigation tab ('Volunteers', 'Slots', 'Settings', 'Reports') |
| `volunteers` | Volunteer[] | List of all volunteers |
| `selectedVolunteerId` | number \| null | Currently selected volunteer ID |
| `selectedSlot` | any | Currently selected slot for detail view |
| `loading` | boolean | Loading state for API calls |

---

## Components

### Header Component
**File:** `src/components/Header.tsx`

**Elements:**
- Logo/Brand name
- Navigation tabs: Volunteers, Slots, Settings, Reports
- Profile dropdown menu with:
  - My Profile (opens ProfilePanel)
  - Settings
  - Logout

---

### Profile Panel Component
**File:** `src/components/ProfilePanel.tsx`

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| Name | Text Input | Editable user name |
| Username | Text Input | Editable username |
| Password | Password Input | Editable password (with show/hide) |

**Buttons:**
- Save Changes
- Cancel

---

### Volunteer List Component
**File:** `src/components/VolunteerList.tsx`

**Features:**
- Search input for filtering volunteers
- List of volunteer cards
- Click to select/toggle volunteer details
- Loading skeleton state

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `volunteers` | Volunteer[] | Array of volunteer data |
| `loading` | boolean | Shows skeleton when true |
| `selectedVolunteerId` | number \| null | Currently selected volunteer |
| `onSelectVolunteer` | function | Callback when volunteer clicked |

---

### Volunteer Card Component
**File:** `src/components/VolunteerCard.tsx`

**Displays:**
- Volunteer avatar/initials
- Name
- Email
- Phone number
- Status badge (Active/Inactive)

---

### Slot Panel Component
**File:** `src/components/SlotPanel.tsx`

**Shows when volunteer is selected:**
- Volunteer information header
- List of assigned slots in a table format

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `selectedVolunteer` | Volunteer \| null | Selected volunteer data |
| `onClose` | function | Callback to close panel |

---

### Slot Table Component
**File:** `src/components/SlotTable.tsx`

**Columns:**
| Column | Description |
|--------|-------------|
| Date | Slot date |
| Time | Start and end time |
| Location | Slot location |
| Status | Available/Booked badge |

---

### All Slots View Component
**File:** `src/components/AllSlotsView.tsx`

**Features:**
- Date filter tabs (Today, This Week, This Month, All)
- Search functionality
- Full slot listing table with Message button
- Click row to view slot details

**Table Columns:**
| Column | Description |
|--------|-------------|
| Date | Slot date |
| Time | Time range |
| Volunteer | Assigned volunteer name |
| Location | Slot location |
| Status | Status badge |
| Actions | Message button |

---

### Slot Detail View Component
**File:** `src/components/SlotDetailView.tsx`

**Displays:**
- Back button
- Slot title with date
- Message button (top right)
- Detailed slot information card:
  - Date & Time
  - Location
  - Assigned Volunteer
  - Status
  - Notes

---

## API Service
**File:** `src/services/api.ts`

**Endpoints Structure:**

### Volunteers API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/volunteers` | Get all volunteers |
| GET | `/volunteers/:id` | Get single volunteer |
| PUT | `/volunteers/:id` | Update volunteer |
| DELETE | `/volunteers/:id` | Delete volunteer |

### Slots API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/slots` | Get all slots |
| GET | `/slots/:id` | Get single slot |
| POST | `/slots` | Create new slot |
| PUT | `/slots/:id` | Update slot |
| DELETE | `/slots/:id` | Delete slot |
| POST | `/slots/:id/remind` | Send reminder (WhatsApp/Email) |

---

## Environment Configuration
**File:** `.env` (create from `.env.example`)

```env
VITE_API_BASE_URL=https://your-api-gateway.amazonaws.com/api
VITE_USE_MOCK_DATA=false
```

---

## Data Types

### Volunteer Interface
```typescript
interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  avatar?: string;
  joinedDate: string;
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
  status: 'available' | 'booked';
  volunteerId?: number;
  volunteerName?: string;
  notes?: string;
}
```

---

## Navigation Flow

```
Login (/)
    │
    └── Dashboard (/dashboard)
            │
            ├── Volunteers Tab
            │   ├── Volunteer List (Left Panel)
            │   └── Volunteer Details + Slots (Right Panel)
            │
            ├── Slots Tab
            │   ├── All Slots View
            │   └── Slot Detail View
            │
            ├── Settings Tab (Coming Soon)
            │
            └── Reports Tab (Coming Soon)
```

---

## UI Components (shadcn/ui)
- Button
- Card
- Input
- Label
- Table
- Badge
- Dialog
- Dropdown Menu
- Tabs
- Tooltip
- Toast/Sonner

---

## Styling
- **Framework:** Tailwind CSS
- **Theme:** Blue/Gray professional theme
- **Design Tokens:** Defined in `src/index.css`
- **Responsive:** Mobile-first with breakpoints at md (768px) and lg (1024px)

---

## FastAPI Backend Integration
See `API_CONFIGURATION.md` for detailed backend setup instructions.
