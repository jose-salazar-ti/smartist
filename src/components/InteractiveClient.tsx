"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function InteractiveClient() {
  const pathname = usePathname();

  useEffect(() => {
    // Reset scroll to top instantly on route change to prevent dynamic clamping issues,
    // EXCEPT when there is an anchor hash in the URL, in which case we scroll to it.
    if (window.location.hash) {
      const hash = window.location.hash;
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    } else {
      window.scrollTo(0, 0);
    }

    let scrollActive = false;
    let handleScroll: () => void;
    let handleMouseMove: (e: MouseEvent) => void;
    let handleFilterClick: (e: MouseEvent) => void;
    let typingInterval: NodeJS.Timeout;
    let revealObserver: IntersectionObserver;
    let mutationObserver: MutationObserver;
    let heroObserver: IntersectionObserver;
    let timer: NodeJS.Timeout;

    const initDelay = setTimeout(() => {
      // ─── Navbar scroll effect ────────────────────────
      const navbar = document.getElementById('navbar');
      handleScroll = () => {
        if (!navbar) return;
        if (window.scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      scrollActive = true;

      // ─── Reveal on scroll (Intersection Observer) ────
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.01,
        rootMargin: '0px'
      });

      const observeRevealElements = () => {
        const revealElements = document.querySelectorAll('.reveal:not(.visible)');
        revealElements.forEach(el => revealObserver.observe(el));
      };

      observeRevealElements();
      timer = setTimeout(observeRevealElements, 600);

      mutationObserver = new MutationObserver(() => {
        observeRevealElements();
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });

      // ─── Product filter buttons (delegación de eventos para robustez en Next.js) ───
      handleFilterClick = (e: MouseEvent) => {
        const targetBtn = (e.target as HTMLElement).closest('.filter-btn') as HTMLElement;
        if (!targetBtn) return;

        const filterBtns = document.querySelectorAll('.filter-btn');
        const productCards = document.querySelectorAll('.product-card');

        filterBtns.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');

        const filter = targetBtn.dataset.filter;

        productCards.forEach((c) => {
          const card = c as HTMLElement;
          const category = card.dataset.category;

          if (filter === 'all' || category === filter) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      };
      document.addEventListener('click', handleFilterClick);

      // ─── Counter animation for hero stats ────────────
      const animateCounters = () => {
        const counters = document.querySelectorAll('.hero-stat-number');
        counters.forEach(counter => {
          const text = counter.textContent || '';
          const hasPlus = text.includes('+');
          const hasPercent = text.includes('%');
          const hasSuffix = text.includes('h');
          
          let target;
          if (hasPlus) target = parseInt(text.replace(/[^0-9]/g, ''));
          else if (hasPercent) target = parseInt(text);
          else if (hasSuffix) target = parseInt(text);
          else return;

          let current = 0;
          const duration = 2000;
          const increment = target / (duration / 16);

          const updateCounter = () => {
            current += increment;
            if (current < target) {
              const display = Math.floor(current);
              if (hasPlus) counter.textContent = display.toLocaleString() + '+';
              else if (hasPercent) counter.textContent = display + '%';
              else if (hasSuffix) counter.textContent = display + 'h';
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = text;
            }
          };
          updateCounter();
        });
      };

      heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounters();
            heroObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      const heroStats = document.querySelector('.hero-stats');
      if (heroStats) heroObserver.observe(heroStats);

      // ─── Parallax effect on hero ─────────────────────
      const heroShowcase = document.querySelector('.hero-showcase') as HTMLElement;
      handleMouseMove = (e: MouseEvent) => {
        if (!heroShowcase || window.innerWidth < 1024) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        heroShowcase.style.transform = `translate(${x}px, ${y}px)`;
      };
      window.addEventListener('mousemove', handleMouseMove);

      // ─── Typing effect for hero title (subtle) ───────
      const heroTitle = document.querySelector('.hero-title .highlight') as HTMLElement;
      if (heroTitle) {
        const texts = [
          'productos inolvidables',
          'regalos con alma',
          'marcas que brillan',
          'recuerdos eternos'
        ];
        let textIndex = 0;

        typingInterval = setInterval(() => {
          textIndex = (textIndex + 1) % texts.length;
          heroTitle.style.opacity = '0';
          heroTitle.style.transform = 'translateY(10px)';

          setTimeout(() => {
            heroTitle.textContent = texts[textIndex];
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
          }, 400);
        }, 4000);

        heroTitle.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      }
    }, 100);

    return () => {
      clearTimeout(initDelay);
      if (scrollActive && handleScroll) window.removeEventListener('scroll', handleScroll);
      if (handleMouseMove) window.removeEventListener('mousemove', handleMouseMove);
      if (handleFilterClick) document.removeEventListener('click', handleFilterClick);
      if (typingInterval) clearInterval(typingInterval);
      if (timer) clearTimeout(timer);
      if (revealObserver) revealObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      if (heroObserver) heroObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
