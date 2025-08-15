import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface LazyLoaderProps {
  children: ReactNode;
  placeholder?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  onLoad?: () => void;
}

const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  placeholder = <div className="animate-pulse bg-gray-200 h-32 rounded"></div>,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  onLoad
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (isVisible && !hasLoaded) {
      setHasLoaded(true);
      onLoad?.();
    }
  }, [isVisible, hasLoaded, onLoad]);

  return (
    <div ref={elementRef} className={className}>
      {hasLoaded ? children : placeholder}
    </div>
  );
};

export default LazyLoader;
