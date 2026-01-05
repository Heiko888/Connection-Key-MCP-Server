/**
 * Unit Tests für Coach Readings Datenbank-Service
 * 
 * Führe aus mit: npm test -- coach-readings.test.ts
 */

import {
  getCoachReadings,
  getCoachReadingById,
  createCoachReading,
  updateCoachReading,
  deleteCoachReading,
  getCoachReadingStats,
} from '../coach-readings';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase Client
jest.mock('@/lib/supabase/server');

describe('Coach Readings DB Service', () => {
  const mockCoachId = 'coach-123';
  const mockReadingId = 'reading-456';
  
  // Helper: Erstelle Chain-Mock
  const createChainMock = (finalResult: any) => {
    const chain = {
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(finalResult),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    };
    return chain;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCoachReadings', () => {
    it('should return array of readings', async () => {
      const mockData = [
        { id: '1', coach_id: mockCoachId, reading_type: 'connection', client_name: 'Test', status: 'pending', reading_data: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn(() => chain),
      });

      const readings = await getCoachReadings(mockCoachId);
      expect(Array.isArray(readings)).toBe(true);
      expect(readings.length).toBe(1);
    });

    it('should filter by status', async () => {
      const mockData = [
        { id: '1', coach_id: mockCoachId, reading_type: 'connection', client_name: 'Test', status: 'completed', reading_data: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      const chain = createChainMock({ data: mockData, error: null });
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn(() => chain),
      });

      const readings = await getCoachReadings(mockCoachId, { status: 'completed' });
      expect(Array.isArray(readings)).toBe(true);
      expect(chain.eq).toHaveBeenCalledWith('status', 'completed');
    });

    it('should sort by created_at desc by default', async () => {
      const chain = createChainMock({ data: [], error: null });
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn(() => chain),
      });

      const readings = await getCoachReadings(mockCoachId, { sortBy: 'created_at', order: 'desc' });
      expect(Array.isArray(readings)).toBe(true);
      expect(chain.order).toHaveBeenCalled();
    });
  });

  describe('getCoachReadingById', () => {
    it('should return reading if found', async () => {
      const mockReading = { 
        id: mockReadingId, 
        coach_id: mockCoachId, 
        reading_type: 'connection', 
        client_name: 'Test', 
        status: 'pending', 
        reading_data: {}, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      };
      const chain = createChainMock({ data: mockReading, error: null });
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn(() => chain),
      });
      
      const reading = await getCoachReadingById(mockCoachId, mockReadingId);
      expect(reading).toBeDefined();
      expect(reading?.id).toBe(mockReadingId);
    });

    it('should return null if not found', async () => {
      const chain = createChainMock({ data: null, error: { code: 'PGRST116' } });
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn(() => chain),
      });
      
      const reading = await getCoachReadingById(mockCoachId, 'non-existent-id');
      expect(reading).toBeNull();
    });
  });

  describe('createCoachReading', () => {
    it('should create a new reading', async () => {
      const mockReading = { 
        id: mockReadingId, 
        coach_id: mockCoachId, 
        reading_type: 'connection', 
        client_name: 'Test Client', 
        status: 'pending', 
        reading_data: { test: 'data' }, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      };
      const chain = createChainMock({ data: mockReading, error: null });
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn(() => chain),
      });

      const newReading = await createCoachReading(mockCoachId, {
        reading_type: 'connection',
        client_name: 'Test Client',
        reading_data: { test: 'data' },
        status: 'pending',
      });
      expect(newReading).toBeDefined();
      expect(newReading.client_name).toBe('Test Client');
    });

    it('should set default status to pending', async () => {
      const mockReading = { 
        id: mockReadingId, 
        coach_id: mockCoachId, 
        reading_type: 'connection', 
        client_name: 'Test Client', 
        status: 'pending', 
        reading_data: {}, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      };
      const chain = createChainMock({ data: mockReading, error: null });
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn(() => chain),
      });

      const newReading = await createCoachReading(mockCoachId, {
        reading_type: 'connection',
        client_name: 'Test Client',
        reading_data: {},
      });
      expect(newReading.status).toBe('pending');
    });
  });

  describe('updateCoachReading', () => {
    it('should update reading', async () => {
      const existingReading = {
        id: mockReadingId,
        coach_id: mockCoachId,
        reading_type: 'connection',
        client_name: 'Test',
        status: 'pending',
        reading_data: { existing: 'data' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock getCoachReadingById durch separate Supabase-Query
      const getByIdChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: existingReading, error: null }),
      };

      const updatedReading = {
        ...existingReading,
        client_name: 'Updated Client',
      };
      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: updatedReading, error: null }),
      };

      let callCount = 0;
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn(() => {
          callCount++;
          // Erster Aufruf: getCoachReadingById, zweiter: update
          return callCount === 1 ? getByIdChain : updateChain;
        }),
      });

      const result = await updateCoachReading(mockCoachId, mockReadingId, {
        client_name: 'Updated Client',
      });
      expect(result).toBeDefined();
      expect(result.client_name).toBe('Updated Client');
    });

    it('should merge reading_data', async () => {
      const existingReading = {
        id: mockReadingId,
        coach_id: mockCoachId,
        reading_type: 'connection',
        client_name: 'Test',
        status: 'pending',
        reading_data: { existing: 'data' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const getByIdChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: existingReading, error: null }),
      };

      const updatedReading = {
        ...existingReading,
        reading_data: { existing: 'data', newField: 'value' },
      };
      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: updatedReading, error: null }),
      };

      let callCount = 0;
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn(() => {
          callCount++;
          return callCount === 1 ? getByIdChain : updateChain;
        }),
      });

      const result = await updateCoachReading(mockCoachId, mockReadingId, {
        reading_data: { newField: 'value' },
      });
      expect(result).toBeDefined();
      expect(result.reading_data.newField).toBe('value');
      expect(result.reading_data.existing).toBe('data');
    });
  });

  describe('deleteCoachReading', () => {
    it('should soft delete reading', async () => {
      // Die Chain ist: update().eq('id').eq('coach_id')
      // Beide eq() müssen this zurückgeben, das letzte eq() gibt Promise zurück
      const chain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn()
          .mockReturnThis() // Erste eq('id') gibt this zurück
          .mockResolvedValueOnce({ data: null, error: null }), // Zweite eq('coach_id') gibt Promise zurück
      };
      
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn(() => chain),
      });
      
      await expect(deleteCoachReading(mockCoachId, mockReadingId)).resolves.not.toThrow();
      expect(chain.update).toHaveBeenCalled();
    });
  });

  describe('getCoachReadingStats', () => {
    it('should return stats object', async () => {
      const mockData = [
        { status: 'pending' },
        { status: 'completed' },
        { status: 'completed' },
        { status: 'approved' },
      ];
      
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn(() => chain),
      });

      const stats = await getCoachReadingStats(mockCoachId);
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('approved');
      expect(stats.total).toBe(4);
      expect(stats.pending).toBe(1);
      expect(stats.completed).toBe(2);
      expect(stats.approved).toBe(1);
    });
  });
});

