import React, { useState, useRef, useEffect } from 'react';
import './DraggableWindow.css';

interface DraggableWindowProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const DraggableWindow: React.FC<DraggableWindowProps> = ({
  title,
  isOpen,
  onClose,
  children,
  className = ''
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && windowRef.current) {
      // Center the window when it opens
      const rect = windowRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2
      });
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.closest('.close-button')) {
      return;
    }
    
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Ensure window stays within viewport bounds
      const rect = windowRef.current?.getBoundingClientRect();
      if (rect) {
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      className={`draggable-window ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
    >
      <div className="window-header" onMouseDown={handleMouseDown}>
        <h2>{title}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="window-content">
        {children}
      </div>
    </div>
  );
};

export default DraggableWindow; 