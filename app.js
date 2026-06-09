import { KATALOG_AKTIVIT } from './data.js';
/**
 * Abstraktní bázová třída definující společné vlastnosti sportovních aktivit.
 */
class SportovniAktivita {
    id;
    nazev;
    zakladniMet;
    constructor(id, nazev, zakladniMet) {
        this.id = id;
        this.nazev = nazev;
        this.zakladniMet = zakladniMet;
        // VALIDACE DAT: Ošetření chybných vstupů
        if (id <= 0)
            throw new Error("ID musí být kladné číslo.");
        if (nazev.trim().length === 0)
            throw new Error("Název nesmí být prázdný.");
        if (zakladniMet <= 0)
            throw new Error("Hodnota MET musí být kladná.");
    }
    getNazev() {
        return this.nazev;
    }
}
/**
 * Třída pro kardio aktivity, kde výpočet závisí na čase (minuty).
 */
class KardioAktivita extends SportovniAktivita {
    dobaTrvaniMinut;
    constructor(id, nazev, met, dobaTrvaniMinut) {
        super(id, nazev, met);
        this.dobaTrvaniMinut = dobaTrvaniMinut;
        if (dobaTrvaniMinut <= 0)
            throw new Error("Doba trvání musí být kladná.");
    }
    vypoctiKalorie(vahaUzivatele) {
        // Vzorec: MET * váha * (čas v hodinách)
        return Math.round(this.zakladniMet * vahaUzivatele * (this.dobaTrvaniMinut / 60));
    }
}
/**
 * Třída pro silové aktivity, kde výpočet zohledňuje počet sérií.
 */
class SilovaAktivita extends SportovniAktivita {
    pocetSerii;
    constructor(id, nazev, met, pocetSerii) {
        super(id, nazev, met);
        this.pocetSerii = pocetSerii;
        if (pocetSerii <= 0)
            throw new Error("Počet sérií musí být kladný.");
    }
    vypoctiKalorie(vahaUzivatele) {
        // Specifická logika: MET základ + bonus za každou intenzivní sérii
        return Math.round((this.zakladniMet * vahaUzivatele * 0.4) + (this.pocetSerii * 5));
    }
}
// --- TESTOVÁNÍ A POLYMORFISMUS (FÁZE 2) ---
// --- UI LOGIKA A PROPOJENÍ S DOM (FÁZE 3) ---
// --- UI LOGIKA A PROPOJENÍ S DOM (FÁZE 3 S GRAFEM) ---
const denik = [];
let vahaUzivatele = 85;
// Načtení prvků z HTML stránky
const form = document.getElementById('fit-form');
const selectAktivita = document.getElementById('aktivita');
const vahaInput = document.getElementById('vaha');
const cilInput = document.getElementById('cil-kcal'); // Nové
const mnozstviInput = document.getElementById('mnozstvi');
const labelMnozstvi = document.getElementById('label-mnozstvi');
const tabulkaBody = document.querySelector('#tabulka-vysledku tbody');
const celkemKcalEl = document.getElementById('celkem-kcal');
const vystupCilEl = document.getElementById('vystup-cil'); // Nové
const kruhovyGraf = document.getElementById('kruhovy-graf'); // Nové
const procentaText = document.getElementById('procenta-text'); // Nové
// 1. Automatické naplnění výběru sportů z data.ts
if (selectAktivita) {
    KATALOG_AKTIVIT.forEach(akt => {
        const opt = document.createElement('option');
        opt.value = akt.id.toString();
        opt.textContent = akt.nazev;
        selectAktivita.appendChild(opt);
    });
}
// Při změně políčka s cílem hned aktualizujeme text pod grafem
cilInput?.addEventListener('input', () => {
    if (vystupCilEl)
        vystupCilEl.textContent = `${cilInput.value} kcal`;
    vykresliTabulku(); // Přepočítat graf
});
// 2. Dynamická změna textu (Doba vs Série) podle vybraného sportu
selectAktivita?.addEventListener('change', () => {
    const id = parseInt(selectAktivita.value);
    const data = KATALOG_AKTIVIT.find(a => a.id === id);
    if (data) {
        labelMnozstvi.textContent = data.typ === 'kardio' ? 'Doba (minuty):' : 'Počet sérií:';
    }
});
// 3. Zpracování formuláře při kliknutí na tlačítko
form?.addEventListener('submit', (e) => {
    e.preventDefault();
    vahaUzivatele = parseFloat(vahaInput.value);
    const id = parseInt(selectAktivita.value);
    const mnozstvi = parseInt(mnozstviInput.value);
    const data = KATALOG_AKTIVIT.find(a => a.id === id);
    if (data) {
        try {
            let novaAkt;
            if (data.typ === 'kardio') {
                novaAkt = new KardioAktivita(data.id, data.nazev, data.met, mnozstvi);
            }
            else {
                novaAkt = new SilovaAktivita(data.id, data.nazev, data.met, mnozstvi);
            }
            denik.push(novaAkt);
            vykresliTabulku();
            mnozstviInput.value = '';
        }
        catch (error) {
            alert(`Chyba validace: ${error.message}`);
        }
    }
});
// 4. Vykreslení výsledků a AKTUALIZACE GRAFU
function vykresliTabulku() {
    if (!tabulkaBody || !celkemKcalEl || !kruhovyGraf || !procentaText || !cilInput)
        return;
    tabulkaBody.innerHTML = '';
    let sumaKcal = 0;
    denik.forEach((akt, index) => {
        const kcal = akt.vypoctiKalorie(vahaUzivatele);
        sumaKcal += kcal;
        const jednotka = akt instanceof KardioAktivita ? 'min' : 'sérií';
        const hodnota = akt.dobaTrvaniMinut || akt.pocetSerii || 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${akt.getNazev()}</strong></td>
            <td>${hodnota} ${jednotka}</td>
            <td><span style="color: #2563eb; font-weight: 600;">${kcal} kcal</span></td>
            <td><button class="btn-smazat" data-index="${index}" style="background:#ef4444; color:white; border:none; padding:3px 8px; border-radius:4px; cursor:pointer;">Smazat</button></td>
        `;
        tabulkaBody.appendChild(tr);
    });
    // Aktualizace textových hodnot
    celkemKcalEl.textContent = `${sumaKcal} kcal`;
    const denniCil = parseFloat(cilInput.value) || 1; // Ošetření dělení nulou
    // VÝPOČET PROCENT A GRAFU
    const procenta = Math.min(Math.round((sumaKcal / denniCil) * 100), 100);
    procentaText.textContent = `${procenta}%`;
    // Přepočet procent na stupně kruhu (360 stupňů = 100 %)
    const stupne = (procenta / 100) * 360;
    // Změna CSS vlastnosti za běhu (vybarvíme kruh modře do výše splněných stupňů)
    kruhovyGraf.style.background = `conic-gradient(#2563eb ${stupne}deg, #e2e8f0 ${stupne}deg)`;
    // Aktivace tlačítek pro smazání řádku
    document.querySelectorAll('.btn-smazat').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index);
            denik.splice(idx, 1);
            vykresliTabulku();
        });
    });
}
