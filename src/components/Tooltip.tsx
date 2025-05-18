import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
  position?: 'right' | 'top' | 'bottom' | 'left';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  text, 
  children, 
  position = 'right',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const childRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
    updatePosition();
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!childRef.current) return;
    
    const rect = childRef.current.getBoundingClientRect();
    const tooltipWidth = tooltipRef.current?.offsetWidth || 0;
    const tooltipHeight = tooltipRef.current?.offsetHeight || 0;
    
    let top = 0;
    let left = 0;

    switch (position) {
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + 10;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - tooltipWidth - 10;
        break;
      case 'top':
        top = rect.top - tooltipHeight - 10;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      
      // Update position after a short delay to ensure tooltip is rendered
      const timeoutId = setTimeout(updatePosition, 10);
      
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
        clearTimeout(timeoutId);
      };
    }
  }, [isVisible]);

  // Clone the child element to add refs and event handlers
  const childWithProps = React.cloneElement(children, {
    ref: childRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  });

  // Determine arrow position based on tooltip position
  const getArrowStyles = () => {
    switch (position) {
      case 'right':
        return {
          top: '50%',
          right: '100%',
          transform: 'translateY(-50%)',
          borderWidth: '6px',
          borderStyle: 'solid',
          borderColor: 'transparent rgba(0, 0, 0, 0.9) transparent transparent'
        };
      case 'left':
        return {
          top: '50%',
          left: '100%',
          transform: 'translateY(-50%)',
          borderWidth: '6px',
          borderStyle: 'solid',
          borderColor: 'transparent transparent transparent rgba(0, 0, 0, 0.9)'
        };
      case 'top':
        return {
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '6px',
          borderStyle: 'solid',
          borderColor: 'rgba(0, 0, 0, 0.9) transparent transparent transparent'
        };
      case 'bottom':
        return {
          top: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '6px',
          borderStyle: 'solid',
          borderColor: 'transparent transparent rgba(0, 0, 0, 0.9) transparent'
        };
    }
  };

  return (
    <>
      {childWithProps}
      {isVisible && ReactDOM.createPortal(
        <div 
          ref={tooltipRef}
          className={`modern-tooltip ${className}`}
          style={{
            position: 'fixed',
            zIndex: 99999,
            top: tooltipPosition.top + 'px',
            left: tooltipPosition.left + 'px',
            transform: position === 'right' || position === 'left' 
              ? 'translateY(-50%)' 
              : 'none',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            lineHeight: 1.4,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            maxWidth: 'none',
            width: 'max-content',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {text}
          <div style={{
            position: 'absolute',
            ...getArrowStyles()
          }} />
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip; 