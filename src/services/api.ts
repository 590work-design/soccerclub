// src/services/api.ts
import { mockVolunteers, mockSlots, getNextSlotId } from './mockData';

/*
  ADDED: Default mock toggle reads env and defaults to false (use real API).
  Set VITE_USE_MOCK=true in .env if you explicitly want mock data again.
*/
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
// FORCE: Disable mock data so the app always uses the real backend API.
// To re-enable mocks for local testing set `VITE_USE_MOCK='true'` in your .env
// and change this line back to read from `import.meta.env`.
const USE_MOCK_DATA = false;
// Disable slots API calls while backend slot endpoints are not ready.
export const ENABLE_SLOTS_API = false;

/*
  Volunteer shape used by the UI. Backend returns many fields (see Swagger).
  We map backend objects to this frontend-friendly shape while keeping the
  original object on `_raw` for debugging or additional UI work.
*/
interface Volunteer {
  id: number;
  name: string;            // frontend-friendly composed name
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

/* ADDED: improved handleResponse to surface JSON "detail" errors and handle empty bodies */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    try {
      const json = text ? JSON.parse(text) : {};
      // FastAPI frequently uses { "detail": ... }
      throw new Error(json.detail || JSON.stringify(json) || `HTTP error! status: ${response.status}`);
    } catch {
      throw new Error(text || `HTTP error! status: ${response.status}`);
    }
  }
  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
};

// Simulate API delay when mocking
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/* ADDED: helper to get Authorization header from token stored in sessionStorage */
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ADDED: Maps backend volunteer object (Swagger example shape) to frontend Volunteer */
const mapBackendVolunteerToFrontend = (b: any): Volunteer => {
  const id = b.id ?? 0;

  const first = b.first_name ?? '';
  const last = b.last_name ?? '';
  const nameFromParts = (first || last) ? `${first} ${last}`.trim() : undefined;
  const name = nameFromParts ?? b.name ?? b.full_name ?? `#${id}`;

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
  /* ADDED: auth.login
     Sends application/x-www-form-urlencoded request to FastAPI auth login endpoint.
     Matches your OpenAPI screenshot expecting 'username' + 'password'.
  */
  auth: {
    login: async (data: {
      username: string;
      password: string;
      grant_type?: string;
      scope?: string;
      client_id?: string;
      client_secret?: string;
    }): Promise<{ access_token: string; token_type: string; [k: string]: any }> => {
      if (USE_MOCK_DATA) {
        await delay(400);
        return { access_token: 'mock-token', token_type: 'bearer' };
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
    /**
     * getAll(skip, limit) -> calls /api/v1/volunteers?skip=...&limit=...
     * Returns array of mapped Volunteer objects.
     */
    // simple in-memory caching + dedupe for volunteer requests
    _cache: {
      getAll: new Map<string, Volunteer[]>(),
      getById: new Map<number, Volunteer | null>(),
    },
    _pending: {
      getAll: new Map<string, Promise<Volunteer[]>>(),
      getById: new Map<number, Promise<Volunteer>>(),
    },

    getAll: async (skip = 0, limit = 100): Promise<Volunteer[]> => {
      const key = `${skip}:${limit}`;

      if (api.volunteers._cache.getAll.has(key)) {
        return api.volunteers._cache.getAll.get(key)!;
      }

      if (api.volunteers._pending.getAll.has(key)) {
        return api.volunteers._pending.getAll.get(key)!;
      }

      const p = (async () => {
        if (USE_MOCK_DATA) {
          await delay(500);
          const slice = mockVolunteers.slice(skip, skip + limit).map(mapBackendVolunteerToFrontend);
          api.volunteers._cache.getAll.set(key, slice);
          return slice;
        }

        const params = new URLSearchParams();
        params.append('skip', String(skip));
        params.append('limit', String(limit));

        const response = await fetch(`${API_BASE_URL}/api/v1/volunteers?${params.toString()}`, {
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

    /**
     * Fetch all volunteers by attempting a single large fetch, falling back
     * to paginated fetching if the backend enforces limits.
     */
    getAllAll: async (): Promise<Volunteer[]> => {
      // Try one large request first (backend might support returning all)
      const tryLarge = await api.volunteers.getAll(0, 10000);
      if (tryLarge.length < 10000) return tryLarge;

      // Backend limited result; fetch in pages of 500 until exhausted
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

    /**
     * getById -> calls /api/v1/volunteers/{id}
     */
    getById: async (id: number): Promise<Volunteer> => {
      if (api.volunteers._cache.getById.has(id)) {
        const cached = api.volunteers._cache.getById.get(id);
        if (cached) return cached;
      }

      if (api.volunteers._pending.getById.has(id)) {
        return api.volunteers._pending.getById.get(id)!;
      }

      const p = (async () => {
        if (USE_MOCK_DATA) {
          await delay(300);
          const volunteer = mockVolunteers.find((v: any) => v.id === id);
          if (!volunteer) throw new Error('Volunteer not found');
          const mapped = mapBackendVolunteerToFrontend(volunteer);
          api.volunteers._cache.getById.set(id, mapped);
          return mapped;
        }

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
      if (USE_MOCK_DATA) {
        await delay(400);
        const index = mockVolunteers.findIndex((v: any) => v.id === id);
        if (index === -1) throw new Error('Volunteer not found');
        mockVolunteers[index] = { ...mockVolunteers[index], ...data };
        return mockVolunteers[index];
      }

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
      if (USE_MOCK_DATA) {
        await delay(400);
        const index = mockVolunteers.findIndex((v: any) => v.id === id);
        if (index === -1) throw new Error('Volunteer not found');
        mockVolunteers.splice(index, 1);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/volunteers/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete volunteer: ${response.status}`);
      }
    },
  },

  slots: {
    getByVolunteerId: async (volunteerId: number): Promise<Slot[]> => {
      if (!ENABLE_SLOTS_API) {
        console.debug('[api.slots.getByVolunteerId] slots API disabled; returning empty list');
        return [];
      }

      if (USE_MOCK_DATA) {
        await delay(400);
        return mockSlots[volunteerId] || [];
      }

      // Try several common endpoints to fetch slots for a volunteer.
      // Different backends may expose different routes; try them in order and
      // return the first successful result. This also logs debug info to the
      // console so it's easier to diagnose 404/Not Found issues in the browser.
      const endpoints = [
        // preferred: query param on /api/slots
        `${API_BASE_URL}/api/slots?volunteer_id=${volunteerId}`,
        // v1 prefix
        `${API_BASE_URL}/api/v1/slots?volunteer_id=${volunteerId}`,
        // volunteers nested slots (some backends use this)
        `${API_BASE_URL}/api/volunteers/${volunteerId}/slots`,
        `${API_BASE_URL}/api/v1/volunteers/${volunteerId}/slots`,
        // alternate pattern
        `${API_BASE_URL}/api/slots/volunteer/${volunteerId}`,
      ];

      let lastError: any = null;
      for (const url of endpoints) {
        try {
          // log the attempted URL for easy client-side debugging
          console.debug('[api.slots.getByVolunteerId] trying', url);
          const resp = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
          });

          // If not ok, capture body (if any) for better error messages and continue
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
            // Some APIs return an object with `results` or similar
            if (data && Array.isArray((data as any).results)) return (data as any).results as Slot[];
            // otherwise treat unexpected body as an error
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

      // If none of the endpoints worked, throw the last error for the caller to display
      throw lastError || new Error('Failed to load slots for volunteer');
    },

    /**
     * Get all slots (optionally the backend may return volunteer info embedded).
     */
    getAll: async (): Promise<Slot[]> => {
      if (!ENABLE_SLOTS_API) {
        console.debug('[api.slots.getAll] slots API disabled; returning empty list');
        return [];
      }

      if (USE_MOCK_DATA) {
        await delay(400);
        // flatten mockSlots map
        const all: Slot[] = [];
        for (const k in mockSlots) {
          all.push(...(mockSlots as any)[k]);
        }
        return all;
      }

      const response = await fetch(`${API_BASE_URL}/api/slots`, {
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
      if (USE_MOCK_DATA) {
        await delay(500);
        const newSlot: Slot = {
          id: getNextSlotId(),
          volunteer_id: data.volunteer_id,
          date: data.date,
          time: data.time,
          description: data.description,
          status: data.status as 'confirmed' | 'pending' | 'cancelled',
        };
        if (!mockSlots[data.volunteer_id]) mockSlots[data.volunteer_id] = [];
        mockSlots[data.volunteer_id].push(newSlot);

        const volunteer = mockVolunteers.find((v: any) => v.id === data.volunteer_id);
        if (volunteer) volunteer.booked_slots = (volunteer.booked_slots || 0) + 1;

        return newSlot;
      }

      const response = await fetch(`${API_BASE_URL}/api/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });

      return (await handleResponse(response)) as Slot;
    },

    update: async (id: number, data: UpdateSlotData): Promise<Slot> => {
      if (USE_MOCK_DATA) {
        await delay(400);
        for (const volunteerId in mockSlots) {
          const slotIndex = mockSlots[volunteerId].findIndex((s: any) => s.id === id);
          if (slotIndex !== -1) {
            const updatedSlot: Slot = {
              ...mockSlots[volunteerId][slotIndex],
              ...(data.date && { date: data.date }),
              ...(data.time && { time: data.time }),
              ...(data.description && { description: data.description }),
              ...(data.status && { status: data.status as 'confirmed' | 'pending' | 'cancelled' }),
            };
            mockSlots[volunteerId][slotIndex] = updatedSlot;
            return updatedSlot;
          }
        }
        throw new Error('Slot not found');
      }

      const response = await fetch(`${API_BASE_URL}/api/slots/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return (await handleResponse(response)) as Slot;
    },

    delete: async (id: number): Promise<void> => {
      if (USE_MOCK_DATA) {
        await delay(400);
        for (const volunteerId in mockSlots) {
          const slotIndex = mockSlots[volunteerId].findIndex((s: any) => s.id === id);
          if (slotIndex !== -1) {
            mockSlots[volunteerId].splice(slotIndex, 1);
            const volunteer = mockVolunteers.find((v: any) => v.id === parseInt(volunteerId));
            if (volunteer) volunteer.booked_slots = Math.max(0, volunteer.booked_slots - 1);
            return;
          }
        }
        throw new Error('Slot not found');
      }

      const response = await fetch(`${API_BASE_URL}/api/slots/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      if (!response.ok) throw new Error(`Failed to delete slot: ${response.status}`);
    },

    sendWhatsApp: async (id: number): Promise<{ message: string }> => {
      if (USE_MOCK_DATA) {
        await delay(600);
        return { message: 'WhatsApp reminder sent successfully!' };
      }
      const response = await fetch(`${API_BASE_URL}/api/slots/${id}/send-whatsapp`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
      });
      return (await handleResponse(response)) as { message: string };
    },

    sendEmail: async (id: number): Promise<{ message: string }> => {
      if (USE_MOCK_DATA) {
        await delay(600);
        return { message: 'Email reminder sent successfully!' };
      }
      const response = await fetch(`${API_BASE_URL}/api/slots/${id}/send-email`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
      });
      return (await handleResponse(response)) as { message: string };
    },
  },
};

export type { Volunteer, Slot, CreateSlotData, UpdateSlotData };