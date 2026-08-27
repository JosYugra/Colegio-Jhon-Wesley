/* ==========================================================================
   Calendario Académico — Colegio Cristiano John Wesley
   Datos embebidos + agenda diaria automática
   ========================================================================== */

(() => {
    "use strict";

    const YEAR = 2026;

    /* ---------- DATOS DEL CALENDARIO ---------- */
    const allEvents = [
        /* ===== AGOSTO ===== */
        { id:1,  fecha:"2026-08-07",  fecha_fin:null,          titulo:"Retiro de primaria",                                       descripcion:"Retiro de primaria",                                                nivel:["P"],             categoria:"evento", icono:"🏫" },
        { id:2,  fecha:"2026-08-13",  fecha_fin:null,          titulo:"Entrega de libretas II Bimestre",                           descripcion:"Entrega de libretas II Bimestre / Reunión de aula / Escuela de Padres Nº 03", nivel:["I","P","S"], categoria:"evento", icono:"📋" },
        { id:3,  fecha:"2026-08-14",  fecha_fin:null,          titulo:"Programa Especial — Día de Arequipa",                       descripcion:"Programa Especial por día de Arequipa (último bloque) grados impares", nivel:["I","P","S"],  categoria:"evento", icono:"🎊" },
        { id:4,  fecha:"2026-08-27",  fecha_fin:"2026-08-28",  titulo:"Campamento de Vitor",                                       descripcion:"Retiro de secundaria — Campamento de Vitor",                       nivel:["S"],            categoria:"evento", icono:"⛺" },

        /* ===== SETIEMBRE ===== */
        { id:5,  fecha:"2026-09-01",  fecha_fin:"2026-10-02",  titulo:"Juegos Florales",                                           descripcion:"Juegos Florales",                                                   nivel:["I","P","S"],    categoria:"evento", icono:"🏆" },
        { id:6,  fecha:"2026-09-07",  fecha_fin:null,          titulo:"Ranking de Conocimientos Nº 2",                             descripcion:"Ranking de Conocimientos Nº 2 (Desde 5ºP hasta 5ºS)",               nivel:["P","S"],        categoria:"evento", icono:"📝" },
        { id:7,  fecha:"2026-09-07",  fecha_fin:"2026-10-09",  titulo:"Unidad Nº 06",                                              descripcion:"Unidad Nº 06: Del 07 de setiembre al 09 de octubre (5 semanas)",   nivel:["I","P","S"],    categoria:"comunidad", icono:"📖" },
        { id:8,  fecha:"2026-09-22",  fecha_fin:null,          titulo:"Celebración del día del estudiante",                        descripcion:"Celebración del día del estudiante (último bloque)",                nivel:["I","P","S"],    categoria:"evento", icono:"🎉" },
        { id:9,  fecha:"2026-09-23",  fecha_fin:null,titulo:"Día Laborable — Día del estudiante",                                                descripcion:"Día Laborable por el día del estudiante",                               nivel:["I","P","S"],    categoria:"comunidad", icono:"🌴" },

        /* ===== OCTUBRE ===== */
        { id:10, fecha:"2026-09-28",  fecha_fin:"2026-10-07",  titulo:"Evaluaciones III Bimestre",                                 descripcion:"Evaluaciones III Bimestre",                                          nivel:["I","P","S"],    categoria:"evento", icono:"✏️" },
        { id:11, fecha:"2026-10-09",  fecha_fin:null,          titulo:"Culto de Acción de Gracias",                                descripcion:"Culto de Acción de Gracias por 33 años de vida institucional (por la mañana)", nivel:["I","P","S"], categoria:"evento", icono:"🙏" },
        { id:12, fecha:"2026-10-12",  fecha_fin:"2026-10-16",  titulo:"Vacaciones — Semana de gestión",                            descripcion:"Periodo de Vacaciones — Estudiantes / Semana de gestión",           nivel:["I","P","S"],    categoria:"comunidad", icono:"🏖️" },
        { id:13, fecha:"2026-10-19",  fecha_fin:"2026-12-18",  titulo:"IV Bimestre",                                               descripcion:"IV Bimestre: Del 19 de octubre al 18 de diciembre (9 semanas)",    nivel:["I","P","S"],    categoria:"comunidad", icono:"📚" },
        { id:14, fecha:"2026-10-19",  fecha_fin:"2026-11-20",  titulo:"Unidad Nº 07",                                              descripcion:"Unidad Nº 07: Del 19 de octubre al 20 de noviembre (5 semanas)",   nivel:["I","P","S"],    categoria:"comunidad", icono:"📖" },

        /* ===== NOVIEMBRE ===== */
        { id:15, fecha:"2026-11-02",  fecha_fin:null,          titulo:"Ranking de Conocimientos Nº 03",                            descripcion:"Ranking de Conocimientos Nº 03 (Desde 6ºP hasta 5ºS)",              nivel:["P","S"],        categoria:"evento", icono:"📝" },
        { id:16, fecha:"2026-11-05",  fecha_fin:null,          titulo:"Entrega de libretas III Bimestre",                          descripcion:"Entrega de libretas III Bimestre / Reunión de aula / Escuela de padres Nº 04", nivel:["I","P","S"], categoria:"evento", icono:"📋" },
        { id:17, fecha:"2026-11-16",  fecha_fin:"2026-11-20",  titulo:"Día de logro",                                              descripcion:"Día de logro",                                                      nivel:["I","P","S"],    categoria:"evento", icono:"🏅" },
        { id:18, fecha:"2026-11-23",  fecha_fin:"2026-12-18",  titulo:"Unidad Nº 08",                                              descripcion:"Unidad Nº 08: Del 23 de noviembre al 18 de diciembre (4 semanas)", nivel:["I","P","S"],    categoria:"comunidad", icono:"📖" },
        { id:19, fecha:"2026-11-26",  fecha_fin:"2026-11-27",  titulo:"Despedida de estudiantes",                                   descripcion:"Despedida de estudiantes de 4ºS a 5ºS y de 5ºP a 6ºP",             nivel:["I","P","S"],    categoria:"evento", icono:"🎓" },

        /* ===== DICIEMBRE ===== */
        { id:20, fecha:"2026-12-04",  fecha_fin:"2026-12-17",  titulo:"Evaluaciones IV Bimestre",                                  descripcion:"Evaluaciones IV Bimestre",                                          nivel:["I","P","S"],    categoria:"evento", icono:"✏️" },
        { id:21, fecha:"2026-12-04",  fecha_fin:null,          titulo:"Compartir especial Inicial 5 años",                         descripcion:"Compartir especial Inicial 5 años",                                 nivel:["I"],            categoria:"evento", icono:"👶" },
        { id:22, fecha:"2026-12-05",  fecha_fin:null,          titulo:"Proyección social 5ºS",                                     descripcion:"Proyección social 5ºS",                                              nivel:["I","P","S"],    categoria:"comunidad", icono:"🤝" },
        { id:23, fecha:"2026-12-11",  fecha_fin:null,          titulo:"Compartir especial 6ºP",                                    descripcion:"Compartir especial 6ºP",                                             nivel:["P"],            categoria:"evento", icono:"🎁" },
        { id:24, fecha:"2026-12-16",  fecha_fin:null,          titulo:"Intercambio de escoltas y Balonazo 5ºS",                    descripcion:"Intercambio de escoltas y Balonazo 5ºS",                             nivel:["I","P","S"],    categoria:"evento", icono:"⚽" },
        { id:25, fecha:"2026-12-17",  fecha_fin:null,          titulo:"Compartir navideño",                                        descripcion:"Compartir navideño (último bloque)",                                nivel:["I","P","S"],    categoria:"evento", icono:"🎄" },
        { id:26, fecha:"2026-12-18",  fecha_fin:null,          titulo:"Graduación 5ºS",                                            descripcion:"Graduación 5ºS",                                                    nivel:["S"],            categoria:"evento", icono:"🎓" },
        { id:27, fecha:"2026-12-21",  fecha_fin:"2026-12-24",  titulo:"Cierre y entrega de documentos",                            descripcion:"Cierre de documentos y Entrega de documentos",                      nivel:["I","P","S"],    categoria:"comunidad", icono:"📂" },
        { id:28, fecha:"2026-12-28",  fecha_fin:"2026-12-31",  titulo:"Semana de Gestión Nº 08",                                   descripcion:"Semana de Gestión Nº 08: Coordinación con docentes",                nivel:["I","P","S"],    categoria:"comunidad", icono:"🗓️" },
        { id:29, fecha:"2026-12-28",  fecha_fin:null,          titulo:"Clausura del Año Escolar",                                   descripcion:"Clausura del Año Escolar",                                           nivel:["I","P","S"],    categoria:"evento", icono:"🏫" }
    ];

    /* ---------- Colores ---------- */

    const CATEGORY_COLORS = {
        admision:  { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" },
        evento:    { bg: "#e3f2fd", text: "#1565c0", border: "#90caf9" },
        comunidad: { bg: "#fff3e0", text: "#e65100", border: "#ffcc80" }
    };
    const CATEGORY_LABELS = {
        admision: "Admisión",
        evento:   "Evento",
        comunidad:"Comunidad"
    };

    const LEVEL_LABELS = { I: "Inicial", P: "Primaria", S: "Secundaria" };

    const MONTH_NAMES = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Setiembre","Octubre","Noviembre","Diciembre"
    ];
    const DAY_NAMES = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
    const DAY_NAMES_FULL = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

    let currentMonth = new Date().getMonth();

    function byId(id) { return document.getElementById(id); }

    function sameDay(a, b) {
        return a.getFullYear() === b.getFullYear() &&
               a.getMonth() === b.getMonth() &&
               a.getDate() === b.getDate();
    }

    /* ---------- Filtrar eventos ---------- */

    function getEventsForMonth(monthIndex) {
        return allEvents.filter(ev => {
            const start = new Date(ev.fecha + "T00:00:00");
            const end = ev.fecha_fin ? new Date(ev.fecha_fin + "T23:59:59") : start;
            const monthStart = new Date(YEAR, monthIndex, 1);
            const monthEnd   = new Date(YEAR, monthIndex + 1, 0, 23, 59, 59);
            return start <= monthEnd && end >= monthStart;
        });
    }

    function getEventsForDay(date) {
        return allEvents.filter(ev => {
            const start = new Date(ev.fecha + "T00:00:00");
            const end   = ev.fecha_fin ? new Date(ev.fecha_fin + "T00:00:00") : null;
            /* Evento de un solo día */
            if (!end || sameDay(start, end)) {
                return sameDay(date, start);
            }
            /* Evento de varios días: solo día de inicio y día de fin */
            return sameDay(date, start) || sameDay(date, end);
        });
    }

    /* ---------- Grid del calendario ---------- */

    function renderCalendarGrid(monthIndex) {
        const grid = byId("calGrid");
        if (!grid) return;
        grid.innerHTML = "";

        const firstDay = new Date(YEAR, monthIndex, 1);
        const lastDay  = new Date(YEAR, monthIndex + 1, 0);
        const daysInMonth = lastDay.getDate();

        let startWeekday = firstDay.getDay() - 1;
        if (startWeekday < 0) startWeekday = 6;

        DAY_NAMES.forEach(name => {
            const header = document.createElement("div");
            header.className = "cal-header";
            header.textContent = name;
            grid.appendChild(header);
        });

        for (let i = 0; i < startWeekday; i++) {
            const empty = document.createElement("div");
            empty.className = "cal-cell cal-cell--empty";
            grid.appendChild(empty);
        }

        const today = new Date();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(YEAR, monthIndex, day);
            const events = getEventsForDay(date);
            const cell = document.createElement("div");
            cell.className = "cal-cell";

            if (sameDay(date, today)) cell.classList.add("cal-cell--today");
            if (events.length) cell.classList.add("cal-cell--has-event");

            const num = document.createElement("span");
            num.className = "cal-cell-num";
            num.textContent = day;
            cell.appendChild(num);

            if (events.length) {
                const dotsWrap = document.createElement("div");
                dotsWrap.className = "cal-cell-dots";
                const levels = new Set();
                events.forEach(ev => (ev.nivel || []).forEach(n => levels.add(n)));
                Array.from(levels).sort().forEach(l => {
                    const dot = document.createElement("span");
                    dot.className = "cal-dot cal-dot--" + l.toLowerCase();
                    dot.title = LEVEL_LABELS[l] || l;
                    dotsWrap.appendChild(dot);
                });
                cell.appendChild(dotsWrap);
                cell.title = events.map(e => e.titulo).join(" | ");
            }

            grid.appendChild(cell);
        }
    }

    /* ---------- Agenda diaria ---------- */

    function renderDailyAgenda(monthIndex) {
        const container = byId("calDailyAgenda");
        if (!container) return;
        container.innerHTML = "";

        const today = new Date();
        const nowMonth = today.getMonth();
        const nowYear = today.getFullYear();

        /* ---- Sección: Hoy (si estamos viendo el mes actual) ---- */
        if (YEAR === nowYear && monthIndex === nowMonth) {
            const todayEvents = getEventsForDay(today);
            if (todayEvents.length) {
                const todaySection = document.createElement("div");
                todaySection.className = "agenda-today";

                todaySection.innerHTML =
                    '<div class="agenda-today-header">' +
                        '<span class="agenda-today-badge">📅 Hoy</span>' +
                        '<span class="agenda-today-date">' +
                            DAY_NAMES_FULL[today.getDay()] + ' ' +
                            today.getDate() + ' de ' + MONTH_NAMES[monthIndex] +
                        '</span>' +
                        '<span class="agenda-today-count">' +
                            todayEvents.length + ' actividad' + (todayEvents.length > 1 ? 'es' : '') +
                        '</span>' +
                    '</div>' +
                    '<div class="agenda-today-events">' +
                        todayEvents.map(ev => buildEventHTML(ev)).join("") +
                    '</div>';

                container.appendChild(todaySection);
            }
        }

        /* ---- Sección: Todos los días con eventos del mes ---- */
        const daysInMonth = new Date(YEAR, monthIndex + 1, 0).getDate();
        const todayStr = today.getFullYear() + "-" +
            String(today.getMonth() + 1).padStart(2, "0") + "-" +
            String(today.getDate()).padStart(2, "0");

        let daysWithEvents = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(YEAR, monthIndex, day);
            const events = getEventsForDay(date);
            if (events.length) {
                const dateStr = YEAR + "-" +
                    String(monthIndex + 1).padStart(2, "0") + "-" +
                    String(day).padStart(2, "0");
                const isToday = dateStr === todayStr;
                daysWithEvents.push({ date, day, events, isToday });
            }
        }

        if (daysWithEvents.length) {
            const agendaSection = document.createElement("div");
            agendaSection.className = "agenda-days";

            const title = document.createElement("h3");
            title.className = "agenda-days-title";
            title.textContent = "Actividades del mes";
            agendaSection.appendChild(title);

            daysWithEvents.forEach(({ date, day, events, isToday }) => {
                const dayGroup = document.createElement("div");
                dayGroup.className = "agenda-day-group" + (isToday ? " agenda-day-group--today" : "");

                const dayHeader = document.createElement("div");
                dayHeader.className = "agenda-day-header";
                dayHeader.innerHTML =
                    '<span class="agenda-day-num">' + day + '</span>' +
                    '<div class="agenda-day-info">' +
                        '<span class="agenda-day-name">' + DAY_NAMES_FULL[date.getDay()] + '</span>' +
                        (isToday ? '<span class="agenda-day-today-tag">Hoy</span>' : '') +
                    '</div>';
                dayGroup.appendChild(dayHeader);

                const dayEvents = document.createElement("div");
                dayEvents.className = "agenda-day-events";
                events.forEach(ev => {
                    const item = document.createElement("div");
                    item.className = "agenda-day-event";
                    item.innerHTML = buildEventHTML(ev);
                    dayEvents.appendChild(item);
                });
                dayGroup.appendChild(dayEvents);

                agendaSection.appendChild(dayGroup);
            });

            container.appendChild(agendaSection);
        } else if (!container.querySelector(".agenda-today")) {
            container.innerHTML = '<p class="cal-no-events">No hay actividades programadas este mes.</p>';
        }
    }

    function buildEventHTML(ev) {
        const cat = ev.categoria || "evento";
        const catColor = CATEGORY_COLORS[cat] || CATEGORY_COLORS.evento;
        const levelBadges = (ev.nivel || []).map(l =>
            '<span class="cal-level-badge cal-level-badge--' + l.toLowerCase() + '" title="' + LEVEL_LABELS[l] + '">' + l + '</span>'
        ).join("");

        const start = new Date(ev.fecha + "T00:00:00");
        const end   = ev.fecha_fin ? new Date(ev.fecha_fin + "T23:59:59") : null;
        let dateLabel = "";
        if (end && !sameDay(start, end)) {
            dateLabel = start.getDate() + " – " + end.getDate() + " de " + MONTH_NAMES[start.getMonth()];
        } else {
            dateLabel = start.getDate() + " de " + MONTH_NAMES[start.getMonth()];
        }

        return '<div class="agenda-event-card">' +
            '<div class="agenda-event-icon">' + (ev.icono || "📅") + '</div>' +
            '<div class="agenda-event-body">' +
                '<div class="agenda-event-header">' +
                    '<h4 class="agenda-event-title">' + ev.titulo + '</h4>' +
                    '<div class="agenda-event-levels">' + levelBadges + '</div>' +
                '</div>' +
                '<p class="agenda-event-desc">' + ev.descripcion + '</p>' +
                '<div class="agenda-event-meta">' +
                    '<span class="agenda-event-daterange">' + dateLabel + '</span>' +
                    '<span class="cal-event-cat" style="background:' + catColor.bg + ';color:' + catColor.text + ';border-color:' + catColor.border + '">' +
                        (CATEGORY_LABELS[cat] || cat) +
                    '</span>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    /* ---------- Render ---------- */

    function renderMonth(monthIndex) {
        renderCalendarGrid(monthIndex);
        renderDailyAgenda(monthIndex);
    }

    function setupMonthTabs() {
        const container = byId("calMonths");
        if (!container) return;

        container.addEventListener("click", e => {
            const btn = e.target.closest(".cal-month-btn");
            if (!btn) return;

            container.querySelectorAll(".cal-month-btn").forEach(b => b.classList.remove("is-active"));
            btn.classList.add("is-active");
            currentMonth = parseInt(btn.dataset.month, 10);
            renderMonth(currentMonth);
        });
    }

    /* ---------- Init ---------- */

    function init() {
        /* Default: mes actual si es 2026, si no enero */
        const now = new Date();
        if (now.getFullYear() === YEAR) {
            currentMonth = now.getMonth();
        } else {
            currentMonth = 0;
        }

        /* Activar botón del mes actual */
        const container = byId("calMonths");
        if (container) {
            container.querySelectorAll(".cal-month-btn").forEach(b => {
                b.classList.toggle("is-active", parseInt(b.dataset.month, 10) === currentMonth);
            });
        }

        renderMonth(currentMonth);

        /* Ocultar loading */
        const loading = byId("calLoading");
        if (loading) loading.hidden = true;

        /* Año en footer */
        const year = byId("year");
        if (year) year.textContent = new Date().getFullYear();
    }

    document.addEventListener("DOMContentLoaded", () => {
        setupMonthTabs();
        init();
    });
})();
