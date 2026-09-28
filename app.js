/**
 * AEROSPACE EVOLUTIONARY COMPUTATION CONTROLLER
 * Connects UI, Canvases, Genetic Engine, ISRO dataset, and Launch Vehicle Co-Evolution.
 */

// Initialize Engine
const engine = new EvolutionaryEngine();
let isPlaying = false;
let playInterval = null;
let hoveredSatellite = null;
let selectedVehicleForRadar = 'LVM3';

// DOM Elements
const orbitCanvas = document.getElementById('orbitCanvas');
const orbitCtx = orbitCanvas.getContext('2d');
const timelineCanvas = document.getElementById('timelineCanvas');
const timelineCtx = timelineCanvas.getContext('2d');
const radarCanvas = document.getElementById('radarCanvas');
const radarCtx = radarCanvas.getContext('2d');
const vehicleRadarCanvas = document.getElementById('vehicleRadarCanvas');
const vehicleRadarCtx = vehicleRadarCanvas.getContext('2d');

// Setup High-DPI Canvas
function setupDpiCanvas(canvas, ctx) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    return { width: rect.width, height: rect.height };
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================

function initApp() {
    if (typeof ISRO_SATELLITE_DATA !== 'undefined') {
        engine.initializeWithISRODataset(ISRO_SATELLITE_DATA);
    } else {
        console.error('ISRO_SATELLITE_DATA not found');
    }

    bindEvents();
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);
    
    updateTelemetry();
    renderVehicleCards();
    renderSatelliteTable();
    updateFuturisticVehicleMetrics();
    startAnimationLoop();
}

function resizeCanvases() {
    setupDpiCanvas(orbitCanvas, orbitCtx);
    setupDpiCanvas(timelineCanvas, timelineCtx);
    setupDpiCanvas(radarCanvas, radarCtx);
    setupDpiCanvas(vehicleRadarCanvas, vehicleRadarCtx);
    drawTimelineChart();
    drawRadarChart();
    drawVehicleRadarChart();
}

// ==========================================================================
// EVENT BINDINGS
// ==========================================================================

function bindEvents() {
    // Play / Pause / Step / Reset
    const btnPlayPause = document.getElementById('btnPlayPause');
    const btnStep = document.getElementById('btnStep');
    const btnReset = document.getElementById('btnReset');
    const speedSelect = document.getElementById('speedSelect');

    btnPlayPause.addEventListener('click', () => {
        if (isPlaying) pauseSimulation();
        else playSimulation();
    });

    btnStep.addEventListener('click', () => {
        stepSimulation();
    });

    btnReset.addEventListener('click', () => {
        pauseSimulation();
        engine.initializeWithISRODataset(ISRO_SATELLITE_DATA);
        updateTelemetry();
        renderVehicleCards();
        renderSatelliteTable();
        drawTimelineChart();
        drawRadarChart();
        drawVehicleRadarChart();
    });

    speedSelect.addEventListener('change', () => {
        if (isPlaying) {
            pauseSimulation();
            playSimulation();
        }
    });

    // Preset Scenarios
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            presetButtons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            applyPreset(e.currentTarget.dataset.preset);
        });
    });

    // Tab Switcher (Environment vs GA Parameters)
    const tabEnv = document.getElementById('tabEnv');
    const tabGA = document.getElementById('tabGA');
    const contentEnv = document.getElementById('contentEnv');
    const contentGA = document.getElementById('contentGA');

    tabEnv.addEventListener('click', () => {
        tabEnv.classList.add('active');
        tabGA.classList.remove('active');
        contentEnv.style.display = 'block';
        contentGA.style.display = 'none';
    });

    tabGA.addEventListener('click', () => {
        tabGA.classList.add('active');
        tabEnv.classList.remove('active');
        contentGA.style.display = 'block';
        contentEnv.style.display = 'none';
    });

    // Environmental Sliders
    bindSlider('sliderSolar', 'dispSolar', (val) => { engine.environment.solarActivity = parseFloat(val); }, 'x');
    bindSlider('sliderDebris', 'dispDebris', (val) => { engine.environment.debrisDensity = parseFloat(val); }, 'x');
    bindSlider('sliderDrag', 'dispDrag', (val) => { engine.environment.atmosphericDrag = parseFloat(val); }, 'x');
    bindSlider('sliderThermal', 'dispThermal', (val) => { engine.environment.thermalStress = parseFloat(val); }, 'x');
    bindSlider('sliderObsolescence', 'dispObsolescence', (val) => { engine.environment.obsolescenceSpeed = parseFloat(val); }, 'x');
    bindSlider('sliderCost', 'dispCost', (val) => { engine.environment.launchCostPressure = parseFloat(val); }, 'x');

    // GA Sliders
    bindSlider('sliderMutRate', 'dispMutRate', (val) => { engine.gaParams.mutationRate = parseFloat(val); }, '%', 100);
    bindSlider('sliderMutStrength', 'dispMutStrength', (val) => { engine.gaParams.mutationStrength = parseFloat(val); });
    bindSlider('sliderCrossover', 'dispCrossover', (val) => { engine.gaParams.crossoverRate = parseFloat(val); }, '%', 100);
    bindSlider('sliderElitism', 'dispElitism', (val) => { engine.gaParams.elitismRate = parseFloat(val); }, '%', 100);

    // Futuristic Vehicle Sliders
    const sProp = document.getElementById('sliderPropellantTech');
    const dProp = document.getElementById('dispPropellantTech');
    sProp.addEventListener('input', (e) => {
        const labels = ['', 'Solid/Hypergolic', 'Cryogenic (CE-20)', 'Reusable Methalox', 'Nuclear-Thermal Tug'];
        dProp.textContent = labels[parseInt(e.target.value, 10)];
        updateFuturisticVehicleMetrics();
    });

    const sReus = document.getElementById('sliderReusability');
    const dReus = document.getElementById('dispReusability');
    sReus.addEventListener('input', (e) => {
        const labels = ['', 'Expendable', 'Partial Recovery', 'Full Rapid Reusability'];
        dReus.textContent = labels[parseInt(e.target.value, 10)];
        updateFuturisticVehicleMetrics();
    });

    const sFair = document.getElementById('sliderFairingMargin');
    const dFair = document.getElementById('dispFairingMargin');
    sFair.addEventListener('input', (e) => {
        dFair.textContent = `${parseFloat(e.target.value).toFixed(1)}x Margin`;
        updateFuturisticVehicleMetrics();
    });

    // Search and Filters
    document.getElementById('tableSearch').addEventListener('input', renderSatelliteTable);
    document.getElementById('filterCategory').addEventListener('change', renderSatelliteTable);
    document.getElementById('filterStatus').addEventListener('change', renderSatelliteTable);

    // Orbit Canvas Mouse Interaction
    orbitCanvas.addEventListener('mousemove', handleCanvasHover);
    orbitCanvas.addEventListener('click', handleCanvasClick);

    // Modal Close
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('inspectModal').addEventListener('click', (e) => {
        if (e.target.id === 'inspectModal') closeModal();
    });
}

function bindSlider(sliderId, dispId, setter, unit = '', mult = 1) {
    const slider = document.getElementById(sliderId);
    const disp = document.getElementById(dispId);
    if (!slider || !disp) return;

    slider.addEventListener('input', (e) => {
        const val = e.target.value;
        setter(val);
        const displayVal = mult !== 1 ? Math.round(parseFloat(val) * mult) : parseFloat(val).toFixed(2);
        disp.textContent = `${displayVal}${unit}`;
    });
}

function applyPreset(presetKey) {
    if (presetKey === 'historical') {
        setSliderValues({ solar: 1.0, debris: 1.0, drag: 1.0, thermal: 1.0, obs: 1.0, cost: 1.0, mut: 0.15, cross: 0.75 });
        engine.activeCarrierVehicle = 'MIXED';
        document.getElementById('activeCarrierLabel').textContent = 'ADAPTIVE FLEET (MIXED)';
        engine.logEvent('[Preset Loaded] Historical Baseline: Standard space conditions, PSLV/Ariane/GSLV mixed fleet.');
    } else if (presetKey === 'kessler') {
        setSliderValues({ solar: 1.0, debris: 3.5, drag: 1.6, thermal: 1.2, obs: 1.2, cost: 1.4, mut: 0.28, cross: 0.85 });
        engine.activeCarrierVehicle = 'LVM3';
        document.getElementById('activeCarrierLabel').textContent = 'LVM3 (HEAVY SHIELDING CARRIER)';
        engine.logEvent('[Preset Loaded] Kessler Cascade: LVM3 selected to carry heavily armored Whipple shielded satellites.');
    } else if (presetKey === 'solar') {
        setSliderValues({ solar: 2.8, debris: 1.2, drag: 2.5, thermal: 2.2, obs: 1.1, cost: 1.2, mut: 0.25, cross: 0.80 });
        engine.activeCarrierVehicle = 'GSLV_MK2';
        document.getElementById('activeCarrierLabel').textContent = 'GSLV MK II (HIGH GEO/MEO INSERTION)';
        engine.logEvent('[Preset Loaded] Solar Superstorm: High-energy insertion to avoid lower atmospheric drag expansion.');
    } else if (presetKey === 'megaconstellation') {
        setSliderValues({ solar: 1.2, debris: 2.4, drag: 1.3, thermal: 1.0, obs: 2.3, cost: 0.8, mut: 0.20, cross: 0.80 });
        engine.activeCarrierVehicle = 'NGLV';
        document.getElementById('activeCarrierLabel').textContent = 'NGLV SOORYA (REUSABLE METHALOX)';
        engine.logEvent('[Preset Loaded] AI Megaconstellation: Reusable NGLV slashing launch cost to $1,200/kg.');
    }
    renderVehicleCards();
}

function setSliderValues(v) {
    const setVal = (id, dispId, val, unit = '', mult = 1) => {
        const s = document.getElementById(id);
        const d = document.getElementById(dispId);
        if (s && d) {
            s.value = val;
            const displayVal = mult !== 1 ? Math.round(parseFloat(val) * mult) : parseFloat(val).toFixed(2);
            d.textContent = `${displayVal}${unit}`;
            s.dispatchEvent(new Event('input'));
        }
    };
    if (v.solar !== undefined) setVal('sliderSolar', 'dispSolar', v.solar, 'x');
    if (v.debris !== undefined) setVal('sliderDebris', 'dispDebris', v.debris, 'x');
    if (v.drag !== undefined) setVal('sliderDrag', 'dispDrag', v.drag, 'x');
    if (v.thermal !== undefined) setVal('sliderThermal', 'dispThermal', v.thermal, 'x');
    if (v.obs !== undefined) setVal('sliderObsolescence', 'dispObsolescence', v.obs, 'x');
    if (v.cost !== undefined) setVal('sliderCost', 'dispCost', v.cost, 'x');
    if (v.mut !== undefined) setVal('sliderMutRate', 'dispMutRate', v.mut, '%', 100);
    if (v.cross !== undefined) setVal('sliderCrossover', 'dispCrossover', v.cross, '%', 100);
}

// ==========================================================================
// SIMULATION CONTROLLER
// ==========================================================================

function playSimulation() {
    isPlaying = true;
    const btn = document.getElementById('btnPlayPause');
    document.getElementById('playIcon').textContent = '⏸';
    document.getElementById('playText').textContent = 'Pause';
    btn.style.background = 'linear-gradient(135deg, #f59e0b, #ef4444)';

    const speed = parseInt(document.getElementById('speedSelect').value, 10) || 500;
    playInterval = setInterval(() => {
        stepSimulation();
    }, speed);
}

function pauseSimulation() {
    isPlaying = false;
    if (playInterval) clearInterval(playInterval);
    const btn = document.getElementById('btnPlayPause');
    document.getElementById('playIcon').textContent = '▶';
    document.getElementById('playText').textContent = 'Evolve Run';
    btn.style.background = '';
}

function stepSimulation() {
    engine.step();
    updateTelemetry();
    renderSatelliteTable();
    drawTimelineChart();
    drawRadarChart();
    drawVehicleRadarChart();
}

// ==========================================================================
// TELEMETRY & STATS DISPLAY
// ==========================================================================

function updateTelemetry() {
    const stats = engine.getSummaryStats();
    const gen = engine.generation;
    const simYear = 2025 + gen * 2;

    document.getElementById('valGeneration').textContent = gen;
    document.getElementById('valSimYear').textContent = `Year: ${simYear} (Epoch ${gen})`;

    document.getElementById('valActiveCount').textContent = stats.activeCount;
    const activePct = ((stats.activeCount / 135) * 100).toFixed(1);
    document.getElementById('valActivePercent').textContent = `${activePct}% of original pool`;

    document.getElementById('valEvolvedCount').textContent = stats.evolvedCount;
    document.getElementById('valEvolvedSub').textContent = `${stats.evolvedCount} new speciation lineages`;

    document.getElementById('valExtinctCount').textContent = stats.extinctCount;
    const mortPct = ((stats.extinctCount / (stats.totalPopulation || 135)) * 100).toFixed(1);
    document.getElementById('valExtinctPercent').textContent = `${mortPct}% total mortality`;

    document.getElementById('valAvgFitness').textContent = stats.avgFitness.toFixed(2);
    let healthStatus = 'Sub-optimal';
    if (stats.avgFitness > 0.70) healthStatus = 'Robust Adaptation';
    else if (stats.avgFitness > 0.50) healthStatus = 'Selective Equilibrium';
    else healthStatus = 'High Extinction Stress';
    document.getElementById('valFitnessSub').textContent = `Status: ${healthStatus}`;

    // Extinction root causes
    const extList = document.getElementById('extinctionList');
    extList.innerHTML = '';
    const sortedCauses = Object.entries(stats.extinctionReasons).sort((a, b) => b[1] - a[1]);
    if (sortedCauses.length === 0) {
        extList.innerHTML = '<div style="font-size:0.75rem; color:var(--text-muted);">No recorded extinctions</div>';
    } else {
        sortedCauses.slice(0, 5).forEach(([cause, count]) => {
            const item = document.createElement('div');
            item.className = 'extinction-item';
            item.innerHTML = `
                <div class="extinction-item-name">
                    <span style="color:var(--extinct-color);">•</span> ${cause}
                </div>
                <div class="extinction-item-count">${count}</div>
            `;
            extList.appendChild(item);
        });
    }

    // Event Terminal Log
    const term = document.getElementById('eventTerminal');
    term.innerHTML = '';
    engine.eventLogs.forEach(log => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        if (log.text.includes('Extinction') || log.text.includes('ALERT')) div.classList.add('alert');
        if (log.text.includes('Speciation')) div.classList.add('speciation');
        div.innerHTML = `<span class="log-time">[${log.timestamp}]</span> ${log.text}`;
        term.appendChild(div);
    });
}

// ==========================================================================
// LAUNCH VEHICLE SHOWCASE & CO-EVOLUTION LAB
// ==========================================================================

function renderVehicleCards() {
    const grid = document.getElementById('vehicleCardsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const vehicles = Object.values(LAUNCH_VEHICLE_DATABASE);

    vehicles.forEach(veh => {
        const isSelected = engine.activeCarrierVehicle === veh.id;
        const card = document.createElement('div');
        card.className = `vehicle-card ${isSelected ? 'active-carrier' : ''}`;
        card.onclick = () => selectVehicleCarrier(veh.id);

        let tagHtml = '';
        if (veh.usedMoreThan5) {
            tagHtml += `<span class="vehicle-tag tag-most-used">&gt;5 LAUNCHES (${veh.launches})</span>`;
        }
        if (veh.isCurrent) {
            tagHtml += `<span class="vehicle-tag tag-current">CURRENT ISRO</span>`;
        } else if (veh.id === 'NGLV') {
            tagHtml += `<span class="vehicle-tag tag-futuristic">FUTURISTIC REUSABLE</span>`;
        } else {
            tagHtml += `<span class="vehicle-tag" style="background:rgba(255,255,255,0.08); color:var(--text-secondary);">HISTORIC PARTNER</span>`;
        }

        card.innerHTML = `
            <div class="vehicle-card-header">
                <div>
                    <div class="vehicle-card-name">${veh.shortName}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${veh.category}</div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                    ${tagHtml}
                </div>
            </div>

            <div class="vehicle-specs-grid">
                <div class="vehicle-spec-item">
                    <div class="vehicle-spec-label">Payload to LEO</div>
                    <div class="vehicle-spec-value">${veh.leoCapacityKg.toLocaleString()} kg</div>
                </div>
                <div class="vehicle-spec-item">
                    <div class="vehicle-spec-label">Payload to GTO</div>
                    <div class="vehicle-spec-value">${veh.gtoCapacityKg > 0 ? veh.gtoCapacityKg.toLocaleString() + ' kg' : 'N/A'}</div>
                </div>
                <div class="vehicle-spec-item">
                    <div class="vehicle-spec-label">Success Rate</div>
                    <div class="vehicle-spec-value" style="color: ${veh.historicalSuccessRate > 90 ? 'var(--survivor-color)' : 'var(--amber-warning)'};">
                        ${veh.historicalSuccessRate}%
                    </div>
                </div>
                <div class="vehicle-spec-item">
                    <div class="vehicle-spec-label">Insertion Precision</div>
                    <div class="vehicle-spec-value" style="color: var(--cyan-accent);">
                        ${(veh.injectionPrecision * 100).toFixed(0)}%
                    </div>
                </div>
            </div>

            <div style="font-size: 0.74rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 0.8rem;">
                ${veh.description}
            </div>

            <div class="vehicle-boost-bar">
                <span style="color: var(--text-muted); font-size: 0.72rem;">Carrier Synergy: <strong style="color:#fff;">+${Math.round((veh.coEvolutionModifiers.shieldingBonus + veh.coEvolutionModifiers.propulsionBonus) * 50)}%</strong></span>
                <button class="btn-select-carrier">
                    ${isSelected ? '✓ Active Carrier' : 'Select Carrier'}
                </button>
            </div>
        `;

        grid.appendChild(card);
    });
}

function selectVehicleCarrier(vehId) {
    engine.activeCarrierVehicle = vehId;
    selectedVehicleForRadar = vehId;
    const v = LAUNCH_VEHICLE_DATABASE[vehId];
    document.getElementById('activeCarrierLabel').textContent = `${v.shortName.toUpperCase()} CARRIER`;
    engine.logEvent(`[Carrier Selected] Future satellite generations will deploy via ${v.name}.`);
    renderVehicleCards();
    drawVehicleRadarChart();
    updateFuturisticVehicleMetrics();
}

function updateFuturisticVehicleMetrics() {
    const sProp = parseInt(document.getElementById('sliderPropellantTech').value, 10);
    const sReus = parseInt(document.getElementById('sliderReusability').value, 10);
    const sFair = parseFloat(document.getElementById('sliderFairingMargin').value);

    // Cost per kg drops with reusability and propellant efficiency
    const baseCost = 4200;
    const reusDiscount = sReus === 1 ? 1.0 : sReus === 2 ? 0.60 : 0.28;
    const propEfficiency = sProp === 1 ? 1.1 : sProp === 2 ? 0.95 : sProp === 3 ? 0.80 : 0.65;
    const projectedCost = Math.round(baseCost * reusDiscount * propEfficiency);

    // Satellite fuel lifetime extension from cryogenic precision & tug assistance
    const fuelSavings = Math.round(15 + sProp * 7 + (sFair - 1.0) * 12);

    document.getElementById('projCostVal').textContent = `$${projectedCost.toLocaleString()} / kg`;
    document.getElementById('projLifeBoost').textContent = `+${fuelSavings}% Fuel Savings`;

    drawVehicleRadarChart();
}

function drawVehicleRadarChart() {
    const rect = vehicleRadarCanvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    vehicleRadarCtx.clearRect(0, 0, w, h);

    const veh = LAUNCH_VEHICLE_DATABASE[selectedVehicleForRadar] || LAUNCH_VEHICLE_DATABASE.LVM3;

    const sProp = parseInt(document.getElementById('sliderPropellantTech').value, 10);
    const sReus = parseInt(document.getElementById('sliderReusability').value, 10);
    const sFair = parseFloat(document.getElementById('sliderFairingMargin').value);

    const axes = [
        { label: 'Injection Precision', val: veh.injectionPrecision * 0.95 },
        { label: 'Payload Allowance', val: Math.min(1.0, veh.massAllowanceFactor * sFair * 0.9) },
        { label: 'Reusability & Economy', val: Math.min(1.0, (veh.reusabilityScore * 0.5) + (sReus * 0.25)) },
        { label: 'Deep Space Capability', val: Math.min(1.0, (veh.gtoCapacityKg / 10500) * 0.6 + (sProp * 0.15)) },
        { label: 'Constellation Agility', val: veh.id === 'SSLV' ? 0.95 : (veh.id === 'NGLV' ? 0.88 : 0.65) },
        { label: 'Kessler Mitigation', val: Math.min(1.0, 0.4 + (veh.coEvolutionModifiers.shieldingBonus * 1.5)) }
    ];

    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(centerX, centerY) * 0.68;
    const angleStep = (Math.PI * 2) / axes.length;

    // Background Rings
    for (let ring = 1; ring <= 3; ring++) {
        const r = (radius / 3) * ring;
        vehicleRadarCtx.beginPath();
        for (let i = 0; i < axes.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            if (i === 0) vehicleRadarCtx.moveTo(x, y);
            else vehicleRadarCtx.lineTo(x, y);
        }
        vehicleRadarCtx.closePath();
        vehicleRadarCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        vehicleRadarCtx.stroke();
    }

    // Spokes & Labels
    axes.forEach((ax, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        vehicleRadarCtx.beginPath();
        vehicleRadarCtx.moveTo(centerX, centerY);
        vehicleRadarCtx.lineTo(x, y);
        vehicleRadarCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        vehicleRadarCtx.stroke();

        const labelX = centerX + Math.cos(angle) * (radius + 15);
        const labelY = centerY + Math.sin(angle) * (radius + 15);
        vehicleRadarCtx.fillStyle = '#94a3b8';
        vehicleRadarCtx.font = '8px "Space Grotesk", sans-serif';
        vehicleRadarCtx.textAlign = 'center';
        vehicleRadarCtx.textBaseline = 'middle';
        vehicleRadarCtx.fillText(ax.label, labelX, labelY);
    });

    // Draw Radar Polygon for Selected Vehicle
    vehicleRadarCtx.beginPath();
    axes.forEach((ax, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = radius * Math.min(1.0, Math.max(0.15, ax.val));
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) vehicleRadarCtx.moveTo(x, y);
        else vehicleRadarCtx.lineTo(x, y);
    });
    vehicleRadarCtx.closePath();

    vehicleRadarCtx.fillStyle = 'rgba(139, 92, 246, 0.25)';
    vehicleRadarCtx.fill();
    vehicleRadarCtx.strokeStyle = '#8b5cf6';
    vehicleRadarCtx.lineWidth = 2;
    vehicleRadarCtx.shadowColor = '#8b5cf6';
    vehicleRadarCtx.shadowBlur = 10;
    vehicleRadarCtx.stroke();
    vehicleRadarCtx.shadowBlur = 0;
}

// ==========================================================================
// ORBITAL SPATIAL SIMULATION CANVAS
// ==========================================================================

function startAnimationLoop() {
    function animate() {
        renderOrbitSimulation();
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

function renderOrbitSimulation() {
    const rect = orbitCanvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    orbitCtx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.92;

    // Background Stars
    orbitCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 30; i++) {
        const sx = ((i * 137.5) % w);
        const sy = ((i * 249.3) % h);
        orbitCtx.fillRect(sx, sy, 1, 1);
    }

    // Concentric Orbits
    const orbits = [
        { key: 'LEO', r: maxRadius * 0.32, color: 'rgba(0, 242, 254, 0.18)', label: 'LEO (300-1000km)' },
        { key: 'MEO', r: maxRadius * 0.55, color: 'rgba(56, 189, 248, 0.18)', label: 'MEO (NavIC / GNSS)' },
        { key: 'GEO', r: maxRadius * 0.78, color: 'rgba(139, 92, 246, 0.18)', label: 'GEO (35,786km)' },
        { key: 'DEEP', r: maxRadius * 0.94, color: 'rgba(245, 158, 11, 0.15)', label: 'DEEP SPACE / L1' }
    ];

    orbits.forEach(o => {
        orbitCtx.beginPath();
        orbitCtx.arc(centerX, centerY, o.r, 0, Math.PI * 2);
        orbitCtx.strokeStyle = o.color;
        orbitCtx.setLineDash([4, 6]);
        orbitCtx.lineWidth = 1;
        orbitCtx.stroke();
        orbitCtx.setLineDash([]);

        orbitCtx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        orbitCtx.font = '9px "JetBrains Mono", monospace';
        orbitCtx.fillText(o.label, centerX + 10, centerY - o.r + 12);
    });

    // Central Earth
    const earthRadius = maxRadius * 0.15;
    const gradEarth = orbitCtx.createRadialGradient(centerX, centerY, 2, centerX, centerY, earthRadius);
    gradEarth.addColorStop(0, '#38bdf8');
    gradEarth.addColorStop(0.6, '#0284c7');
    gradEarth.addColorStop(1, '#082f49');

    orbitCtx.beginPath();
    orbitCtx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
    orbitCtx.fillStyle = gradEarth;
    orbitCtx.fill();

    orbitCtx.beginPath();
    orbitCtx.arc(centerX, centerY, earthRadius + 4, 0, Math.PI * 2);
    orbitCtx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    orbitCtx.lineWidth = 2;
    orbitCtx.stroke();

    const baseRadiusMap = {
        LEO: maxRadius * 0.32,
        MEO: maxRadius * 0.55,
        GEO: maxRadius * 0.78,
        DEEP: maxRadius * 0.94
    };

    let closestHover = null;
    let closestDist = 12;

    engine.population.forEach(ind => {
        ind.angle = (ind.angle || 0) + (ind.orbitSpeed || 0.01);
        const baseR = baseRadiusMap[ind.orbit] || baseRadiusMap.LEO;
        const r = baseR + (ind.radiusVariation || 0) * maxRadius;

        const x = centerX + Math.cos(ind.angle) * r;
        const y = centerY + Math.sin(ind.angle) * r;
        ind.screenX = x;
        ind.screenY = y;

        if (mousePos) {
            const dist = Math.hypot(mousePos.x - x, mousePos.y - y);
            if (dist < closestDist) {
                closestDist = dist;
                closestHover = ind;
            }
        }

        orbitCtx.beginPath();
        if (ind.status === 'active') {
            orbitCtx.arc(x, y, 3.5, 0, Math.PI * 2);
            orbitCtx.fillStyle = '#10b981';
            orbitCtx.shadowColor = '#10b981';
            orbitCtx.shadowBlur = 8;
            orbitCtx.fill();
        } else if (ind.status === 'evolved') {
            orbitCtx.arc(x, y, 4, 0, Math.PI * 2);
            orbitCtx.fillStyle = '#a855f7';
            orbitCtx.shadowColor = '#a855f7';
            orbitCtx.shadowBlur = 10;
            orbitCtx.fill();
        } else {
            orbitCtx.rect(x - 2, y - 2, 4, 4);
            orbitCtx.fillStyle = 'rgba(244, 63, 94, 0.45)';
            orbitCtx.shadowBlur = 0;
            orbitCtx.fill();
        }
        orbitCtx.shadowBlur = 0;
    });

    hoveredSatellite = closestHover;

    if (hoveredSatellite) {
        const sat = hoveredSatellite;
        const hx = sat.screenX;
        const hy = sat.screenY;

        orbitCtx.beginPath();
        orbitCtx.arc(hx, hy, 9, 0, Math.PI * 2);
        orbitCtx.strokeStyle = '#00f2fe';
        orbitCtx.lineWidth = 1.5;
        orbitCtx.stroke();

        const text = `${sat.name} [${sat.status.toUpperCase()}]`;
        const sub = `Carrier: ${sat.launchVehicleName || 'PSLV'} | Orbit: ${sat.orbit} | Fit: ${sat.fitness.toFixed(2)}`;
        orbitCtx.font = '11px "Space Grotesk", sans-serif';
        const tw = Math.max(orbitCtx.measureText(text).width, orbitCtx.measureText(sub).width) + 16;
        const boxX = Math.min(w - tw - 10, Math.max(10, hx + 12));
        const boxY = Math.min(h - 45, Math.max(10, hy - 25));

        orbitCtx.fillStyle = 'rgba(6, 10, 24, 0.9)';
        orbitCtx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        orbitCtx.lineWidth = 1;
        orbitCtx.fillRect(boxX, boxY, tw, 40);
        orbitCtx.strokeRect(boxX, boxY, tw, 40);

        orbitCtx.fillStyle = '#ffffff';
        orbitCtx.fillText(text, boxX + 8, boxY + 16);
        orbitCtx.fillStyle = '#94a3b8';
        orbitCtx.font = '10px "JetBrains Mono", monospace';
        orbitCtx.fillText(sub, boxX + 8, boxY + 32);
    }
}

let mousePos = null;
function handleCanvasHover(e) {
    const rect = orbitCanvas.getBoundingClientRect();
    mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}
orbitCanvas.addEventListener('mouseleave', () => { mousePos = null; hoveredSatellite = null; });

function handleCanvasClick() {
    if (hoveredSatellite) {
        openModal(hoveredSatellite);
    }
}

// ==========================================================================
// TIMELINE EVOLUTION CHART CANVAS
// ==========================================================================

function drawTimelineChart() {
    const rect = timelineCanvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    timelineCtx.clearRect(0, 0, w, h);

    const history = engine.history;
    if (history.length === 0) return;

    const padL = 40, padR = 20, padT = 20, padB = 30;
    const graphW = w - padL - padR;
    const graphH = h - padT - padB;

    timelineCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    timelineCtx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padT + (graphH / 4) * i;
        timelineCtx.beginPath();
        timelineCtx.moveTo(padL, y);
        timelineCtx.lineTo(w - padR, y);
        timelineCtx.stroke();

        timelineCtx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        timelineCtx.font = '9px "JetBrains Mono", monospace';
        const val = Math.round(135 * (1 - i / 4));
        timelineCtx.fillText(val, 10, y + 3);
    }

    const maxGen = Math.max(10, history[history.length - 1].generation);
    const getX = (gen) => padL + (gen / maxGen) * graphW;
    const getY = (val) => padT + graphH - (val / 135) * graphH;

    function drawSeries(key, color, isRatio = false) {
        timelineCtx.beginPath();
        timelineCtx.strokeStyle = color;
        timelineCtx.lineWidth = 2;

        history.forEach((pt, i) => {
            const x = getX(pt.generation);
            const rawVal = pt[key];
            const val = isRatio ? rawVal * 135 : rawVal;
            const y = Math.max(padT, Math.min(padT + graphH, getY(val)));
            if (i === 0) timelineCtx.moveTo(x, y);
            else timelineCtx.lineTo(x, y);
        });
        timelineCtx.stroke();
    }

    drawSeries('activeCount', '#10b981');
    drawSeries('evolvedCount', '#a855f7');
    drawSeries('extinctCount', '#f43f5e');
    drawSeries('avgFitness', '#00f2fe', true);

    const legendItems = [
        { label: 'Survivors', color: '#10b981' },
        { label: 'Evolved', color: '#a855f7' },
        { label: 'Extinct', color: '#f43f5e' },
        { label: 'Fitness (scaled)', color: '#00f2fe' }
    ];

    let legX = padL + 10;
    legendItems.forEach(item => {
        timelineCtx.fillStyle = item.color;
        timelineCtx.fillRect(legX, 8, 12, 3);
        timelineCtx.fillStyle = '#cbd5e1';
        timelineCtx.font = '10px "Space Grotesk", sans-serif';
        timelineCtx.fillText(item.label, legX + 16, 12);
        legX += timelineCtx.measureText(item.label).width + 30;
    });

    timelineCtx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    timelineCtx.font = '9px "JetBrains Mono", monospace';
    timelineCtx.fillText(`Gen 0`, padL, h - 8);
    timelineCtx.fillText(`Gen ${maxGen}`, w - padR - 35, h - 8);
}

// ==========================================================================
// GENOMIC RADAR ADAPTATION CANVAS
// ==========================================================================

function drawRadarChart() {
    const rect = radarCanvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    radarCtx.clearRect(0, 0, w, h);

    const stats = engine.getSummaryStats();
    const averages = stats.geneAverages;
    const genes = GENE_DEFINITIONS;

    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(centerX, centerY) * 0.72;
    const angleStep = (Math.PI * 2) / genes.length;

    for (let ring = 1; ring <= 4; ring++) {
        const r = (radius / 4) * ring;
        radarCtx.beginPath();
        for (let i = 0; i < genes.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            if (i === 0) radarCtx.moveTo(x, y);
            else radarCtx.lineTo(x, y);
        }
        radarCtx.closePath();
        radarCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        radarCtx.stroke();
    }

    genes.forEach((g, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        radarCtx.beginPath();
        radarCtx.moveTo(centerX, centerY);
        radarCtx.lineTo(x, y);
        radarCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        radarCtx.stroke();

        const labelX = centerX + Math.cos(angle) * (radius + 16);
        const labelY = centerY + Math.sin(angle) * (radius + 16);
        radarCtx.fillStyle = '#94a3b8';
        radarCtx.font = '8.5px "Space Grotesk", sans-serif';
        radarCtx.textAlign = 'center';
        radarCtx.textBaseline = 'middle';
        
        const shortName = g.name.split(' ')[0];
        radarCtx.fillText(shortName, labelX, labelY);
    });

    radarCtx.beginPath();
    genes.forEach((g, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const val = averages[g.id] || 0.1;
        const r = radius * Math.min(1.0, Math.max(0.1, val));
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) radarCtx.moveTo(x, y);
        else radarCtx.lineTo(x, y);
    });
    radarCtx.closePath();

    radarCtx.fillStyle = 'rgba(0, 242, 254, 0.25)';
    radarCtx.fill();
    radarCtx.strokeStyle = '#00f2fe';
    radarCtx.lineWidth = 2;
    radarCtx.shadowColor = '#00f2fe';
    radarCtx.shadowBlur = 10;
    radarCtx.stroke();
    radarCtx.shadowBlur = 0;
}

// ==========================================================================
// ISRO POPULATION REGISTRY TABLE
// ==========================================================================

function renderSatelliteTable() {
    const tbody = document.getElementById('satelliteTableBody');
    if (!tbody) return;

    const searchTerm = (document.getElementById('tableSearch').value || '').toLowerCase();
    const filterCat = document.getElementById('filterCategory').value;
    const filterStat = document.getElementById('filterStatus').value;

    const filtered = engine.population.filter(sat => {
        const matchSearch = sat.name.toLowerCase().includes(searchTerm) || 
                            (sat.originalCategory || '').toLowerCase().includes(searchTerm) ||
                            (sat.launchVehicleName || '').toLowerCase().includes(searchTerm) ||
                            sat.orbit.toLowerCase().includes(searchTerm);
        
        const matchCat = filterCat === 'ALL' || sat.originalCategory === filterCat;
        const matchStat = filterStat === 'ALL' || sat.status === filterStat;

        return matchSearch && matchCat && matchStat;
    });

    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 2rem; color: var(--text-muted);">No matching satellites found</td></tr>`;
        return;
    }

    filtered.forEach((sat) => {
        const tr = document.createElement('tr');
        
        let statusBadgeClass = 'active';
        let statusLabel = 'Active';
        if (sat.status === 'evolved') {
            statusBadgeClass = 'evolved';
            statusLabel = 'Evolved';
        } else if (sat.status === 'extinct') {
            statusBadgeClass = 'extinct';
            statusLabel = 'Extinct';
        }

        const healthColor = sat.health > 70 ? 'var(--survivor-color)' : sat.health > 30 ? 'var(--amber-warning)' : 'var(--extinct-color)';

        tr.innerHTML = `
            <td style="font-family: var(--font-mono); color: var(--text-muted);">${sat.id.replace('ISRO-', '')}</td>
            <td style="font-weight: 700; color: #fff;">${sat.name}</td>
            <td style="color: var(--text-secondary);">${sat.originalCategory || 'General'}</td>
            <td><span class="orbit-tag">${sat.orbit}</span></td>
            <td style="font-family: var(--font-mono); color: var(--text-secondary);">${sat.launchVehicleName || 'PSLV'}</td>
            <td><span class="badge-status ${statusBadgeClass}">${statusLabel}</span></td>
            <td>
                <span style="font-family: var(--font-mono); font-weight:700; color: ${healthColor};">
                    ${Math.round(sat.health)}%
                </span>
            </td>
            <td>
                <span style="font-family: var(--font-mono); color: var(--cyan-accent); font-weight:700;">
                    ${sat.fitness.toFixed(2)}
                </span>
            </td>
            <td>
                <button class="btn-secondary" style="padding: 3px 8px; font-size: 0.72rem;" onclick="inspectFromTable('${sat.id}')">Inspect</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.inspectFromTable = function(satId) {
    const found = engine.population.find(s => s.id === satId);
    if (found) openModal(found);
};

// ==========================================================================
// SATELLITE GENOME DIAGNOSTIC MODAL
// ==========================================================================

function openModal(sat) {
    const modal = document.getElementById('inspectModal');
    document.getElementById('modalSatName').textContent = sat.name;
    document.getElementById('modalSatMeta').innerHTML = `
        <span>Category: ${sat.originalCategory || 'N/A'}</span> • 
        <span>Carrier: ${sat.launchVehicleName || 'PSLV'}</span> • 
        <span>Orbit: ${sat.orbit}</span> • 
        <span>Epoch: ${sat.launchDate}</span>
    `;

    const statusBadge = document.getElementById('modalStatusBadge');
    statusBadge.className = `badge-status ${sat.status}`;
    statusBadge.textContent = sat.status.toUpperCase();

    document.getElementById('modalHealthVal').textContent = `${Math.round(sat.health)}%`;
    document.getElementById('modalFitnessVal').textContent = sat.fitness.toFixed(2);
    document.getElementById('modalLineage').textContent = sat.lineage;

    const reasonEl = document.getElementById('modalExtinctionReason');
    if (sat.status === 'extinct') {
        reasonEl.style.display = 'block';
        reasonEl.innerHTML = `<strong style="color:var(--extinct-color);">Extinction Root Cause:</strong> ${sat.extinctionReason || 'Decommissioned'}`;
    } else {
        reasonEl.style.display = 'none';
    }

    const grid = document.getElementById('modalGeneGrid');
    grid.innerHTML = '';

    GENE_DEFINITIONS.forEach(def => {
        const val = sat.genes[def.id] || 0.1;
        const pct = Math.round(val * 100);
        const item = document.createElement('div');
        item.className = 'gene-item';
        item.innerHTML = `
            <div class="gene-item-head">
                <span style="font-weight: 600; color: #fff;">${def.name}</span>
                <span style="font-family: var(--font-mono); color: var(--cyan-accent); font-weight:700;">${pct}%</span>
            </div>
            <div class="gene-item-bar">
                <div class="gene-item-fill" style="width: ${pct}%;"></div>
            </div>
            <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">${def.desc}</div>
        `;
        grid.appendChild(item);
    });

    modal.classList.add('open');
}

function closeModal() {
    document.getElementById('inspectModal').classList.remove('open');
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', initApp);
