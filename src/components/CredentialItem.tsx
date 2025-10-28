/**
 * CredentialItem Component
 * 
 * Display a single credential with copy-to-clipboard functionality
 */

import { useState } from 'react';
import type { DecryptedCredential } from '../store/vaultStore';

interface CredentialItemProps {
  credential: DecryptedCredential;
  isSelected: boolean;
  onClick: () => void;
  onCopyPassword: () => void;
  onCopyUsername: () => void;
}

const FALLBACK_DOMAIN = 'example.com';

/**
 * Extract domain from URL for favicon
 */
function getFaviconUrl(url?: string): string {
  if (!url) {
    return `https://www.google.com/s2/favicons?domain=${FALLBACK_DOMAIN}&sz=32`;
  }
  
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=${FALLBACK_DOMAIN}&sz=32`;
  }
}

export function CredentialItem({
  credential,
  isSelected,
  onClick,
  onCopyPassword,
  onCopyUsername,
}: CredentialItemProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'password' | 'username' | null>(null);

  const handleCopyPassword = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopiedField('password');
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
    onCopyPassword();
  };

  const handleCopyUsername = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopiedField('username');
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
    onCopyUsername();
  };

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPassword(!showPassword);
  };

  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 border-blue-300'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <img
          src={getFaviconUrl(credential.url)}
          alt=""
          className="w-8 h-8 rounded flex-shrink-0 mt-1"
          onError={(e) => {
            e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${FALLBACK_DOMAIN}&sz=32`;
          }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and URL */}
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{credential.title}</h3>
            {credential.url && (
              <p className="text-xs text-gray-500 truncate">{credential.url}</p>
            )}
          </div>

          {/* Username */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600 truncate flex-1">{credential.username}</span>
            <button
              onClick={(e) => {
                handleCopyUsername(e);
              }}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Copy username"
              aria-label="Copy username"
            >
              {copiedField === 'username' ? (
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Password */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-600 truncate flex-1">
              {showPassword ? credential.password : '••••••••'}
            </span>
            <button
              onClick={togglePasswordVisibility}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={(e) => {
                handleCopyPassword(e);
              }}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Copy password"
              aria-label="Copy password"
            >
              {copiedField === 'password' ? (
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
