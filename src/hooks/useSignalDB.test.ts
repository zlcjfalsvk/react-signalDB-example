import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Collection } from '@signaldb/core';
import { useSignalDB } from './useSignalDB';

// Mock useReactivity from db module
vi.mock('../lib/db', () => ({
  useReactivity: vi.fn(),
}));

vi.mock('@signaldb/localstorage', () => ({
  default: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  })),
}));

vi.mock('@signaldb/core', () => ({
  Collection: vi.fn().mockImplementation(() => ({
    find: vi.fn(() => ({
      toArray: vi.fn(() => []),
      onChange: vi.fn(() => () => {}),
    })),
    findOne: vi.fn(),
    insert: vi.fn(),
    insertOne: vi.fn(),
    updateOne: vi.fn(),
    updateMany: vi.fn(),
    removeOne: vi.fn(),
    removeMany: vi.fn(),
    createIndex: vi.fn(),
    memory: vi.fn(() => []),
  })),
}));

// Mock data type for testing
interface TestDoc {
  id: string;
  title: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}

describe('useSignalDB', () => {
  let mockCollection: Partial<Collection<TestDoc>>;
  let mockUseReactivity: vi.Mock;

  const mockData: TestDoc[] = [
    {
      id: '1',
      title: 'Test 1',
      value: 10,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: '2',
      title: 'Test 2',
      value: 20,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    mockCollection = {
      find: vi.fn(() => ({
        fetch: vi.fn(() => mockData),
        count: vi.fn(() => mockData.length),
      })),
      findOne: vi.fn(),
      insert: vi.fn(),
      updateOne: vi.fn(),
      updateMany: vi.fn(),
      removeOne: vi.fn(),
      removeMany: vi.fn(),
    };

    const dbModule = await import('../lib/db');
    mockUseReactivity = dbModule.useReactivity as unknown as vi.Mock;
    
    // Mock useReactivity to call the function passed to it and return its result
    mockUseReactivity.mockImplementation((fn) => fn());
  });

  it('should return correct data and count', () => {
    const { result } = renderHook(() =>
      useSignalDB({
        collection: mockCollection as Collection<TestDoc>,
      })
    );

    expect(result.current.data).toEqual(mockData);
    expect(result.current.count).toBe(2);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle empty collection', () => {
    mockCollection.find = vi.fn(() => ({
      fetch: vi.fn(() => []),
      count: vi.fn(() => 0),
    }));

    const { result } = renderHook(() =>
      useSignalDB({
        collection: mockCollection as Collection<TestDoc>,
      })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  it('should call findOne with correct selector', () => {
    mockCollection.findOne = vi.fn().mockReturnValue(mockData[0]);

    const { result } = renderHook(() =>
      useSignalDB({
        collection: mockCollection as Collection<TestDoc>,
      })
    );

    const foundDoc = result.current.findOne({ id: '1' });

    expect(mockCollection.findOne).toHaveBeenCalledWith({ id: '1' });
    expect(foundDoc).toEqual(mockData[0]);
  });

  it('should insert document with generated ID', () => {
    mockCollection.insert = vi.fn();

    const { result } = renderHook(() =>
      useSignalDB({
        collection: mockCollection as Collection<TestDoc>,
      })
    );

    const docData = {
      title: 'New Test',
      value: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.insert(docData);
    });

    expect(mockCollection.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        ...docData,
        id: expect.any(String),
      })
    );
  });

  it('should update document with updatedAt timestamp', () => {
    mockCollection.updateOne = vi.fn().mockReturnValue(1);

    const { result } = renderHook(() =>
      useSignalDB({
        collection: mockCollection as Collection<TestDoc>,
      })
    );

    const update = { title: 'Updated Title' };

    act(() => {
      result.current.updateOne({ id: '1' }, update);
    });

    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { id: '1' },
      {
        $set: {
          ...update,
          updatedAt: expect.any(Date),
        },
      }
    );
  });

  it('should remove documents', () => {
    mockCollection.removeOne = vi.fn().mockReturnValue(1);
    mockCollection.removeMany = vi.fn().mockReturnValue(2);

    const { result } = renderHook(() =>
      useSignalDB({
        collection: mockCollection as Collection<TestDoc>,
      })
    );

    act(() => {
      result.current.removeOne({ id: '1' });
      result.current.removeMany({ value: { $gt: 15 } });
    });

    expect(mockCollection.removeOne).toHaveBeenCalledWith({ id: '1' });
    expect(mockCollection.removeMany).toHaveBeenCalledWith({
      value: { $gt: 15 },
    });
  });

  it('should check document existence', () => {
    mockCollection.findOne = vi
      .fn()
      .mockReturnValueOnce(mockData[0])
      .mockReturnValueOnce(null);

    const { result } = renderHook(() =>
      useSignalDB({
        collection: mockCollection as Collection<TestDoc>,
      })
    );

    expect(result.current.exists({ id: '1' })).toBe(true);
    expect(result.current.exists({ id: 'nonexistent' })).toBe(false);
  });

  it('should pass correct options to collection methods', () => {
    const selector = { value: { $gt: 10 } };
    const options = { sort: { createdAt: -1 }, limit: 10 };

    renderHook(() =>
      useSignalDB({
        collection: mockCollection as Collection<TestDoc>,
        selector,
        options,
      })
    );

    expect(mockCollection.find).toHaveBeenCalledWith(selector, options);
    expect(mockCollection.find).toHaveBeenCalledWith(selector);
  });

  it('should handle empty data gracefully', () => {
    mockUseReactivity.mockImplementation(() => null);

    const { result } = renderHook(() =>
      useSignalDB({
        collection: mockCollection as Collection<TestDoc>,
      })
    );

    expect(result.current.data).toEqual([]);
  });

  it('should return the same functions on re-renders (memoization)', () => {
    const { result, rerender } = renderHook(() =>
      useSignalDB({
        collection: mockCollection as Collection<TestDoc>,
      })
    );

    const firstRender = result.current;

    rerender();

    const secondRender = result.current;

    expect(firstRender.findOne).toBe(secondRender.findOne);
    expect(firstRender.insert).toBe(secondRender.insert);
    expect(firstRender.updateOne).toBe(secondRender.updateOne);
    expect(firstRender.removeOne).toBe(secondRender.removeOne);
  });
});
