(() => {
    "use strict";

    const siteRoot = new URL("../", document.currentScript.src);
    let cache = null;

    function firstValue(source, names) {
        for (const name of names) {
            const value = source?.[name];
            if (value !== undefined && value !== null && value !== "") return value;
        }
        return null;
    }

    function assetUrl(value) {
        if (typeof value !== "string" || !value.trim()) return null;
        try { return new URL(value.trim().replace(/\\/g, "/"), siteRoot).href; }
        catch (_) { return null; }
    }

    function normalizeMagazine(item, index) {
        if (!item || typeof item !== "object") return null;
        const id = firstValue(item, ["id", "revista_id", "revistaId"]);
        const titulo = firstValue(item, ["titulo", "title", "nombre"]);
        const fecha = firstValue(item, ["fecha", "date", "published_at", "fecha_publicacion"]);
        const portada = firstValue(item, ["portada", "cover", "imagen", "image", "portada_url"]);
        const pdf = firstValue(item, ["pdf_url", "pdfUrl", "pdf", "archivo", "documento"]);
        const paginas = firstValue(item, ["paginas", "pages", "pages_path"]);
        const totalPaginas = Number(firstValue(item, ["total_paginas", "totalPages", "page_count"]));
        if (id === null || !titulo || !paginas || !Number.isInteger(totalPaginas) || totalPaginas < 1) {
            console.warn(`Revista omitida en la posición ${index}: faltan id, título o páginas optimizadas.`);
            return null;
        }
        const parsedDate = fecha ? new Date(fecha) : null;
        const validDate = parsedDate && !Number.isNaN(parsedDate.getTime());
        return Object.freeze({
            id: String(id),
            titulo: String(titulo),
            descripcion: String(firstValue(item, ["descripcion", "description", "resumen"]) || "Conoce esta edición de nuestra revista institucional."),
            fecha: validDate ? parsedDate.toISOString() : "",
            mes: String(firstValue(item, ["mes", "month"]) || (validDate ? new Intl.DateTimeFormat("es", { month: "long" }).format(parsedDate) : "Edición")),
            anio: String(firstValue(item, ["anio", "year"]) || (validDate ? parsedDate.getFullYear() : "")),
            portadaUrl: assetUrl(portada),
            pdfUrl: assetUrl(pdf),
            pagesBaseUrl: assetUrl(paginas),
            totalPages: totalPaginas
        });
    }

    function requestCatalog(force = false) {
        if (force) cache = null;
        if (cache) return cache;
        if (!Array.isArray(window.REVISTAS_CATALOG)) {
            throw new Error("No se cargó el catálogo local de revistas");
        }
        cache = window.REVISTAS_CATALOG.map(normalizeMagazine).filter(Boolean).sort((a, b) => {
            const byDate = (Date.parse(b.fecha) || 0) - (Date.parse(a.fecha) || 0);
            return byDate || String(b.id).localeCompare(String(a.id), undefined, { numeric: true });
        });
        return cache;
    }

    const copy = (item) => item ? { ...item } : null;
    window.RevistasAPI = Object.freeze({
        async getAll(options = {}) { return (await requestCatalog(Boolean(options.force))).map(copy); },
        async getById(id, options = {}) {
            const revistas = await requestCatalog(Boolean(options.force));
            return copy(revistas.find((revista) => revista.id === String(id)));
        }
    });
})();
