# ISRO Satellite Evolutionary Computation & Survivability Simulator 🚀🛰️

An interactive aerospace web platform and evolutionary computation engine that models satellite population survivability, extinction dynamics, and multi-generational adaptation under real and simulated orbital space weather conditions.

Built on the official dataset of all **135 Indian Space Research Organisation (ISRO / DoS) satellites** launched from 1975 to 2025.

---

## 📌 Project Overview

This project bridges **historical satellite telemetry data** with **Evolutionary Algorithms (Genetic Algorithms / Multi-Objective Optimization)** to model:
1. **Satellite Survivability & Extinction Dynamics**: How space debris cascades (Kessler Syndrome), solar proton flux, atmospheric drag decay in LEO, and technological obsolescence trigger satellite mortality or decommissioning.
2. **Multi-Generational Genetic Adaptation**: How surviving elite satellites reproduce (via BLX-$\alpha$ crossover and Gaussian mutation) to evolve resilient next-generation successor spacecraft with enhanced radiation shielding, autonomous collision evasion, and high-$\Delta v$ propulsion.
3. **Launch Vehicle Co-Evolution**: How historical workhorses (>5 launches like PSLV, Ariane, GSLV Mk II, LVM3) and current/futuristic ISRO launchers (SSLV, NGLV Soorya) provide carrier synergy, orbital injection accuracy, and payload envelope allowances that directly shape satellite evolution.

---

## 🧬 Evolutionary Computation Model

### 1. 8-Gene Chromosomal Architecture
Each satellite individual possesses an 8-gene chromosome representing physical engineering traits:

| Gene ID | Trait Name | Physical Representation |
| :--- | :--- | :--- |
| `g1: radHardening` | Radiation Hardening | Standoff protection against solar proton events, cosmic rays, and Van Allen belt latch-ups. |
| `g2: solarDegradationResist` | PV Cell Resilience | Multi-junction GaAs/perovskite cell degradation resistance over mission life. |
| `g3: propulsionDeltaV` | Propulsion & Station-Keeping | Chemical/Electric propulsion for orbital maintenance and active collision avoidance. |
| `g4: debrisShielding` | Whipple Shielding | Multi-layer standoff bumpers mitigating micrometeoroid and orbital debris impacts. |
| `g5: autonomousEvasion` | Edge AI Autonomy | On-board autonomous conjunction assessment and real-time evasion maneuver execution. |
| `g6: thermalTolerance` | Thermal Control System | Heat pipes and phase-change materials mitigating day/night eclipse temperature swings. |
| `g7: redundancyLevel` | Subsystem Redundancy | Dual/triple voting modular redundancy in avionics, power distribution, and OBC. |
| `g8: softwareAdaptability` | Software-Defined Agility | In-orbit reconfigurable SDR payloads preventing commercial obsolescence. |

### 2. Multi-Objective Fitness Formulation
$$\text{Fitness} = w_{\text{rad}} \cdot S_{\text{rad}} + w_{\text{debris}} \cdot S_{\text{debris}} + w_{\text{drag}} \cdot S_{\text{drag}} + w_{\text{power}} \cdot S_{\text{power}} + w_{\text{adapt}} \cdot A_{\text{tech}} - P_{\text{mass}}$$

Where:
- $S_{\text{debris}}$ is calculated from local orbital debris density vs `debrisShielding` and `autonomousEvasion`.
- $S_{\text{drag}}$ is calculated from atmospheric expansion vs `propulsionDeltaV`.
- $P_{\text{mass}}$ penalizes satellites attempting to maximize all traits simultaneously without carrier mass margin.

### 3. Extinction Triggers
- **Kessler Debris Collisions**: Catastrophic kinetic fragmentation.
- **Solar Flare Radiation Burnout**: Single-event burnout from coronal mass ejections.
- **Atmospheric Drag Re-entry**: LEO orbital decay when drag exceeds station-keeping thrust.
- **Power Starvation**: Photovoltaic cell efficiency decay and battery failure.
- **Technological Obsolescence**: Economic or operational retirement when fitness falls below threshold.

---

## 🚀 Launch Vehicle Co-Evolution (>5 Launches & Current ISRO)

| Vehicle | Launches | Status | LEO Capacity | GTO Capacity | Injection Precision | Carrier Role |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **PSLV** | **63** | Used &gt; 5x • Current Workhorse | 3,800 kg | 1,425 kg | **95%** | Ultra-consistent polar sun-synchronous injection; conserves satellite circularization $\Delta v$. |
| **Ariane Series** | **27** | Used &gt; 5x • Historic Partner | 21,000 kg | 10,500 kg | **92%** | Massive payload mass allowance for heavy geostationary communication satellites (INSAT/GSAT). |
| **GSLV Mk II** | **18** | Used &gt; 5x • Current Medium-Heavy | 6,000 kg | 2,500 kg | **88%** | Indigenous cryogenic CE-7.5 upper stage; dedicated carrier for NavIC (NVS) navigation constellations. |
| **LVM3 / GSLV Mk III** | **6** | Used &gt; 5x • Current Heavy Flagship | 10,000 kg | 4,200 kg | **98%** | 100% mission success record with CE-20 cryogenic engine; high fairing volume ($110\text{ m}^3$) allowing thick Whipple shielding. |
| **SSLV** | **3** | Current Small-Sat | 500 kg | — | **90%** | 72-hour rapid-response launch cadence; enables agile, decentralized nano-constellation replenishment. |
| **NGLV (Soorya)** | *In Dev* | Futuristic Reusable Heavy | 20,000 kg | 9,000 kg | **99%** | Methane/LOX reusable booster; slashes launch cost to ~$1,200/kg and enables deep-space space tugs. |

---

## 📂 Repository Structure

```
├── isro_satellites_dataset.csv             # Structured dataset of 135 satellites with metadata
├── satellite_data.js                       # JSON/JS module for standalone client execution
├── evolution_engine.js                     # Genetic Algorithm & co-evolutionary simulation engine
├── index.html                              # Web application UI & dashboard layout
├── style.css                               # Deep-space glassmorphism design system
├── app.js                                  # Canvas animation controller & event orchestration
├── Satellites_launched_so_far_...pdf      # Official ISRO reference document
└── README.md                               # Project documentation
```

---

## 💻 How to Run Locally

No external web frameworks or server installations are required.

### Option 1: Direct File Open
Simply double-click `index.html` or open it in any modern browser (Chrome, Edge, Firefox, Brave).

### Option 2: Local HTTP Server (Python)
```bash
python -m http.server 8080
```
Then navigate to `http://localhost:8080/index.html`.

---

## 📊 Interactive Features
- **Real-Time Orbital Simulation Canvas**: Interactive 2D concentric orbit viewport (LEO, MEO, GEO, Deep Space) with animated, color-coded satellite nodes (Active, Evolved, Extinct debris).
- **Extinction vs Evolution Trajectory Chart**: Multi-line generational timeline tracking population survivors, evolved offspring, and mean fitness.
- **Genomic Adaptation Radar**: Real-time polygon radar displaying evolving population mean traits.
- **Launch Vehicle Carrier Showcase & Futuristic Lab**: Interactive carrier selector and futuristic parameter sliders (Propellant tech, Reusability, Fairing margin).
- **Population Registry & Diagnostic Modal**: Search, filter, and inspect any of the 135 satellites with full gene breakdown and failure analysis.

---

## 📜 License
MIT License. Dataset compiled from official public ISRO/Department of Space records.
