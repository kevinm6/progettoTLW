var communityMembers = {};
var pageMembers = 0;

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
   if (pageMembers > 0) {
      pageMembers = pageMembers - 1
      getCredits(id, pageMembers)
   }
}

function nextMembers() {
   pageMembers = pageMembers + 1
   getCredits(id, pageMembers)
}

function showMembers(members, pageMembers) {
   var card = document.getElementById('card-cast')
   var container = document.getElementById('container-cast')
   container.innerHTML = ''
   container.append(card)

   for (var i = pageMembers * 6; i < (pageMembers + 1) * 6; i++) {
      var clone = card.cloneNode(true)
      if (members[i] == null) break;

      clone.id = 'card-cast-' + i
      clone.getElementsByClassName('card-text')[0].innerHTML = members[i].name
      clone.getElementsByClassName('text-body-secondary')[0].innerHTML = members[i].nickname

      // IDT we want to add the profile picture for users...
      // just use a placeholder
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
}

function popolateMembers() {
   fetch('/users')
      .then((response) => {
         if (!response.ok) {
            response.json().then((data) => alert(data.status_message));
            return
         }
         response.json().then((members) => showMembers(members, pageMembers))
      })
      .catch((e) => console.error("Error fetching users of SNM.", e));
}


function addUserToCommunityMembers(userId) {
   console.log("Clicked checkbox", userId);
   let checkbox = document.getElementById('user-selection-'+userId);
   let checkboxLabel = document.getElementById('label-selection-'+userId);

   fetch(`/users/${userId}`)
      .then((response) => {
         if (!response.ok) {
            console.error("Error fetching user of SNM.", response);
            alert("Error fetching user of SNM. Retry.");
            return;
         }
         response.json().then((user) => {
            if (checkbox.checked) {
               communityMembers.push({_id: user._id});

            } else {
               communityMembers.pop()
            }
               // ._id === user._id).concat([{_id: user._id}]);

            // advise user about status of selection
            checkboxLabel.innerHTML = checkbox.checked ?
               `<small style="color:green">Added</small>`: `<small style="color:gray">Add to community</small>`;
         });
      });
}

async function fetchCommunity(creatorId) {
   fetch(`/community/${creatorId}`)
      .then((response) => {
         if (!response.ok) {
            console.error("Error fetching community.", response);
            return null;
         }
         console.log(response);
         response.json()
            .then((communityData) => {
               handleUI(communityData);
            })
            .catch((reason) => {
               handleUI(null);
            });
      });
}

function createCommunity() {
   let name = document.getElementById('name').value;
   let description = document.getElementById('description').value;
   let members = communityMembers;
   let communityData = {
      name: name,
      desc: description,
      members: members,
      // playlists: playlists
   };

   console.log(members)
   console.log(communityData);

   return;
   fetch('/createcommunity', {
      method: "POST",
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify(communityData)
   }).then(async response => {
         if (response.ok) {
            console.log("Community created successful!");
            setTimeout(function () {
               window.location.replace = "/community";
            }, 500);
         }
         else {
            console.error("Error creating community.");
         }
      });
}


function handleUI(community) {
   const communityContainer = document.getElementById('community-container');
   const communityGeneralButton = document.getElementById("communityGeneralButton");
   const deleteCommunityButton = document.getElementById("deleteCommunityButton");

   if (community) {
      communityContainer.innerHTML += `
<div class="col-12">
<h2>${community.name}</h2>
<h4>${community.desc}</h4>
</div>`

      if (community.creatorId == user._id) {
         communityGeneralButton.disabled = false;
         deleteCommunityButton.disabled = false;
         deleteCommunityButton.removeAttribute('disabled');
         deleteCommunityButton.removeAttribute('hidden');

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
                           window.location.href = '/community';
                        }
                        // fetch(`/community/${user.id}`)
                        // authandpopulate()
                     })
               } catch (err) {
                  console.error(err)
               }
            }
         });

         // TODO: manage if user != creator
      }
   } else {
      console.log("Community is ", community);

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
