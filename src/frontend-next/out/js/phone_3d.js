/* src/frontend/js/phone_3d.js - CSS 3D Phone Perspective Tilt */

class Phone3DEngine {
  constructor() {
    this.phoneCard = document.querySelector('.hero-phone-card');
    this.wrapper = document.querySelector('.hero-phone-wrapper');
    if (!this.phoneCard || !this.wrapper) return;

    this.init();
  }

  init() {
    let ticking = false;

    window.addEventListener('mousemove', (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleMouseMove(e);
          ticking = false;
        });
        ticking = true;
      }
    });

    this.wrapper.addEventListener('mouseleave', () => {
      this.resetPhoneTransform();
    });
  }

  handleMouseMove(e) {
    const rect = this.wrapper.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Max rotation 12 degrees
    const rotateX = (mouseY / (rect.height / 2)) * -12;
    const rotateY = (mouseX / (rect.width / 2)) * 12;

    this.phoneCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  }

  resetPhoneTransform() {
    this.phoneCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Phone3DEngine();
});
