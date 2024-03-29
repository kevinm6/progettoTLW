const menuItems = [
   { label: "Home", link: "/#" },
   { label: "Explore", link: "../html/explore.html" },
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


   const response = await fetch('/authuser', {
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

   const ret = await response.ok;
   return ret
}


async function generateMenu() {
   let loggedIn = await isUserLoggedIn();

   const profile = {
      label: loggedIn ? 'Profile' : 'Login',
      link: loggedIn ? '/profile' : '/login'
   }

   if (loggedIn) {
      const playlist = {
         label: 'Playlist',
         link: '/playlist'
      }

      const community = {
         label: 'Community',
         link: '/community'
      }
      menuItems.push(playlist, community);
   }

   menuItems.push(profile);

   var menuHTML = "";

   for (let i = 0; i < menuItems.length; i++) {
      let item = menuItems[i];
      menuHTML += `<li class="nav-item"><a class="menu-link nav-link fs-3" href="${item.link}">${item.label}</a></li>`;
   }

   const menuElement = document.getElementById("menu");
   /* <img src="../../public/images/LOGOSNM.png" class="snmimg" alt="Logo"> */
   menuElement.innerHTML = `
      <nav class="navbar navbar-expand-lg">
         <div class="container-fluid">
         <a class="navbar-brand snm" href=""><p class="fs-1">Social Network Music</p></a>
            <button class="btn navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
               aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
               <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
               <ul class="navbar-nav">
                  ${menuHTML}
               </ul>
            </div>
         </div>
      </nav><br>
`;
}

// Chiamata alla funzione per generare il menu
generateMenu();
