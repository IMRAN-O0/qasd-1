import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true
}) => {
  const modalRef = useRef(null);

  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return;
    }

    const handleEscape = e => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = e => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-hidden
          transform transition-all duration-200 ease-out
          ${sizes[size]}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            {title && <h2 className='text-xl font-semibold text-gray-800'>{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                aria-label='إغلاق'
              >
                <X size={20} className='text-gray-400' />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className='overflow-y-auto max-h-[calc(90vh-120px)]'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
