// ================== STANDINGS ==================
const standingsCsvUrl = "https://raw.githubusercontent.com/michaelj86768894/big12/main/standings.csv";

async function loadStandings() {
  try {
    const response = await fetch(standingsCsvUrl);
    const csvText = await response.text();
    const rows = csvText.trim().split("\n").map(r => r.split(","));
    rows.shift(); // remove header

    const standings = {};

    rows.forEach(row => {
      const team1 = row[0].trim();
      const team2 = row[1].trim();
      const score1 = parseFloat(row[2]);
      const score2 = parseFloat(row[3]);
      const team1Div = row[4]?.trim() || "";
      const team2Div = row[5]?.trim() || "";

      if (!standings[team1]) standings[team1] = { wins:0, losses:0, pointsFor:0, division: team1Div };
      if (!standings[team2]) standings[team2] = { wins:0, losses:0, pointsFor:0, division: team2Div };

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
      .map(([team, stats]) => ({team, ...stats}))
      .sort((a,b) => b.wins - a.wins || b.pointsFor - a.pointsFor);

    const top7Teams = new Set(standingsArray.slice(0,7).map(t => t.team));

    const container = document.querySelector("#standings-container");
    container.innerHTML = ""; // clear old tables

    // Split by division
    const east = standingsArray.filter(t => t.division === "East");
    const central = standingsArray.filter(t => t.division === "Central");
    const west = standingsArray.filter(t => t.division === "West");

    function appendDivisionTable(arr, divisionName) {
      if (arr.length === 0) return;

      const table = document.createElement("table");
      table.classList.add("standings-table");

      const thead = document.createElement("thead");
      thead.innerHTML = `
        <tr>
          <th colspan="5" style="background-color:#001433;color:#FFFFFF;text-align:center;">${divisionName}</th>
        </tr>
        <tr>
          <th>#</th>
          <th>Team</th>
          <th>W</th>
          <th>L</th>
          <th>PF</th>
        </tr>
      `;
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      arr.forEach((team, index) => {
        const tr = document.createElement("tr");
        if (top7Teams.has(team.team)) tr.classList.add("highlight");
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${team.team}</td>
          <td>${team.wins}</td>
          <td>${team.losses}</td>
          <td>${team.pointsFor.toFixed(1)}</td>
        `;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);

      container.appendChild(table);
    }

    appendDivisionTable(east, "East");
    appendDivisionTable(central, "Central");
    appendDivisionTable(west, "West");

    document.querySelector(".loading").style.display = "none";

  } catch (err) {
    document.querySelector(".loading").textContent = "Error loading standings.";
    console.error(err);
  }
}

loadStandings();

// ================== COLLAPSIBLE SECTIONS & TEAM FILTER ==================
document.addEventListener("DOMContentLoaded", function () {
  const coll = document.getElementsByClassName("collapsible");
  const dropdown = document.getElementById("searchDropdown");

  // --- Collapsible functionality ---
  Array.from(coll).forEach((button) => {
    button.addEventListener("click", function () {
      this.classList.toggle("active");
      const content = this.nextElementSibling;

      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });

  // --- Team dropdown functionality ---
  if (dropdown) {
    dropdown.addEventListener("change", function () {
      const selected = this.value.toLowerCase();
      const allSections = Array.from(coll);

      allSections.forEach((header) => {
        const content = header.nextElementSibling;
        const rows = Array.from(content.querySelectorAll("tr"));

        let hasMatch = false;

        rows.forEach((row) => {
          const rowText = row.textContent.toLowerCase();
          if (selected === "" || rowText.includes(selected)) {
            row.style.display = "";
            hasMatch = true;
          } else {
            row.style.display = "none";
          }
        });

        // Show or hide section header based on matches
        if (hasMatch) {
          header.style.display = "";
          content.style.display = "block";           // Ensure it's visible
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
});

// ================== SCHEDULE ==================
const scheduleCsvUrl = "https://raw.githubusercontent.com/michaelj86768894/big12/main/Head2Head.csv?cb=" + new Date().getTime();
let allMatches = [];
let teams = [];

function parseCsvToObjects(csvText) {
  const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim() !== "");
  const headers = lines.shift().split(",").map(h => h.trim());
  return lines.map(line => {
    const cols = line.split(",").map(c => c.trim());
    const obj = {};
    headers.forEach((h,i)=> obj[h]=cols[i]??"");
    return obj;
  });
}

function parseDate_mmddyy(s) {
  if (!s) return null;
  const parts = s.split("/").map(p=>parseInt(p,10));
  if (parts.length!==3 || parts.some(isNaN)) return null;
  let [m,d,y]=parts;
  if (y<100) y+=2000;
  return new Date(y,m-1,d);
}

function formatDateShort(dateObj) {
  if (!dateObj) return "N/A";
  const m=String(dateObj.getMonth()+1).padStart(2,"0");
  const d=String(dateObj.getDate()).padStart(2,"0");
  const yy=String(dateObj.getFullYear()).slice(-2);
  return `${m}/${d}/${yy}`;
}

async function loadCsvAndInit() {
  try {
    const res = await fetch(scheduleCsvUrl);
    if(!res.ok) throw new Error("Network error "+res.status);
    const text = await res.text();
    const rows = parseCsvToObjects(text);

    allMatches = rows.map(r=>{
      const d=parseDate_mmddyy(r["Date"]);
      return {
        rawDate: r["Date"]||"",
        date: d,
        team1: (r["Team 1"]||"").trim(),
        team2: (r["Team 2"]||"").trim(),
        score1: parseInt(r["Team 1 Score"]||"0",10),
        score2: parseInt(r["Team 2 Score"]||"0",10),
        gameType: (r["Game Type"]||"").trim()
      };
    }).filter(m=>m.team1 && m.team2);

    const teamSet=new Set();
    allMatches.forEach(m=>{teamSet.add(m.team1);teamSet.add(m.team2);});
    teams=Array.from(teamSet).sort((a,b)=>a.localeCompare(b));

    populateDropdowns();
    document.getElementById("loadingMsg").style.display="none";
  } catch(err) {
    document.getElementById("loadingMsg").textContent="Error loading match data.";
    console.error(err);
  }
}

function populateDropdowns() {
  const t1=document.getElementById("team1");
  const t2=document.getElementById("team2");

  const allOpt1=document.createElement("option");
  allOpt1.value="ALL_TEAMS";
  allOpt1.textContent="All Teams";
  t1.appendChild(allOpt1);

  const allOpt2=document.createElement("option");
  allOpt2.value="ALL_TEAMS";
  allOpt2.textContent="All Teams";
  t2.appendChild(allOpt2);

  teams.forEach(team=>{
    const o1=document.createElement("option"); o1.value=team; o1.textContent=team; t1.appendChild(o1);
    const o2=document.createElement("option"); o2.value=team; o2.textContent=team; t2.appendChild(o2);
  });

  t1.addEventListener("change", updateDisplay);
  t2.addEventListener("change", updateDisplay);
  document.getElementById("matchFilter").addEventListener("input", updateDisplay);
  document.getElementById("yearFilter").addEventListener("change", updateDisplay);
  document.getElementById("gameTypeFilter").addEventListener("change", updateDisplay);

  t1.value = "ALL_TEAMS";
  t2.value = "ALL_TEAMS";

  updateDisplay();
}

function populateYearDropdown(){
  const yearSet = new Set(allMatches.map(m=>m.date?m.date.getFullYear():null).filter(y=>y));
  const yearDropdown=document.getElementById("yearFilter");
  Array.from(yearSet).sort((a,b)=>b-a).forEach(y=>{
    const opt=document.createElement("option");
    opt.value=y;
    opt.textContent=y;
    yearDropdown.appendChild(opt);
  });
}

function populateGameTypeDropdown() {
  const typeSet = new Set(allMatches.map(m => m.gameType).filter(t => t));
  const typeDropdown = document.getElementById("gameTypeFilter");

  Array.from(typeSet).sort().forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    typeDropdown.appendChild(opt);
  });

  typeDropdown.value = "ALL_TYPES";
}

function getWinnerClass(m){
  if(m.score1>m.score2) return "winner";
  if(m.score2>m.score1) return "winner";
  return "";
}

function updateDisplay(){
  const teamA = document.getElementById("team1").value;
  const teamB = document.getElementById("team2").value;
  const yearVal = "2025";
  const gameTypeVal = "Season";
  const searchVal = document.getElementById("matchFilter").value.trim().toLowerCase();

  let filtered = allMatches.filter(m => {
    const matchTeam1 = (teamA==="ALL_TEAMS" || m.team1===teamA || m.team2===teamA);
    const matchTeam2 = (teamB==="ALL_TEAMS" || m.team1===teamB || m.team2===teamB);
    return matchTeam1 && matchTeam2;
  });

  if(yearVal!=="ALL_YEARS"){
    filtered = filtered.filter(m=>m.date && m.date.getFullYear()===parseInt(yearVal,10));
  }

  if(gameTypeVal !== "ALL_TYPES") {
    filtered = filtered.filter(m => m.gameType === gameTypeVal);
  }

  if(searchVal!==""){
    filtered = filtered.filter(m=>(
      m.team1.toLowerCase().includes(searchVal) ||
      m.team2.toLowerCase().includes(searchVal)
    ));
  }

  filtered.sort((a,b)=>b.date - a.date);

  // --- SUMMARY CALCULATION ---
  if (filtered.length > 0) {
    if(teamA==="ALL_TEAMS" && teamB==="ALL_TEAMS"){
      // Overall schedule summary
      document.getElementById("head2headSummary").textContent = `${filtered.length} total games`;
      document.getElementById("mostRecent").textContent = formatDateShort(filtered[0].date);
      document.getElementById("cardTeam1").style.display = "none";
      document.getElementById("cardTeam2").style.display = "none";
    } else {
      let winsA = 0, winsB = 0, pfA = 0, pfB = 0;
      filtered.forEach(m => {
        pfA += (m.team1 === teamA ? m.score1 : m.score2);
        pfB += (m.team1 === teamB ? m.score1 : m.score2);

        if (m.score1 > m.score2 && m.team1 === teamA) winsA++;
        else if (m.score2 > m.score1 && m.team2 === teamA) winsA++;

        if (teamB !== "ALL_TEAMS") {
          if (m.score1 > m.score2 && m.team1 === teamB) winsB++;
          else if (m.score2 > m.score1 && m.team2 === teamB) winsB++;
        }
      });

      document.getElementById("cardTeam1").style.display = "block";
      document.getElementById("cardTeam2").style.display = (teamB==="ALL_TEAMS" ? "none" : "block");

      document.getElementById("head2headSummary").textContent = `${filtered.length} games`;
      document.getElementById("mostRecent").textContent = formatDateShort(filtered[0].date);
      document.getElementById("cardTeam1PF").textContent = pfA;

      if(teamB==="ALL_TEAMS"){
        document.getElementById("cardTeam1Record").textContent = `${winsA} Wins`;
        document.getElementById("cardTeam2Record").textContent = `N/A`;
        document.getElementById("cardTeam2PF").textContent = `N/A`;
      } else {
        document.getElementById("cardTeam1Record").textContent = `${winsA} - ${winsB}`;
        document.getElementById("cardTeam2Record").textContent = `${winsB} - ${winsA}`;
        document.getElementById("cardTeam2PF").textContent = pfB;
      }
    }

    document.getElementById("summaryArea").style.display = "flex";
  } else {
    document.getElementById("summaryArea").style.display = "none";
  }

  // --- TABLE ROWS BY DATE COLOR ---
  const tbody = document.querySelector("#matchTable tbody");
  tbody.innerHTML="";
  let lastDate = null;
  let toggle = false;

  filtered.forEach(m=>{
    const dateKey = formatDateShort(m.date);
    if(dateKey !== lastDate){
      toggle = !toggle;
      lastDate = dateKey;
    }
    const tr = document.createElement("tr");
    tr.style.backgroundColor = toggle ? "#f9f9f9" : "#ffffff";
    tr.innerHTML = `
      <td>${dateKey}</td>
      <td class="${Number(m.score1) > Number(m.score2) ? 'winner' : ''}">${m.team1}</td>
      <td class="${Number(m.score2) > Number(m.score1) ? 'winner' : ''}">${m.team2}</td>
      <td>${m.score1} - ${m.score2}</td>
      <td>${m.gameType || ""}</td>`;
    tbody.appendChild(tr);
  });

  document.getElementById("matchTableWrap").style.display="block";
  document.getElementById("noMatches").style.display = filtered.length===0 ? "block" : "none";

  refreshCollapsibleHeight();
}

loadCsvAndInit();

function refreshCollapsibleHeight() {
  document.querySelectorAll(".collapsible.active + .content").forEach(content => {
    content.style.maxHeight = content.scrollHeight + "px";
  });
}

// ================== NAV BAR ==================
// Load the navigation bar dynamically from /pages/nav.html
document.addEventListener("DOMContentLoaded", () => {
  fetch("/big12/pages/nav.html")
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load nav: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      // Find or create a placeholder for the nav
      let navContainer = document.getElementById("nav-placeholder");
      if (!navContainer) {
        navContainer = document.createElement("div");
        navContainer.id = "nav-placeholder";
        document.body.insertAdjacentElement("afterbegin", navContainer);
      }
      navContainer.innerHTML = data;
    })
    .catch(error => console.error("Error loading nav:", error));
});

// =========================== NEWS SLIDE SHOW=======================
let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function showSlides(n) {
  let slides = document.getElementsByClassName("news-slide");
  if (n > slides.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = slides.length}
  for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";  
  }
  slides[slideIndex-1].style.display = "block";  
}

// Optional: auto-slide every 5 seconds
setInterval(function() {
  plusSlides(1);
}, 5000);
