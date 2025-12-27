const trigger = document.getElementById('toggle-trigger');
const colorLayer = document.querySelector('.color-layer');
const grayLayer = document.querySelector('.gray-layer');
const label = document.getElementById('switch-text');
const navItems = document.querySelectorAll('.nav-item');
const emailElement = document.querySelector(".contact-email");

// 1. Audio Global
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(freq, duration, vol) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// 2. GSAP Timeline
const tl = gsap.timeline({ paused: true });

tl.to(colorLayer, {
    clipPath: "inset(0 0% 0 0)",
    duration: 1.2,
    ease: "expo.inOut"
})
.to(grayLayer, {
    x: -50,
    duration: 1.2,
    ease: "expo.inOut"
}, 0)
.from(".reveal-item", {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out"
}, "-=0.6");

// 3. Switch Logic
trigger.addEventListener('change', () => {
    if (trigger.checked) {
        colorLayer.style.pointerEvents = "all";
        tl.play();
        label.innerText = "MODO CREATIVO";
        label.style.color = "#00f2ff";
        playBeep(800, 0.1, 0.08);
    } else {
        colorLayer.style.pointerEvents = "none";
        tl.reverse();
        label.innerText = "ACTIVAR EXPERIENCIA?";
        label.style.color = "#888";
        playBeep(300, 0.1, 0.08);
    }
});

// 4. Menu & Hover Logic
navItems.forEach((item, index) => {
    // Función para activar imagen
    const activateImage = () => {
        if (trigger.checked) {
            const targetImg = document.getElementById(`bg-img-${index + 1}`);
            document.querySelectorAll('.nav-bg-img').forEach(img => img.classList.remove('active'));
            if(targetImg) targetImg.classList.add('active');
        }
    };

    // Evento para PC
    item.addEventListener('mouseenter', () => {
        activateImage();
        if (trigger.checked) playBeep(1200, 0.05, 0.02);
    });

    // Evento para Mobile (Click/Tap)
    item.addEventListener('click', activateImage);

    item.addEventListener('mouseleave', () => {
        document.querySelectorAll('.nav-bg-img').forEach(img => img.classList.remove('active'));
    });
});

// 5. Decodificación de Email (Estabilizada)
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ@.";
let interval = null;

emailElement.addEventListener("mouseenter", (event) => {
    const originalText = event.target.dataset.value;
    let iteration = 0;
    
    clearInterval(interval);
    if (trigger.checked) playBeep(1500, 0.1, 0.03);

    interval = setInterval(() => {
        event.target.innerText = originalText
            .split("")
            .map((letter, index) => {
                if (index < iteration) return originalText[index];
                return letters[Math.floor(Math.random() * letters.length)];
            })
            .join("");

        if (iteration >= originalText.length) {
            clearInterval(interval);
            event.target.innerText = originalText; // Asegura el final exacto
        }
        
        if (trigger.checked && iteration % 2 === 0) playBeep(2000, 0.02, 0.01);
        iteration += 1 / 3;
    }, 30);
});