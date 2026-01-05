/**
 * Integration Tests für Coach Readings API Routes
 * 
 * Führe aus mit: npm test -- route.test.ts
 */

import { GET, POST } from '../route';
import { NextRequest } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import * as coachReadingsDB from '@/lib/db/coach-readings';
import { readingsStore } from '../store';

// Mock dependencies
jest.mock('@/lib/coach-auth');
jest.mock('@/lib/db/coach-readings');
jest.mock('../store', () => ({
  readingsStore: [],
}));

describe('Coach Readings API Routes', () => {
  const mockUser = { id: 'test-coach-id', email: 'coach@test.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    (checkCoachAuth as jest.Mock).mockResolvedValue({ user: mockUser, isCoach: true });
    (coachReadingsDB.getCoachReadings as jest.Mock).mockResolvedValue([]);
    (coachReadingsDB.getCoachReadingStats as jest.Mock).mockResolvedValue({
      total: 0,
      pending: 0,
      completed: 0,
      approved: 0,
      zoomScheduled: 0,
    });
  });

  const mockRequest = (method: string, body?: any, url?: string) => {
    return new NextRequest(url || 'http://localhost:3005/api/coach/readings', {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  describe('GET /api/coach/readings', () => {
    it('should return readings for authenticated coach', async () => {
      (coachReadingsDB.getCoachReadings as jest.Mock).mockResolvedValue([
        {
          id: 'reading-1',
          coach_id: mockUser.id,
          reading_type: 'connection',
          client_name: 'Test Client',
          status: 'completed',
          reading_data: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      const request = mockRequest('GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('readings');
      expect(data).toHaveProperty('stats');
      expect(Array.isArray(data.readings)).toBe(true);
    });

    it('should filter by status', async () => {
      const request = new NextRequest('http://localhost:3005/api/coach/readings?status=completed');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.readings).toBeDefined();
      expect(coachReadingsDB.getCoachReadings).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ status: 'completed' })
      );
    });

    it('should return 401 if not authenticated', async () => {
      (checkCoachAuth as jest.Mock).mockResolvedValue({ user: null, isCoach: false });
      
      const request = mockRequest('GET');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });

    it('should return 403 if not coach', async () => {
      (checkCoachAuth as jest.Mock).mockResolvedValue({ user: mockUser, isCoach: false });
      
      const request = mockRequest('GET');
      const response = await GET(request);
      
      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/coach/readings', () => {
    beforeEach(() => {
      (coachReadingsDB.createCoachReading as jest.Mock).mockResolvedValue({
        id: 'new-reading-id',
        coach_id: mockUser.id,
        reading_type: 'connection',
        client_name: 'Test Client',
        status: 'pending',
        reading_data: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    it('should create a new reading', async () => {
      const request = mockRequest('POST', {
        reading_type: 'connection',
        client_name: 'Test Client',
        reading_data: {
          personA: {
            name: 'Person A',
            geburtsdatum: '1990-01-01',
            geburtszeit: '12:00',
            geburtsort: 'Berlin',
          },
          personB: {
            name: 'Person B',
            geburtsdatum: '1992-05-15',
            geburtszeit: '14:30',
            geburtsort: 'München',
          },
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('reading');
    });

    it('should return 400 if required fields are missing', async () => {
      const request = mockRequest('POST', {
        reading_type: 'connection',
        // client_name fehlt
        reading_data: {},
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should return 401 if not authenticated', async () => {
      (checkCoachAuth as jest.Mock).mockResolvedValue({ user: null, isCoach: false });
      
      const request = mockRequest('POST', {
        reading_type: 'connection',
        client_name: 'Test',
        reading_data: {},
      });
      
      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });
});

