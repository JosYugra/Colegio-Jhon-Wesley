(() => {
    "use strict";

    const mapElement = document.getElementById("map");

    if (!mapElement || typeof L === "undefined") {
        console.error("No se pudo cargar Leaflet.");
        return;
    }

    const coordinates = [-16.402979700, -71.5383686];

    const map = L.map(mapElement, {
        scrollWheelZoom: false
    }).setView(coordinates, 17);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
    ).addTo(map);

    L.marker(coordinates)
        .addTo(map)
        .bindPopup(`
            <strong>Colegio Cristiano John Wesley</strong><br>
            La Merced 411, Cercado<br>
            Arequipa, Perú
        `)
        .openPopup();

})();