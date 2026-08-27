(() => {
    "use strict";

    const colors = ["#2ea3f2", "#00923f", "#1c7fc4", "#e67e22", "#8e44ad", "#e74c3c"];
    const byId = (id) => document.getElementById(id);

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function createCover(revista, readerUrl) {
        const cover = element("a", "revista-card-cover");
        cover.href = readerUrl;
        cover.style.backgroundColor = colors[Number(revista.id) % colors.length] || colors[0];
        cover.setAttribute("aria-label", `Leer ${revista.titulo}`);
        const fallback = element("span", "revista-card-placeholder", "Portada no disponible");
        fallback.hidden = Boolean(revista.portadaUrl);
        cover.append(fallback);
        if (revista.portadaUrl) {
            const image = document.createElement("img");
            image.src = revista.portadaUrl;
            image.alt = `Portada de ${revista.titulo}`;
            image.loading = "lazy";
            image.addEventListener("error", () => { image.remove(); fallback.hidden = false; }, { once: true });
            cover.append(image);
        }
        cover.append(element("span", "revista-card-cover-action", "Abrir edición"));
        return cover;
    }

    function createCard(revista) {
        const readerUrl = `lector.html?revista=${encodeURIComponent(revista.id)}`;
        const card = element("article", "revista-card");
        const body = element("div", "revista-card-body");
        const read = element("a", "revista-card-link revista-card-read");
        read.href = readerUrl;
        const arrow = element("span", "", "→");
        arrow.setAttribute("aria-hidden", "true");
        read.append("Leer revista ", arrow);
        body.append(
            element("p", "revista-card-meta", `${revista.mes}${revista.anio ? ` ${revista.anio}` : ""}`),
            element("h3", "revista-card-title", revista.titulo),
            element("p", "revista-card-description", revista.descripcion),
            read
        );
        card.append(createCover(revista, readerUrl), body);
        return card;
    }

    function showCatalogState(name) {
        byId("revistasLoading").hidden = name !== "loading";
        byId("revistasEmpty").hidden = name !== "empty";
        byId("revistasError").hidden = name !== "error";
        byId("revistasGrid").hidden = name !== "ready";
    }

    async function renderCatalog(force = false) {
        const grid = byId("revistasGrid");
        if (!grid) return;
        if (!window.RevistasAPI) {
            console.error("No se cargó el módulo de datos de revistas.");
            showCatalogState("error");
            return;
        }
        showCatalogState("loading");
        try {
            const revistas = await window.RevistasAPI.getAll({ force });
            if (!revistas.length) {
                grid.replaceChildren();
                showCatalogState("empty");
                return;
            }
            grid.replaceChildren(...revistas.map(createCard));
            showCatalogState("ready");
        } catch (error) {
            console.error("No se pudo cargar el catálogo de revistas.", error);
            grid.replaceChildren();
            showCatalogState("error");
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        byId("revistasRetry")?.addEventListener("click", () => renderCatalog(true));
        renderCatalog();
        const year = byId("year");
        if (year) year.textContent = new Date().getFullYear();
    });
})();
