/**
 * Blog Card Interactions
 * Adds dynamic cosmic glow effect that follows mouse movement
 */

// Wait for DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
  // Get all blog cards
  const blogCards = document.querySelectorAll(".blog-card");

  // Add mouse movement tracking to each card
  blogCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      // Calculate mouse position relative to card
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / card.clientWidth) * 100;
      const y = ((e.clientY - rect.top) / card.clientHeight) * 100;

      // Update CSS variables for the glow effect position
      card.style.setProperty("--x", `${x}%`);
      card.style.setProperty("--y", `${y}%`);
    });

    // Reset on mouse leave
    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--x", "50%");
      card.style.setProperty("--y", "50%");
    });
  });

  // Add subtle floating animation to cards
  blogCards.forEach((card, index) => {
    // Set a different animation delay for each card
    card.style.animationDelay = `${index * 0.1}s`;

    // Add floating animation
    const floatingAnimation = () => {
      const randomDuration = 3 + Math.random() * 2; // Between 3-5s
      const randomOffset = Math.random() * 5 + 3; // Between 3-8px

      card.animate(
        [
          { transform: "translateY(0)" },
          { transform: `translateY(-${randomOffset}px)` },
          { transform: "translateY(0)" },
        ],
        {
          duration: randomDuration * 1000,
          iterations: Infinity,
          easing: "ease-in-out",
        }
      );
    };

    // Start floating animation after card appears
    setTimeout(floatingAnimation, 600 + index * 100);
  });
});
