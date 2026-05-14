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
const TESTOVACI_VAHA = 85; // kg
const seznamZaznamu = [];
// Mechanismus "oživení" objektů ze surových dat z data.ts
KATALOG_AKTIVIT.forEach((polozka) => {
    try {
        if (polozka.typ === "kardio") {
            // Simulujeme uživatelský vstup 30 minut
            seznamZaznamu.push(new KardioAktivita(polozka.id, polozka.nazev, polozka.met, 30));
        }
        else {
            // Simulujeme uživatelský vstup 4 série
            seznamZaznamu.push(new SilovaAktivita(polozka.id, polozka.nazev, polozka.met, 4));
        }
    }
    catch (error) {
        console.error("Chyba při validaci objektu:", error);
    }
});
// Výpis do konzole pro ověření funkčnosti
console.log("%c--- FITNESS KALKULAČKA: TEST FÁZE 2 ---", "color: #007bff; font-weight: bold; font-size: 14px;");
seznamZaznamu.forEach(aktivita => {
    console.log(`Aktivita: ${aktivita.getNazev()}`);
    console.log(`- Typ třídy: ${aktivita.constructor.name}`);
    console.log(`- Odhadovaný výdej: ${aktivita.vypoctiKalorie(TESTOVACI_VAHA)} kcal`);
    console.log("---------------------------------------");
});
