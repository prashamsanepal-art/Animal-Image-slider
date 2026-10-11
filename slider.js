
document.addEventListener("DOMContentLoaded", function () {
    const slider = document.querySelector(".slider");
    const viewport = document.querySelector(".slider-viewport");
    const track = document.querySelector(".slider-track");
    const dotsContainer = document.querySelector(".slider-dots");
    const nextButton = document.querySelector(".next");
    const previousButton = document.querySelector(".previous");
    const counter = document.querySelector(".slide-counter");

    if (
        !slider ||
        !viewport ||
        !track ||
        !dotsContainer ||
        !nextButton ||
        !previousButton
    ) {
        console.error("Slider HTML elements are missing.");
        return;
    }

    const originalSlides = Array.from(track.children);
    const totalSlides = originalSlides.length;

    if (totalSlides === 0) {
        console.error("No slides found.");
        return;
    }

    // Clone the first and last slides for infinite looping.
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[totalSlides - 1].cloneNode(true);

    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");

    track.insertBefore(lastClone, originalSlides[0]);
    track.appendChild(firstClone);

    // Position 1 represents the first original slide.
    let position = 1;
    let isAnimating = false;
    let fallbackTimer;

    function setPosition(animate = true) {
        track.style.transition = animate
            ? "transform 0.5s ease-in-out"
            : "none";

        // Move exactly one viewport width per slide.
        track.style.transform =
            `translateX(-${position * viewport.clientWidth}px)`;
    }

    // Create one clickable dot for every original slide.
    const dots = originalSlides.map(function (_, index) {
        const dot = document.createElement("button");

        dot.type = "button";
        dot.setAttribute("aria-label", `Go to image ${index + 1}`);

        dot.addEventListener("click", function () {
            if (isAnimating) return;

            const targetPosition = index + 1;

            if (targetPosition === position) return;

            moveTo(targetPosition);
        });

        dotsContainer.appendChild(dot);
        return dot;
    });

    function updateInterface() {
        let activeIndex = position - 1;

        if (position === 0) {
            activeIndex = totalSlides - 1;
        } else if (position === totalSlides + 1) {
            activeIndex = 0;
        }

        dots.forEach(function (dot, index) {
            const isActive = index === activeIndex;

            dot.classList.toggle("active", isActive);

            if (isActive) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });

        counter.textContent =
            `Image ${activeIndex + 1} of ${totalSlides}`;
    }

    function moveTo(newPosition) {
        if (isAnimating) return;

        isAnimating = true;
        position = newPosition;

        setPosition(true);
        updateInterface();

        // Fallback in case transitionend does not fire.
        clearTimeout(fallbackTimer);
        fallbackTimer = setTimeout(finishTransition, 700);
    }

    function finishTransition() {
        if (!isAnimating) return;

        clearTimeout(fallbackTimer);

        // Jump to the matching original slide without animation.
        if (position === 0) {
            position = totalSlides;
        } else if (position === totalSlides + 1) {
            position = 1;
        }

        setPosition(false);

        // Apply the reset before enabling the next click.
        track.getBoundingClientRect();

        isAnimating = false;
        updateInterface();
    }

    track.addEventListener("transitionend", function (event) {
        if (
            event.target === track &&
            event.propertyName === "transform"
        ) {
            finishTransition();
        }
    });

    nextButton.addEventListener("click", function () {
        if (isAnimating) return;
        moveTo(position + 1);
    });

    previousButton.addEventListener("click", function () {
        if (isAnimating) return;
        moveTo(position - 1);
    });

    // Keep the correct slide visible when the viewport changes.
    window.addEventListener("resize", function () {
        clearTimeout(fallbackTimer);
        isAnimating = false;
        setPosition(false);
        updateInterface();
    });

    // Display the first original slide on startup.
    setPosition(false);
    updateInterface();
});
