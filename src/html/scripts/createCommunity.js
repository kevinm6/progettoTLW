var communityMembers = [];
let playlists = [];

function createCommunity(self, uid) {
   let name = document.getElementById('name').value;
   let description = document.getElementById('description').value;

   if (!checkFieldFullfilled()) {
      alert("Community name can't be empty!\nUpdate it and retry");
      return;
   }

   let newCommunity = {
      creatorId: uid,
      name: name,
      desc: description,
      members: communityMembers,
      playlists: playlists
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
                  self.innerText = ' Community successful created!';
                  self.style.backgroundColor = 'green';
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


function toggleCreateCommunityPlaylist(self, pid) {
   switch (self.innerText) {
      case 'Add Playlist':
         playlists.push({pid: pid});
         self.innerText = 'Remove Playlist';
         self.className = 'btn btn-danger';
         break;

      case 'Remove Playlist':
         playlists = playlists.filter((item) => item !== pid);
         self.innerText = 'Add Playlist';
         self.className = 'btn btn-primary';

         break;

   }
}



