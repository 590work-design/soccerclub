import { mockVolunteers, mockSlots } from './mockData';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const PREDEFINED_LOCATIONS = [
  { id: 1, name: "Sports park Molenzicht" },
  { id: 2, name: "Clubhouse" },
  { id: 3, name: "Main Field" }
];

// Disable slots API calls while backend slot endpoints are not ready.
export const ENABLE_SLOTS_API = false; // Disabled by user request

/*
  Volunteer shape used by the UI. Backend returns many fields (see Swagger).
  We map backend objects to this frontend-friendly shape while keeping the
  original object on `_raw` for debugging or additional UI work.
*/
interface Volunteer {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  group_number?: number;
  notes?: string;
  sportlink_member_id?: string;
  total_points?: number;
  total_sanctions?: number;
  booked_slots?: number;
  is_active?: boolean;
  scheduled_task?: string;
  preferred_task?: string | string[];
  created_at?: string;
  updated_at?: string;
  status: 'active' | 'inactive';
  _raw?: any;
  [k: string]: any;
}

interface Slot {
  id: number;
  volunteer_id: number;
  date: string;
  time: string;
  description: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  task_template_id?: number; // Added for linking
}

interface CreateSlotData {
  volunteer_id: number;
  date: string;
  time: string;
  description: string;
  status: string;
}

interface UpdateSlotData {
  date?: string;
  time?: string;
  description?: string;
  status?: string;
}

// ADDED: TaskTemplate interface based on Swagger
interface TaskTemplate {
  id: number;
  name: string;
  description: string;
  location_id?: number;
  location_name?: string; // Enhanced by frontend lookup or backend join
  minimum_age?: number;
  gender?: string;
  target_audience?: string;
  default_task_duration?: number;
  task_value?: number;
  calendar_color?: string;
  created_by?: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  required_diploma_association?: string;
  required_diploma_bond?: string;
  min_volunteers?: number;
  max_volunteers?: number;
  today?: boolean;
  status?: string;
  publish_on_website?: boolean;
  publish_on_mobile?: boolean;
  allow_registration?: boolean;
  allow_swapping?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface TaskManager {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface CreateTaskTemplateData {
  name: string;
  description: string;
  location_id?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

/* ADDED: improved handleResponse to surface JSON "detail" errors and handle empty bodies */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    try {
      const json = text ? JSON.parse(text) : {};
      throw new Error(json.detail || JSON.stringify(json) || `HTTP error! status: ${response.status} `);
    } catch {
      throw new Error(text || `HTTP error! status: ${response.status} `);
    }
  }
  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
};

/* ADDED: helper to get Authorization header from token stored in sessionStorage */
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token');
  if (!token) console.warn('[AutoDebug] No token in sessionStorage!');
  else console.log('[AutoDebug] Using token:', token.substring(0, 10) + '...');
  return token ? { Authorization: `Bearer ${token} ` } : {};
};

/* ADDED: Maps backend volunteer object (Swagger example shape) to frontend Volunteer */
const mapBackendVolunteerToFrontend = (b: any): Volunteer => {
  const id = b.id ?? 0;

  const first = b.first_name ?? '';
  const last = b.last_name ?? '';
  const nameFromParts = (first || last) ? `${first} ${last} `.trim() : undefined;
  const name = nameFromParts ?? b.name ?? b.full_name ?? `#${id} `;

  const isActive = typeof b.is_active !== 'undefined'
    ? Boolean(b.is_active)
    : (b.status ? b.status === 'active' : true);

  const points = typeof b.total_points !== 'undefined'
    ? Number(b.total_points)
    : (typeof b.points !== 'undefined' ? Number(b.points) : 0);

  const booked = typeof b.booked_slots !== 'undefined' ? Number(b.booked_slots)
    : (typeof b.bookings !== 'undefined' ? Number(b.bookings) : 0);

  return {
    id,
    name,
    first_name: b.first_name,
    last_name: b.last_name,
    email: b.email,
    phone: b.phone,
    address: b.address,
    group_number: b.group_number ?? b.group ?? undefined,
    notes: b.notes,
    sportlink_member_id: b.sportlink_member_id,
    total_points: points,
    total_sanctions: typeof b.total_sanctions !== 'undefined' ? Number(b.total_sanctions) : undefined,
    booked_slots: booked,
    is_active: isActive,
    scheduled_task: b.scheduled_task,
    preferred_task: b.preferred_task,
    created_at: b.created_at,
    updated_at: b.updated_at,
    status: isActive ? 'active' : 'inactive',
    _raw: b,
  };
};

export const api = {
  auth: {
    login: async (data: {
      username: string;
      password: string;
      grant_type?: string;
      scope?: string;
      client_id?: string;
      client_secret?: string;
    }): Promise<{ access_token: string; token_type: string;[k: string]: any }> => {
      const useMock = import.meta.env.VITE_USE_MOCK === 'true';

      if (useMock) {
        console.log('[Mock] Logging in with strict mock data');
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (data.username === 'fail') {
          throw new Error('Invalid credentials');
        }

        return {
          access_token: 'mock-jwt-token-12345',
          token_type: 'bearer',
          user: {
            id: 1,
            name: 'Mock User',
            email: data.username,
            role: 'admin'
          }
        };
      }

      const form = new URLSearchParams();
      form.append('grant_type', data.grant_type ?? 'password');
      form.append('username', data.username);
      form.append('password', data.password);
      if (data.scope) form.append('scope', data.scope);
      if (data.client_id) form.append('client_id', data.client_id);
      if (data.client_secret) form.append('client_secret', data.client_secret);

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });

      return (await handleResponse(response)) as { access_token: string; token_type: string };
    },
  },

  volunteers: {
    _cache: {
      getAll: new Map<string, Volunteer[]>(),
      getById: new Map<number, Volunteer | null>(),
    },
    _pending: {
      getAll: new Map<string, Promise<Volunteer[]>>(),
      getById: new Map<number, Promise<Volunteer>>(),
    },

    getAll: async (skip = 0, limit = 100): Promise<Volunteer[]> => {
      const useMock = import.meta.env.VITE_USE_MOCK === 'true';
      if (useMock) {
        console.log('[Mock] Fetching all volunteers');
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockVolunteers.slice(skip, skip + limit);
      }

      const key = `${skip}:${limit} `;

      if (api.volunteers._cache.getAll.has(key)) {
        return api.volunteers._cache.getAll.get(key)!;
      }

      if (api.volunteers._pending.getAll.has(key)) {
        return api.volunteers._pending.getAll.get(key)!;
      }

      const p = (async () => {
        const params = new URLSearchParams();
        params.append('skip', String(skip));
        params.append('limit', String(limit));

        const url = `${API_BASE_URL}/api/v1/volunteers?${params.toString()}`;
        console.log('[DEBUG] Fetching volunteers from:', url);

        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        });

        const data = await handleResponse(response);
        if (!Array.isArray(data)) {
          if (data == null) return [];
          throw new Error('Unexpected volunteers response shape');
        }

        const mapped = data.map(mapBackendVolunteerToFrontend);
        api.volunteers._cache.getAll.set(key, mapped);
        return mapped;
      })();

      api.volunteers._pending.getAll.set(key, p);
      try {
        const res = await p;
        return res;
      } finally {
        api.volunteers._pending.getAll.delete(key);
      }
    },

    getAllAll: async (): Promise<Volunteer[]> => {
      const tryLarge = await api.volunteers.getAll(0, 10000);
      if (tryLarge.length < 10000) return tryLarge;

      const pageSize = 500;
      let all = [...tryLarge];
      let skip = tryLarge.length;
      while (true) {
        const page = await api.volunteers.getAll(skip, pageSize);
        all.push(...page);
        if (page.length < pageSize) break;
        skip += page.length;
      }
      return all;
    },

    getById: async (id: number): Promise<Volunteer> => {
      const useMock = import.meta.env.VITE_USE_MOCK === 'true';
      if (useMock) {
        console.log('[Mock] Fetching volunteer', id);
        const v = mockVolunteers.find(mv => mv.id === id);
        if (!v) throw new Error('Volunteer not found');
        return v;
      }

      if (api.volunteers._cache.getById.has(id)) {
        const cached = api.volunteers._cache.getById.get(id);
        if (cached) return cached;
      }

      if (api.volunteers._pending.getById.has(id)) {
        return api.volunteers._pending.getById.get(id)!;
      }

      const p = (async () => {
        const response = await fetch(`${API_BASE_URL}/api/v1/volunteers/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        });

        const data = await handleResponse(response);
        const mapped = mapBackendVolunteerToFrontend(data);
        api.volunteers._cache.getById.set(id, mapped);
        return mapped;
      })();

      api.volunteers._pending.getById.set(id, p);
      try {
        return await p;
      } finally {
        api.volunteers._pending.getById.delete(id);
      }
    },

    update: async (id: number, data: Partial<Volunteer>): Promise<Volunteer> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/volunteers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const respData = await handleResponse(response);
      return mapBackendVolunteerToFrontend(respData);
    },

    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/volunteers/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete volunteer: ${response.status} `);
      }
    },
  },

  taskTemplates: {
    getAll: async (skip = 0, limit = 100): Promise<TaskTemplate[]> => {
      const useMock = import.meta.env.VITE_USE_MOCK === 'true';
      if (useMock) {
        console.log('[Mock] Fetching task templates');
        // Return dummy task templates if strict mock data is needed, or empty array
        return [
          {
            id: 1,
            name: 'Bar Service Test',
            description: 'Mock bar service',
            task_value: 10,
            min_volunteers: 2,
            max_volunteers: 4
          }
        ];
      }

      const params = new URLSearchParams();
      params.append('skip', String(skip));
      params.append('limit', String(limit));

      const response = await fetch(`${API_BASE_URL}/api/v1/task-templates?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await handleResponse(response);
      if (!Array.isArray(data)) {
        if (data && Array.isArray((data as any).results)) return (data as any).results as TaskTemplate[];
        if (data == null) return [];
        throw new Error('Unexpected task-templates response shape');
      }
      return data as TaskTemplate[];
    },

    getById: async (id: number): Promise<TaskTemplate> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/task-templates/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      return (await handleResponse(response)) as TaskTemplate;
    },

    create: async (data: CreateTaskTemplateData): Promise<TaskTemplate> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/task-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      return (await handleResponse(response)) as TaskTemplate;
    },

    update: async (id: number, data: Partial<TaskTemplate>): Promise<TaskTemplate> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/task-templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      return (await handleResponse(response)) as TaskTemplate;
    },

    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/task-templates/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to delete task template: ${response.status}`);
      }
    },

    getPublication: async (id: number): Promise<{
      publish_on_website: boolean;
      publish_on_mobile: boolean;
      allow_registration: boolean;
      allow_swapping: boolean;
    }> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/task-templates/${id}/publication`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      return await handleResponse(response);
    },

    updatePublication: async (id: number, data: {
      publish_on_website: boolean;
      publish_on_mobile: boolean;
      allow_registration: boolean;
      allow_swapping: boolean;
    }): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/task-templates/${id}/publication`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to update publication settings: ${response.status}`);
      }
    },

    getEmailTemplate: async (id: number): Promise<{ sender: string; subject: string; body_html: string; task_template_id?: number; has_unchanged_email_bodies?: boolean }> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/task-templates/${id}/email-template`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      return await handleResponse(response);
    },

    updateEmailTemplate: async (id: number, data: { sender: string; subject: string; body_html: string }): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/task-templates/${id}/email-template`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to update email template: ${response.status}`);
      }
    },

    getManagers: async (id: number): Promise<TaskManager[]> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/task-templates/${id}/managers`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      return (await handleResponse(response)) as TaskManager[];
    },

    addManager: async (id: number, userId: number): Promise<TaskManager> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/task-templates/${id}/managers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ user_id: userId }),
      });
      return (await handleResponse(response)) as TaskManager;
    },

    removeManager: async (id: number, userId: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/task-templates/${id}/managers/${userId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to remove manager: ${response.status}`);
      }
    },
  },

  slots: {
    getByVolunteerId: async (volunteerId: number): Promise<Slot[]> => {
      const useMock = import.meta.env.VITE_USE_MOCK === 'true';
      if (useMock) {
        return mockSlots[volunteerId] || [];
      }

      if (!ENABLE_SLOTS_API) {
        console.debug('[api.slots.getByVolunteerId] slots API disabled; returning empty list');
        return [];
      }

      // Try several common endpoints to fetch slots for a volunteer.
      const endpoints = [
        `${API_BASE_URL}/api/slots?volunteer_id=${volunteerId}`,
        `${API_BASE_URL}/api/v1/slots?volunteer_id=${volunteerId}`,
        `${API_BASE_URL}/api/volunteers/${volunteerId}/slots`,
        `${API_BASE_URL}/api/v1/volunteers/${volunteerId}/slots`,
        `${API_BASE_URL}/api/slots/volunteer/${volunteerId}`,
      ];

      let lastError: any = null;
      for (const url of endpoints) {
        try {
          console.debug('[api.slots.getByVolunteerId] trying', url);
          const resp = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
          });

          if (!resp.ok) {
            const text = await resp.text();
            console.debug('[api.slots.getByVolunteerId] non-ok', url, resp.status, text);
            lastError = new Error(text || `HTTP ${resp.status}`);
            continue;
          }

          const data = await (async () => {
            const text = await resp.text();
            return text ? JSON.parse(text) : undefined;
          })();

          if (!Array.isArray(data)) {
            if (data && Array.isArray((data as any).results)) return (data as any).results as Slot[];
            console.debug('[api.slots.getByVolunteerId] unexpected body shape', url, data);
            lastError = new Error(JSON.stringify(data));
            continue;
          }

          return data as Slot[];
        } catch (err: any) {
          console.debug('[api.slots.getByVolunteerId] fetch error', url, err?.message ?? err);
          lastError = err;
          continue;
        }
      }

      throw lastError || new Error('Failed to load slots for volunteer');
    },

    getAll: async (): Promise<Slot[]> => {
      const useMock = import.meta.env.VITE_USE_MOCK === 'true';
      if (useMock) {
        // Flatten mockSlots
        return Object.values(mockSlots).flat();
      }

      if (!ENABLE_SLOTS_API) {
        console.debug('[api.slots.getAll] slots API disabled; returning empty list');
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/slots`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      });

      const data = await handleResponse(response);
      if (!Array.isArray(data)) {
        if (data && Array.isArray((data as any).results)) return (data as any).results as Slot[];
        throw new Error('Unexpected slots response shape');
      }
      return data as Slot[];
    },

    create: async (data: CreateSlotData): Promise<Slot> => {
      const response = await fetch(`${API_BASE_URL}/api/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });

      return (await handleResponse(response)) as Slot;
    },

    update: async (id: number, data: UpdateSlotData): Promise<Slot> => {
      const response = await fetch(`${API_BASE_URL}/api/slots/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return (await handleResponse(response)) as Slot;
    },

    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/api/slots/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      if (!response.ok) throw new Error(`Failed to delete slot: ${response.status}`);
    },

    sendWhatsApp: async (id: number): Promise<{ message: string }> => {
      const response = await fetch(`${API_BASE_URL}/api/slots/${id}/send-whatsapp`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
      });
      return (await handleResponse(response)) as { message: string };
    },

    sendEmail: async (id: number): Promise<{ message: string }> => {
      const response = await fetch(`${API_BASE_URL}/api/slots/${id}/send-email`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
      });
      return (await handleResponse(response)) as { message: string };
    },
  },


  locations: {
    getAll: async (skip = 0, limit = 100): Promise<Location[]> => {
      const params = new URLSearchParams();
      params.append('skip', String(skip));
      params.append('limit', String(limit));

      const response = await fetch(`${API_BASE_URL}/api/v1/locations?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await handleResponse(response);
      if (!Array.isArray(data)) {
        return [];
      }
      return data as Location[];
    },
    create: async (data: { name: string, description?: string }): Promise<Location> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      return (await handleResponse(response)) as Location;
    },
  },
};

export interface Location {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}



export type { Volunteer, Slot, CreateSlotData, UpdateSlotData, TaskTemplate, TaskManager };