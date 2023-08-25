const menuItems = [
   { label: "Home", link: "http://localhost:3000" },
   { label: "Ricerca", link: "../html/search.html" },
   //{ label: "Playlists", link: "../html/playlist.html?id_user=502356" },
   // { label: "Groups", link: "../html/groups.html?id_user=502356" },
   // { label: "Community", link: "../html/community.html?id_user=502356" },
];

/**
 * Check if user is logged to generate an appropriate menu
 *
 * @return {boolean} result of response from fetch
 *                   true the user is logged in, false otherwise
 */
async function isUserLoggedIn() {
   const email = localStorage.getItem("email");
   const nickname = localStorage.getItem("nickname");
   const _id = localStorage.getItem("_id");

   // Mancano dati di login nel localStorage
   if (!email || !nickname || !_id)
      return false;


   const response = await fetch("http://localhost:3000/authuser", {
      method: "POST",
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify({
         email: email,
         nickname: nickname,
         _id: _id
      })
   });

   return response.ok
}


async function generateMenu() {
   const loggedin = await isUserLoggedIn();

   const profile = {
      label: loggedin ? "Profile" : "Login",
      link: loggedin ? "http://localhost:3000/profile" : "http://localhost:3000/login"
   }
   const playlist = {
      label: loggedin ? "Playlist" : "",
      link: loggedin ? "http://localhost:3000/playlist" : ""
   }

   const community = {
      label: loggedin ? "Community" : "",
      link: loggedin ? "http://localhost:3000/community" : ""
   }

   menuItems.push(playlist);
   menuItems.push(community);
   menuItems.push(profile);

   var menuHTML = "";

   for (let i = 0; i < menuItems.length; i++) {
      let item = menuItems[i];
      menuHTML += `<li class="nav-item"><a class="nav-link" href="${item.link}">${item.label}</a></li>`;
   }

   const menuElement = document.getElementById("menu");
   menuElement.innerHTML = `
<nav class="navbar navbar-expand-md bg-body-tertiary">
   <div class="container-fluid">
      <a class="navbar-brand" href="#">Social Network for Music</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
         aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
         <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
         <ul class="navbar-nav">
            ${menuHTML}
         </ul>
      </div>
   </div>
</nav>
`;
}

// Chiamata alla funzione per generare il menu
generateMenu();
