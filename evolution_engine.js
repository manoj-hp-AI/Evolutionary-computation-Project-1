/**
 * SATELLITE & LAUNCH VEHICLE EVOLUTIONARY COMPUTATION ENGINE
 * Models satellite survivability, extinction dynamics, and multi-generational evolution
 * linked with launch vehicle capabilities and futuristic space delivery evolution.
 */

// Gene definitions and their baseline physical meaning
const GENE_DEFINITIONS = [
    { id: 'radHardening', name: 'Radiation Hardening', desc: 'Resistance to solar proton events, cosmic rays, and Van Allen belt latch-ups', min: 0.1, max: 1.0 },
    { id: 'solarDegradationResist', name: 'PV Cell Resilience', desc: 'Multi-junction GaAs/perovskite cell degradation resistance over mission life', min: 0.1, max: 1.0 },
    { id: 'propulsionDeltaV', name: 'Propulsion & Station-Keeping', desc: 'Chemical/Electric propulsion capacity for orbital maintenance & collision evasion', min: 0.05, max: 1.0 },
    { id: 'debrisShielding', name: 'Whipple Debris Shielding', desc: 'Multi-layer standoff bumper protection against micrometeoroids and space debris', min: 0.05, max: 1.0 },
    { id: 'autonomousEvasion', name: 'Edge AI Autonomy', desc: 'On-board autonomous conjunction assessment and rapid collision avoidance', min: 0.05, max: 1.0 },
    { id: 'thermalTolerance', name: 'Thermal Control System', desc: 'Active/passive heat dissipation and tolerance to extreme day/night eclipse swings', min: 0.1, max: 1.0 },
    { id: 'redundancyLevel', name: 'Subsystem Redundancy', desc: 'Dual/triple voting modular redundancy across avionics, batteries, and OBC', min: 0.1, max: 1.0 },
    { id: 'softwareAdaptability', name: 'Software-Defined Agility', desc: 'In-orbit reprogramming capability to combat operational obsolescence', min: 0.05, max: 1.0 }
];

// Orbital Regimes
const ORBITAL_REGIMES = {
    LEO: { name: 'Low Earth Orbit (LEO)', alt: '300 - 1000 km', radiusNorm: 0.32, dragMultiplier: 2.5, debrisMultiplier: 3.0, radMultiplier: 0.8 },
    MEO: { name: 'Medium Earth Orbit (MEO)', alt: '1000 - 25000 km', radiusNorm: 0.55, dragMultiplier: 0.05, debrisMultiplier: 1.2, radMultiplier: 3.2 },
    GEO: { name: 'Geostationary Orbit (GEO)', alt: '35786 km', radiusNorm: 0.80, dragMultiplier: 0.0, debrisMultiplier: 1.5, radMultiplier: 1.8 },
    DEEP: { name: 'Deep Space / Lagrange', alt: '> 1.5M km', radiusNorm: 0.96, dragMultiplier: 0.0, debrisMultiplier: 0.2, radMultiplier: 4.0 }
};

// ==========================================================================
// LAUNCH VEHICLE DATABASE (Historical >5 Launches + Current ISRO + Futuristic)
// ==========================================================================
const LAUNCH_VEHICLE_DATABASE = {
    PSLV: {
        id: 'PSLV',
        name: 'PSLV (Polar Satellite Launch Vehicle)',
        shortName: 'PSLV',
        launches: 63,
        usedMoreThan5: true,
        isCurrent: true,
        category: 'Workhorse Multi-Stage',
        leoCapacityKg: 3800,
        gtoCapacityKg: 1425,
        historicalSuccessRate: 95.2,
        injectionPrecision: 0.95, // High orbital insertion accuracy
        massAllowanceFactor: 0.68,
        fairingVolumeM3: 38,
        upperStageType: 'Liquid PS4 (Mono-methyl hydrazine / MON-3)',
        propellantTech: 'Solid + Storable Liquid',
        reusabilityScore: 0.10, // Expendable
        costPerKgLEO: 4200, // USD
        coEvolutionModifiers: {
            propulsionBonus: 0.12,
            shieldingBonus: 0.05,
            redundancyBonus: 0.08,
            autonomyBonus: 0.05,
            costFactor: 0.70
        },
        description: 'ISRO\'s premier workhorse with 63 historical launches. Exceptional record for Sun-Synchronous Polar Orbits, Chandrayaan-1, and Mars Orbiter Mission.'
    },
    ARIANE: {
        id: 'ARIANE',
        name: 'Ariane Series (Arianespace / Europe)',
        shortName: 'Ariane',
        launches: 27,
        usedMoreThan5: true,
        isCurrent: false, // Historic heavy partner
        category: 'Heavy GTO Partner',
        leoCapacityKg: 21000,
        gtoCapacityKg: 10500,
        historicalSuccessRate: 96.3,
        injectionPrecision: 0.92,
        massAllowanceFactor: 0.90, // Massive mass capacity for GEO comms
        fairingVolumeM3: 145,
        upperStageType: 'Cryogenic HM7B / Vulcain',
        propellantTech: 'Hydrolox (Cryogenic)',
        reusabilityScore: 0.05,
        costPerKgLEO: 8500,
        coEvolutionModifiers: {
            propulsionBonus: 0.15,
            shieldingBonus: 0.22,
            redundancyBonus: 0.25,
            autonomyBonus: 0.02,
            costFactor: 1.50
        },
        description: 'Heavily utilized historical heavy partner (27 launches) for India\'s geostationary telecommunication satellites (INSAT and GSAT series) prior to domestic heavy lift capability.'
    },
    GSLV_MK2: {
        id: 'GSLV_MK2',
        name: 'GSLV Mk II',
        shortName: 'GSLV Mk II',
        launches: 18,
        usedMoreThan5: true,
        isCurrent: true,
        category: 'Medium-Heavy Cryogenic',
        leoCapacityKg: 6000,
        gtoCapacityKg: 2500,
        historicalSuccessRate: 83.3,
        injectionPrecision: 0.88,
        massAllowanceFactor: 0.75,
        fairingVolumeM3: 50,
        upperStageType: 'Indigenous Cryogenic CE-7.5 (LOX / LH2)',
        propellantTech: 'Solid + Liquid + Cryogenic',
        reusabilityScore: 0.15,
        costPerKgLEO: 3800,
        coEvolutionModifiers: {
            propulsionBonus: 0.14,
            shieldingBonus: 0.12,
            redundancyBonus: 0.15,
            autonomyBonus: 0.06,
            costFactor: 0.85
        },
        description: 'ISRO\'s operational medium launcher featuring India\'s indigenous cryogenic upper stage (CE-7.5). Workhorse for NavIC (NVS) navigation constellations and INSAT weather satellites.'
    },
    LVM3: {
        id: 'LVM3',
        name: 'LVM3 / GSLV Mk III',
        shortName: 'LVM3',
        launches: 6,
        usedMoreThan5: true,
        isCurrent: true,
        category: 'Heavy-Lift Flagship',
        leoCapacityKg: 10000,
        gtoCapacityKg: 4200,
        historicalSuccessRate: 100.0,
        injectionPrecision: 0.98,
        massAllowanceFactor: 0.92, // Generous fairing volume and high mass margin
        fairingVolumeM3: 110,
        upperStageType: 'High-thrust Cryogenic CE-20 (LOX / LH2, 200 kN)',
        propellantTech: 'Solid Boosters + Vikas Liquid Core + Cryogenic CE-20',
        reusabilityScore: 0.35, // Stepping stone for semi-cryo upgrades
        costPerKgLEO: 3200,
        coEvolutionModifiers: {
            propulsionBonus: 0.22,
            shieldingBonus: 0.25,
            redundancyBonus: 0.22,
            autonomyBonus: 0.10,
            costFactor: 0.90
        },
        description: 'ISRO\'s flagship heavy lifter with 100% mission success across 6 launches. Selected for Chandrayaan-2/3, OneWeb constellations, and human-rated for the Gaganyaan mission.'
    },
    SSLV: {
        id: 'SSLV',
        name: 'SSLV (Small Satellite Launch Vehicle)',
        shortName: 'SSLV',
        launches: 3,
        usedMoreThan5: false,
        isCurrent: true,
        category: 'Rapid-Response Small-Sat',
        leoCapacityKg: 500,
        gtoCapacityKg: 0,
        historicalSuccessRate: 66.7,
        injectionPrecision: 0.90,
        massAllowanceFactor: 0.35, // Mass-constrained small sat
        fairingVolumeM3: 12,
        upperStageType: 'Velocity Trimming Module (VTM)',
        propellantTech: '3 Solid Stages + Liquid Trim Stage',
        reusabilityScore: 0.20,
        costPerKgLEO: 2800,
        coEvolutionModifiers: {
            propulsionBonus: 0.05,
            shieldingBonus: -0.05,
            redundancyBonus: -0.05,
            autonomyBonus: 0.25, // Promotes agile edge AI cubesats
            costFactor: 0.25
        },
        description: 'ISRO\'s dedicated on-demand launcher for small satellites and mega-constellation replenishment. Enables 72-hour turnaround with minimal launch pad infrastructure.'
    },
    NGLV: {
        id: 'NGLV',
        name: 'NGLV (Next Generation Launch Vehicle / "Soorya")',
        shortName: 'NGLV (Soorya)',
        launches: 0,
        usedMoreThan5: false,
        isCurrent: false, // Futuristic Next-Gen in active development
        category: 'Futuristic Reusable Heavy',
        leoCapacityKg: 20000,
        gtoCapacityKg: 9000,
        historicalSuccessRate: 99.0, // Projected
        injectionPrecision: 0.99,
        massAllowanceFactor: 0.98,
        fairingVolumeM3: 185,
        upperStageType: 'Methalox High-Isp Re-ignitable Engine + Space Tug Stage',
        propellantTech: 'LOX / Liquid Methane (Methalox) Reusable Booster',
        reusabilityScore: 0.92, // Vertical landing reusable booster
        costPerKgLEO: 1200, // Massive cost reduction
        coEvolutionModifiers: {
            propulsionBonus: 0.35,
            shieldingBonus: 0.35,
            redundancyBonus: 0.30,
            autonomyBonus: 0.30,
            costFactor: 0.28
        },
        description: 'ISRO\'s next-generation heavy-lift reusable rocket program. Designed to establish the Bharatiya Antariksh Station (BAS), human lunar landings, and deep-space logistics.'
    }
};

class EvolutionaryEngine {
    constructor() {
        // Environmental Parameters
        this.environment = {
            solarActivity: 1.0,        // 0.2 to 3.0
            debrisDensity: 1.0,        // 0.2 to 4.0
            atmosphericDrag: 1.0,      // 0.2 to 3.0
            thermalStress: 1.0,        // 0.5 to 2.5
            obsolescenceSpeed: 1.0,    // 0.5 to 2.5
            launchCostPressure: 1.0
        };

        // Genetic Algorithm Parameters
        this.gaParams = {
            mutationRate: 0.15,
            mutationStrength: 0.18,
            crossoverRate: 0.75,
            selectionPressure: 'tournament',
            tournamentSize: 3,
            elitismRate: 0.12,
            targetPopulationSize: 135
        };

        // Active Carrier Launch Vehicle (Default: All ISRO Mixed Fleet)
        this.activeCarrierVehicle = 'MIXED'; // 'MIXED' or specific vehicle ID (e.g. 'LVM3', 'PSLV', 'NGLV')

        // Futuristic Vehicle Evolution Parameters
        this.vehicleEvolution = {
            propellantEvolutionLevel: 1.0,  // 1.0 (Current) to 3.0 (Advanced Methalox/Nuclear-Thermal)
            reusabilityLevel: 1.0,          // 1.0 (Expendable) to 3.0 (Full Rapid Reusability)
            spaceTugAssistance: false,      // High-efficiency electric space tug for direct GEO/Lunar insertion
            fairingPayloadExpansion: 1.0    // Volume allowance expansion factor
        };

        this.generation = 0;
        this.population = [];
        this.history = [];
        this.eventLogs = [];
    }

    inferOrbit(category, satelliteName, vehicle) {
        const cat = (category || '').toLowerCase();
        const sat = (satelliteName || '').toUpperCase();
        const veh = (vehicle || '').toUpperCase();

        if (cat.includes('science') || sat.includes('CHANDRAYAAN') || sat.includes('MARS') || sat.includes('ADITYA') || sat.includes('XPOSAT')) {
            if (sat.includes('ADITYA') || sat.includes('MARS') || sat.includes('CHANDRAYAAN')) {
                return 'DEEP';
            }
            return 'LEO';
        }
        if (cat.includes('navigation') || sat.includes('IRNSS') || sat.includes('NVS')) {
            return 'MEO';
        }
        if (cat.includes('communication') || sat.includes('INSAT') || sat.includes('GSAT') || sat.includes('EDUSAT') || sat.includes('CMS') || veh.includes('ARIANE')) {
            return 'GEO';
        }
        return 'LEO';
    }

    generateBaselineGenome(sat) {
        const year = sat.Year || 2000;
        const techEra = Math.max(0.05, Math.min(0.95, (year - 1975) / 50));
        const orbit = this.inferOrbit(sat.Category, sat.Satellite_Name, sat.Launch_Vehicle);

        let vehFactor = 0.5;
        const v = (sat.Launch_Vehicle || '').toUpperCase();
        if (v.includes('LVM3') || v.includes('FALCON')) vehFactor = 0.95;
        else if (v.includes('ARIANE-5') || v.includes('GSLV MK III')) vehFactor = 0.88;
        else if (v.includes('PSLV-C')) vehFactor = 0.75;
        else if (v.includes('SLV-3') || v.includes('ASLV') || v.includes('C-1')) vehFactor = 0.25;

        const genes = {
            radHardening: Math.min(0.98, Math.max(0.15, 0.25 + techEra * 0.45 + (orbit === 'GEO' || orbit === 'DEEP' ? 0.25 : 0.0) + (Math.random() - 0.5) * 0.1)),
            solarDegradationResist: Math.min(0.98, Math.max(0.15, 0.20 + techEra * 0.50 + (Math.random() - 0.5) * 0.1)),
            propulsionDeltaV: Math.min(0.98, Math.max(0.10, 0.20 + vehFactor * 0.45 + (orbit === 'GEO' ? 0.30 : 0.0) + (Math.random() - 0.5) * 0.1)),
            debrisShielding: Math.min(0.98, Math.max(0.10, 0.15 + techEra * 0.35 + (orbit === 'LEO' ? 0.20 : 0.0) + (Math.random() - 0.5) * 0.1)),
            autonomousEvasion: Math.min(0.98, Math.max(0.05, 0.05 + Math.pow(techEra, 2) * 0.75 + (Math.random() - 0.5) * 0.08)),
            thermalTolerance: Math.min(0.98, Math.max(0.20, 0.30 + techEra * 0.40 + (orbit === 'DEEP' ? 0.25 : 0.0) + (Math.random() - 0.5) * 0.1)),
            redundancyLevel: Math.min(0.98, Math.max(0.15, 0.25 + techEra * 0.45 + (orbit === 'GEO' || orbit === 'DEEP' ? 0.25 : 0.0) + (Math.random() - 0.5) * 0.1)),
            softwareAdaptability: Math.min(0.98, Math.max(0.05, 0.05 + Math.pow(techEra, 1.5) * 0.70 + (Math.random() - 0.5) * 0.08))
        };

        return { genes, orbit, techEra };
    }

    initializeWithISRODataset(dataset) {
        this.generation = 0;
        this.population = [];
        this.history = [];
        this.eventLogs = [];

        dataset.forEach(sat => {
            const { genes, orbit } = this.generateBaselineGenome(sat);
            
            const rawStatus = (sat.Status_Category || '').toLowerCase();
            let initialStatus = 'active';
            let initialHealth = 100;
            let extinctionReason = null;

            if (rawStatus.includes('unsuccessful')) {
                initialStatus = 'extinct';
                initialHealth = 0;
                extinctionReason = 'Launch Injection Failure';
            } else if (rawStatus.includes('failure')) {
                initialStatus = 'extinct';
                initialHealth = 0;
                extinctionReason = 'Early Subsystem Failure';
            } else if (rawStatus.includes('not operational')) {
                initialStatus = 'extinct';
                initialHealth = 0;
                extinctionReason = 'End-of-Life Decommission';
            } else {
                initialStatus = 'active';
                initialHealth = 85 + Math.random() * 15;
            }

            // Identify Launcher ID
            const vUpper = (sat.Launch_Vehicle || '').toUpperCase();
            let launcherId = 'PSLV';
            if (vUpper.includes('ARIANE')) launcherId = 'ARIANE';
            else if (vUpper.includes('LVM3') || vUpper.includes('GSLV MK III')) launcherId = 'LVM3';
            else if (vUpper.includes('GSLV')) launcherId = 'GSLV_MK2';
            else if (vUpper.includes('SSLV')) launcherId = 'SSLV';

            const individual = {
                id: `ISRO-${sat.Sl_No}`,
                name: sat.Satellite_Name,
                originalCategory: sat.Category,
                launchDate: sat.Launch_Date,
                year: sat.Year,
                orbit: orbit,
                launchVehicleId: launcherId,
                launchVehicleName: sat.Launch_Vehicle,
                generation: 0,
                lineage: sat.Satellite_Name,
                isEvolved: false,
                genes: genes,
                health: initialHealth,
                status: initialStatus,
                extinctionReason: extinctionReason,
                fitness: 0,
                angle: Math.random() * Math.PI * 2,
                orbitSpeed: (orbit === 'LEO' ? 0.025 : orbit === 'MEO' ? 0.015 : orbit === 'GEO' ? 0.007 : 0.003) * (0.8 + Math.random() * 0.4),
                radiusVariation: (Math.random() - 0.5) * 0.06
            };

            this.evaluateFitness(individual);
            this.population.push(individual);
        });

        this.recordHistory();
        this.logEvent(`[Initialization] Population established with ${this.population.length} satellites.`);
    }

    /**
     * Evaluate Satellite Fitness including Launch Vehicle Carrier Injection Precision
     */
    evaluateFitness(ind) {
        if (ind.status === 'extinct') {
            ind.fitness = 0.01;
            return ind.fitness;
        }

        const env = this.environment;
        const reg = ORBITAL_REGIMES[ind.orbit] || ORBITAL_REGIMES.LEO;
        const g = ind.genes;

        // Carrier Vehicle Performance Influence
        const vehicle = LAUNCH_VEHICLE_DATABASE[ind.launchVehicleId] || LAUNCH_VEHICLE_DATABASE.PSLV;
        const carrierBoost = vehicle.coEvolutionModifiers || {};
        const injectionPrecision = vehicle.injectionPrecision || 0.90;

        // Higher vehicle injection precision reduces required orbital insertion delta-V, boosting effective propulsion
        const effectivePropulsion = Math.min(1.0, g.propulsionDeltaV * (0.85 + injectionPrecision * 0.25));

        // 1. Environmental Survivability Component
        const radStress = env.solarActivity * reg.radMultiplier;
        const radSurvival = Math.max(0.05, 1.0 - (radStress / (1.0 + g.radHardening * 2.5 + g.redundancyLevel * 1.2)));

        const debrisHazard = env.debrisDensity * reg.debrisMultiplier;
        const evasionDefense = (g.debrisShielding * 1.5 + g.autonomousEvasion * 2.0);
        const debrisSurvival = Math.max(0.05, 1.0 - (debrisHazard / (1.2 + evasionDefense * 2.0)));

        const dragStress = env.atmosphericDrag * reg.dragMultiplier;
        const dragSurvival = Math.max(0.1, 1.0 - (dragStress / (1.0 + effectivePropulsion * 3.0)));

        const powerDegradation = (env.solarActivity * 0.4 + 0.6) / (1.0 + g.solarDegradationResist * 2.2);
        const powerFitness = Math.max(0.1, 1.0 - powerDegradation * 0.4);

        const thermalFitness = Math.max(0.1, 1.0 - (env.thermalStress / (1.2 + g.thermalTolerance * 2.5)));

        // 2. Mission Capability & Technological Competitiveness
        const techAdaptability = Math.max(0.1, (g.softwareAdaptability * 1.8 + g.autonomousEvasion * 1.2) / (1.0 + env.obsolescenceSpeed));

        // 3. Mass & Cost Penalty
        // Vehicles with high mass allowance factor reduce the mass penalty burden on the satellite
        const vehicleMassForgiveness = vehicle.massAllowanceFactor || 0.70;
        const totalGeneLoad = (
            g.radHardening + 
            g.solarDegradationResist + 
            g.propulsionDeltaV * 1.3 + 
            g.debrisShielding * 1.4 + 
            g.autonomousEvasion * 0.8 + 
            g.thermalTolerance + 
            g.redundancyLevel * 1.2 + 
            g.softwareAdaptability * 0.7
        ) / 8.0;

        const effectiveCostPressure = env.launchCostPressure * (carrierBoost.costFactor || 1.0) / (0.5 + vehicleMassForgiveness * 0.7);
        const costPenalty = Math.max(0.0, (totalGeneLoad - 0.65) * effectiveCostPressure * 0.30);

        // Composite Fitness
        const rawFitness = (
            radSurvival * 0.22 +
            debrisSurvival * 0.25 +
            dragSurvival * 0.15 +
            powerFitness * 0.15 +
            thermalFitness * 0.10 +
            techAdaptability * 0.20 +
            g.redundancyLevel * 0.08
        ) - costPenalty;

        ind.fitness = Math.max(0.05, Math.min(1.0, rawFitness));
        return ind.fitness;
    }

    /**
     * Check extinction triggers
     */
    evaluateExtinction(ind) {
        if (ind.status === 'extinct') return true;

        const env = this.environment;
        const reg = ORBITAL_REGIMES[ind.orbit] || ORBITAL_REGIMES.LEO;
        const g = ind.genes;
        const vehicle = LAUNCH_VEHICLE_DATABASE[ind.launchVehicleId] || LAUNCH_VEHICLE_DATABASE.PSLV;

        // Health decay per generation based on environmental stress
        const radDamage = Math.max(0, (env.solarActivity * reg.radMultiplier * 8.5) - (g.radHardening * 9.0));
        const debrisImpactRisk = Math.max(0, (env.debrisDensity * reg.debrisMultiplier * 10.0) - (g.debrisShielding * 8.0 + g.autonomousEvasion * 9.0));
        const dragDecay = Math.max(0, (env.atmosphericDrag * reg.dragMultiplier * 7.5) - (g.propulsionDeltaV * 9.5));
        const powerDecay = Math.max(0, 5.0 - (g.solarDegradationResist * 5.5));
        const obsolescenceDecay = Math.max(0, (env.obsolescenceSpeed * 6.0) - (g.softwareAdaptability * 7.0));

        const totalDamage = (radDamage + debrisImpactRisk + dragDecay + powerDecay + obsolescenceDecay) * 0.45;
        ind.health = Math.max(0, ind.health - totalDamage);

        // 1. Debris Collision
        const collisionProbability = (env.debrisDensity * reg.debrisMultiplier * 0.065) / (1.0 + g.debrisShielding * 2.0 + g.autonomousEvasion * 3.0);
        if (Math.random() < collisionProbability) {
            ind.status = 'extinct';
            ind.health = 0;
            ind.extinctionReason = 'Debris Collision (Kessler Impact)';
            return true;
        }

        // 2. Solar Storm Radiation Burnout
        const radBurnoutProb = (env.solarActivity * reg.radMultiplier * 0.055) / (1.0 + g.radHardening * 3.5 + g.redundancyLevel * 2.0);
        if (Math.random() < radBurnoutProb) {
            ind.status = 'extinct';
            ind.health = 0;
            ind.extinctionReason = 'Solar Flare Radiation Burnout';
            return true;
        }

        // 3. Atmospheric Re-entry in LEO
        if (ind.orbit === 'LEO') {
            const reEntryProb = (env.atmosphericDrag * 0.06) / (1.0 + g.propulsionDeltaV * 3.5);
            if (Math.random() < reEntryProb && g.propulsionDeltaV < 0.35) {
                ind.status = 'extinct';
                ind.health = 0;
                ind.extinctionReason = 'Atmospheric Drag Re-entry';
                return true;
            }
        }

        // 4. Component Degradation Depletion
        if (ind.health <= 0) {
            ind.status = 'extinct';
            ind.health = 0;
            ind.extinctionReason = powerDecay > radDamage ? 'Power Starvation & Cell Death' : 'Cumulative Component Degradation';
            return true;
        }

        // 5. Obsolescence Discard
        if (ind.fitness < 0.22 && Math.random() < (env.obsolescenceSpeed * 0.08)) {
            ind.status = 'extinct';
            ind.health = 0;
            ind.extinctionReason = 'Technological Obsolescence';
            return true;
        }

        return false;
    }

    selectParent(pool) {
        if (this.gaParams.selectionPressure === 'tournament') {
            const k = Math.min(this.gaParams.tournamentSize, pool.length);
            let best = null;
            for (let i = 0; i < k; i++) {
                const candidate = pool[Math.floor(Math.random() * pool.length)];
                if (!best || candidate.fitness > best.fitness) {
                    best = candidate;
                }
            }
            return best;
        } else {
            const totalFit = pool.reduce((sum, ind) => sum + ind.fitness, 0);
            let r = Math.random() * totalFit;
            for (const ind of pool) {
                r -= ind.fitness;
                if (r <= 0) return ind;
            }
            return pool[pool.length - 1];
        }
    }

    crossover(parentA, parentB) {
        const childGenes = {};
        const alpha = 0.15;

        GENE_DEFINITIONS.forEach(def => {
            const key = def.id;
            const valA = parentA.genes[key];
            const valB = parentB.genes[key];

            if (Math.random() < this.gaParams.crossoverRate) {
                const minVal = Math.min(valA, valB);
                const maxVal = Math.max(valA, valB);
                const range = maxVal - minVal;
                const blend = (minVal - alpha * range) + Math.random() * (range + 2 * alpha * range);
                childGenes[key] = Math.max(def.min, Math.min(def.max, blend));
            } else {
                childGenes[key] = Math.random() < 0.5 ? valA : valB;
            }
        });

        const orbit = Math.random() < 0.85 ? (Math.random() < 0.5 ? parentA.orbit : parentB.orbit) : this.mutateOrbit(parentA.orbit);

        return { childGenes, orbit };
    }

    mutate(genes) {
        const mutated = { ...genes };
        let mutatedCount = 0;

        GENE_DEFINITIONS.forEach(def => {
            if (Math.random() < this.gaParams.mutationRate) {
                const u1 = Math.random() || 0.0001;
                const u2 = Math.random();
                const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
                
                const delta = z0 * this.gaParams.mutationStrength;
                mutated[def.id] = Math.max(def.min, Math.min(def.max, mutated[def.id] + delta));
                mutatedCount++;
            }
        });

        return { mutatedGenes: mutated, mutatedCount };
    }

    mutateOrbit(currentOrbit) {
        const orbits = ['LEO', 'MEO', 'GEO', 'DEEP'];
        const otherOrbits = orbits.filter(o => o !== currentOrbit);
        return otherOrbits[Math.floor(Math.random() * otherOrbits.length)];
    }

    /**
     * Run One Evolutionary Generation Step with Carrier Vehicle Influences
     */
    step() {
        this.generation++;
        const currentActive = this.population.filter(ind => ind.status === 'active' || ind.status === 'evolved');

        // 1. Evaluate Extinction
        let newlyExtinct = 0;
        currentActive.forEach(ind => {
            const wentExtinct = this.evaluateExtinction(ind);
            if (wentExtinct) newlyExtinct++;
        });

        // 2. Re-evaluate surviving pool
        const survivors = this.population.filter(ind => ind.status !== 'extinct');
        survivors.forEach(ind => this.evaluateFitness(ind));
        survivors.sort((a, b) => b.fitness - a.fitness);

        if (newlyExtinct > 0) {
            this.logEvent(`[Gen ${this.generation}] Space hazards induced ${newlyExtinct} satellite extinctions. Active survivors: ${survivors.length}.`);
        }

        // 3. Reproduction & Speciation with Selected Launch Vehicle
        const targetPop = this.gaParams.targetPopulationSize;
        const deficit = targetPop - survivors.length;

        if (survivors.length >= 2 && deficit > 0) {
            const eliteCount = Math.max(1, Math.floor(survivors.length * this.gaParams.elitismRate));
            const reproductionPool = survivors.slice(0, Math.max(eliteCount, Math.floor(survivors.length * 0.6)));

            const newOffspring = [];
            for (let i = 0; i < deficit; i++) {
                const parentA = this.selectParent(reproductionPool);
                let parentB = this.selectParent(reproductionPool);
                if (reproductionPool.length > 1 && parentA.id === parentB.id) {
                    parentB = reproductionPool[(reproductionPool.indexOf(parentA) + 1) % reproductionPool.length];
                }

                const { childGenes, orbit } = this.crossover(parentA, parentB);
                const { mutatedGenes } = this.mutate(childGenes);

                // Determine Carrier Vehicle for next-gen satellite
                let carrierId = this.activeCarrierVehicle;
                if (carrierId === 'MIXED') {
                    // Choose between current/futuristic ISRO vehicles (LVM3, PSLV, SSLV, NGLV) based on generation
                    if (this.generation > 5) {
                        carrierId = Math.random() < 0.6 ? 'NGLV' : (Math.random() < 0.5 ? 'LVM3' : 'SSLV');
                    } else {
                        carrierId = Math.random() < 0.45 ? 'PSLV' : (Math.random() < 0.5 ? 'LVM3' : 'GSLV_MK2');
                    }
                }

                // Apply Launch Vehicle Carrier Genotype Enhancements
                const vehicle = LAUNCH_VEHICLE_DATABASE[carrierId] || LAUNCH_VEHICLE_DATABASE.PSLV;
                const mods = vehicle.coEvolutionModifiers || {};

                // E.g. Heavy LVM3/NGLV vehicles allow heavier shielding & redundancy
                if (mods.shieldingBonus) mutatedGenes.debrisShielding = Math.min(1.0, mutatedGenes.debrisShielding + mods.shieldingBonus * 0.5);
                if (mods.propulsionBonus) mutatedGenes.propulsionDeltaV = Math.min(1.0, mutatedGenes.propulsionDeltaV + mods.propulsionBonus * 0.5);
                if (mods.redundancyBonus) mutatedGenes.redundancyLevel = Math.min(1.0, mutatedGenes.redundancyLevel + mods.redundancyBonus * 0.5);
                if (mods.autonomyBonus) mutatedGenes.autonomousEvasion = Math.min(1.0, mutatedGenes.autonomousEvasion + mods.autonomyBonus * 0.5);

                const childId = `EVO-${this.generation}-${i + 1}`;
                const childName = `${parentA.name.split(' ')[0]}-Evo${this.generation}.${i+1}`;

                const child = {
                    id: childId,
                    name: childName,
                    originalCategory: parentA.originalCategory,
                    launchDate: `Gen-${this.generation}`,
                    year: 2025 + this.generation * 2,
                    orbit: orbit,
                    launchVehicleId: carrierId,
                    launchVehicleName: vehicle.shortName,
                    generation: this.generation,
                    lineage: `${parentA.name} × ${parentB.name}`,
                    isEvolved: true,
                    genes: mutatedGenes,
                    health: 100,
                    status: 'evolved',
                    extinctionReason: null,
                    fitness: 0,
                    angle: Math.random() * Math.PI * 2,
                    orbitSpeed: (orbit === 'LEO' ? 0.025 : orbit === 'MEO' ? 0.015 : orbit === 'GEO' ? 0.007 : 0.003) * (0.8 + Math.random() * 0.4),
                    radiusVariation: (Math.random() - 0.5) * 0.06
                };

                this.evaluateFitness(child);
                newOffspring.push(child);
            }

            this.population.push(...newOffspring);
            this.logEvent(`[Gen ${this.generation}] ${newOffspring.length} satellites evolved via ${this.activeCarrierVehicle === 'MIXED' ? 'Adaptive Fleet' : LAUNCH_VEHICLE_DATABASE[this.activeCarrierVehicle].shortName}.`);
        } else if (survivors.length < 2) {
            this.logEvent(`[Gen ${this.generation}] CRITICAL ALERT: Severe population collapse. Insufficient breeding pool.`);
        }

        // Final fitness update
        this.population.forEach(ind => {
            if (ind.status !== 'extinct') this.evaluateFitness(ind);
        });

        this.recordHistory();
        return this.getSummaryStats();
    }

    recordHistory() {
        const stats = this.getSummaryStats();
        this.history.push({
            generation: this.generation,
            ...stats
        });
    }

    getSummaryStats() {
        let activeCount = 0;
        let evolvedCount = 0;
        let extinctCount = 0;
        let totalFitness = 0;
        let activeTotal = 0;

        const extinctionReasons = {};
        const orbitCounts = { LEO: 0, MEO: 0, GEO: 0, DEEP: 0 };
        const launcherCounts = {};
        const geneAverages = {
            radHardening: 0,
            solarDegradationResist: 0,
            propulsionDeltaV: 0,
            debrisShielding: 0,
            autonomousEvasion: 0,
            thermalTolerance: 0,
            redundancyLevel: 0,
            softwareAdaptability: 0
        };

        this.population.forEach(ind => {
            const vId = ind.launchVehicleId || 'PSLV';
            launcherCounts[vId] = (launcherCounts[vId] || 0) + 1;

            if (ind.status === 'extinct') {
                extinctCount++;
                const r = ind.extinctionReason || 'Unknown Failure';
                extinctionReasons[r] = (extinctionReasons[r] || 0) + 1;
            } else {
                if (ind.isEvolved) evolvedCount++;
                else activeCount++;

                activeTotal++;
                totalFitness += ind.fitness;
                orbitCounts[ind.orbit] = (orbitCounts[ind.orbit] || 0) + 1;

                GENE_DEFINITIONS.forEach(def => {
                    geneAverages[def.id] += ind.genes[def.id] || 0;
                });
            }
        });

        if (activeTotal > 0) {
            GENE_DEFINITIONS.forEach(def => {
                geneAverages[def.id] = (geneAverages[def.id] / activeTotal);
            });
        }

        return {
            totalPopulation: this.population.length,
            activeCount,
            evolvedCount,
            extinctCount,
            survivingCount: activeCount + evolvedCount,
            avgFitness: activeTotal > 0 ? (totalFitness / activeTotal) : 0,
            extinctionReasons,
            orbitCounts,
            launcherCounts,
            geneAverages
        };
    }

    logEvent(msg) {
        const timestamp = new Date().toLocaleTimeString();
        this.eventLogs.unshift({ timestamp, text: msg });
        if (this.eventLogs.length > 50) this.eventLogs.pop();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EvolutionaryEngine, GENE_DEFINITIONS, ORBITAL_REGIMES, LAUNCH_VEHICLE_DATABASE };
}
