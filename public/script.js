const container =
  document.getElementById("playersContainer");

const modal =
  document.getElementById("modal");

const closeBtn =
  document.getElementById("closeBtn");

/* =========================
   SEARCH INPUT
========================= */

const searchInput =
  document.getElementById("searchInput");

/* =========================
   ADMIN MODAL
========================= */

const adminModal =
  document.getElementById("adminModal");

const adminPassword =
  document.getElementById("adminPassword");

const adminLoginBtn =
  document.getElementById("adminLoginBtn");

const viewerBtn =
  document.getElementById("viewerBtn");

/* =========================
   ADMIN DATA
========================= */

let ADMIN_KEY = "";

let isAdminLoggedIn = false;

let allPlayers = [];

/* =========================
   VIEWER MODE
========================= */

viewerBtn.addEventListener("click", () => {

  adminModal.style.display = "none";

  fetchPlayers();
});

/* =========================
   ADMIN LOGIN
========================= */

adminLoginBtn.addEventListener(
  "click",
  async () => {

  const enteredKey =
    adminPassword.value;

  if (!enteredKey) {

    alert("Enter Password");

    return;
  }

  try {

    const response =
      await fetch("/players/999999", {

      method: "PUT",

      headers: {
        "Content-Type":
        "application/json",

        "x-admin-key":
        enteredKey
      },

      body: JSON.stringify({
        name: "test",
        role: "test",
        dob: "01-01-2000"
      })
    });

    if (response.status === 403) {

      alert("Wrong Password");

      return;
    }

    ADMIN_KEY = enteredKey;

    isAdminLoggedIn = true;

    adminModal.style.display =
      "none";

    alert("Admin Login Success");

    fetchPlayers();

  } catch {

    alert("Login Failed");
  }
});

/* =========================
   FETCH PLAYERS
========================= */

async function fetchPlayers() {

  const response =
    await fetch("/players");

  const players =
    await response.json();

  allPlayers = players;

  renderPlayers(players);
}

/* =========================
   RENDER PLAYERS
========================= */

function renderPlayers(players) {

  container.innerHTML = "";

  players.forEach((player, index) => {

    const card =
      document.createElement("div");

    card.className = "player-card";

    card.style.animationDelay =
      `${index * 0.12}s`;

    const age =
      calculateAge(player.dob);

    /* =========================
       PLAYER BADGES
    ========================= */

    let badge = "";

    if (player.captain) {

      badge =
      `<div class="player-badge captain">
        👑 CAPTAIN
      </div>`;
    }

    else if (player.viceCaptain) {

      badge =
      `<div class="player-badge vice">
        ⚡ VICE CAPTAIN
      </div>`;
    }

    card.innerHTML = `

      ${badge}

      <img
      src="${player.image}"
      class="player-image">

      <div class="player-info">

        <h2>${player.name}</h2>

        <p>${player.role}</p>

        <p>Age: ${age}</p>

        ${
          isAdminLoggedIn
          ? `
          <div class="card-buttons">

            <button class="edit-btn">
              Edit
            </button>

            <button class="upload-btn">
              Upload Photo
            </button>

          </div>
          `
          : ""
        }

      </div>
    `;

    /* =========================
       3D HOVER EFFECT
    ========================= */

    card.addEventListener(
      "mousemove",
      (e) => {

      const rect =
        card.getBoundingClientRect();

      const x =
        e.clientX - rect.left;

      const y =
        e.clientY - rect.top;

      const rotateY =
        ((x / rect.width) - 0.5) * 12;

      const rotateX =
        ((y / rect.height) - 0.5) * -12;

      card.style.transform =
        `
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.04)
        `;
    });

    card.addEventListener(
      "mouseleave",
      () => {

      card.style.transform =
        "rotateX(0) rotateY(0)";
    });

    /* =========================
       OPEN MODAL
    ========================= */

    card.addEventListener(
      "click",
      () => {

      openModal(player, age);
    });

    /* =========================
       ADMIN FEATURES
    ========================= */

    if (isAdminLoggedIn) {

      const editBtn =
        card.querySelector(".edit-btn");

      editBtn.addEventListener(
        "click",
        async (e) => {

        e.stopPropagation();

        const name =
          prompt(
            "Enter Name",
            player.name
          );

        const role =
          prompt(
            "Enter Role",
            player.role
          );

        const dob =
          prompt(
            "Enter DOB",
            player.dob
          );

        const response =
          await fetch(
          `/players/${player.id}`,
          {

          method: "PUT",

          headers: {
            "Content-Type":
            "application/json",

            "x-admin-key":
            ADMIN_KEY
          },

          body: JSON.stringify({
            name,
            role,
            dob
          })
        });

        if (response.status === 403) {

          alert("Unauthorized");

          return;
        }

        alert("Player Updated");

        fetchPlayers();
      });

      /* UPLOAD */

      const uploadBtn =
        card.querySelector(".upload-btn");

      uploadBtn.addEventListener(
        "click",
        (e) => {

        e.stopPropagation();

        const input =
          document.createElement("input");

        input.type = "file";

        input.accept = "image/*";

        input.onchange =
          async () => {

          const file =
            input.files[0];

          const formData =
            new FormData();

          formData.append(
            "photo",
            file
          );

          const response =
            await fetch(
            `/upload/${player.id}`,
            {

            method: "POST",

            headers: {
              "x-admin-key":
              ADMIN_KEY
            },

            body: formData
          });

          if (
            response.status === 403
          ) {

            alert("Unauthorized");

            return;
          }

          alert("Photo Uploaded");

          fetchPlayers();
        };

        input.click();
      });
    }

    container.appendChild(card);
  });
}

/* =========================
   SEARCH PLAYERS
========================= */

searchInput.addEventListener(
  "input",
  () => {

  const value =
    searchInput.value
    .toLowerCase();

  const filtered =
    allPlayers.filter(player =>
      player.name
      .toLowerCase()
      .includes(value)
    );

  renderPlayers(filtered);
});

/* =========================
   CALCULATE AGE
========================= */

function calculateAge(dob) {

  const parts =
    dob.split("-");

  const birthDate =
    new Date(
      parts[2],
      parts[1] - 1,
      parts[0]
    );

  const diff =
    Date.now() -
    birthDate.getTime();

  const ageDate =
    new Date(diff);

  return Math.abs(
    ageDate
    .getUTCFullYear() - 1970
  );
}

/* =========================
   OPEN MODAL
========================= */

function openModal(player, age) {

  modal.style.display = "flex";

  document.getElementById(
    "modalImage"
  ).src = player.image;

  document.getElementById(
    "modalName"
  ).innerText =
    player.name;

  document.getElementById(
    "modalRole"
  ).innerText =
    `Role: ${player.role}`;

  document.getElementById(
    "modalDOB"
  ).innerText =
    `DOB: ${player.dob}`;

  document.getElementById(
    "modalAge"
  ).innerText =
    `Age: ${age}`;

  document.getElementById(
    "modalPlace"
  ).innerText =
    `Place of Birth:
    ${player.placeOfBirth}`;
}

/* =========================
   CLOSE MODAL
========================= */

closeBtn.addEventListener(
  "click",
  () => {

  modal.style.display =
    "none";
});

window.onclick =
  function(event) {

  if (event.target === modal) {

    modal.style.display =
      "none";
  }
};