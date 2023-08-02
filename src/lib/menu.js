const menuItems = [
  { label: 'Home', link: '../html/index.html' },
  { label: 'Ricerca', link: '../html/search.html' },
  { label: 'Playlists', link: '../html/playlist.html?id_user=502356' },
  { label: 'Groups', link: '../html/groups.html?id_user=502356' },
  { label: 'Community', link: '../html/community.html?id_user=502356' },
]

var menuHTML = ''

var dropdown = '<div></div>'
if (window.localStorage.getItem('user') != null) {
  var user = JSON.parse(localStorage.getItem('user'))
  console.log(localStorage.getItem('user'))
  console.log(user)
  menuItems.push({ label: `Preferiti`, link: 'preferiti.html' })
  var dropdown = `
        <div class="d-flex">
            <ul class="navbar-nav">
                <li class="nav-item dropdown">
                    <button class="btn dropdown-toggle" data-bs-toggle="dropdown">
                        Benvenuto ${user.name}
                    </button>
                    <ul class="dropdown-menu">
                        <li>
                            <a class="dropdown-item" href="#" onclick="logout()">Logout</a>
                        </li>

                    </ul>

                </li>
            </ul>
        </div>
        `
}

for (let i = 0; i < menuItems.length; i++) {
  let item = menuItems[i]
  menuHTML += `<li class="nav-item"><a class="nav-link" href="${item.link}">${item.label}</a></li>`
}
function logout() {
  localStorage.removeItem('user')
  window.location.href = './html/index.html'
}
const menuElement = document.getElementById('menu')
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
              ${dropdown}
            </div>

        </div>
    </nav>
`
