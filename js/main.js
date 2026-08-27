(() => {
    "use strict";

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    /* MENÚ MÓVIL */

    const navToggle = document.getElementById("navToggle");
    const siteNav = document.getElementById("siteNav");

    if (navToggle && siteNav) {

        navToggle.addEventListener("click", () => {

            const isOpen = siteNav.classList.toggle("is-open");

            navToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        });

        siteNav.addEventListener("click", event => {

            if (event.target.closest("a")) {

                siteNav.classList.remove("is-open");

                navToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        });

    }


    /* CONTADORES */

    const counters = document.querySelectorAll("[data-count]");

    function animateCounter(element) {

        const target = Number(element.dataset.count);
        const prefix = element.dataset.prefix || "";

        if (reduceMotion || !target) {

            element.textContent = prefix + target;

            return;
        }

        const duration = 1200;
        const start = performance.now();

        function update(now) {

            const progress = Math.min(
                (now - start) / duration,
                1
            );

            const eased =
                1 - Math.pow(1 - progress, 3);

            element.textContent =
                prefix + Math.round(target * eased);

            if (progress < 1) {
                requestAnimationFrame(update);
            }

        }

        requestAnimationFrame(update);
    }


    if (counters.length) {

        const observer = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        animateCounter(entry.target);

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.4
            }
        );

        counters.forEach(counter => {
            observer.observe(counter);
        });

    }


    /* AÑO DEL FOOTER */

    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }


    /* REVEAL ON SCROLL */

    const revealElements = document.querySelectorAll(".reveal");

    if (revealElements.length && !reduceMotion) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.15
            }
        );

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });

    }

})();