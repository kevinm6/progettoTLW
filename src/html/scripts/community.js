var user = null;
var pageMembers = 0;


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
         console.log(user);
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
   console.log(endpoint, uid, community);

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
         communityHandleUI(uid, community);
         break;

      default: break;
   }
}


// async function fetchUsersAndUpdateCards(membersData) {
//    // TODO: needs button to add users to community
//    if (membersData.lenght == null) return;
//    try {
//       membersData.forEach(async member => {
//          let res = await fetch(`/users/${member}`);
//          let memberInfo = await res.json()
//          // console.log(memberInfo, memberInfo[0].nickname)
//          const membersContainer = document.getElementById('membersContainer');
//          const card = `
// <div class="col-md-4 mb-4">
// <div class="card">
// <div class="card-body">
// <h5 class="card-title">${memberInfo[0].nickname}</h5>
// </div>
// </div>
// </div>
// `;
//          membersContainer.innerHTML += card;
//          // return memberInfo
//       });

//    } catch (error) {
//       console.error("Errore durante il recupero degli utenti:", error);
//       return {};
//    }
// }


// function editCommunity(community) {
//    console.log("Editing community...");
//    /**
//     * local updateCommunity = await fetch(`/community/`, {
//     * method: 'PUT'
//     * body: ''
//     * body: ''
//     * })
//     */
// }


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
         response.json().then((playlists) => {
            populatePlaylists(playlists, endpoint);
         })
      }
   })
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

         for (const member in members) {
            /* Skip card creation for creator of community */
            if (user._id == member._id) continue;
            fetch(`/users/${members[member]._id}`).then((response) => {
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
         const playlistContainer = document.getElementById("playlistContainer");
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
         // TODO: add button to remove member from community

         for (const member in members) {
            /* Skip card creation for creator of community */
            if (user._id == members[i]._id) continue;
            fetch(`/users/${members[member]._id}`).then((response) => {
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
   console.log("To remove from community: ", strObj);
   fetch(`/community/${user._id}`, {
      method: 'PUT',
      headers: {
         'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({ op: 'removeMember', creatorId: user._id, member: member })
   }).then(response => {
         console.log(response.json());
         alert(response);
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


function communityHandleUI(uid, community) {
   const communityContainer = document.getElementById('community-container');
   const communityGeneralButton = document.getElementById("communityGeneralButton");
   const deleteCommunityButton = document.getElementById("deleteCommunityButton");

   document.getElementById('community-title').innerText = community.name;
   document.getElementById('community-desc').innerText = community.desc;

   // if (community.creatorId == user._id) {
   communityGeneralButton.removeAttribute('disabled');
   deleteCommunityButton.removeAttribute('disabled');

   communityGeneralButton.addEventListener("click", () => {
      // TODO: manage edit of community:
      //        - add/remove members
      //        - add/remove playlist
      editCommunity(community);
      // window.location.href = '/createcommunity';
   });


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




function checkFieldFullfilled() {
   let name = document.getElementById('name').value;
   let desc = document.getElementById('description').value;

   return !(name == "") && !(desc == "");
}


function searchUserToAdd() {
   // TODO: add selection to users not present already in community
   fetch('/users').then((response) => {
      if (response.ok) {
         response.json().then(data => console.log(data))
      }
   }).catch((err) => console.error(err));
}


// TODO: to be done!
function getPlaylistsOfCommunity(params) {

}
