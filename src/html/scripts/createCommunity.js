let playlists = [];


function createCommunity(userId) {
   let name = document.getElementById('name').value;
   let description = document.getElementById('description').value;

   if (!checkFieldFullfilled()) {
      alert("Community name can't be empty!\nUpdate it and retry");
      return;
   }

   let newCommunity = {
      creatorId: userId,
      name: name,
      desc: description,
      members: communityMembers,
      playlists: playlists
   };

   console.log(newCommunity);

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
                  setTimeout(function() {
                     window.location.replace("/community");
                  }, 1400);
               }
            });

         } else {
            console.error("Error creating community.");
         }
      });
}


function createCommunityHandleUI(community) {
   if (!community == null) {
      document.getElementById('create-community-container').innerHTML = `
<br><br>
<h2 style="text-align: center;">User has already a community.</h2>
<p style="text-align: center; color: grey">click on the button below to show it</p>
<div>
   <a style="position:absolute; left:44%; top:50%;" class="btn btn-primary" href="/community">Enter Community</a>
</div>
`
   } else {
      getUserPlaylists(user._id);
      return;
   }
}


function getUserPlaylists(uid) {
   fetch(`/playlist/${uid}`).then((response) => {
      if (response.ok) {
         response.json().then((playlists) => {
            populatePlaylists(playlists, 'createcommunity');
         })
      }
   })
}


function toggleCreateCommunityPlaylist(self, pid) {
   switch (self.innerText) {
      case 'Add Playlist':
         self.innerText = 'Remove Playlist';
         self.className = 'btn btn-danger';
         playlists.push(pid);
         break;

      case 'Remove Playlist':
         playlists = playlists.filter((item) => item !== pid);
         self.innerText = 'Add Playlist';
         self.className = 'btn btn-primary';

         break;

      default:
         break;
   }
   console.log(playlists);
}
