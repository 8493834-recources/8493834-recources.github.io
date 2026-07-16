let score = 0;
let clickPower = 1;
let passiveCps = 0;
let clickHistory = [];
const CPS_WINDOW_MS = 1000;
let fractionalProgress = 0;

let totalCursorsCount = 0;
let currentOrbitAngle = 0;
let currentFingerDipOffset = 0; 
let isDipping = false;
let dipTimer = 0;
let currentUser = null;

// --- GOLDEN COOKIE SYSTEM TRACKERS ---
let goldenCookieMultiplier = 1;
let goldenCookieTimer = 0;
let goldenSpawnTimer = Math.random() * 60 + 30; // Spawns every 30 to 90 seconds

// Complete list of 24 upgrades (10 Original + 14 New Endgame Tiers)
const upgradesConfig = [
    { id: 'autoClicker', name: 'Auto-Clicker', type: 'cps',   val: 0.2, cost: 15,    mult: 1.15, desc: 'A pointing hand that clicks automatically.' },
    { id: 'rollingPin',  name: 'Rolling Pin',  type: 'click', val: 1,   cost: 50,    mult: 1.25, desc: 'Doubles your rolling muscle power.' },
    { id: 'grandma',     name: 'Grandma',      type: 'cps',   val: 1,   cost: 150,   mult: 1.20, desc: 'A nice grandma to bake more treats.' },
    { id: 'cookieFarm',  name: 'Cookie Farm',  type: 'cps',   val: 8,   cost: 1100,  mult: 1.20, desc: 'Grows cookies from organic seeds.' },
    { id: 'factoryOven', name: 'Factory Oven', type: 'cps',   val: 47,  cost: 12000, mult: 1.22, desc: 'Mass produces high-temp sweets.' },
    { id: 'cookieMine',  name: 'Cookie Mine',  type: 'cps',   val: 260, cost: 130000,mult: 1.24, desc: 'Mines out pure chocolate veins.' },
    { id: 'shipment',    name: 'Shipment',     type: 'cps',   val: 1400,cost: 1400000,mult:1.24, desc: 'Brings cargo from the Cookie Planet.' },
    { id: 'alchemyLab',  name: 'Alchemy Lab',  type: 'cps',   val: 7800,cost: 20000000,mult:1.24,desc: 'Transmutes raw gold into cookies.' },
    { id: 'portal',      name: 'Portal',       type: 'cps',   val: 44000,cost:330000000,mult:1.26,desc: 'Opens doorways to the Cookieverse.' },
    { id: 'timeMachine', name: 'Time Machine', type: 'cps',   val: 260000,cost:5100000000,mult:1.28,desc: 'Brings cookies from the past.' },
    { id: 'antimatter',  name: 'Antimatter Condenser', type: 'cps', val: 1.4e6, cost: 7.5e10, mult: 1.28, desc: 'Condenses cosmic antimatter into sweet dough.' },
    { id: 'prism',       name: 'Prism',                type: 'cps', val: 9.2e6, cost: 1.1e12, mult: 1.30, desc: 'Converts pure, refracted starlight into cookies.' },
    { id: 'chancemaker', name: 'Chancemaker',          type: 'cps', val: 6.5e7, cost: 2.6e13, mult: 1.30, desc: 'Manipulates luck to make baking accidents impossible.' },
    { id: 'fractalEngine',name: 'Fractal Engine',      type: 'cps', val: 4.5e8, cost: 3.1e14, mult: 1.32, desc: 'Uses fractal geometry to turn cookies into more cookies.' },
    { id: 'javascript',  name: 'Javascript Console',   type: 'cps', val: 3.2e9, cost: 7.5e15, mult: 1.32, desc: 'Alters the source code of reality to code in free cookies.' },
    { id: 'idleverse',   name: 'Idleverse',            type: 'cps', val: 2.4e10,cost: 1.2e17, mult: 1.34, desc: 'Harvests production loops from alternate dimensions.' },
    { id: 'cortexBaker', name: 'Cortex Baker',         type: 'cps', val: 1.8e11,cost: 1.9e18, mult: 1.34, desc: 'A super-brain network that visualises cookies into existence.' },
    { id: 'laserRoller', name: 'Laser Rolling Pin',    type: 'click',val: 50000, cost: 4.5e18, mult: 1.35, desc: 'Heats dough to atomic levels. Huge Click Power burst.' },
    { id: 'you',         name: 'Clone of You',         type: 'cps', val: 1.5e12,cost: 2.6e19, mult: 1.36, desc: 'Hires cloned versions of yourself to double your speed.' },
    { id: 'grandmaGod',  name: 'Elder Goddess',        type: 'cps', val: 1.2e13,cost: 3.8e20, mult: 1.36, desc: 'Awakens an ancient deity of flour and baking wrath.' },
    { id: 'galacticCore',name: 'Galactic Core Tap',    type: 'cps', val: 9.8e13,cost: 5.5e21, mult: 1.38, desc: 'Siphons heavy thermal energy directly from the galaxy center.' },
    { id: 'quantumBake', name: 'Quantum Oven',         type: 'cps', val: 8.5e14,cost: 8.9e22, mult: 1.38, desc: 'Bakes items in all states of matter across time simultaneously.' },
    { id: 'realityWarp', name: 'Reality Warper',       type: 'cps', val: 7.6e15,cost: 1.4e24, mult: 1.40, desc: 'Bends structural space-time continuum vectors into cookie rings.' },
    { id: 'infiniteBakery',name: 'The Infinite Bakery',type: 'cps', val: 9.9e16,cost: 9.9e25, mult: 1.45, desc: 'The absolute final bottleneck of endless dough creation.' }
];

const upgradesState = {};
upgradesConfig.forEach(item => {
    upgradesState[item.id] = { level: 0, currentCost: item.cost };
});

const scoreEl = document.getElementById('score');
const cpsEl = document.getElementById('cps');
const clickPowerEl = document.getElementById('clickPower');
const cookieBtn = document.getElementById('cookieBtn');
const btnWrapper = document.getElementById('btnWrapper');
const shopListEl = document.getElementById('shopList');
const cursorHolderEl = document.getElementById('cursorHolder');
const usernameInput = document.getElementById('usernameInput');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const saveBtn = document.getElementById('saveBtn');
const authContainer = document.getElementById('authContainer');
const profileContainer = document.getElementById('profileContainer');
const activeUserEl = document.getElementById('activeUser');
const saveStatusEl = document.getElementById('saveStatus');

function formatMassiveNumbers(num) {
    if (num >= 1e24) return (num / 1e24).toFixed(2) + " Septillion";
    if (num >= 1e21) return (num / 1e21).toFixed(2) + " Sextillion";
    if (num >= 1e18) return (num / 1e18).toFixed(2) + " Quintillion";
    if (num >= 1e15) return (num / 1e15).toFixed(2) + " Quadrillion";
    if (num >= 1e12) return (num / 1e12).toFixed(2) + " Trillion";
    if (num >= 1e9)  return (num / 1e9).toFixed(2) + " Billion";
    if (num >= 1e6)  return (num / 1e6).toFixed(2) + " Million";
    return Math.floor(num).toLocaleString();
}
function saveGameData() {
    if (!currentUser) return;
    const gameData = {
        score: score, clickPower: clickPower, passiveCps: passiveCps,
        totalCursorsCount: totalCursorsCount, upgradesState: upgradesState
    };
    localStorage.setItem(`cookieUser_${currentUser.toLowerCase()}`, JSON.stringify(gameData));
    localStorage.setItem('cookie_lastActiveUser', currentUser);
    localStorage.setItem(`cookieUser_lastSeen_${currentUser.toLowerCase()}`, Date.now());
    saveStatusEl.style.opacity = '1';
    setTimeout(() => { saveStatusEl.style.opacity = '0'; }, 1500);
}

function loadGameData(username) {
    const rawData = localStorage.getItem(`cookieUser_${username.toLowerCase()}`);
    currentUser = username; 
    cursorHolderEl.innerHTML = '';
    
    upgradesConfig.forEach(item => { 
        upgradesState[item.id] = { level: 0, currentCost: item.cost }; 
    });
    
    if (rawData) {
        const parsed = JSON.parse(rawData);
        score = parsed.score || 0; 
        clickPower = parsed.clickPower || 1;
        passiveCps = parsed.passiveCps || 0; 
        totalCursorsCount = parsed.totalCursorsCount || 0;
        if (parsed.upgradesState) {
            Object.keys(parsed.upgradesState).forEach(key => {
                if (upgradesState[key]) {
                    upgradesState[key].level = parsed.upgradesState[key].level || 0;
                    upgradesState[key].currentCost = parsed.upgradesState[key].currentCost || upgradesConfig.find(u => u.id === key).cost;
                }
            });
        }
        for(let i=0; i<totalCursorsCount; i++) {
            const hand = document.createElement('div');
            hand.className = 'cursor-hand'; hand.innerHTML = '☝️';
            cursorHolderEl.appendChild(hand);
        }
    } else {
        score = 0; clickPower = 1; passiveCps = 0; totalCursorsCount = 0;
    }
    activeUserEl.textContent = currentUser;
    authContainer.style.display = 'none'; 
    profileContainer.style.display = 'block';
    buildShopUI(); 
    updateUI(); 
    arrangeCursors();
    checkOfflineEarnings();
}

function checkOfflineEarnings() {
    if (!currentUser) return;
    const storageKey = `cookieUser_lastSeen_${currentUser.toLowerCase()}`;
    const lastSeenRaw = localStorage.getItem(storageKey);
    const now = Date.now();

    if (lastSeenRaw && passiveCps > 0) {
        const lastSeen = parseInt(lastSeenRaw, 10);
        const secondsOffline = Math.floor((now - lastSeen) / 1000);
        const maxOfflineSeconds = 12 * 60 * 60; 
        const earnedSeconds = Math.min(secondsOffline, maxOfflineSeconds);

        if (earnedSeconds > 15) { 
            const cookiesEarned = Math.floor(earnedSeconds * passiveCps);
            score += cookiesEarned;
            alert(`Welcome back, ${currentUser}!\nYour bakery was active while you were away.\n\nTime Offline: ${Math.floor(earnedSeconds / 60)} minutes\nCookies Baked: +${formatMassiveNumbers(cookiesEarned)} 🍪`);
            updateUI();
        }
    }
    localStorage.setItem(storageKey, Date.now());
}

function logoutUser() {
    if (currentUser) saveGameData();
    currentUser = null; 
    localStorage.removeItem('cookie_lastActiveUser');
    score = 0; clickPower = 1; passiveCps = 0; totalCursorsCount = 0;
    cursorHolderEl.innerHTML = '';
    upgradesConfig.forEach(item => { upgradesState[item.id] = { level: 0, currentCost: item.cost }; });
    profileContainer.style.display = 'none'; 
    authContainer.style.display = 'block';
    usernameInput.value = ''; 
    buildShopUI(); 
    updateUI();
}

loginBtn.addEventListener('click', () => {
    let user = usernameInput.value.trim();
    if (user.length === 0) user = "Player1";
    loadGameData(user);
});

usernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        let user = usernameInput.value.trim();
        if (user.length === 0) user = "Player1";
        loadGameData(user);
    }
});

logoutBtn.addEventListener('click', logoutUser);
saveBtn.addEventListener('click', saveGameData);
function buildShopUI() {
    shopListEl.innerHTML = '';
    upgradesConfig.forEach(item => {
        const state = upgradesState[item.id];
        const card = document.createElement('div'); card.className = 'upgrade-card';
        const info = document.createElement('div'); info.className = 'upgrade-info';
        const title = document.createElement('div'); title.className = 'upgrade-title';
        title.innerHTML = `${item.name} (<span id="${item.id}Level">${state.level}</span>)`;
        const desc = document.createElement('div'); desc.className = 'upgrade-desc'; desc.textContent = item.desc;
        info.appendChild(title); info.appendChild(desc);
        const btn = document.createElement('button'); btn.className = 'upgrade-buy-btn'; btn.id = `${item.id}Btn`; btn.textContent = `Cost: ${state.currentCost}`;
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!currentUser) loadGameData("Player1");
            const currentState = upgradesState[item.id];
            if (score >= currentState.currentCost) {
                score -= currentState.currentCost; 
                currentState.level++;
                if (item.type === 'click') { clickPower += item.val; } else { passiveCps += item.val; }
                if (item.id === 'autoClicker') {
                    totalCursorsCount++;
                    const hand = document.createElement('div'); hand.className = 'cursor-hand'; hand.innerHTML = '☝️';
                    cursorHolderEl.appendChild(hand);
                }
                currentState.currentCost = Math.round(item.cost * Math.pow(item.mult, currentState.level));
                updateUI(); arrangeCursors();
            }
            this.blur();
        });
        card.appendChild(info); card.appendChild(btn); shopListEl.appendChild(card);
    });
}

function arrangeCursors() {
    const hands = document.querySelectorAll('.cursor-hand');
    const total = hands.length; if (total === 0) return;
    const baseRadius = 110; const targetRadius = baseRadius - currentFingerDipOffset; 
    const centerX = btnWrapper.offsetWidth > 0 ? btnWrapper.offsetWidth / 2 : 210;
    const centerY = btnWrapper.offsetHeight > 0 ? btnWrapper.offsetHeight / 2 : 150;
    hands.forEach((hand, index) => {
        const baseAngle = (index / total) * 2 * Math.PI;
        const angle = baseAngle + currentOrbitAngle;
        const x = centerX + targetRadius * Math.cos(angle) - 15;
        const y = centerY + targetRadius * Math.sin(angle) - 15;
        hand.style.left = `${x}px`; hand.style.top = `${y}px`;
        hand.style.transform = `rotate(${(angle * 180 / Math.PI) - 90}deg)`;
    });
}

function spawnGoldenCookie() {
    if (!currentUser) return;
    const golden = document.createElement('div');
    golden.className = 'golden-cookie';
    golden.innerHTML = '⭐';
    
    golden.style.left = Math.random() * (window.innerWidth - 80) + 'px';
    golden.style.top = Math.random() * (window.innerHeight - 80) + 'px';
    
    golden.addEventListener('click', () => {
        triggerGoldenBonus();
        golden.remove();
    });
    
    document.body.appendChild(golden);
    setTimeout(() => { golden.remove(); }, 10000); 
}

function triggerGoldenBonus() {
    const isMultiplier = Math.random() > 0.5;
    
    if (isMultiplier) {
        goldenCookieMultiplier = 7;
        goldenCookieTimer = 20;
        triggerClickEffect("FRENZY! x7 SPEED", "#fbbf24");
    } else {
        const instantReward = Math.max(50, passiveCps * 900);
        score += instantReward;
        triggerClickEffect(`LUCKY! +${formatMassiveNumbers(instantReward)}`, "#fbbf24");
        updateUI();
    }
}

function triggerFingersClickAnimation() {
    isDipping = true; dipTimer = 0;
    cookieBtn.classList.add('pressed');
    setTimeout(() => cookieBtn.classList.remove('pressed'), 100);
}

function handleManualClick() {
    if (!currentUser) loadGameData("Player1");
    const effectivePower = clickPower * goldenCookieMultiplier;
    score += effectivePower; 
    clickHistory.push(Date.now());
    triggerClickEffect(effectivePower, '#fef08a'); 
    updateUI();
}

function triggerClickEffect(displayValue, color) {
    const eff = document.createElement('div'); eff.className = 'floating-effect';
    eff.textContent = typeof displayValue === 'number' ? `+${formatMassiveNumbers(displayValue)} 🍪` : displayValue; 
    eff.style.color = color;
    eff.style.left = `${Math.random() * 40 + 30}%`; eff.style.top = `${Math.random() * 30 + 35}%`;
    btnWrapper.appendChild(eff); setTimeout(() => eff.remove(), 600);
    scoreEl.classList.add('pulse'); setTimeout(() => scoreEl.classList.remove('pulse'), 50);
}

function updateUI() {
    scoreEl.textContent = formatMassiveNumbers(score);
    clickPowerEl.textContent = formatMassiveNumbers(clickPower);
    upgradesConfig.forEach(item => {
        const state = upgradesState[item.id];
        const btn = document.getElementById(`${item.id}Btn`);
        const lvlSpan = document.getElementById(`${item.id}Level`);
        if (btn && lvlSpan) {
            lvlSpan.textContent = state.level;
            btn.textContent = `Cost: ${formatMassiveNumbers(state.currentCost)}`;
            btn.disabled = score < state.currentCost;
        }
    });
}

function calculateCps() {
    const now = Date.now();
    clickHistory = clickHistory.filter(timestamp => now - timestamp < CPS_WINDOW_MS);
    const displayCps = Math.max(clickHistory.length * clickPower, passiveCps);
    cpsEl.textContent = formatMassiveNumbers(displayCps * goldenCookieMultiplier);
}

let spacePressed = false;
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
        e.preventDefault();
        if (!spacePressed) { spacePressed = true; cookieBtn.classList.add('pressed'); handleManualClick(); }
    }
});
window.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
        e.preventDefault(); spacePressed = false; cookieBtn.classList.remove('pressed');
    }
});
cookieBtn.addEventListener('mousedown', (e) => { e.preventDefault(); handleManualClick(); });

let visualClickTimer = 0, autoSaveTimer = 0, lastTime = Date.now();
setInterval(() => {
    const now = Date.now(); const delta = (now - lastTime) / 1000; lastTime = now;
    if (currentUser) {
        if (passiveCps > 0) {
            fractionalProgress += (passiveCps * goldenCookieMultiplier) * delta;
            if (fractionalProgress >= 1) {
                const whole = Math.floor(fractionalProgress); fractionalProgress -= whole;
                score += whole; triggerClickEffect(whole, '#f59e0b'); updateUI();
            }
        }
        
        if (goldenCookieTimer > 0) {
            goldenCookieTimer -= delta;
            if (goldenCookieTimer <= 0) {
                goldenCookieMultiplier = 1; 
                triggerClickEffect("Frenzy Over", "#6b7280");
            }
        }

        goldenSpawnTimer -= delta;
        if (goldenSpawnTimer <= 0) {
            goldenSpawnTimer = Math.random() * 60 + 45; 
            spawnGoldenCookie();
        }

        if (totalCursorsCount > 0) {
            currentOrbitAngle += 0.3 * delta;
            if (isDipping) {
                dipTimer += delta * 15; currentFingerDipOffset = Math.sin(dipTimer) * 16; 
                if (dipTimer >= Math.PI) { isDipping = false; currentFingerDipOffset = 0; }
            }
            arrangeCursors();
            visualClickTimer += delta;
            if (visualClickTimer >= 1.0) { visualClickTimer = 0; triggerFingersClickAnimation(); }
        }
        autoSaveTimer += delta; if (autoSaveTimer >= 10.0) { autoSaveTimer = 0; saveGameData(); }
        localStorage.setItem(`cookieUser_lastSeen_${currentUser.toLowerCase()}`, Date.now());
    }
    calculateCps();
}, 16);

window.addEventListener('beforeunload', () => {
    if (currentUser) saveGameData();
});

window.onload = function() {
    buildShopUI(); updateUI();
    const autoLoadUser = localStorage.getItem('cookie_lastActiveUser');
    if (autoLoadUser) loadGameData(autoLoadUser);
};