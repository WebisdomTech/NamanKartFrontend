import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import bannerPujaItems from "@/assets/banners/home-banner-puja-items.jpeg";
import bannerRudrakshaMalas from "@/assets/banners/home-banner-rudraksha-malas.jpeg";

export type BannerSlide = {
  id: string;
  image: string;
  alt: string;
  heading: string;
  subheading: string;
  buttonText: string;
  buttonSlug: string;
};

const DEFAULT_BANNERS: BannerSlide[] = [
  {
    id: "banner-puja-items",
    image: bannerPujaItems,
    alt: "Brass Puja Items",
    heading: "Authentic Puja Items",
    subheading: "Everything you need for a complete and sacred worship experience.",
    buttonText: "Shop Now",
    buttonSlug: "puja-items",
  },
  {
    id: "banner-rudraksha-malas",
    image: bannerRudrakshaMalas,
    alt: "Rudraksha & Other Malas",
    heading: "Rudraksha & Other Malas",
    subheading: "Authentic malas for meditation, mantra chanting, and spiritual well-being.",
    buttonText: "Explore Collection",
    buttonSlug: "rudraksha",
  },
];

export function HeroCarousel({ slides = DEFAULT_BANNERS }: { slides?: BannerSlide[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );

  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay functionality with smooth rotation
  useEffect(() => {
    if (!emblaApi) return;
    const timer = setInterval(() => {
      emblaApi.scrollNext();
    }, 7000);

    return () => clearInterval(timer);
  }, [emblaApi]);

  return (
    <section className="relative overflow-hidden w-full bg-gray-950">
      {/* Carousel Track */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative flex-[0_0_100%] min-w-0 min-h-[380px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[560px] flex items-center"
            >
              {/* Image Container */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-full object-cover object-center select-none"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                  width={1600}
                  height={900}
                />
                {/* Subtle left-to-right dark gradient overlay behind text */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent md:from-black/55 md:via-black/20 md:to-transparent" />
              </div>

              {/* Banner Text Content */}
              <div className="container-page relative z-10 py-10 sm:py-16 md:py-20 lg:py-24 text-white">
                <div className="max-w-xl lg:max-w-2xl text-left">
                  <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-md leading-tight">
                    {slide.heading}
                  </h1>
                  <p className="mt-2.5 sm:mt-4 text-xs sm:text-base md:text-lg text-gray-100 font-medium leading-relaxed max-w-lg md:max-w-xl drop-shadow-xs">
                    {slide.subheading}
                  </p>
                  <div className="mt-5 sm:mt-8">
                    <Link
                      to="/category/$slug"
                      params={{ slug: slide.buttonSlug }}
                      className="inline-flex items-center justify-center bg-saffron hover:bg-saffron-hover text-white px-6 py-3 sm:px-7 sm:py-3.5 rounded-full font-semibold shadow-md transition duration-200 text-xs sm:text-base cursor-pointer"
                    >
                      {slide.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows (Visible on sm screens and up, mobile relies on touch/swipe + dots) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="hidden sm:flex absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-black/60 text-white items-center justify-center backdrop-blur-xs transition duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            aria-label="Previous banner slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={scrollNext}
            className="hidden sm:flex absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-black/60 text-white items-center justify-center backdrop-blur-xs transition duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            aria-label="Next banner slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* Slide Indicator Dots */}
      {scrollSnaps.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 sm:h-2.5 transition-all duration-300 rounded-full cursor-pointer ${
                index === selectedIndex
                  ? "w-6 sm:w-8 bg-saffron"
                  : "w-2 sm:w-2.5 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to banner slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
