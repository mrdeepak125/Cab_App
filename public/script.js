document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        document.querySelector(".pre-loader").style.display = "none";
        document.getElementById("content").style.display = "block";
    }, 3000); // Change 3000 to the number of milliseconds you want the pre-loader to display
});

function showPopup(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    popupMessage.innerText = message;
    popup.classList.add('visible');
}

function closePopup() {
    const popup = document.getElementById('popup');
    popup.classList.remove('visible');
}

document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();

    const fromLocation = document.getElementById('from-location').value;
    const toLocation = document.getElementById('to-location').value;
    const pickupDate = document.getElementById('pickup-date').value;
    const pickupTime = document.getElementById('pickup-time').value;

    if (!fromLocation || !toLocation || !pickupDate || !pickupTime) {
        showPopup('Please fill in all fields.');
        return;
    }

    fetch('/book-cab', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'from-location': fromLocation,
            'to-location': toLocation,
            'pickup-date': pickupDate,
            'pickup-time': pickupTime
        })
    }).then(response => response.text())
        .then(data => {
            showPopup(data);
        }).catch(error => {
            showPopup('Error saving booking.');
        });
});
