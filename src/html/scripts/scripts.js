async function authenticateUser() {
    // Verifica se l'utente è loggato
    if (!localStorage.getItem("nickname") || !localStorage.getItem("email")) {
        return "ERR_NOT_LOGGED";
    }

    try {
        const response = await fetch('/authuser', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: localStorage.getItem("email"),
                nickname: localStorage.getItem("nickname"),
                _id: localStorage.getItem("_id") // invio dell'id al posto della password.
            })
        });

        if (!response.ok) {
            throw new Error("Autenticazione non valida");
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        return "ERR";
    }
}

function msToTime(msStr) {
    const padZero = (num) => (num < 10 ? "0" + num : num);

    const totalMilliseconds = parseInt(msStr, 10);
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}


async function showConfirmationModal(customModalTitle,customModalBody,confirmText,cancelText) {
    const modalContent = `
    <div class="modal modal-custom" id="confirmationModal">
        <div class="modal-content-custom">
            <h2 id="modalTitle">${customModalTitle}</h2>
            <p id="modalBody">${customModalBody}</p>
            <div class="button-container">
                <button id="confirmButton" class="btn btn-danger">${confirmText}</button>
                <button id="cancelButton" class="btn btn-secondary">${cancelText}</button>
            </div>
        </div>
    </div>
`;
    document.body.insertAdjacentHTML("beforeend", modalContent);
    return new Promise((resolve) => {
        // Ottieni riferimenti agli elementi del modal
        const confirmationModal = document.getElementById("confirmationModal");
        const cancelButton = document.getElementById("cancelButton");
        const confirmButton = document.getElementById("confirmButton");
        const modalTitle=document.getElementById("modalTitle");
        const modalBody=document.getElementById("modalBody");
        modalTitle.textContent=customModalTitle;
        modalBody.textContent=customModalBody;
        confirmButton.textContent=confirmText;
        cancelButton.textContent=cancelText
        confirmationModal.style.display = "block";

        // Event listener per il pulsante di conferma
        confirmButton.addEventListener("click", function () {
            hideConfirmationModal();
            resolve(true); // Risolvi la Promise con 'true'
            return true;
        });

        // Event listener per il pulsante di annullamento
        cancelButton.addEventListener("click", function () {
            hideConfirmationModal();
            resolve(false); // Risolvi la Promise con 'false'
            return false;
        });
    });
}

// hide the modal
function hideConfirmationModal() {
    const confirmationModal = document.getElementById("confirmationModal");
    confirmationModal.style.display = "none";
    return;
}


function disableHoverOnCards() {
   const cards = document.querySelectorAll('.card');
   cards.forEach(card => {
      card.classList.add('disable-hover');
   });
}
function reenableHoverOnCards() {
   const cards = document.querySelectorAll('.card');
   cards.forEach(card => {
      card.classList.remove('disable-hover');
   });
}

