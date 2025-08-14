import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder='Enter text' />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('renders with label', () => {
    render(<Input label='Username' placeholder='Enter username' />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('handles different input types', () => {
    const { rerender } = render(<Input type='email' />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type='password' />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');

    rerender(<Input type='number' />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input value='' onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'test value' })
      })
    );
  });

  it('shows error state', () => {
    render(<Input error='This field is required' />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('error');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('shows success state', () => {
    render(<Input success />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('success');
  });

  it('can be disabled', () => {
    render(<Input disabled placeholder='Disabled input' />);
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
  });

  it('can be readonly', () => {
    render(<Input readOnly value='Read only value' />);
    const input = screen.getByDisplayValue('Read only value');
    expect(input).toHaveAttribute('readonly');
  });

  it('renders with icon', () => {
    const TestIcon = () => <span data-testid='input-icon'>Icon</span>;
    render(<Input icon={<TestIcon />} />);
    expect(screen.getByTestId('input-icon')).toBeInTheDocument();
  });

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Input className='custom-input' />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('shows helper text', () => {
    render(<Input helperText='This is helper text' />);
    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(<Input label='Required Field' required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('handles textarea variant', () => {
    render(<Input variant='textarea' placeholder='Enter description' />);
    const textarea = screen.getByPlaceholderText('Enter description');
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('validates input on blur', () => {
    const validator = jest.fn().mockReturnValue('Invalid input');
    render(<Input validator={validator} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.blur(input);

    expect(validator).toHaveBeenCalledWith('test');
  });
});
