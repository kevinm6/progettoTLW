var user = null;
var pageMembers = 0;
var edit = false;

var [cachedTitle, cachedDesc] = ["", ""];


async function authAndSetUser(endpoint) {
   try {
      const userData = await authenticateUser();
      if (userData === "ERR") {
         console.error("Error during authentication:", error);
         alert("Error during authentication, try again!");
         logout();
         throw new Error("Errore durante l'autenticazione");
      } else if (userData === "ERR_NOT_LOGGED") {
         alert("Login to access your community.");
         window.location.href = '/login';
         throw new Error("Utente non loggato");
      } else {
         user = await userData;
         checkIfUserHasCommunity(endpoint, user._id);
      }
   } catch (error) {
      console.error("Errore durante l'esecuzione:", error);
   }
}


async function checkIfUserHasCommunity(endpoint, uid) {
   // TODO: improve if user is not logged
   if (!uid) {
      alert("You need to register to the app!");
      return;
   }
   let community = await fetchCommunity(uid);
   // console.log(endpoint, uid, community);

   switch (endpoint) {
      case 'createcommunity':
         if (community != null) {
            document.getElementById('create-community-container').innerHTML = `
            <br><br>
            <h2 style="text-align: center;">User has already a community.</h2>
            <p style="text-align: center; color: grey">click on the button below to show it</p>
            <br>
            <div>
               <a style="position:relative; left:44%; top:50%;" class="btn btn-primary" href="/community">Enter Community</a>
            </div>
            `;
            return
         };

         var userPlaylists = await getUserPlaylists(uid);
         populateMembers([], endpoint);
         populatePlaylists(null, userPlaylists, endpoint);

         break;

      case 'community':

         if (community == null) {
            const communityContainer = document.getElementById('community-container');
            communityContainer.innerHTML = `
            <br><br>
            <h2 style="text-align: center;">No Community found.</h2>
            <p style="text-align: center; color: grey">click on the button below to create one</p>
            <div>
               <a style="position:absolute; left:44%; top:50%;" class="btn btn-primary" href="/createcommunity">Create Community</a>
            </div>
            `;
            return
         };

         populateMembers(community.members, endpoint);
         let communityPlaylists = await fetchCommunityPlaylists(community.playlists);
         populatePlaylists(community._id, communityPlaylists, endpoint);
         var userPlaylists = await getUserPlaylists(uid);
         populateCreatorPlaylistDropdown(community._id, userPlaylists, communityPlaylists);
         communityHandleUI(community);

         const deleteCommunityButton = document.getElementById("deleteCommunityButton");
         deleteCommunityButton.addEventListener("click", () => {
            // console.log(user);
            if (window.confirm("Do you really want to delete this community?")) {
                  fetch(`/community/${user.id}`, {
                     method: 'DELETE',
                     headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                     },
                     body: JSON.stringify({ creatorId: user._id})
                  }).then(response => {
                        // console.log(response.json());
                        if (response.ok) {
                           window.location.replace('/community');
                        }
                     }).catch(err => console.error(err));
               }
            });
         break;

      default: break;
   }
}


async function getUserPlaylists(uid) {
   let response = await fetch(`/playlist/${uid}`);
   let data = await response.json();

   return data;
}


async function fetchCommunityPlaylists(playlists) {
   let playlistsData = [];

   for await (const i of playlists) {
      let res = await fetch(`/getplaylist/${i.pid}`);
      let pl = await res.json();
      playlistsData.push(pl);
   }
   return playlistsData;
}


async function populateMembers(members, endpoint) {
   var card = document.getElementById('card-cast');
   var container = document.getElementById('container-cast');
   container.append(card)

   switch (endpoint) {
      case 'createcommunity':
         fetch(`/users`).then((response) => {
            if (response.ok) {
               response.json().then((members) => {
                  for (const i in members) {
                  // for (var i = pageMembers * 6; i < (pageMembers + 1) * 6; i++) {

                     /* Skip card creation for creator of community */
                     if (user._id == members[i]._id) continue;

                     var clone = card.cloneNode(true)

                     clone.id = 'card-cast-' + i
                     clone.getElementsByClassName('card-text')[0].innerHTML = members[i].name
                     clone.getElementsByClassName('text-body-secondary')[0].innerHTML = members[i].nickname

                     // IDT we want to add the profile picture for users... just use a placeholder
                     clone.getElementsByClassName('card-img-top')[0].src =
                        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'

                     clone.getElementsByClassName('checkbox')[0].id += members[i]._id;
                     clone.getElementsByClassName('checkbox')[0].setAttribute('onClick', `addUserToCommunityMembers('${members[i]._id}','${endpoint}')`);

                     clone.getElementsByTagName('label')[0].setAttribute('id', 'label-selection-'+ members[i]._id);
                     clone.getElementsByTagName('label')[0].setAttribute('for', 'user-selection-'+ members[i]._id);
                     clone.getElementsByTagName('label')[0].innerHTML = `<small style="color:gray;">Add to community</small>`;

                     clone.classList.remove('d-none')

                     card.before(clone)
                  }
                  // }
               })
            }
         }).catch((err) => console.error(err));

         break;

      case 'community':
         for (let i in members) {
            if (i == 0) {
               let clone = card.cloneNode(true);
               clone.id = 'card-cast-' + user._id;
               clone.getElementsByClassName('card-text')[0].innerHTML = "Add New member";
               clone.getElementsByClassName('card-body')[0].innerHTML += await setModalContent(endpoint);
               clone.getElementsByClassName('card-img-top')[0].src =
                  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'

               clone.getElementsByClassName('btn btn-danger')[0].innerText = "Add Member";
               clone.getElementsByClassName('btn btn-danger')[0].setAttribute('data-bs-toggle', 'modal');
               clone.getElementsByClassName('btn btn-danger')[0].setAttribute('data-bs-target', '#selectMemberModal');
               clone.getElementsByClassName('btn btn-danger')[0]
                  .setAttribute('onClick', `addMemberToCommunity()`);

               clone.setAttribute('hidden', true);
               clone.classList.remove('d-none')
               card.before(clone)
            }

            /* Skip card creation for creator of community */
            if (user._id == members[i].uid) continue;

            let response = await fetch(`/users/${members[i].uid}`);
            let m = await response.json().catch(err => console.error(err));

            let clone = card.cloneNode(true);
            clone.id = 'card-cast-' + m.uid
            clone.getElementsByClassName('card-text')[0].innerHTML = m.name
            clone.getElementsByClassName('text-body-secondary')[0].innerHTML = m.nickname

            clone.getElementsByClassName('card-img-top')[0].src =
               'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'

            let strMember = JSON.stringify(m);
            clone.getElementsByClassName('btn btn-danger')[0]
               .setAttribute('onClick', `removeMemberFromCommunity('${strMember}')`);

            clone.classList.remove('d-none')
            card.before(clone)
         }

         break;

      default: break;
   }
}




async function setModalContent(endpoint) {
   let users = "";
   let _ = await fetch('/users').then(response => {
      if (response.ok) {
         response.json().then(data => {
            for (item in data) {
               let user = data[item];
               users += `
                 <tr>
                     <td>${user.name}</td>
                     <td>${user.nickname}</td>
                     <td><button type="button"
                        class="btn btn-primary" id='add-member-${user._id}' onclick="addUserToCommunityMembers('${user._id}','${endpoint}')">Add ${data[item].name}</button>
                     </td>
                 </tr>
               `;
            }
         })
      }
   }).catch(err => console.error("Error fetching users.", err));

   let cardBody = `
<div class="modal" role="dialog" id="selectMemberModal" aria-labelledby="selectMemberModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="selectMemberModalTitle">Select Member to add</h5>
        <button type="button" class="close" onclick="reenableHoverOnCards()" data-bs-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
      <table class="table">
         <thead>
            <tr>
            <th scope="col">Name</th>
            <th scope="col">Nickname</th>
            <th scope="col">Add</th>
            </tr>
         </thead>
         <tbody>
            ${users}
         </tbody>
      </table>
      </div>
      <div class="modal-footer">
        <button type="button" onclick="reenableHoverOnCards()" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>`;
   return cardBody;
}


function populatePlaylists(cid, playlists, endpoint) {
   var card = document.getElementById('card-cast');
   var container = document.getElementById('container-cast');
   container.append(card)

   // DEBUG: console.log(playlists, endpoint)
   switch (endpoint) {
      case 'createcommunity':
         let playlistContainer = document.getElementById("playlistContainer");
         playlists.forEach(playlist => {
            var stringified = JSON.stringify(playlist.songs).replace(/"/g, '&quot;');
            const card = `
            <div class="col-md-4 mb-4">
               <div class="card h-100">
                  <div class="card-body">
                     <h5 class="card-title">${playlist.title}</h5>
                     <p class="card-text">${playlist.description}</p>
                     <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#songsModal${playlist._id}"
                        onclick="showSongs('${playlist._id}', '${stringified}')">View Songs</button>

                     <button type="button" class="btn btn-primary" onclick="toggleCreateCommunityPlaylist(this,'${playlist._id}')">
                        Add Playlist
                     </button>

                  </div>
               </div>
            </div>
            `;
            playlistContainer.innerHTML += card;
         });
         break;

      case 'community':
         let playlistPublicContainer = document.getElementById("playlistPublicContainer");

         const creatorSharePlaylist = `
         <div class="col-md-4 mb-4">
              <div class="card h-100" id="creator-share-playlist" hidden>
                  <div class="card-body">
                      <h5 class="card-title">Add Personal Playlist</h5>
                      <p class="card-text"></p>
                  <div class="btn-group dropup mb-2">
                      <button class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" id='share-playlist-btn' hidden>
                        Share Playlist
                      </button>
                      <div class="dropdown-menu dropdown-menu-right" id="playlist-community${cid}" aria-labelledby="dropdownMenuButton">
                  </div>
                  </div>
              </div>
          </div>`;
         playlistPublicContainer.innerHTML += creatorSharePlaylist;
         // console.log(playlists);
         playlists.forEach(playlist => {
           var stringified = JSON.stringify(playlist.songs).replace(/"/g, '&quot;');
           const card = `
           <div class="col-md-4 mb-4">
           <div class="card h-100">
               <div class="card-body">
                   <h5 class="card-title">${playlist.title}${playlist.private ? '<i class="private bi bi-lock-fill text-success"></i>' : ''}</h5>
                   <p class="card-text">${playlist.description}</p>
                   <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#songsModal${playlist._id}"
                       onclick="showSongs('${playlist._id}', ${stringified})">
                       View Songs
                   </button>
                   <button class="btn btn-danger" onclick="removePlaylist('${playlist._id}','${playlist.title}')" hidden disabled>
                       Remove
                   </button>

               </div>
           </div>
          </div>`;
           playlistPublicContainer.innerHTML += card;
        });

         getUserPlaylists(user._id, 'community');
         break;

      default: break;
   }
}

async function populateCreatorPlaylistDropdown(cid, userPlaylists, communityPlaylists) {
   // DEBUG: console.log(userPlaylists, communityPlaylists);
   const dropdownMenu = document.getElementById(`playlist-community${cid}`);
   dropdownMenu.innerHTML = "";

   let playlistToShow = userPlaylists.filter(
      pl => { return !communityPlaylists.find(p => p._id == pl._id); }
   );

   for (const key in playlistToShow) {
     let p = playlistToShow[key];
     dropdownMenu.innerHTML += `<a class="dropdown-item" onClick='addPlaylistToCommunity("${p._id}","${cid}")'>${p.title}</a>`;
   }
}


async function addMemberToCommunity() {
   disableHoverOnCards();
   let modal = document.getElementById('#selectMemberModal');
   let selectMemberModal = new bootstrap.Modal(modal);

   selectMemberModal.show();
}


function removePlaylist(pid, title) {
   if (!window.confirm(`Confirm remove playlist < ${title} > from community?`)) return;

   fetch(`/community/${user._id}`, {
      method: 'PUT',
      headers: {
         'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({ op: 'removePlaylist', creatorId: user._id, pid: pid })
   }).then(response => {
         console.log(response.json());
         if (response.ok) {
            window.location.replace('/community');
         }
      }).catch(err => console.error(err));
}


function addUserToCommunityMembers(userId, endpoint) {
   switch (endpoint) {
      case 'createcommunity':
         let checkbox = document.getElementById('user-selection-'+userId);
         let checkboxLabel = document.getElementById('label-selection-'+userId);

         fetch(`/users/${userId}`)
            .then((response) => {
               if (!response.ok) {
                  console.error(response);
                  alert("Error fetching user of SNM. Retry.");
                  return;
               }
               response.json().then((user) => {
                  if (checkbox.checked) {
                     if (communityMembers[user.nickname]?._id == userId) {
                        alert("User already added to member of community.Cancel...");
                        return;
                     }
                     communityMembers.push({uid: userId});
                     checkboxLabel.innerHTML = `<small style="color:green">Added</small>`;
                  } else {
                     const index = communityMembers.indexOf({uid: userId});
                     if (index > -1) {
                       communityMembers.splice(index, 1);
                     }
                     checkboxLabel.innerHTML = `<small style="color:gray">Add to community</small>`;
                  }
               });
            });
         break;

      case 'community':
         let btn = document.getElementById('add-member-'+userId);
         if (btn.innerText == 'Remove') {
            fetch(`/community/${userId}`, {
               method: 'PUT',
               headers: {
                  'Content-Type': 'application/json;charset=utf-8'
               },
               body: JSON.stringify({ op: 'removeMemberFromId', creatorId: user._id, member: userId })
            }).then(response => {
                  console.log(response.json());
                  if (response.ok) {
                     btn.innerText = "Add";
                     btn.className = 'btn btn-primary';
                  }
               }).catch(err => console.error(err));
         } else {
            fetch(`/community/${userId}`, {
               method: 'PUT',
               headers: {
                  'Content-Type': 'application/json;charset=utf-8'
               },
               body: JSON.stringify({ op: 'addMember', creatorId: user._id, mid: userId })
            }).then(response => {
                  console.log(response.json());
                  if (response.ok) {
                     btn.innerText = "Remove";
                     btn.className = 'btn btn-danger';
                  }
               }).catch(err => console.error(err));
         }
         break;

      default:
         break;
   }
}

function removeMemberFromCommunity(member) {
   let strObj = JSON.parse(member);
   if (!window.confirm(`Confirm remove < ${strObj.nickname} > from community?`)) return;

   fetch(`/community/${user._id}`, {
      method: 'PUT',
      headers: {
         'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({ op: 'removeMember', creatorId: user._id, member: member })
   }).then(response => {
         console.log(response.json());
         if (response.ok) {
            window.location.replace('/community');
         }
      }).catch(err => console.error(err));
}


async function fetchCommunity(creatorId) {
   const res = await fetch(`/community/${creatorId}`)
   let communityData = await res.json();
   return communityData;
}


function communityHandleUI(community) {
   // const communityContainer = document.getElementById('community-container');
   const communityGeneralButton = document.getElementById("communityGeneralButton");

   document.getElementById('community-title').innerText = community.name;
   document.getElementById('community-desc').innerText = community.desc;

   if (community.creatorId == user._id) {
      communityGeneralButton.removeAttribute('disabled');

      communityGeneralButton.removeEventListener('hover', () => {
         communityGeneralButton.style.display = 'block';
         communityGeneralButton.innerText = `You are not the owner of this community.
         Only the creator can!`;
      });
      communityGeneralButton.addEventListener('click', () => {
         toggleEditCommunity(communityGeneralButton);
      });
   } else {
      communityGeneralButton.removeEventListener("click");
      communityGeneralButton.addEventListener('hover', () => {
         communityGeneralButton.style.display = 'block';
         communityGeneralButton.innerText = `You are not the owner of this community.
         Only the creator can!`;
      })
   }
}


function toggleEditCommunity(self) {
   const communityTitle = document.getElementById('community-title');
   const communityDesc = document.getElementById('community-desc');
   const creatorSharePlaylist = document.getElementById('creator-share-playlist');
   const creatorSharePlaylistBtn = document.getElementById('share-playlist-btn');
   const creatorAddMemberCard = document.getElementById('card-cast-'+user._id);
   // DEBUG: console.log(communityDesc);

   if (edit) {
      edit = false;
      let title = communityTitle.innerText;
      let desc = communityDesc.innerText;

      let btns = document.querySelectorAll('.btn-danger');
      btns.forEach(btn => {
         btn.setAttribute('disabled', true);
         btn.setAttribute('hidden', true);
      })
      communityTitle.removeAttribute('contenteditable');
      communityDesc.removeAttribute('contenteditable');

      creatorSharePlaylist.setAttribute('hidden', true);
      creatorSharePlaylistBtn.setAttribute('hidden', true);

      creatorAddMemberCard.setAttribute('hidden', true);

      communityTitle.style.borderColor = null;
      communityDesc.style.borderColor = null;

      if (cachedTitle != title || cachedDesc != desc) {
         let updateInfo = { name: title, desc: desc };
         fetch(`/community/${user._id}`, {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({ op: 'updateInfo', creatorId: user._id, info: updateInfo })
         }).then(response => {
               if (response.ok) {
                  cachedTitle = title;
                  cachedDesc = desc;
               };
            }).catch(err => console.error(err));
      }

      self.innerText = "Edit Community";
   } else {
      edit = true;
      let btns = document.querySelectorAll('.btn-danger');
      btns.forEach(btn => {
         btn.removeAttribute('disabled');
         btn.removeAttribute('hidden');
      })
      communityTitle.setAttribute('contenteditable', true);
      communityDesc.setAttribute('contenteditable', true);

      creatorSharePlaylist.removeAttribute('hidden');
      creatorSharePlaylistBtn.removeAttribute('hidden');

      creatorAddMemberCard.removeAttribute('hidden');


      cachedTitle = communityTitle.innerText;
      cachedDesc = communityTitle.innerText;
      self.innerText = "Save Changes";
   }

}


function checkFieldFullfilled() {
   let name = document.getElementById('name').value;
   let desc = document.getElementById('description').value;

   return !(name == "") && !(desc == "");
}

