var communityMembers = [];
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


function addUserToCommunityMembers(user) {
   console.log("Clicked checkbox", user);
   let checkbox = document.getElementById('user-selection-'+user);
   let checkboxLabel = document.getElementById('label-selection-'+user);

   if (checkbox.checked) {
      checkboxLabel.innerHTML = `<small style="color:green">Added</small>`;
   } else {
      checkboxLabel.innerHTML = `<small style="color:gray">Add to community</small>`;
   }


}


function createCommunity() {
   let title = document.getElementById("title").value;
   let description = document.getElementById("description").value;
   let members = communityMembers;
   let communityData = {};

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
