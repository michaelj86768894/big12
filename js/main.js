// ---------------------------
// Schedule / Head-to-head module
// ---------------------------
const SCHEDULE_CSV  = "https://raw.githubusercontent.com/michaelj86768894/big12/main/Head2Head.csv?cb=" + Date.now();
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
