
 async function generateMenu() {
    const menuElement = document.getElementById("footer");
    menuElement.innerHTML = `
    <div>
    <p class="footer-p">Powered By</p>
    <img src="../../public/images/spotify2.png" alt="Spotify Logo" style="width: 50px; height: auto; margin: 10px;">
    <img src="../../public/images/nodejs.png" alt="nodejs Logo" style="width: 50px; height: auto; margin: 10px;">
    <img src="../../public/images/express.png" alt="express Logo" style="width: 15%; height: auto;">
    </div>
 `;
 }
 generateMenu();
 