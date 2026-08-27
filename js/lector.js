(() => {
    "use strict";

    const MOBILE_BREAKPOINT = 760;
    const FLIP_DURATION = 400;
    const ZOOM_STEP = 0.15;
    const state = {
        magazine: null,
        currentPage: 1,
        totalPages: 0,
        zoom: 1,
        animating: false,
        renderVersion: 0,
        mobile: window.innerWidth < MOBILE_BREAKPOINT,
        imageCache: new Map()
    };

    const el = Object.fromEntries([
        "readerTitle", "readerLoading", "loadingDetail", "readerError", "readerErrorDetail", "retryButton",
        "bookStage", "book", "leftPage", "rightPage", "leftCanvas", "rightCanvas",
        "leftNumber", "rightNumber", "bookNavigation", "previousPage", "nextPage",
        "pageInput", "totalPages", "zoomOut", "zoomIn", "fitPage", "fullscreen"
    ].map((id) => [id, document.getElementById(id)]));

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function selectedId() {
        const params = new URLSearchParams(window.location.search);
        return params.get("revista") || params.get("id");
    }

    function showState(name) {
        el.readerLoading.hidden = name !== "loading";
        el.readerError.hidden = name !== "error";
        el.bookStage.hidden = name !== "ready";
        el.bookNavigation.hidden = name !== "ready";
    }

    function pageImageUrl(pageNumber) {
        return `${state.magazine.pagesBaseUrl}/page-${String(pageNumber).padStart(3, "0")}.jpg`;
    }

    function loadPageImage(pageNumber) {
        if (state.imageCache.has(pageNumber)) return state.imageCache.get(pageNumber);
        const promise = new Promise((resolve, reject) => {
            const image = new Image();
            image.decoding = "async";
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`PAGE_IMAGE_${pageNumber}`));
            image.src = pageImageUrl(pageNumber);
        }).catch((error) => {
            state.imageCache.delete(pageNumber);
            throw error;
        });
        state.imageCache.set(pageNumber, promise);
        return promise;
    }

    function describeLoadError(error) {
        const message = String(error?.message || error || "");
        if (message.startsWith("PAGE_IMAGE_")) return "No fue posible cargar una de las páginas de esta revista.";
        return "No fue posible preparar la revista. Comprueba que sus páginas estén publicadas y vuelve a intentarlo.";
    }

    function failReader(error) {
        console.error("No se pudo preparar la revista.", error);
        el.readerErrorDetail.textContent = describeLoadError(error);
        state.animating = false;
        showState("error");
    }

    async function loadMagazine() {
        showState("loading");
        el.loadingDetail.textContent = "Preparando la portada";
        el.readerErrorDetail.textContent = "Comprueba tu conexión e inténtalo nuevamente.";
        state.renderVersion += 1;
        state.imageCache.clear();
        state.animating = false;

        try {
            state.magazine = await window.RevistasAPI.getById(selectedId());
            if (!state.magazine) throw new Error("Revista no encontrada");
            if (!state.magazine.pagesBaseUrl || !state.magazine.totalPages) throw new Error("Revista sin páginas optimizadas");

            el.readerTitle.textContent = state.magazine.titulo;
            document.title = `${state.magazine.titulo} — Lector`;
            state.totalPages = state.magazine.totalPages;
            state.currentPage = 1;
            state.zoom = 1;
            el.totalPages.textContent = state.totalPages;

            await loadPageImage(1);
            showState("ready");
            await renderCurrentPages();
        } catch (error) {
            failReader(error);
        }
    }

    function pagePair(page = state.currentPage) {
        if (state.mobile || page === 1) return [null, page];
        const left = page % 2 === 0 ? page : page - 1;
        return [left, left + 1 <= state.totalPages ? left + 1 : null];
    }

    function normalizeTarget(page) {
        const bounded = Math.max(1, Math.min(state.totalPages, page));
        if (state.mobile || bounded === 1) return bounded;
        return bounded % 2 === 0 ? bounded : bounded - 1;
    }

    async function renderPage(pageNumber, canvas, container, numberLabel, version) {
        if (!pageNumber) {
            container.hidden = true;
            return;
        }

        container.hidden = false;
        const image = await loadPageImage(pageNumber);
        if (version !== state.renderVersion) return;

        const stageRect = el.bookStage.getBoundingClientRect();
        const slots = state.mobile || state.currentPage === 1 ? 1 : 2;
        const maxWidth = Math.max(220, (stageRect.width - (state.mobile ? 20 : 70)) / slots);
        const maxHeight = Math.max(280, stageRect.height - 30);
        const fitScale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
        const width = Math.round(image.naturalWidth * fitScale * state.zoom);
        const height = Math.round(image.naturalHeight * fitScale * state.zoom);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        container.style.width = canvas.style.width;
        container.style.height = canvas.style.height;
        numberLabel.textContent = pageNumber;

        const context = canvas.getContext("2d", { alpha: false });
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
    }

    function preloadNearby() {
        const keep = new Set();
        for (let page = state.currentPage - 2; page <= state.currentPage + 3; page += 1) {
            if (page >= 1 && page <= state.totalPages) {
                keep.add(page);
                loadPageImage(page).catch(() => {});
            }
        }
        for (const page of state.imageCache.keys()) {
            if (!keep.has(page)) state.imageCache.delete(page);
        }
    }

    /* Renderiza una imagen en un canvas offscreen sin tocar el DOM */
    function renderToBuffer(image) {
        const stageRect = el.bookStage.getBoundingClientRect();
        const slots = state.mobile || state.currentPage === 1 ? 1 : 2;
        const maxWidth = Math.max(220, (stageRect.width - (state.mobile ? 20 : 70)) / slots);
        const maxHeight = Math.max(280, stageRect.height - 30);
        const fitScale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
        const width = Math.round(image.naturalWidth * fitScale * state.zoom);
        const height = Math.round(image.naturalHeight * fitScale * state.zoom);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const buffer = document.createElement("canvas");
        buffer.width = Math.round(width * dpr);
        buffer.height = Math.round(height * dpr);
        const ctx = buffer.getContext("2d", { alpha: false });
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);
        return { buffer, width, height };
    }

    /* Aplica un buffer offscreen a un canvas visible */
    function applyBuffer(bufferData, canvas, container, numberLabel, pageNumber) {
        canvas.width = bufferData.buffer.width;
        canvas.height = bufferData.buffer.height;
        canvas.style.width = `${bufferData.width}px`;
        canvas.style.height = `${bufferData.height}px`;
        container.style.width = canvas.style.width;
        container.style.height = canvas.style.height;
        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.drawImage(bufferData.buffer, 0, 0);
        if (pageNumber) numberLabel.textContent = pageNumber;
    }

    async function renderCurrentPages() {
        state.renderVersion += 1;
        const version = state.renderVersion;
        const [left, right] = pagePair();
        el.book.classList.toggle("is-cover", state.currentPage === 1);
        el.book.classList.toggle("is-single", state.mobile || state.currentPage === 1);
        await Promise.all([
            renderPage(left, el.leftCanvas, el.leftPage, el.leftNumber, version),
            renderPage(right, el.rightCanvas, el.rightPage, el.rightNumber, version)
        ]);
        if (version !== state.renderVersion) return;
        el.pageInput.value = state.currentPage;
        updateControls();
        preloadNearby();
    }

    function updateControls() {
        el.previousPage.disabled = state.currentPage <= 1 || state.animating;
        const lastVisible = pagePair().filter(Boolean).at(-1) || 1;
        el.nextPage.disabled = lastVisible >= state.totalPages || state.animating;
        el.pageInput.setAttribute("aria-label", `Página actual ${state.currentPage} de ${state.totalPages}. Escribe un número y presiona Enter`);
    }

    async function goToPage(page, direction) {
        const target = normalizeTarget(page);
        if (state.animating || target === state.currentPage) return;
        const resolvedDirection = direction || (target > state.currentPage ? "next" : "previous");
        state.animating = true;
        updateControls();

        try {
            /* 1. Cargar imágenes + renderizar a buffers offscreen ANTES de la animación */
            const targetPages = pagePair(target).filter(Boolean);
            const images = await Promise.all(targetPages.map(loadPageImage));
            const buffers = images.map((img) => renderToBuffer(img));

            /* 2. Animación */
            if (!prefersReducedMotion) {
                el.book.classList.add(resolvedDirection === "next" ? "flip-next" : "flip-previous");

                /* Safety: quitar la clase si se queda pegada */
                const safetyTimer = setTimeout(() => {
                    el.book.classList.remove("flip-next", "flip-previous");
                }, FLIP_DURATION + 100);

                /* Esperar a que la página vieja quede de borde (invisible) */
                await new Promise((resolve) => setTimeout(resolve, FLIP_DURATION * 0.45));

                /* 3. Swap: aplicar buffers al DOM en un frame, cuando nada es visible */
                await new Promise((resolve) => {
                    requestAnimationFrame(() => {
                        const [leftPage, rightPage] = targetPages;
                        if (leftPage) {
                            applyBuffer(buffers[0], el.leftCanvas, el.leftPage, el.leftNumber, leftPage);
                            el.leftPage.hidden = false;
                        } else {
                            el.leftPage.hidden = true;
                        }
                        if (rightPage) {
                            const rightBuf = leftPage ? buffers[1] : buffers[0];
                            applyBuffer(rightBuf, el.rightCanvas, el.rightPage, el.rightNumber, rightPage);
                            el.rightPage.hidden = false;
                        } else {
                            el.rightPage.hidden = true;
                        }
                        resolve();
                    });
                });

                state.currentPage = target;
                el.book.classList.toggle("is-cover", state.currentPage === 1);
                el.book.classList.toggle("is-single", state.mobile || state.currentPage === 1);
                el.pageInput.value = state.currentPage;
                updateControls();
                preloadNearby();

                /* Esperar a que termine la animación */
                await new Promise((resolve) => setTimeout(resolve, FLIP_DURATION * 0.55));
                clearTimeout(safetyTimer);
                el.book.classList.remove("flip-next", "flip-previous");
            } else {
                /* Sin animación: render directo */
                const [leftPage, rightPage] = targetPages;
                if (leftPage) {
                    applyBuffer(buffers[0], el.leftCanvas, el.leftPage, el.leftNumber, leftPage);
                    el.leftPage.hidden = false;
                } else {
                    el.leftPage.hidden = true;
                }
                if (rightPage) {
                    const rightBuf = leftPage ? buffers[1] : buffers[0];
                    applyBuffer(rightBuf, el.rightCanvas, el.rightPage, el.rightNumber, rightPage);
                    el.rightPage.hidden = false;
                } else {
                    el.rightPage.hidden = true;
                }
                state.currentPage = target;
                el.book.classList.toggle("is-cover", state.currentPage === 1);
                el.book.classList.toggle("is-single", state.mobile || state.currentPage === 1);
                el.pageInput.value = state.currentPage;
                updateControls();
                preloadNearby();
            }
        } catch (error) {
            el.book.classList.remove("flip-next", "flip-previous");
            failReader(error);
            return;
        }

        state.animating = false;
        updateControls();
    }

    function previousTarget() {
        return state.mobile ? state.currentPage - 1 : (state.currentPage <= 2 ? 1 : state.currentPage - 2);
    }

    function nextTarget() {
        return state.mobile ? state.currentPage + 1 : (state.currentPage === 1 ? 2 : state.currentPage + 2);
    }

    function submitPage() {
        const value = Number(el.pageInput.value);
        if (!Number.isInteger(value) || value < 1 || value > state.totalPages) {
            el.pageInput.value = state.currentPage;
            el.pageInput.classList.add("is-invalid");
            setTimeout(() => el.pageInput.classList.remove("is-invalid"), 450);
            return;
        }
        goToPage(value);
    }

    function setZoom(value) {
        state.zoom = Math.max(.65, Math.min(2, value));
        renderCurrentPages().catch(failReader);
    }

    el.previousPage.addEventListener("click", () => goToPage(previousTarget(), "previous"));
    el.nextPage.addEventListener("click", () => goToPage(nextTarget(), "next"));
    el.retryButton.addEventListener("click", loadMagazine);
    el.zoomOut.addEventListener("click", () => setZoom(state.zoom - ZOOM_STEP));
    el.zoomIn.addEventListener("click", () => setZoom(state.zoom + ZOOM_STEP));
    el.fitPage.addEventListener("click", () => setZoom(1));
    el.pageInput.addEventListener("input", () => { el.pageInput.value = el.pageInput.value.replace(/\D/g, ""); });
    el.pageInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") { event.preventDefault(); submitPage(); }
    });
    el.pageInput.addEventListener("blur", () => { el.pageInput.value = state.currentPage; });
    el.fullscreen.addEventListener("click", async () => {
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await document.documentElement.requestFullscreen();
        } catch (_) { /* Pantalla completa es opcional. */ }
    });

    document.addEventListener("keydown", (event) => {
        if (document.activeElement === el.pageInput) return;
        if (event.key === "ArrowLeft") { event.preventDefault(); goToPage(previousTarget(), "previous"); }
        if (event.key === "ArrowRight") { event.preventDefault(); goToPage(nextTarget(), "next"); }
    });

    let touchStartX = 0;
    let touchStartY = 0;
    el.bookStage.addEventListener("touchstart", (event) => {
        touchStartX = event.changedTouches[0].clientX;
        touchStartY = event.changedTouches[0].clientY;
    }, { passive: true });
    el.bookStage.addEventListener("touchend", (event) => {
        const dx = event.changedTouches[0].clientX - touchStartX;
        const dy = event.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
        if (dx < 0) goToPage(nextTarget(), "next");
        else goToPage(previousTarget(), "previous");
    }, { passive: true });

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const mobileNow = window.innerWidth < MOBILE_BREAKPOINT;
            if (mobileNow !== state.mobile) {
                state.mobile = mobileNow;
                state.currentPage = normalizeTarget(state.currentPage);
            }
            if (state.magazine) renderCurrentPages().catch(failReader);
        }, 180);
    });

    loadMagazine();
})();
