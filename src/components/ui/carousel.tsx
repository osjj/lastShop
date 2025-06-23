'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface CarouselSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  textColor?: 'light' | 'dark';
}

interface CarouselProps {
  slides: CarouselSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
}

export function Carousel({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  className
}: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, nextSlide, slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      {/* Slides Container */}
      <div className="relative h-96 md:h-[500px] lg:h-[600px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000 ease-in-out',
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            )}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30" />
            
            {/* Content */}
            <div className="relative h-full flex items-center justify-center">
              <div className="text-center max-w-4xl mx-auto px-4">
                {slide.subtitle && (
                  <p className={cn(
                    'text-lg md:text-xl mb-4 font-medium',
                    slide.textColor === 'dark' ? 'text-gray-800' : 'text-white/90'
                  )}>
                    {slide.subtitle}
                  </p>
                )}
                
                <h1 className={cn(
                  'text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight',
                  slide.textColor === 'dark' ? 'text-gray-900' : 'text-white'
                )}>
                  {slide.title}
                </h1>
                
                {slide.description && (
                  <p className={cn(
                    'text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed',
                    slide.textColor === 'dark' ? 'text-gray-700' : 'text-white/80'
                  )}>
                    {slide.description}
                  </p>
                )}
                
                {slide.buttonText && slide.buttonLink && (
                  <Button
                    asChild
                    size="lg"
                    className={cn(
                      'text-lg px-8 py-4 font-semibold shadow-lg',
                      slide.textColor === 'dark' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-white text-blue-600 hover:bg-gray-100'
                    )}
                  >
                    <a href={slide.buttonLink}>
                      {slide.buttonText}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0 w-12 h-12"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0 w-12 h-12"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-300',
                index === currentSlide
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/70'
              )}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}