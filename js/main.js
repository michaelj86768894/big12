const csvUrl = "https://raw.githubusercontent.com/michaelj86768894/big12/main/standings.csv";

async function loadStandings() {
  try {
    const response = await fetch(csvUrl);
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

// ================== COLLAPSIBLE SECTIONS ==================
document.addEventListener("DOMContentLoaded", function () {
  const coll = document.getElementsByClassName("collapsible");

  // Collapsible functionality
  for (let i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
      this.classList.toggle("active");
      const content = this.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  }

  // Team dropdown functionality (only runs if dropdown exists)
  const dropdown = document.getElementById("searchDropdown");
  const allRows = document.querySelectorAll(".content tr");

  if (dropdown) {
    dropdown.addEventListener("change", function () {
      const selected = this.value.toLowerCase();

      allRows.forEach((row) => {
        const rowText = row.textContent.toLowerCase();
        row.style.display =
          selected === "" || rowText.includes(selected) ? "" : "none";
      });

      // Hide/show collapsible sections based on matches
      for (let i = 0; i < coll.length; i++) {
        const header = coll[i];
        const content = header.nextElementSibling;
        const rowsInSection = content.querySelectorAll("tr");

        const hasMatch = Array.from(rowsInSection).some(
          (row) => row.style.display !== "none"
        );

        if (hasMatch || selected === "") {
          header.style.display = "";
          content.style.display = "";
          header.classList.add("active");
          content.style.maxHeight = content.scrollHeight + "px";
        } else {
          header.style.display = "none";
          content.style.display = "none";
        }
      }
    });
  }
});
