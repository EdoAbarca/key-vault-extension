import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Vault Locked/i)).toBeInTheDocument();
  });

  it('shows unlock prompt when vault is locked', () => {
    render(<App />);
    expect(screen.getByText(/Please unlock your vault to view credentials/i)).toBeInTheDocument();
  });
});
