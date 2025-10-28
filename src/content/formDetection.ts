/**
 * Form Detection Module
 * 
 * Detects and identifies login forms on web pages
 */

/**
 * Detected form information
 */
export interface DetectedForm {
  form: HTMLFormElement;
  usernameField: HTMLInputElement | null;
  passwordField: HTMLInputElement;
}

/**
 * Check if an input field is likely a username field
 */
function isUsernameField(input: HTMLInputElement): boolean {
  const type = input.type.toLowerCase();
  const name = input.name.toLowerCase();
  const id = input.id.toLowerCase();
  const autocomplete = input.autocomplete.toLowerCase();
  const placeholder = input.placeholder ? input.placeholder.toLowerCase() : '';
  
  // Check input type
  if (type === 'email' || type === 'text') {
    // Check common username indicators
    const usernameIndicators = [
      'user', 'login', 'email', 'account', 'id', 'identifier'
    ];
    
    const hasIndicator = usernameIndicators.some(indicator => 
      name.includes(indicator) || 
      id.includes(indicator) || 
      placeholder.includes(indicator)
    );
    
    // Check autocomplete attribute
    const hasAutocomplete = 
      autocomplete.includes('username') || 
      autocomplete.includes('email');
    
    return hasIndicator || hasAutocomplete;
  }
  
  return false;
}

/**
 * Check if an input field is likely a password field
 */
function isPasswordField(input: HTMLInputElement): boolean {
  const type = input.type.toLowerCase();
  const autocomplete = input.autocomplete.toLowerCase();
  
  // Primary check: type="password"
  if (type === 'password') {
    return true;
  }
  
  // Check autocomplete attribute for password-related values
  if (autocomplete.includes('current-password') || 
      autocomplete.includes('new-password')) {
    return true;
  }
  
  return false;
}

/**
 * Check if a form is likely a login form
 */
function isLoginForm(form: HTMLFormElement): boolean {
  const action = form.action.toLowerCase();
  const method = form.method.toLowerCase();
  const id = form.id.toLowerCase();
  const className = form.className.toLowerCase();
  
  // Check for login indicators
  const loginIndicators = ['login', 'signin', 'sign-in', 'auth', 'session'];
  
  const hasLoginIndicator = loginIndicators.some(indicator =>
    action.includes(indicator) ||
    id.includes(indicator) ||
    className.includes(indicator)
  );
  
  // Login forms typically use POST method
  const usesPost = method === 'post' || method === '';
  
  return hasLoginIndicator || usesPost;
}

/**
 * Find username and password fields in a form
 */
function findFormFields(form: HTMLFormElement): {
  usernameField: HTMLInputElement | null;
  passwordField: HTMLInputElement | null;
} {
  const inputs = Array.from(form.querySelectorAll('input'));
  
  // Find password field (required for login form)
  const passwordField = inputs.find(isPasswordField) ?? null;
  
  if (!passwordField) {
    return { usernameField: null, passwordField: null };
  }
  
  // Find username field (email or text before password)
  const passwordIndex = inputs.indexOf(passwordField);
  const inputsBeforePassword = inputs.slice(0, passwordIndex + 1);
  
  // Look for username field before password field
  const usernameField = inputsBeforePassword
    .reverse()
    .find(isUsernameField) ?? null;
  
  return { usernameField, passwordField };
}

/**
 * Detect login forms on the page
 */
export function detectLoginForms(): DetectedForm[] {
  const detectedForms: DetectedForm[] = [];
  
  // Find all forms on the page
  const forms = Array.from(document.querySelectorAll('form'));
  
  for (const form of forms) {
    // Check if form is visible
    const style = window.getComputedStyle(form);
    if (style.display === 'none' || style.visibility === 'hidden') {
      continue;
    }
    
    // Find form fields
    const { usernameField, passwordField } = findFormFields(form);
    
    // A login form must have at least a password field
    if (passwordField && isLoginForm(form)) {
      detectedForms.push({
        form,
        usernameField,
        passwordField,
      });
    }
  }
  
  // Also check for forms without <form> tag (React/Vue apps)
  const standalonePasswordFields = Array.from(
    document.querySelectorAll('input[type="password"]')
  ).filter(input => {
    // Skip if already in a detected form
    return !detectedForms.some(df => 
      df.passwordField === input || 
      df.form.contains(input)
    );
  }) as HTMLInputElement[];
  
  for (const passwordField of standalonePasswordFields) {
    // Find nearest parent container
    let container = passwordField.parentElement;
    while (container && container !== document.body) {
      const inputs = Array.from(
        container.querySelectorAll('input')
      );
      
      if (inputs.length > 0 && inputs.length <= 5) {
        const passwordIndex = inputs.indexOf(passwordField);
        const inputsBeforePassword = inputs.slice(0, passwordIndex + 1);
        const usernameField = inputsBeforePassword
          .reverse()
          .find(isUsernameField) ?? null;
        
        // Create a pseudo-form
        const pseudoForm = container as unknown as HTMLFormElement;
        detectedForms.push({
          form: pseudoForm,
          usernameField,
          passwordField,
        });
        break;
      }
      
      container = container.parentElement;
    }
  }
  
  return detectedForms;
}

/**
 * Fill form fields with credentials
 */
export function fillFormFields(
  detectedForm: DetectedForm,
  username: string,
  password: string
): void {
  // Fill username field if present
  if (detectedForm.usernameField) {
    const usernameField = detectedForm.usernameField;
    usernameField.value = username;
    
    // Trigger input events for React/Vue compatibility
    usernameField.dispatchEvent(new Event('input', { bubbles: true }));
    usernameField.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Fill password field
  const passwordField = detectedForm.passwordField;
  passwordField.value = password;
  
  // Trigger input events for React/Vue compatibility
  passwordField.dispatchEvent(new Event('input', { bubbles: true }));
  passwordField.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Submit a form
 */
export function submitForm(detectedForm: DetectedForm): void {
  // Try to submit the form if it's a real form element
  if (detectedForm.form.tagName === 'FORM') {
    detectedForm.form.submit();
  } else {
    // Try to find and click a submit button
    const container = detectedForm.form;
    const submitButton = container.querySelector<HTMLButtonElement | HTMLInputElement>(
      'button[type="submit"], input[type="submit"], button:not([type="button"])'
    );
    
    if (submitButton) {
      submitButton.click();
    }
  }
}
