const API_BASE_URL = 'https://genia-follicular-libbie.ngrok-free.dev';

document.addEventListener('DOMContentLoaded', () => {









    setActiveSite();
    fetchLiveTeplota();
    fetchHistorie();

    setInterval(fetchLiveTeplota, 60000)
});


function setActiveSite() {
    const navButtons = document.querySelectorAll('.nav-button');
    const contentSections = document.querySelectorAll('.content');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.getAttribute('data-target');
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            contentSections.forEach(section => { section.classList.remove('active') });

            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.classList.add('active');
            }

        });

    });
}

async function fetchLiveTeplota() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/live_teplota`, {
            method: 'GET',
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        const data = await res.json();

        if (data.teplota && data.vlhkost) {
            console.log('Live teplota:', data.teplota);
            console.log('Live vlhkost:', data.vlhkost);
            const liveTemp = document.querySelectorAll('.live-teplota');
            if (liveTemp) {
                liveTemp.forEach(element => {
                    element.textContent = `Aktuální teplota: ${data.teplota} °C`;
                });
            }
            const liveHum = document.querySelectorAll('.live-vlhkost');
            if (liveHum) {
                liveHum.forEach(element => {
                    element.textContent = `Aktuální vlhkost: ${data.vlhkost} %`;
                });
            }
        }
    } catch (error) {
        console.error('Chyba při načítání live teploty:', error);
    }
}
