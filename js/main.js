// main.js (refactor)
// Modular, readable, and robust rewrite of your original script.

// ---------------------------
// Config / URLs
// ---------------------------
const STANDINGS_CSV = "https://raw.githubusercontent.com/michaelj86768894/big12/main/standings.csv";
const SCHEDULE_CSV  = "https://raw.githubusercontent.com/michaelj86768894/big12/main/Head2Head.csv?cb=" + Date.now();

// ---------------------------
// Small helpers
// ---------------------------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

// CSV parser: returns array of objects using header row
function parseCsvToObjects(csvText) {
  const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim() !== "");
  if (!lines.length) return [];
  const headers = lines.shift().split(",").map(h => h.trim());
  return lines.map(line => {
    const cols = line.split(",").map(c => c.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = cols[i] ?? "");
    return obj;
  });
}

// parse mm/dd/yy or mm/dd/yyyy robustly -> Date or null
function parseDate_mmddyy(s) {
  if (!s) return null;
  const parts = s.split("/").map(p => parseInt(p, 10));
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  let [m, d, y] = parts;
  if (y < 100) y += 2000;
  return new Date(y, m - 1, d);
}

// format short mm/dd/yy
function formatDateShort(dateObj) {
  if (!dateObj || isNaN(dateObj)) return "N/A";
  return dateObj.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
}

// simple safe text (no HTML injection)
function esc(s) { return String(s == null ? "" : s); }

// ---------------------------
// Standings module
// ---------------------------
const Standings = (() => {
  async function loadAndRender() {
    const container = $("#standings-container");
    const loadingEl = $(".loading") || null;
    if (loadingEl) loadingEl.textContent = "Loading standings...";

    try {
      const csv = await fetchText(STANDINGS_CSV);
      // assume header then rows: adapt to your CSV format
      const rows = csv.trim().split(/\r?\n/).map(r => r.split(",").map(c => c.trim()));
      if (rows.length <= 1) {
        if (loadingEl) loadingEl.textContent = "No standings data.";
        return;
      }
      const header = rows.shift(); // not used explicitly here
      const standings = {};

      rows.forEach(r => {
        const [team1, team2, s1, s2, team1Div = "", team2Div = ""] = r;
        const score1 = parseFloat(s1) || 0;
        const score2 = parseFloat(s2) || 0;
        if (!team1 || !team2) return;

        if (!standings[team1]) standings[team1] = { wins: 0, losses: 0, pointsFor: 0, division: team1Div || "" };
        if (!standings[team2]) standings[team2] = { wins: 0, losses: 0, pointsFor: 0, division: team2Div || "" };

        standings[team1].pointsFor += score1;
        standings[team2].pointsFor += score2;

        if (score1 > score2) {
          standings[team1].wins++;
          standings[team2].losses++;
        } else if (score2 > score1) {
          standings[team2].wins++;
          standings[team1].losses++;
        }
      });

      const standingsArray = Object.entries(standings)
        .map(([team, stats]) => ({ team, ...stats }))
        .sort((a, b) => b.wins - a.wins || b.pointsFor - a.pointsFor);

      const top7 = new Set(standingsArray.slice(0, 7).map(t => t.team));

      // build by division
      const groups = {
        East: standingsArray.filter(t => (t.division || "").toLowerCase() === "east"),
        Central: standingsArray.filter(t => (t.division || "").toLowerCase() === "central"),
        West: standingsArray.filter(t => (t.division || "").toLowerCase() === "west")
      };

      // render: clear container then append
      if (container) container.innerHTML = "";
      Object.entries(groups).forEach(([name, arr]) => {
        if (!arr.length) return;
        const table = document.createElement("table");
        table.className = "standings-table";
        const thead = document.createElement("thead");
        thead.innerHTML = `
          <tr>
            <th colspan="5" style="background-color:#001433;color:#FFFFFF;text-align:center;">${esc(name)}</th>
          </tr>
          <tr>
            <th>#</th><th>Team</th><th>W</th><th>L</th><th>PF</th>
          </tr>`;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        arr.forEach((t, i) => {
          const tr = document.createElement("tr");
          if (top7.has(t.team)) tr.classList.add("highlight");
          tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${esc(t.team)}</td>
            <td>${t.wins}</td>
            <td>${t.losses}</td>
            <td>${t.pointsFor.toFixed(1)}</td>`;
          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        if (container) container.appendChild(table);
      });

      if (loadingEl) loadingEl.style.display = "none";
    } catch (err) {
      console.error("Standings load error:", err);
      if (loadingEl) loadingEl.textContent = "Error loading standings.";
    }
  }

  return { init: loadAndRender };
})();

// ---------------------------
// Collapsibles + team filter module
// ---------------------------
const Collapsibles = (() => {
  function init() {
    const coll = $$(".collapsible");
    coll.forEach(btn => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("active");
        const content = btn.nextElementSibling;
        if (!content) return;
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    });

    const dropdown = $("#searchDropdown");
    if (dropdown) {
      dropdown.addEventListener("change", () => {
        const selected = dropdown.value.trim().toLowerCase();
        coll.forEach(header => {
          const content = header.nextElementSibling;
          if (!content) return;
          const rows = Array.from(content.querySelectorAll("tr"));
          let has = false;
          rows.forEach(row => {
            const txt = row.textContent.toLowerCase();
            if (!selected || txt.includes(selected)) {
              row.style.display = "";
              has = true;
            } else row.style.display = "none";
          });

          if (has) {
            header.style.display = "";
            content.style.display = "block";
            header.classList.add("active");
            content.style.maxHeight = content.scrollHeight + "px";
          } else {
            header.style.display = "none";
            content.style.display = "none";
            header.classList.remove("active");
            content.style.maxHeight = null;
          }
        });
      });
    }
  }

  return { init };
})();

// ---------------------------
// Schedule / Head-to-head module
// ---------------------------
const Schedule = (() => {
  let allMatches = [];
  let teams = [];

  function getValueOrDefault(el, defaultVal) {
    return el ? el.value : defaultVal;
  }

  async function load() {
    try {
      const text = await fetchText(SCHEDULE_CSV);
      const rows = parseCsvToObjects(text);
      allMatches = rows.map(r => {
        const d = parseDate_mmddyy(r["Date"] || r["date"] || "");
        return {
          rawDate: r["Date"] || "",
          date: d,
          team1: (r["Team 1"] || r["Team1"] || r["team1"] || "").trim(),
          team2: (r["Team 2"] || r["Team2"] || r["team2"] || "").trim(),
          score1: parseInt(r["Team 1 Score"] || r["Score1"] || "0", 10) || 0,
          score2: parseInt(r["Team 2 Score"] || r["Score2"] || "0", 10) || 0,
          gameType: (r["Game Type"] || r["Type"] || "").trim()
        };
      }).filter(m => m.team1 && m.team2);

      const teamSet = new Set();
      allMatches.forEach(m => { teamSet.add(m.team1); teamSet.add(m.team2); });
      teams = Array.from(teamSet).sort((a, b) => a.localeCompare(b));

      populateDropdowns();
      $("#loadingMsg")?.style && ($("#loadingMsg").style.display = "none");

      // populate year and game type filters
      populateYearDropdown();
      populateGameTypeDropdown();

      // initial render
      updateDisplay();
    } catch (err) {
      console.error("Schedule load error:", err);
      const loading = $("#loadingMsg");
      if (loading) loading.textContent = "Error loading match data.";
    }
  }

  function populateDropdowns() {
    const t1 = $("#team1");
    const t2 = $("#team2");
    if (!t1 || !t2) return;

    // clear existing
    t1.innerHTML = "";
    t2.innerHTML = "";

    const optAll1 = new Option("All Teams", "ALL_TEAMS");
    t1.appendChild(optAll1);
    const optAll2 = new Option("All Teams", "ALL_TEAMS");
    t2.appendChild(optAll2);

    teams.forEach(team => {
      t1.appendChild(new Option(team, team));
      t2.appendChild(new Option(team, team));
    });

    t1.value = "ALL_TEAMS";
    t2.value = "ALL_TEAMS";

    // attach handlers
    t1.addEventListener("change", updateDisplay);
    t2.addEventListener("change", updateDisplay);
    $("#matchFilter")?.addEventListener("input", updateDisplay);
    $("#yearFilter")?.addEventListener("change", updateDisplay);
    $("#gameTypeFilter")?.addEventListener("change", updateDisplay);
  }

  function populateYearDropdown() {
    const yearDropdown = $("#yearFilter");
    if (!yearDropdown) return;
    yearDropdown.innerHTML = "";
    const allOpt = new Option("— All Years —", "ALL_YEARS");
    yearDropdown.appendChild(allOpt);
    const yearSet = Array.from(new Set(allMatches.map(m => m.date ? m.date.getFullYear() : null).filter(Boolean)))
      .sort((a, b) => b - a);
    yearSet.forEach(y => yearDropdown.appendChild(new Option(y, y)));
  }

  function populateGameTypeDropdown() {
    const typeDropdown = $("#gameTypeFilter");
    if (!typeDropdown) return;
    typeDropdown.innerHTML = "";
    const allOpt = new Option("— All Types —", "ALL_TYPES");
    typeDropdown.appendChild(allOpt);
    const types = Array.from(new Set(allMatches.map(m => m.gameType).filter(Boolean))).sort();
    types.forEach(t => typeDropdown.appendChild(new Option(t, t)));
  }

  function updateDisplay() {
    const teamA = getValueOrDefault($("#team1"), "ALL_TEAMS");
    const teamB = getValueOrDefault($("#team2"), "ALL_TEAMS");
    const yearVal = getValueOrDefault($("#yearFilter"), "ALL_YEARS");
    const gameTypeVal = getValueOrDefault($("#gameTypeFilter"), "ALL_TYPES");
    const searchVal = ($("#matchFilter")?.value || "").trim().toLowerCase();

    let filtered = allMatches.filter(m => {
      const matchTeamA = (teamA === "ALL_TEAMS") || (m.team1 === teamA) || (m.team2 === teamA);
      const matchTeamB = (teamB === "ALL_TEAMS") || (m.team1 === teamB) || (m.team2 === teamB);
      return matchTeamA && matchTeamB;
    });

    if (yearVal !== "ALL_YEARS") {
      filtered = filtered.filter(m => m.date && m.date.getFullYear() === parseInt(yearVal, 10));
    }

    if (gameTypeVal !== "ALL_TYPES") {
      filtered = filtered.filter(m => m.gameType === gameTypeVal);
    }

    if (searchVal) {
      filtered = filtered.filter(m =>
        m.team1.toLowerCase().includes(searchVal) ||
        m.team2.toLowerCase().includes(searchVal) ||
        (m.gameType || "").toLowerCase().includes(searchVal)
      );
    }

    filtered.sort((a, b) => (b.date ? b.date.getTime() : 0) - (a.date ? a.date.getTime() : 0));

    renderSummary(filtered, teamA, teamB);
    renderMatchTable(filtered);
    refreshCollapsibleHeight();
  }

  function renderSummary(filtered, teamA, teamB) {
    const summaryArea = $("#summaryArea");
    if (!summaryArea) return;

    if (filtered.length === 0) {
      summaryArea.style.display = "none";
      return;
    }

    // if both ALL_TEAMS -> overall stats
    if (teamA === "ALL_TEAMS" && teamB === "ALL_TEAMS") {
      $("#head2headSummary") && ($("#head2headSummary").textContent = `${filtered.length} total games`);
      $("#mostRecent") && ($("#mostRecent").textContent = formatDateShort(filtered[0].date));
      $("#cardTeam1") && ($("#cardTeam1").style.display = "none");
      $("#cardTeam2") && ($("#cardTeam2").style.display = "none");
      summaryArea.style.display = "flex";
      return;
    }

    // compute wins / PF
    let winsA = 0, winsB = 0, pfA = 0, pfB = 0;
    filtered.forEach(m => {
      // points for for selected teamA
      if (m.team1 === teamA) pfA += m.score1;
      if (m.team2 === teamA) pfA += m.score2;
      if (m.team1 === teamB) pfB += m.score1;
      if (m.team2 === teamB) pfB += m.score2;

      if (m.score1 > m.score2) {
        if (m.team1 === teamA) winsA++;
        if (m.team1 === teamB) winsB++;
      } else if (m.score2 > m.score1) {
        if (m.team2 === teamA) winsA++;
        if (m.team2 === teamB) winsB++;
      }
    });

    $("#cardTeam1") && ($("#cardTeam1").style.display = "block");
    $("#cardTeam2") && ($("#cardTeam2").style.display = (teamB === "ALL_TEAMS" ? "none" : "block"));

    $("#head2headSummary") && ($("#head2headSummary").textContent = `${filtered.length} games`);
    $("#mostRecent") && ($("#mostRecent").textContent = formatDateShort(filtered[0].date));
    $("#cardTeam1PF") && ($("#cardTeam1PF").textContent = pfA);
    if (teamB === "ALL_TEAMS") {
      $("#cardTeam1Record") && ($("#cardTeam1Record").textContent = `${winsA} Wins`);
      $("#cardTeam2Record") && ($("#cardTeam2Record").textContent = `N/A`);
      $("#cardTeam2PF") && ($("#cardTeam2PF").textContent = `N/A`);
    } else {
      $("#cardTeam1Record") && ($("#cardTeam1Record").textContent = `${winsA} - ${winsB}`);
      $("#cardTeam2Record") && ($("#cardTeam2Record").textContent = `${winsB} - ${winsA}`);
      $("#cardTeam2PF") && ($("#cardTeam2PF").textContent = pfB);
    }

    summaryArea.style.display = "flex";
  }

  function renderMatchTable(filtered) {
    const wrap = $("#matchTableWrap");
    const tbody = $("#matchTable tbody");
    const noMatches = $("#noMatches");
    if (!tbody) return;

    if (!filtered.length) {
      tbody.innerHTML = "";
      if (wrap) wrap.style.display = "none";
      if (noMatches) noMatches.style.display = "block";
      return;
    }

    // Build rows in one go (faster)
    let lastDateKey = null;
    let toggle = false;
    const rowsHtml = filtered.map(m => {
      const dateKey = formatDateShort(m.date);
      if (dateKey !== lastDateKey) {
        toggle = !toggle;
        lastDateKey = dateKey;
      }
      const rowBg = toggle ? "#f9f9f9" : "#ffffff";
      const team1WinnerClass = m.score1 > m.score2 ? "winner" : "";
      const team2WinnerClass = m.score2 > m.score1 ? "winner" : "";
      return `<tr style="background-color:${rowBg}">
        <td>${esc(dateKey)}</td>
        <td class="${team1WinnerClass}">${esc(m.team1)}</td>
        <td class="${team2WinnerClass}">${esc(m.team2)}</td>
        <td>${m.score1} - ${m.score2}</td>
        <td>${esc(m.gameType || "")}</td>
      </tr>`;
    }).join("");

    tbody.innerHTML = rowsHtml;
    if (wrap) wrap.style.display = "block";
    if (noMatches) noMatches.style.display = "none";
  }

  function refresh() { updateDisplay(); }

  return { load, updateDisplay, refresh };
})();

// ---------------------------
// Nav injection module
// ---------------------------
const NavLoader = (() => {
  async function load() {
    const placeholder = $("#nav-placeholder") || (function create() {
      const el = document.createElement("div");
      el.id = "nav-placeholder";
      document.body.insertAdjacentElement("afterbegin", el);
      return el;
    })();

    try {
      const html = await fetchText("/big12/pages/nav.html");
      placeholder.innerHTML = html;
    } catch (err) {
      console.error("Error loading nav:", err);
      // leave placeholder empty silently
    }
  }

  return { load };
})();

// ===========================
// News slideshow carousel
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".news-slide-wrapper");
  const slides = Array.from(document.querySelectorAll(".news-slide"));
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");
  let index = 0;

  if (!wrapper || slides.length === 0) return;

  function showSlide(i) {
    index = (i + slides.length) % slides.length; // wrap around
    const offset = -index * 100; // percent
    wrapper.style.transform = `translateX(${offset}%)`;
  }

  prevBtn?.addEventListener("click", () => showSlide(index - 1));
  nextBtn?.addEventListener("click", () => showSlide(index + 1));

  // Auto-slide every 8 seconds
  setInterval(() => showSlide(index + 1), 8000);

  // Initial display
  showSlide(0);
});
// ---------------------------
// Utilities used across modules
// ---------------------------
function refreshCollapsibleHeight() {
  $$(".collapsible.active + .content").forEach(content => {
    content.style.maxHeight = content.scrollHeight + "px";
  });
}

// ---------------------------
// Initialize everything on DOM ready
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Init collapsibles immediately (they operate independently)
  Collapsibles.init();

  // Load nav (non-blocking)
  NavLoader.load();

  // Kick off data loads in parallel
  Standings.init();        // optional: guard if no #standings-container on page (module handles empty)
  Schedule.load();        // loads schedule + populates UI elements

  // Init slideshow (guarded)
  Slideshow.init();
});

document.addEventListener("DOMContentLoaded", () => {
  // Hamburger menu toggle
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  menuToggle.addEventListener("change", () => {
    if (menuToggle.checked) {
      navLinks.style.display = "flex";
    } else {
      navLinks.style.display = "none";
    }
  });

  // Mobile dropdown toggle
  document.querySelectorAll(".nav-links li.dropdown > a").forEach(parentLink => {
    parentLink.addEventListener("click", e => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const dropdownContent = parentLink.nextElementSibling;
        dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", e => {
    if (!e.target.closest(".nav-links li.dropdown")) {
      document.querySelectorAll(".nav-links li .dropdown-content").forEach(dc => {
        dc.style.display = "none";
      });
    }
  });
});
