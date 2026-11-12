import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders its accessible name and defaults to a non-submit button', () => {
    render(<Button>Save changes</Button>);
    const button = screen.getByRole('button', { name: 'Save changes' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });
  it('forwards native events and variant props', () => {
    const onClick = jest.fn();
    render(<Button variant="secondary" size="sm" onClick={onClick}>Continue</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveClass('pf-button--secondary', 'pf-button--sm');
  });
});
