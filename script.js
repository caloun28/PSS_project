const API_BASE_URL = 'https://genia-follicular-libbie.ngrok-free.dev';

document.addEventListener('DOMContentLoaded', () => {
    setActiveSite();
    fetchHistorie();
    fetchLiveTeplota();

    setInterval(fetchLiveTeplota, 60000)
    setInterval(fetchHistorie, 1800000)
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

async function fetchHistorie() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/historie`, {
            method: 'GET',
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        const data = await res.json();

        if (data && data.length > 0) {
            const casy = [];
            const teploty = [];
            const vlhkosti = [];

            data.forEach(zaznam => {
                const cistyCas = zaznam.time.split('.')[0] + 'Z';
                const cas = new Date(cistyCas);

                if (isNaN(cas.getTime())) {
                    console.error("Neplatný čas u záznamu:", zaznam);
                    casy.push("??:??");
                } else {
                    const formatCas = cas.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
                    casy.push(formatCas);
                }

                teploty.push(zaznam.teplota);
                vlhkosti.push(zaznam.vlhkost);
            });

            const prumerTeplota = (teploty.reduce((a, b) => a + b, 0) / teploty.length).toFixed(1);
            const prumerVlhkost = (vlhkosti.reduce((a, b) => a + b, 0) / vlhkosti.length).toFixed(1);

            const prumerTeplotaElement = document.querySelectorAll('.prumer-teplota');
            if (prumerTeplotaElement) {
                prumerTeplotaElement.forEach(element => {
                    element.textContent = `Průměrná teplota: ${prumerTeplota} °C`;
                });
            }

            const prumerVlhkostElement = document.querySelectorAll('.prumer-vlhkost');
            if (prumerVlhkostElement) {
                prumerVlhkostElement.forEach(element => {
                    element.textContent = `Průměrná vlhkost: ${prumerVlhkost} %`;
                });
            }

            vykresliGraf('teplotaGraf', 'Teplota (°C)', casy, teploty, '#FF6384');
            vykresliGraf('vlhkostGraf', 'Vlhkost (%)', casy, vlhkosti, '#36A2EB');
            vykresliSpolecnyGraf('spolecnyGraf', 'Teplota (°C)', 'Vlhkost (%)', casy, teploty, vlhkosti, '#FF6384', '#36A2EB');
        }

    } catch (error) {
        console.error('Chyba při načítání historie:', error);
    }
}

function vykresliSpolecnyGraf(canvasClass, label1, label2, labels, data1, data2, barva1, barva2) {
    const canvas = document.querySelectorAll(`.${canvasClass}`);
    if (canvas.length === 0) return;

    canvas.forEach(canvas => {
        const existujiciGraf = Chart.getChart(canvas);
        if (existujiciGraf) {
            existujiciGraf.destroy();
        }
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label1,
                    data: data1,
                    borderColor: barva1,
                    backgroundColor: barva1 + '22',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    yAxisID: 'y',
                }, {
                    label: label2,
                    data: data2,
                    borderColor: barva2,
                    backgroundColor: barva2 + '22',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    yAxisID: 'y1',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: label1,
                            color: barva1,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: false,
                        grid: {
                            drawOnChartArea: false,
                        },
                        title: {
                            display: true,
                            text: label2,
                            color: barva2,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });
    });
}


function vykresliGraf(canvasClass, label, labels, data, barva) {
    const canvas = document.querySelectorAll(`.${canvasClass}`);
    if (canvas.length === 0) return;

    canvas.forEach(canvas => {

        const existujiciGraf = Chart.getChart(canvas);
        if (existujiciGraf) {
            existujiciGraf.destroy();
        }
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: barva,
                    backgroundColor: barva + '22',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        })
    });
}
