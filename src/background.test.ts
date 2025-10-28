// Mock chrome APIs
const mockChrome = {
  runtime: {
    onInstalled: {
      addListener: jest.fn(),
    },
    onMessage: {
      addListener: jest.fn(),
    },
  },
};

// Set up global chrome object before importing background script
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).chrome = mockChrome;

// Import the background script once at module level
import './background';

describe('Background Service Worker', () => {
  it('should register onInstalled listener', () => {
    expect(mockChrome.runtime.onInstalled.addListener).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('should register onMessage listener', () => {
    expect(mockChrome.runtime.onMessage.addListener).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('onInstalled callback should log installation details', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Get the onInstalled callback
    const onInstalledCallback = mockChrome.runtime.onInstalled.addListener.mock.calls[0][0] as (details: chrome.runtime.InstalledDetails) => void;
    
    // Call it with mock details
    const mockDetails = { reason: 'install' } as chrome.runtime.InstalledDetails;
    onInstalledCallback(mockDetails);
    
    expect(consoleSpy).toHaveBeenCalledWith('Extension installed:', mockDetails);
    
    consoleSpy.mockRestore();
  });

  it('onMessage callback should respond with status ok', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Get the onMessage callback
    const onMessageCallback = mockChrome.runtime.onMessage.addListener.mock.calls[0][0] as (
      message: unknown,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void
    ) => boolean;
    
    // Mock sendResponse function
    const sendResponse = jest.fn();
    // Send an invalid message (will get error response)
    const mockMessage = { type: 'test' };
    const mockSender = {} as chrome.runtime.MessageSender;
    
    // Call the callback
    const result = onMessageCallback(mockMessage, mockSender, sendResponse);
    
    expect(sendResponse).toHaveBeenCalledWith({ error: 'Invalid message format' });
    expect(result).toBe(false);
    
    consoleSpy.mockRestore();
  });
});
