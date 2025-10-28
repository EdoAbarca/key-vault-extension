/**
 * PasswordGenerator Component
 * 
 * UI component for generating secure random passwords with customizable options
 */

import { useState, useEffect } from 'react';
import {
  generatePassword,
  calculatePasswordStrength,
  DEFAULT_OPTIONS,
  PASSWORD_CONSTRAINTS,
  PasswordStrength,
  type PasswordGeneratorOptions,
} from '../crypto';

interface PasswordGeneratorProps {
  onClose?: () => void;
  onPasswordGenerated?: (password: string) => void;
}

/**
 * Get color classes for password strength indicator
 */
function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.VERY_WEAK:
      return 'bg-red-600';
    case PasswordStrength.WEAK:
      return 'bg-orange-600';
    case PasswordStrength.FAIR:
      return 'bg-yellow-500';
    case PasswordStrength.GOOD:
      return 'bg-blue-500';
    case PasswordStrength.STRONG:
      return 'bg-green-500';
    case PasswordStrength.VERY_STRONG:
      return 'bg-green-600';
    default:
      return 'bg-gray-300';
  }
}

/**
 * Get text label for password strength
 */
function getStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.VERY_WEAK:
      return 'Very Weak';
    case PasswordStrength.WEAK:
      return 'Weak';
    case PasswordStrength.FAIR:
      return 'Fair';
    case PasswordStrength.GOOD:
      return 'Good';
    case PasswordStrength.STRONG:
      return 'Strong';
    case PasswordStrength.VERY_STRONG:
      return 'Very Strong';
    default:
      return 'Unknown';
  }
}

export function PasswordGenerator({ onClose, onPasswordGenerated }: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<PasswordGeneratorOptions>(DEFAULT_OPTIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setCopySuccess(false);

    try {
      const newPassword = await generatePassword(options);
      setPassword(newPassword);
      if (onPasswordGenerated) {
        onPasswordGenerated(newPassword);
      }
    } catch {
      setError('Failed to generate password');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate initial password on mount
  useEffect(() => {
    void handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate strength when password changes
  const strengthResult = password ? calculatePasswordStrength(password) : null;

  const handleCopy = async () => {
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      setCopySuccess(true);
      setTimeout(() => { setCopySuccess(false); }, 2000);
    } catch {
      setError('Failed to copy to clipboard');
      setTimeout(() => { setError(null); }, 3000);
    }
  };

  const handleLengthChange = (length: number) => {
    setOptions({ ...options, length });
  };

  const handleOptionChange = (key: keyof PasswordGeneratorOptions, value: boolean) => {
    setOptions({ ...options, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Password Generator</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Password Display */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={password}
            readOnly
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Generated password will appear here"
          />
          <button
            onClick={() => { void handleCopy(); }}
            disabled={!password}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Copy password"
            title="Copy to clipboard"
          >
            {copySuccess ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        {copySuccess && (
          <p className="mt-1 text-xs text-green-600">Copied to clipboard!</p>
        )}
      </div>

      {/* Strength Indicator */}
      {strengthResult && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Password Strength</span>
            <span className="text-sm font-semibold text-gray-900">
              {getStrengthLabel(strengthResult.strength)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strengthResult.strength)}`}
              style={{ width: `${strengthResult.score.toString()}%` }}
            />
          </div>
          {strengthResult.feedback.length > 0 && (
            <div className="mt-2">
              {strengthResult.feedback.map((feedback, index) => (
                <p key={index} className="text-xs text-gray-600">
                  {feedback}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Length Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="length" className="text-sm font-medium text-gray-700">
            Length
          </label>
          <span className="text-sm font-semibold text-gray-900">{options.length}</span>
        </div>
        <input
          id="length"
          type="range"
          min={PASSWORD_CONSTRAINTS.MIN_LENGTH}
          max={PASSWORD_CONSTRAINTS.MAX_LENGTH}
          value={options.length}
          onChange={(e) => { handleLengthChange(Number(e.target.value)); }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{PASSWORD_CONSTRAINTS.MIN_LENGTH}</span>
          <span>{PASSWORD_CONSTRAINTS.MAX_LENGTH}</span>
        </div>
      </div>

      {/* Character Set Options */}
      <div className="mb-6 space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={options.includeUppercase}
            onChange={(e) => { handleOptionChange('includeUppercase', e.target.checked); }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Uppercase (A-Z)</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={options.includeLowercase}
            onChange={(e) => { handleOptionChange('includeLowercase', e.target.checked); }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Lowercase (a-z)</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={options.includeNumbers}
            onChange={(e) => { handleOptionChange('includeNumbers', e.target.checked); }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Numbers (0-9)</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={options.includeSymbols}
            onChange={(e) => { handleOptionChange('includeSymbols', e.target.checked); }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Symbols (!@#$%...)</span>
        </label>
      </div>

      {/* Generate Button */}
      <button
        onClick={() => { void handleGenerate(); }}
        disabled={isGenerating}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate New Password
          </>
        )}
      </button>
    </div>
  );
}
