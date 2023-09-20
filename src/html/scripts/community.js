var user = null;
var pageMembers = 0;
var edit = false;


// TODO: divide createcommunity function in separate module and fix


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
            <div>
               <a style="position:absolute; left:44%; top:50%;" class="btn btn-primary" href="/community">Enter Community</a>
            </div>
            `;
            return
         };


         populateMembers([], endpoint);
         getUserPlaylists(uid, endpoint);
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
         getCommunityPlaylists(community.playlists, endpoint);
         // populatePlaylists(community.playlists, endpoint);
         communityHandleUI(community);
         break;

      default: break;
   }
}



// function prevMembers() {
//    if (pageResults > 0) {
//       pageResults = pageResults - 1
//       getCredits(id, pageResults)
//    }
// }


// function nextResults() {
//    pageResults = pageResults + 1
//    getCredits(id, pageResults)
// }


function getUserPlaylists(uid, endpoint) {
   fetch(`/playlist/${uid}`).then((response) => {
      if (response.ok) {
         response.json().then((userPlaylists) => {
            populatePlaylists(userPlaylists, endpoint);
         })
      }
   });
}

async function getCommunityPlaylists(playlists, endpoint) {
   let playlistsData = [];

   for await (const i of playlists) {
      let res = await fetch(`/getplaylist/${i.pid}`);
      let pl = await res.json();
      playlistsData.push(pl);
   }
   populatePlaylists(playlistsData, endpoint);
}


function populateMembers(members, endpoint) {
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
                     clone.getElementsByClassName('checkbox')[0].setAttribute('onClick', `addUserToCommunityMembers('${members[i]._id}')`);

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
         // TODO: add button to remove member from community

         for (let i in members) {
            /* Skip card creation for creator of community */
            if (user._id == members[i].uid) continue;
            fetch(`/users/${members[i].uid}`).then((response) => {
               if (response.ok) {
                  response.json().then((m) => {
                     var clone = card.cloneNode(true)
                     // console.log(m);
                     clone.id = 'card-cast-' + m._id
                     clone.getElementsByClassName('card-text')[0].innerHTML = m.name
                     clone.getElementsByClassName('text-body-secondary')[0].innerHTML = m.nickname

                     // IDT we want to add the profile picture for users... just use a placeholder
                     clone.getElementsByClassName('card-img-top')[0].src =
                        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'

                     let strMember = JSON.stringify(m);
                     clone.getElementsByClassName('btn btn-danger')[0]
                        .setAttribute('onClick', `removeMemberFromCommunity('${strMember}')`);

                     clone.classList.remove('d-none')
                     card.before(clone)
                  })
               }
            }).catch((err) => {
                  console.error("Error fetching members of community:", err);
                  alert("Error fetching members of community. Retry!");
               })
         }

         break;

      default: break;
   }
}


function populatePlaylists(playlists, endpoint) {
   var card = document.getElementById('card-cast');
   var container = document.getElementById('container-cast');
   container.append(card)

   // console.log(playlists, endpoint)
   switch (endpoint) {
      case 'createcommunity':
         let playlistContainer = document.getElementById("playlistContainer");
         playlists.forEach(playlist => {
            var stringified = JSON.stringify(playlist.songs).replace(/"/g, '&quot;');
            const card = `
               <div class="col-md-4 mb-4">
               <div class="card h-100">
               <div class="card-body">
               <h5 class="card-title">${playlist.title}${playlist.private ? '<i class="bi bi-lock-fill text-success"></i>' : ''}</h5>
               <p class="card-text">${playlist.description}</p>
               <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#songsModal${playlist._id}"
               onclick="showSongs('${playlist._id}', ${stringified})">View Songs</button>
               <button class="btn btn-primary" onclick="toggleCreateCommunityPlaylist(this,'${playlist._id}')">
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

         // const creatorAddPlaylist = `
         // <div class="col-md-4 mb-4">
         //   <div class="card h-100">
         //    <div class="card-body">
         //     <button class="btn btn-danger" onclick="creatorAddPlaylist('${user._id}')" hidden disabled>
         //         Remove
         //     </button>
         //    </div>
         //   </div>
         // </div>`;
         // playlistPublicContainer += creatorAddPlaylist;

         // console.log(playlistPublicContainer);
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
         break;

      default: break;
   }
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
         // alert(response);
         if (response.ok) {
            window.location.replace('/community');
         }
      }).catch(err => console.error(err));
}


function addUserToCommunityMembers(userId) {
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
               communityMembers[user.nickname] = {_id: userId};
               checkboxLabel.innerHTML = `<small style="color:green">Added</small>`;
            } else {
               delete communityMembers[user.nickname];
               checkboxLabel.innerHTML = `<small style="color:gray">Add to community</small>`;
            }
         });
      });
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
   const communityContainer = document.getElementById('community-container');
   const communityGeneralButton = document.getElementById("communityGeneralButton");

   document.getElementById('community-title').innerText = community.name;
   document.getElementById('community-desc').innerText = community.desc;

   // if (community.creatorId == user._id) {
   communityGeneralButton.removeAttribute('disabled');

   communityGeneralButton.addEventListener("click", () => {
      toggleEditCommunity(community);
   });
}


function toggleEditCommunity(community) {
   if (edit) {
      edit = false;
      let btns = document.querySelectorAll('.btn-danger');
      btns.forEach(btn => {
         btn.setAttribute('disabled', true);
         btn.setAttribute('hidden', true);
      })

   } else {
      edit = true;
      let btns = document.querySelectorAll('.btn-danger');
      btns.forEach(btn => {
         btn.removeAttribute('disabled');
         btn.removeAttribute('hidden');
      })

      const deleteCommunityButton = document.getElementById("deleteCommunityButton");
      deleteCommunityButton.addEventListener("click", () => {
         // console.log(user);
         if (window.confirm("Do you really want to delete this community?")) {
            try {
               fetch(`/community/${user.id}`, {
                  method: 'DELETE',
                  headers: {
                     'Content-Type': 'application/json;charset=utf-8'
                  },
                  body: JSON.stringify({ creatorId: user._id})
               }).then(response => {
                     console.log(response.json());
                     alert(response);
                     if (response.ok) {
                        window.location.replace('/community');
                     }
                  })
            } catch (err) {
               console.error(err)
            }
         }
      });

   }


   // deleteCommunityButton.removeAttribute('disabled');
   // deleteCommunityButton.removeAttribute('hidden');

}




function checkFieldFullfilled() {
   let name = document.getElementById('name').value;
   let desc = document.getElementById('description').value;

   return !(name == "") && !(desc == "");
}



function searchUserToAdd() {
   fetch('/users').then((response) => {
      if (response.ok) {
         response.json().then(data => console.log(data))
      }
   }).catch((err) => console.error(err));
}

