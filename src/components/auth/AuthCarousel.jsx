import React, { useState, useEffect } from 'react';

const SLIDES = [
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArAG6UqYBA2PtwXx4JgKj2R9y4iQl28zydaX0q-BSYGRfDBlQx0rhIS7oScruZCD7CQ2nOtNV6fu8xvqp-stkjLV4fvqrUUQtTU25xErcTJw90KtvZzfNKucJRdJwCUYH99xKE9ysNA_s6SyXYtEUCeQo7QWNnzkfxvWEWOdqafNNE3WWFmkKP_p8uQboIXmKVYqI5kZOR0zW3eYedp3yG7hmptg4b-Zt8rP5ddpn-HxNilIKdSigjmw',
    alt: 'Fotografía editorial de boda',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm6ggu9JbD9ncMjBiPAogTAqoONtl5w9qiIhZb5moV3rMvbBfqEn5NjkviGeAQ22C78XSjUToFeyA5cHtWxeCayjUoUfXju9M8woayzcLLln9XBvnYAw2sKIFpI6nSRGo9wDm02zphpWQTS46UZsEQdrPg07kdTtsAneacK_y5EVKasnruGK1Aw8L0Y8ead0wDC5MMpjz04UU7MpBUrxuw8x5YXlIi-6qRl2ZqeQPvMNCszI-NwtvVDw',
    alt: 'Detalles de la recepción',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkOw-7ENtwLa5o6QTy7Sb2RLcBp7pHdM0-XtHGv099rTDH193aquS6PpU13zY4Sr7advSKizdwrBEzHZqmyNzH51cvQk-a0e6dWQjJj_tHvyFt6ucmJUlWuOysl09ol05BMD2Hm2dndPOfx8AWnCI-SpEW1EDQBZ3RnCXyQJaUFcHnFou3evaACyyCN57e97kQ9l9Rz40wNLSn1wPGZk6EKdMTGcbatfrtJsom-_UAy2EBCUq13Ll6qw',
    alt: 'Momento blanco y negro',
  },
];

export default function AuthCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section class="relative h-[55vh] md:h-screen w-full md:w-1/2 overflow-hidden bg-[#ebe7e6]">
      {/* Slides Container */}
      <div
        class="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {SLIDES.map((slide, index) => (
          <div key={index} class="flex-shrink-0 w-full h-full relative">
            <img
              src={slide.url}
              alt={slide.alt}
              class="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Degradado Suave */}
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FDFBF9] md:bg-gradient-to-r md:from-transparent md:to-[#FDFBF9]/20 pointer-events-none" />

      {/* Floating Glass Badge estilo Apple */}
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div class="bg-white/60 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 shadow-sm flex items-center space-x-2">
          <span class="font-sans text-[11px] font-semibold tracking-widest text-[#1A1A1A] uppercase">
            Show your Inner POV
          </span>
        </div>
      </div>

      {/* Indicadores / Puntos */}
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            class={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
}