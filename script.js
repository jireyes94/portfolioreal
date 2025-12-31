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
    clipPath: "inset(0 0% 0 0)", // Al activarse, 0% de recorte en todos lados
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
        document.body.classList.add('creative-active'); // <--- ESTA LÍNEA FALTA
        colorLayer.style.pointerEvents = "all";
        tl.play();
        label.innerText = "MODO CREATIVO";
        label.style.color = "#00f2ff";
        playBeep(800, 0.1, 0.2);
    } else {
        document.body.classList.remove('creative-active'); // <--- PARA REVERTIR
        colorLayer.style.pointerEvents = "none";
        tl.reverse();
        label.innerText = "ACTIVAR EXPERIENCIA?";
        label.style.color = "#888";
        playBeep(300, 0.1, 0.2);
    }
});

// 4. Menu & Hover Logic (CORREGIDO PARA MOBILE)
navItems.forEach((item, index) => {
    const activateItem = () => {
        if (!trigger.checked) return;
        
        // Desactivar otros
        navItems.forEach(i => i.classList.remove('active-mobile'));
        document.querySelectorAll('.nav-bg-img').forEach(img => img.classList.remove('active'));
        
        // Activar actual
        item.classList.add('active-mobile');
        const targetImg = document.getElementById(`bg-img-${index + 1}`);
        if(targetImg) targetImg.classList.add('active');
        
        playBeep(1200, 0.05, 0.1);
    };

    item.addEventListener('mouseenter', activateItem);

    item.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            activateItem();
        }
    });

    item.addEventListener('mouseleave', () => {
        // Solo removemos si no es mobile, para que el click persista
        if (window.innerWidth > 768) {
            document.querySelectorAll('.nav-bg-img').forEach(img => img.classList.remove('active'));
        }
    });
});

// 5. Decodificación de Email (Estabilizada)
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let interval = null;

document.querySelectorAll(".contact-email, .sidebar-link").forEach(el => {
    el.addEventListener("mouseenter", (event) => {
        const originalText = event.target.dataset.value;
        let iteration = 0;
        
        clearInterval(interval);
        if (trigger.checked) playBeep(1500, 0.1, 0.1);

        interval = setInterval(() => {
            event.target.innerText = originalText
                .split("")
                .map((letter, index) => {
                    if (originalText[index] === " ") return " "; 
                    if (index < iteration) return originalText[index];
                    return letters[Math.floor(Math.random() * letters.length)];
                })
                .join("");

            if (iteration >= originalText.length) clearInterval(interval);
            iteration += 1 / 3;
        }, 30);
    });
});

// Lógica de la Terminal Emergente Mejorada
const modal = document.getElementById('modal-terminal');
const openBtn = document.getElementById('open-terminal');
const closeBtn = document.getElementById('close-terminal');
const botInput = document.getElementById('bot-input');
const terminalBody = document.getElementById('terminal-body');
const inputArea = document.getElementById('input-area');
const waTrigger = document.getElementById('whatsapp-trigger');
const waLink = document.getElementById('wa-link');

let step = 1;
let userData = { name: '', contact: '' };

// 1. FUNCIÓN DE RESETEO (Punto 2 de tu pedido)
function resetTerminal() {
    step = 1;
    userData = { name: '', contact: '' };
    // Texto inicial profesionalizado (Punto 1 de tu pedido)
    terminalBody.innerHTML = '<div class="bot-msg">> POR FAVOR, DIGAME SU NOMBRE.</div>';
    inputArea.style.display = 'flex';
    waTrigger.style.display = 'none';
    botInput.value = "";
}

// Abrir Modal y Resetear
openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    resetTerminal(); // <-- Reset cada vez que se abre
    modal.style.display = 'flex';
    botInput.focus();
    if (trigger.checked) playBeep(800, 0.1, 0.1);
});

// Cerrar Modal
closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

// Lógica de Chat
botInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && botInput.value.trim() !== "") {
        const val = botInput.value.trim();
        addMsg(val, 'user-msg');
        botInput.value = "";

        if (step === 1) {
            userData.name = val;
            setTimeout(() => {
                addMsg(`> ID_VERIFICADO: ${val.toUpperCase()}.`, 'bot-msg');
                addMsg(`> WHATSAPP O EMAIL DONDE CONTACTARNOS?:`, 'bot-msg');
                step = 2;
            }, 600);
        } else if (step === 2) {
            userData.contact = val;
            sendToBackend(); // Enviar al backend propio
        }
    }
});

function addMsg(text, className) {
    const div = document.createElement('div');
    div.className = className;
    div.innerText = text.startsWith('>') ? text : `> ${text}`;
    terminalBody.appendChild(div);
    terminalBody.scrollTop = terminalBody.scrollHeight;
    if (trigger.checked) playBeep(1200, 0.05, 0.1);
}

// 3. ENVÍO AL BACKEND Y WHATSAPP (Punto 3 de tu pedido)
async function sendToBackend() {
    inputArea.style.display = 'none';

    try {
        // Fetch a tu propia API en Vercel
        await fetch("/api/contact", {
            method: "POST",
            body: JSON.stringify(userData)
        });
        addMsg('> NOS CONTACTAREMOS A LA MAYOR BREVEDAD.', 'bot-msg');
    } catch (err) {
        addMsg('> ERROR DE SINCRONIZACIÓN. CANAL DE RESPALDO ACTIVADO.', 'bot-msg');
    }

    // Configurar el botón final de WhatsApp
    const phone = "5492214379913"; 
    const message = encodeURIComponent(`Hola DCVDEV, soy ${userData.name}. Mi contacto es ${userData.contact}. Vi tu portfolio y quiero hablar de un proyecto.`);
    waLink.href = `https://wa.me/${phone}?text=${message}`;
    
    waTrigger.style.display = 'block';
    addMsg(`> CANAL DIRECTO HABILITADO.`, 'bot-msg');
    if (trigger.checked) playBeep(2000, 0.2, 0.1);
}

// 1. DATA DE PROYECTOS (Aquí agregas lo que quieras)
const myProjects = [
    { name: "NOTYPE.LABS", img: "img/notypelabs.jpg", url: "https://notypelabs.vercel.app" }
];

// 2. SELECTORES
const projectModal = document.getElementById('modal-projects');
const openProjectsBtn = document.getElementById('open-projects');
const closeProjectsBtn = document.getElementById('close-projects');
const projectsContainer = document.getElementById('projects-container');

// 3. RENDERIZADO TIPO COMPONENTE
function renderProjects() {
    projectsContainer.innerHTML = myProjects.map(project => `
        <div class="project-card">
            <div class="project-img" style="background-image: url('${project.img}')"></div>
            <div class="project-info">
                <h3>${project.name}</h3>
            </div>
            <a href="${project.url}" target="_blank" class="project-link">VISITAR SITIO</a>
        </div>
    `).join('');
}

// 4. EVENTOS
openProjectsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    renderProjects();
    projectModal.style.display = 'flex';
    if (trigger.checked) playBeep(800, 0.1, 0.2); // Usando tu volumen mejorado
});

closeProjectsBtn.addEventListener('click', () => {
    projectModal.style.display = 'none';
});

// Cerrar al clickear fuera
window.addEventListener('click', (e) => {
    if (e.target == projectModal) projectModal.style.display = "none";
});