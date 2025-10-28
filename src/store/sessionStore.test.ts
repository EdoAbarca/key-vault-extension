/**
 * Session Store Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSessionStore, DEFAULT_SESSION_SETTINGS } from './sessionStore';

// Mock chrome.storage API
const mockChromeStorage = {
  local: {
    get: jest.fn().mockResolvedValue({}),
    set: jest.fn().mockResolvedValue(undefined),
  },
};

// Set up global chrome object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).chrome = {
  storage: mockChromeStorage,
};

describe('useSessionStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset the store before each test
    const { result } = renderHook(() => useSessionStore());
    act(() => {
      result.current.clearSession();
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useSessionStore());

    expect(result.current.isActive).toBe(false);
    expect(result.current.lockTimeoutMinutes).toBe(DEFAULT_SESSION_SETTINGS.lockTimeoutMinutes);
    expect(result.current.autoLockTimerId).toBe(null);
  });

  it('initializes session with stored settings', async () => {
    const storedSettings = { lockTimeoutMinutes: 30 };
    mockChromeStorage.local.get.mockResolvedValueOnce({ sessionSettings: storedSettings });

    const { result } = renderHook(() => useSessionStore());

    await act(async () => {
      await result.current.initializeSession();
    });

    await waitFor(() => {
      expect(result.current.lockTimeoutMinutes).toBe(30);
      expect(result.current.isActive).toBe(true);
    });
  });

  it('initializes session with default settings when storage is empty', async () => {
    mockChromeStorage.local.get.mockResolvedValueOnce({});

    const { result } = renderHook(() => useSessionStore());

    await act(async () => {
      await result.current.initializeSession();
    });

    await waitFor(() => {
      expect(result.current.lockTimeoutMinutes).toBe(DEFAULT_SESSION_SETTINGS.lockTimeoutMinutes);
    });
  });

  it('updates last activity time', () => {
    const { result } = renderHook(() => useSessionStore());
    const initialTime = result.current.lastActivityTime;

    // Advance time
    jest.advanceTimersByTime(5000);

    act(() => {
      result.current.updateActivity();
    });

    expect(result.current.lastActivityTime).toBeGreaterThan(initialTime);
  });

  it('starts and stops auto-lock timer', () => {
    const { result } = renderHook(() => useSessionStore());

    act(() => {
      result.current.startAutoLockTimer();
    });

    expect(result.current.autoLockTimerId).not.toBe(null);

    act(() => {
      result.current.stopAutoLockTimer();
    });

    expect(result.current.autoLockTimerId).toBe(null);
  });

  it('sets lock timeout and saves to storage', async () => {
    const { result } = renderHook(() => useSessionStore());

    await act(async () => {
      await result.current.setLockTimeout(25);
    });

    expect(result.current.lockTimeoutMinutes).toBe(25);
    expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
      sessionSettings: { lockTimeoutMinutes: 25 },
    });
  });

  it('validates lock timeout to be between 1-60 minutes', async () => {
    const { result } = renderHook(() => useSessionStore());

    // Test minimum
    await act(async () => {
      await result.current.setLockTimeout(0);
    });
    expect(result.current.lockTimeoutMinutes).toBe(1);

    // Test maximum
    await act(async () => {
      await result.current.setLockTimeout(100);
    });
    expect(result.current.lockTimeoutMinutes).toBe(60);

    // Test valid value
    await act(async () => {
      await result.current.setLockTimeout(30);
    });
    expect(result.current.lockTimeoutMinutes).toBe(30);
  });

  it('triggers lock event after inactivity timeout', async () => {
    const { result } = renderHook(() => useSessionStore());
    const eventSpy = jest.fn();
    window.addEventListener('vault-auto-lock', eventSpy);

    await act(async () => {
      await result.current.initializeSession();
    });

    act(() => {
      result.current.startAutoLockTimer();
    });

    // Set last activity time to be in the past
    const fifteenMinutesAgo = Date.now() - (15 * 60 * 1000 + 1000);
    act(() => {
      useSessionStore.setState({ 
        isActive: true,
        lastActivityTime: fifteenMinutesAgo 
      });
    });

    // Fast forward the timer check
    act(() => {
      jest.advanceTimersByTime(10000); // Check runs every 10 seconds
    });

    expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'vault-auto-lock',
    }));
    expect(result.current.isActive).toBe(false);

    window.removeEventListener('vault-auto-lock', eventSpy);
  });

  it('does not trigger lock if activity is recent', async () => {
    const { result } = renderHook(() => useSessionStore());
    const eventSpy = jest.fn();
    window.addEventListener('vault-auto-lock', eventSpy);

    await act(async () => {
      await result.current.initializeSession();
    });

    act(() => {
      result.current.startAutoLockTimer();
    });

    // Update activity to current time
    act(() => {
      result.current.updateActivity();
    });

    // Fast forward the timer check
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(eventSpy).not.toHaveBeenCalled();
    expect(result.current.isActive).toBe(true);

    window.removeEventListener('vault-auto-lock', eventSpy);
  });

  it('clears session state when clearSession is called', async () => {
    const { result } = renderHook(() => useSessionStore());

    await act(async () => {
      await result.current.initializeSession();
    });

    act(() => {
      result.current.startAutoLockTimer();
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.autoLockTimerId).not.toBe(null);

    act(() => {
      result.current.clearSession();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.autoLockTimerId).toBe(null);
  });

  it('stops existing timer when starting a new one', () => {
    const { result } = renderHook(() => useSessionStore());

    act(() => {
      result.current.startAutoLockTimer();
    });

    const firstTimerId = result.current.autoLockTimerId;

    act(() => {
      result.current.startAutoLockTimer();
    });

    const secondTimerId = result.current.autoLockTimerId;

    expect(firstTimerId).not.toBe(secondTimerId);
    expect(secondTimerId).not.toBe(null);
  });
});
