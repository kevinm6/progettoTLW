var communityMembers = {};
var pageMembers = 0;


function createCommunity(userId) {
   let name = document.getElementById('name').value;
   let description = document.getElementById('description').value;

   if (!checkFieldFullfilled()) {
      alert("Community name can't be empty!\nUpdate it and retry")
      return;
   }

   let newCommunity = {
      creatorId: userId,
      name: name,
      desc: description,
      members: communityMembers,
      playlists: []
   };


   fetch('/createcommunity', {
      method: "POST",
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify(newCommunity)
   }).then((response) => {
         if (response.ok) {
            response.json().then((msg) => {
               if (msg.error) {
                  if (confirm(msg.error)) window.location.replace('/community');
               } else {
                  document.getElementsByClassName('btn')[0].style.backgroundColor = 'green';
                  document.getElementsByClassName('btn')[0].innerText = 'Community successful created!';
                  setTimeout(function () {
                     window.location.replace("/community");
                  }, 1400);
               }
            });

         } else {
            console.error("Error creating community.");
         }
      });
}


function editCommunity(community) {
   console.log("Editing community...");
   /**
    * local updateCommunity = await fetch(`/community/`, {
    * method: 'PUT'
    * body: ''
    * body: ''
    * })
    */
}


function prevMembers() {
   if (pageResults > 0) {
      pageResults = pageResults - 1
      getCredits(id, pageResults)
   }
}


function nextResults() {
   pageResults = pageResults + 1
   getCredits(id, pageResults)
}


function showMembers(endpoint, members, pageMembers) {
   var card = document.getElementById('card-cast');
   var container = document.getElementById('container-cast');
   container.append(card)

   switch (endpoint) {
      case 'createcommunity':
         for (var i = pageMembers * 6; i < (pageMembers + 1) * 6; i++) {
            var clone = card.cloneNode(true)
            if (members[i] == null) break;


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

         break;

      case 'community':
         for (var i = pageMembers * 6; i < (pageMembers + 1) * 6; i++) {
            var clone = card.cloneNode(true)
            if (members[i] == null) break;


            clone.id = 'card-cast-' + i
            clone.getElementsByClassName('card-text')[0].innerHTML = members[i].name
            clone.getElementsByClassName('text-body-secondary')[0].innerHTML = members[i].nickname

            // IDT we want to add the profile picture for users... just use a placeholder
            clone.getElementsByClassName('card-img-top')[0].src =
               'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'

            // clone.getElementsByClassName('checkbox')[0].id += members[i]._id;
            // clone.getElementsByClassName('checkbox')[0].setAttribute('onClick', `addUserToCommunityMembers('${members[i]._id}')`);

            // clone.getElementsByTagName('label')[0].setAttribute('id', 'label-selection-'+ members[i]._id);
            // clone.getElementsByTagName('label')[0].setAttribute('for', 'user-selection-'+ members[i]._id);
            // clone.getElementsByTagName('label')[0].innerHTML = `<small style="color:gray;">Add to community</small>`;

            clone.classList.remove('d-none')

            card.before(clone)
         }

         break;

      default: break;
   }
}


function popolateMembers(endpoint) {
   fetch('/users')
      .then((response) => {
         if (!response.ok) {
            response.json().then((data) => alert(data.status_message));
            return
         }
         response.json().then((members) => showMembers(endpoint, members, pageResults))
      })
      .catch((e) => console.error("Error fetching users of SNM.", e));
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


function fetchCommunity(creatorId) {
   fetch(`/community/${creatorId}`)
      .then((response) => {
         if (!response.ok) {
            console.error("Error fetching community.", response);
            return null;
         }
         response.json().then((communityData) => handleUI(communityData));
      });
}


function handleUI(community) {
   // console.log(community);

   if (window.location.href.includes('/createcommunity')) {
      if (!community.error) {
         document.getElementById('create-community-container').innerHTML = `
         <br><br>
         <h2 style="text-align: center;">User has already a community.</h2>
         <p style="text-align: center; color: grey">click on the button below to show it</p>
         <div>
            <a style="position:absolute; left:44%; top:50%;" class="btn btn-primary" href="/community">Enter Community</a>
         </div>
         `
      }
      popolateMembers('createcommunity');
      return;
   }


   const communityContainer = document.getElementById('community-container');
   const communityGeneralButton = document.getElementById("communityGeneralButton");
   const deleteCommunityButton = document.getElementById("deleteCommunityButton");

   if (!community.error) {
      popolateMembers('community');

      console.log(community);
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

         // TODO: manage if user != creator
      // }
   } else {

      communityContainer.innerHTML = `
<br><br>
<h2 style="text-align: center;">No Community found.</h2>
<p style="text-align: center; color: grey">click on the button below to create one</p>
<div>
   <a style="position:absolute; left:44%; top:50%;" class="btn btn-primary" href="/createcommunity">Create Community</a>
</div>
`
   }
}


function checkFieldFullfilled() {
   let name = document.getElementById('name').value;
   let desc = document.getElementById('description').value;

   return !(name == "") && !(desc == "");
}

function checkIfUserHasCommunity() {
   let userId = localStorage.getItem('_id');
   // TODO: if user is not logged in, we must tell him to register to the app

   if (!userId) {

      return;
   }

   fetchCommunity(userId);
}
