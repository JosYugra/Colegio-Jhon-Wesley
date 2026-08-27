(() => {
    "use strict";

    /* =================================================================
       Video Player Personalizado
       Colegio Cristiano John Wesley
    ================================================================= */

    /* ---------- SVG Icons ---------- */

    const ICONS = {
        play: '<svg viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21"/></svg>',
        pause: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>',
        volumeHigh: '<svg viewBox="0 0 24 24"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><path d="M14,7.5c1.5,1 2.5,2.5 2.5,4.5s-1,3.5-2.5,4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M17,5c2.5,2 4,4.5 4,7s-1.5,5-4,7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        volumeMute: '<svg viewBox="0 0 24 24"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        fullscreen: '<svg viewBox="0 0 24 24"><polyline points="15,3 21,3 21,9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="9,21 3,21 3,15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        fullscreenExit: '<svg viewBox="0 0 24 24"><polyline points="10,3 3,3 3,10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="21,14 21,21 14,21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };

    const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];


    /* ---------- Utilidades ---------- */

    function formatTime(sec) {
        if (!isFinite(sec)) return "0:00";
        const s = Math.floor(sec);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        const mm = m % 60;
        const ss = s % 60;
        if (h > 0) {
            return h + ":" + String(mm).padStart(2, "0") + ":" + String(ss).padStart(2, "0");
        }
        return m + ":" + String(ss).padStart(2, "0");
    }


    /* ---------- Construcción del DOM ---------- */

    function buildPlayer(container) {

        const videoSrc = container.dataset.src;
        const posterSrc = container.dataset.poster || "";
        const title = container.dataset.title || "Video del Colegio";

        // Video element
        const video = document.createElement("video");
        video.preload = "metadata";
        video.playsInline = true;
        video.setAttribute("title", title);
        if (posterSrc) video.setAttribute("poster", posterSrc);

        const source = document.createElement("source");
        source.src = videoSrc;
        source.type = "video/mp4";
        video.appendChild(source);

        // Poster overlay
        const poster = document.createElement("div");
        poster.className = "vp-poster";
        if (posterSrc) {
            poster.style.backgroundImage = "url('" + posterSrc + "')";
        }
        poster.setAttribute("aria-hidden", "true");

        // Play button on poster
        const playBtnBig = document.createElement("button");
        playBtnBig.className = "vp-play-btn";
        playBtnBig.setAttribute("aria-label", "Reproducir video");
        playBtnBig.innerHTML = ICONS.play;
        poster.appendChild(playBtnBig);

        // Loading
        const loading = document.createElement("div");
        loading.className = "vp-loading";
        loading.innerHTML = '<div class="vp-loading-spinner"></div>';

        // Controls bar
        const controls = document.createElement("div");
        controls.className = "vp-controls";

        // Progress
        const progressWrap = document.createElement("div");
        progressWrap.className = "vp-progress-wrap";
        progressWrap.setAttribute("role", "slider");
        progressWrap.setAttribute("aria-label", "Barra de progreso");
        progressWrap.setAttribute("aria-valuemin", "0");
        progressWrap.setAttribute("aria-valuemax", "100");
        progressWrap.setAttribute("aria-valuenow", "0");
        progressWrap.setAttribute("tabindex", "0");

        const progressBuffered = document.createElement("div");
        progressBuffered.className = "vp-progress-buffered";

        const progressBar = document.createElement("div");
        progressBar.className = "vp-progress-bar";

        const progressThumb = document.createElement("div");
        progressThumb.className = "vp-progress-thumb";

        progressWrap.appendChild(progressBuffered);
        progressWrap.appendChild(progressBar);
        progressWrap.appendChild(progressThumb);

        // Buttons row
        const buttons = document.createElement("div");
        buttons.className = "vp-buttons";

        // Play/Pause
        const playPauseBtn = document.createElement("button");
        playPauseBtn.className = "vp-btn vp-playpause";
        playPauseBtn.setAttribute("aria-label", "Reproducir");
        playPauseBtn.innerHTML = ICONS.play;

        // Time
        const timeEl = document.createElement("span");
        timeEl.className = "vp-time";
        timeEl.innerHTML = '<span class="vp-time-current">0:00</span><span class="vp-time-separator">/</span><span class="vp-time-duration">0:00</span>';

        // Spacer
        const spacer = document.createElement("div");
        spacer.className = "vp-spacer";

        // Volume
        const volumeWrap = document.createElement("div");
        volumeWrap.className = "vp-volume-wrap";

        const volumeBtn = document.createElement("button");
        volumeBtn.className = "vp-btn vp-volume";
        volumeBtn.setAttribute("aria-label", "Silenciar");
        volumeBtn.innerHTML = ICONS.volumeHigh;

        const volumeSlider = document.createElement("input");
        volumeSlider.className = "vp-volume-slider";
        volumeSlider.type = "range";
        volumeSlider.min = "0";
        volumeSlider.max = "1";
        volumeSlider.step = "0.05";
        volumeSlider.value = "1";
        volumeSlider.setAttribute("aria-label", "Volumen");

        volumeWrap.appendChild(volumeBtn);
        volumeWrap.appendChild(volumeSlider);

        // Speed
        const speedWrap = document.createElement("div");
        speedWrap.style.position = "relative";

        const speedBtn = document.createElement("button");
        speedBtn.className = "vp-btn vp-speed-btn";
        speedBtn.setAttribute("aria-label", "Velocidad de reproducción");
        speedBtn.innerHTML = "<span>1x</span>";

        const speedMenu = document.createElement("div");
        speedMenu.className = "vp-speed-menu";

        SPEEDS.forEach(s => {
            const opt = document.createElement("button");
            opt.className = "vp-speed-option" + (s === 1 ? " is-active" : "");
            opt.textContent = s + "x";
            opt.dataset.speed = s;
            speedMenu.appendChild(opt);
        });

        speedWrap.appendChild(speedBtn);
        speedWrap.appendChild(speedMenu);

        // Fullscreen
        const fsBtn = document.createElement("button");
        fsBtn.className = "vp-btn vp-fullscreen";
        fsBtn.setAttribute("aria-label", "Pantalla completa");
        fsBtn.innerHTML = ICONS.fullscreen;

        // Assemble buttons row
        buttons.appendChild(playPauseBtn);
        buttons.appendChild(timeEl);
        buttons.appendChild(spacer);
        buttons.appendChild(volumeWrap);
        buttons.appendChild(speedWrap);
        buttons.appendChild(fsBtn);

        // Assemble controls
        controls.appendChild(progressWrap);
        controls.appendChild(buttons);

        // Assemble container
        container.appendChild(video);
        container.appendChild(poster);
        container.appendChild(loading);
        container.appendChild(controls);

        return {
            video, poster, playBtnBig, loading, controls,
            progressWrap, progressBar, progressBuffered, progressThumb,
            playPauseBtn, timeEl, volumeBtn, volumeSlider,
            speedWrap, speedBtn, speedMenu, fsBtn
        };
    }


    /* ---------- Inicializar cada reproductor ---------- */

    function initPlayer(container) {

        const els = buildPlayer(container);
        const { video, poster, playBtnBig, loading, controls,
                progressWrap, progressBar, progressBuffered, progressThumb,
                playPauseBtn, timeEl, volumeBtn, volumeSlider,
                speedWrap, speedBtn, speedMenu, fsBtn } = els;

        let hideTimer = null;
        let controlsVisible = true;
        let isSeeking = false;

        /* -- Play / Pause -- */

        function play() {
            video.play().catch(() => {});
        }

        function pause() {
            video.pause();
        }

        function togglePlay() {
            if (video.paused || video.ended) {
                play();
            } else {
                pause();
            }
        }

        /* -- Actualizar estado visual -- */

        function updatePlayState() {
            const paused = video.paused || video.ended;
            playPauseBtn.innerHTML = paused ? ICONS.play : ICONS.pause;
            playPauseBtn.setAttribute("aria-label", paused ? "Reproducir" : "Pausar");

            if (paused) {
                poster.classList.remove("is-hidden");
                playBtnBig.classList.remove("is-hidden");
                controls.classList.add("is-hidden");
            } else {
                poster.classList.add("is-hidden");
                playBtnBig.classList.add("is-hidden");
                showControls();
                resetHideTimer();
            }
        }

        /* -- Progreso -- */

        function updateProgress() {
            if (isSeeking) return;
            const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
            progressBar.style.width = pct + "%";
            progressThumb.style.left = pct + "%";
            progressWrap.setAttribute("aria-valuenow", Math.round(pct));

            const cur = timeEl.querySelector(".vp-time-current");
            const dur = timeEl.querySelector(".vp-time-duration");
            cur.textContent = formatTime(video.currentTime);
            dur.textContent = formatTime(video.duration);
        }

        function updateBuffered() {
            if (video.buffered.length > 0) {
                const end = video.buffered.end(video.buffered.length - 1);
                const pct = video.duration ? (end / video.duration) * 100 : 0;
                progressBuffered.style.width = pct + "%";
            }
        }

        /* -- Seek -- */

        function seekFromEvent(e) {
            const rect = progressWrap.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const pct = x / rect.width;
            if (video.duration) {
                video.currentTime = pct * video.duration;
            }
            progressBar.style.width = (pct * 100) + "%";
            progressThumb.style.left = (pct * 100) + "%";
        }

        progressWrap.addEventListener("mousedown", e => {
            isSeeking = true;
            seekFromEvent(e);
        });

        document.addEventListener("mousemove", e => {
            if (isSeeking) seekFromEvent(e);
        });

        document.addEventListener("mouseup", () => {
            if (isSeeking) isSeeking = false;
        });

        // Touch
        progressWrap.addEventListener("touchstart", e => {
            isSeeking = true;
            seekFromEvent(e.touches[0]);
        }, { passive: true });

        progressWrap.addEventListener("touchmove", e => {
            if (isSeeking) seekFromEvent(e.touches[0]);
        }, { passive: true });

        progressWrap.addEventListener("touchend", () => {
            isSeeking = false;
        });

        // Keyboard on progress
        progressWrap.addEventListener("keydown", e => {
            if (e.key === "ArrowRight") {
                video.currentTime = Math.min(video.currentTime + 5, video.duration || 0);
            } else if (e.key === "ArrowLeft") {
                video.currentTime = Math.max(video.currentTime - 5, 0);
            }
        });


        /* -- Volumen -- */

        function updateVolumeIcon() {
            const muted = video.muted || video.volume === 0;
            volumeBtn.innerHTML = muted ? ICONS.volumeMute : ICONS.volumeHigh;
            volumeBtn.setAttribute("aria-label", muted ? "Activar sonido" : "Silenciar");
        }

        volumeBtn.addEventListener("click", () => {
            video.muted = !video.muted;
            if (!video.muted && video.volume === 0) {
                video.volume = 0.5;
                volumeSlider.value = "0.5";
            }
            updateVolumeIcon();
        });

        volumeSlider.addEventListener("input", () => {
            video.volume = parseFloat(volumeSlider.value);
            video.muted = video.volume === 0;
            updateVolumeIcon();
        });


        /* -- Velocidad -- */

        speedBtn.addEventListener("click", e => {
            e.stopPropagation();
            speedMenu.classList.toggle("is-open");
        });

        speedMenu.addEventListener("click", e => {
            const opt = e.target.closest(".vp-speed-option");
            if (!opt) return;
            const rate = parseFloat(opt.dataset.speed);
            video.playbackRate = rate;
            speedBtn.innerHTML = "<span>" + rate + "x</span>";
            speedMenu.querySelectorAll(".vp-speed-option").forEach(o =>
                o.classList.toggle("is-active", parseFloat(o.dataset.speed) === rate)
            );
            speedMenu.classList.remove("is-open");
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener("click", e => {
            if (!speedWrap.contains(e.target)) {
                speedMenu.classList.remove("is-open");
            }
        });


        /* -- Pantalla completa -- */

        function isFullscreen() {
            return document.fullscreenElement || document.webkitFullscreenElement;
        }

        function toggleFullscreen() {
            if (isFullscreen()) {
                (document.exitFullscreen || document.webkitExitFullscreen).call(document);
            } else {
                (container.requestFullscreen || container.webkitRequestFullscreen).call(container);
            }
        }

        fsBtn.addEventListener("click", toggleFullscreen);

        document.addEventListener("fullscreenchange", updateFsIcon);
        document.addEventListener("webkitfullscreenchange", updateFsIcon);

        function updateFsIcon() {
            fsBtn.innerHTML = isFullscreen() ? ICONS.fullscreenExit : ICONS.fullscreen;
            fsBtn.setAttribute("aria-label", isFullscreen() ? "Salir de pantalla completa" : "Pantalla completa");
        }


        /* -- Controles auto-hide -- */

        function showControls() {
            controls.classList.remove("is-hidden");
            controlsVisible = true;
            container.style.cursor = "";
        }

        function hideControls() {
            if (video.paused || video.ended) return;
            controls.classList.add("is-hidden");
            controlsVisible = false;
            container.style.cursor = "none";
        }

        function resetHideTimer() {
            clearTimeout(hideTimer);
            showControls();
            hideTimer = setTimeout(hideControls, 3000);
        }

        container.addEventListener("mousemove", resetHideTimer);
        container.addEventListener("mouseleave", () => {
            if (!video.paused) {
                clearTimeout(hideTimer);
                hideTimer = setTimeout(hideControls, 800);
            }
        });

        // Touch: tap para mostrar/ocultar
        container.addEventListener("click", e => {
            // No interferir con controles
            if (e.target.closest(".vp-controls") || e.target.closest(".vp-poster")) return;

            if (controlsVisible && !video.paused) {
                hideControls();
            } else {
                resetHideTimer();
            }
        });


        /* -- Eventos de video -- */

        video.addEventListener("play", updatePlayState);
        video.addEventListener("pause", updatePlayState);
        video.addEventListener("ended", updatePlayState);
        video.addEventListener("timeupdate", updateProgress);
        video.addEventListener("progress", updateBuffered);
        video.addEventListener("loadedmetadata", updateProgress);

        video.addEventListener("waiting", () => loading.classList.add("is-visible"));
        video.addEventListener("canplay", () => loading.classList.remove("is-visible"));
        video.addEventListener("playing", () => loading.classList.remove("is-hidden"));

        // Click en poster → play
        poster.addEventListener("click", e => {
            e.stopPropagation();
            play();
        });

        // Click en play button grande → play
        playBtnBig.addEventListener("click", e => {
            e.stopPropagation();
            play();
        });

        // Botón play/pause barra
        playPauseBtn.addEventListener("click", e => {
            e.stopPropagation();
            togglePlay();
        });

        // Doble clic → fullscreen
        video.addEventListener("dblclick", e => {
            e.preventDefault();
            toggleFullscreen();
        });

        // Click en video → toggle play (solo si no hay controles)
        video.addEventListener("click", e => {
            if (e.target.closest(".vp-controls")) return;
            togglePlay();
        });

        // Teclado
        container.setAttribute("tabindex", "0");
        container.addEventListener("keydown", e => {
            switch (e.key) {
                case " ":
                case "k":
                    e.preventDefault();
                    togglePlay();
                    break;
                case "f":
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case "m":
                    e.preventDefault();
                    video.muted = !video.muted;
                    updateVolumeIcon();
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    video.volume = Math.min(video.volume + 0.1, 1);
                    volumeSlider.value = video.volume;
                    updateVolumeIcon();
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    video.volume = Math.max(video.volume - 0.1, 0);
                    volumeSlider.value = video.volume;
                    updateVolumeIcon();
                    break;
            }
        });

        // Init
        updatePlayState();
        updateVolumeIcon();
    }


    /* ---------- Auto-init ---------- */

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".vp-container").forEach(initPlayer);
    });

})();
