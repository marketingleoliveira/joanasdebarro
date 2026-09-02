import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  href?: string | null;
}

interface StoreHeroCarouselProps {
  slides: HeroSlide[];
  className?: string;
  intervalMs?: number;
}

/**
 * Carrossel de destaque da loja: largura máxima responsiva e altura fixa de 250px.
 * Autoplay pausável, navegação por setas, indicadores e suporte a teclado.
 */
export function StoreHeroCarousel({ slides, className, intervalMs = 5000 }: StoreHeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;
  const trackRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (next: number) => {
      if (total === 0) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (paused || total <= 1) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % total), intervalMs);
    return () => window.clearInterval(timer);
  }, [paused, total, intervalMs]);

  if (total === 0) return null;

  return (
    <section
      aria-label="Destaques da loja"
      className={cn('relative w-full overflow-hidden', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative h-[250px] w-full">
        <div
          ref={trackRef}
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide) => {
            const content = (
              <div className="relative h-[250px] w-full shrink-0 grow-0 basis-full overflow-hidden">
                {slide.image ? (
                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="store-diamond-soft absolute inset-0" aria-hidden="true" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-store-dark/80 via-store-dark/40 to-transparent" />
                <div className="container relative flex h-full flex-col items-start justify-center gap-2 px-6 sm:px-10">
                  <h2 className="font-display text-2xl font-bold leading-tight text-primary-foreground sm:text-4xl">
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="max-w-xl text-xs text-primary-foreground/85 sm:text-sm">{slide.subtitle}</p>
                  )}
                  {slide.href && (
                    <span className="mt-2 inline-flex items-center rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                      Ver agora
                    </span>
                  )}
                </div>
              </div>
            );
            return slide.href ? (
              <Link key={slide.id} to={slide.href} className="h-full w-full shrink-0 grow-0 basis-full">
                {content}
              </Link>
            ) : (
              <div key={slide.id} className="h-full w-full shrink-0 grow-0 basis-full">
                {content}
              </div>
            );
          })}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Slide anterior"
              onClick={() => go(index - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 text-store-dark shadow-md transition hover:bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Próximo slide"
              onClick={() => go(index + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 text-store-dark shadow-md transition hover:bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Ir para o slide ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === index ? 'w-6 bg-primary' : 'w-2 bg-card/70 hover:bg-card',
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default StoreHeroCarousel;
