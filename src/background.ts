// Background service worker for Chrome Extension
/// <reference types="chrome"/>

console.log('Key Vault Extension - Background service worker initialized');

// Listen for installation
chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
  console.log('Extension installed:', details);
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((
  message: unknown,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
) => {
  console.log('Message received:', message);
  sendResponse({ status: 'ok' });
  return true;
});
