# ECKED eLearning Digital Maturity Monitor

'n Webtoepassing vir Edmondo van der Berg se eLearning-skoolbesoeke in Eden en Sentraal-Karoo. Hierdie projek bou voort op die bestaande WCED-Elearning HTML-instrument en behou sy assesseringsafdelings, skoollyste en verslaguitleg.

## Wat werk reeds

- Skoolkeuse volgens agt kringe, besoekdatum, adviseur en onderhoudbesonderhede.
- Twaalf aanwysers oor Enabling Environment, e-Culture & Change Management en e-Teaching & Training.
- Puntetoekenning van 1–5, outomatiese vlakke, sterk punte en ontwikkelingsbehoeftes.
- Reëlgebaseerde aanbevelings en 'n sesweek-intervensieplan.
- Verslagbesigtiging, wysiging, verwydering, druk/PDF en kopiëring na Word.
- Distriksopsomming gebaseer op elke skool se jongste besoek; die tabel behou alle besoeke.
- JSON-rugsteun en gevalideerde herstel; CSV-uitvoer vir verdere ontleding.
- Browserberging met foutterugvoer en geen voorafgelaaide voorbeeld-skoolverslag nie.

## Vinnige voorskou

Die oorspronklike aflaaipakket bevat ook `elearning-maturity-preview.html`, 'n gebundelde enkel-lêer-voorskou wat jy direk kan oopmaak. Die repository bevat die bronkode; `npm run build` skep die aanlyn weergawe. Dit gebruik plaaslike browserberging en deel nie sy data outomaties met 'n latere aanlyn webadres nie. Die GitHub-ontwikkelingsprojek gebruik steeds die bronlêers hieronder.

## Begin plaaslik

Vereis Node.js 24 en npm.

```bash
npm ci
npm run dev
```

Open die plaaslike adres wat Vite wys. Gebruik 'n webbediener; moenie `index.html` met 'n dubbelklik oopmaak nie.

```bash
npm test
npm run test:ui
npm run build
npm run preview
```

Die produksieweergawe is in `dist/`. Dit bevat gebundelde JavaScript en CSS; die toepassing laai nie React, Tailwind of Babel vanaf 'n CDN tydens gebruik nie.

## GitHub en publikasie

1. Die repository is https://github.com/TeacherEdd/elearning-Dashboard-.
2. Kloon dit met `git clone https://github.com/TeacherEdd/elearning-Dashboard-.git` en werk vanuit die projek se wortel. Moenie `node_modules`, persoonlike rugsteunlêers of `.env`-lêers oplaai nie.
3. Die `Check application`-workflow toets en bou elke push/pull request.
4. Om GitHub Pages te gebruik: kies **Settings → Pages → Source → GitHub Actions**.
5. Begin **Actions → Publish to GitHub Pages → Run workflow**. Publikasie is doelbewus handmatig.

GitHub Pages is een opsie vir die huidige statiese weergawe. Geen aanmelding, gedeelde databasis of aanlyn AI-diens is in weergawe 0.1 geïmplementeer nie.

## Puntelogika

Elke aanwyser dra ewe veel tot die algehele gemiddelde by. Omdat die afdelings onderskeidelik 3, 4 en 5 aanwysers het, is hul effektiewe gewigte 25%, 33⅓% en 41⅔%. Die afdelings het dus nie gelyke gewig nie. Dit behou die oorspronklike instrument se metode.

| Gemiddelde | Vlak |
| --- | --- |
| 1 tot en met 2.5 | EMERGING |
| Meer as 2.5, minder as 3.5 | ESTABLISHING |
| 3.5 tot minder as 4.5 | INTEGRATED |
| 4.5 tot 5 | TRANSFORMATIVE |

Die klassifikasie gebruik die onafgeronde gemiddelde. Die skerm wys een desimale plek; 'n afgeronde waarde naby 'n grens kan dus na die volgende vlak lyk.

Elke skool se jongste besoekdatum bepaal die distriksopsomming. By dieselfde datum gebruik die toepassing die jongste `updatedAt`, indien beskikbaar; anders die eerste ooreenstemmende rekord. Die geskiedenistabel en sy filters wys alle besoeke.

## Data en rugsteun

Verslae bly in die huidige browser en webadres se `localStorage`, met die bestaande sleutel `wced-district-monitor-ai-v6`. Dit is nie 'n gedeelde databasis nie. Skoolbesoekdata word nie na GitHub opgelaai wanneer die kode gepubliseer word nie.

- Kies **Export backup** voor jy van toestel/browser/webadres verander.
- **Restore backup** voeg rekords saam. Rekords met dieselfde ID word deur die rugsteun se weergawe vervang, ná bevestiging.
- Herstel verwerp onvolledige rekords, verkeerde puntetipes, ongeldige datums en duplikaat-IDs. Afgeleide ontleding word van die punte af herbou.
- CSV-uitvoer bevat alle besoeke en neutraliseer waardes wat as spreadsheet-formules geïnterpreteer kan word.
- 'n Nuwe webadres kan nie outomaties die oorspronklike HTML-lêer se browserberging lees nie. Die oorspronklike lêer het nie 'n JSON-uitvoerknoppie nie; bestaande gestoorde data moet apart uit daardie oorspronklike browserberging uitgevoer word voordat dit geskuif word. Die nuwe invoer aanvaar ook 'n kaal reeks oorspronklike verslagrekords.
- Voltooide verslae word gestoor; onvoltooide vorms word nog nie outomaties as konsepte herstel nie.

Die toepassing het nog nie 'n service worker of betroubare volle aflyn-opstart nie. Gebundelde bates verminder afhanklikheid van eksterne dienste, maar dit maak nie die toepassing op sigself 'n aflyn-PWA nie.

## Ontleding en AI

Hierdie weergawe genereer aanbevelings uit die bestaande aanwyserriglyne. Dit stuur geen skooldata na 'n AI-verskaffer nie en bevat geen API-sleutel nie. Die vorige leë Gemini-koppeling en stil terugval is verwyder; die skerm verduidelik nou watter soort aanbevelings gebruik word.

Die interne veldnaam `aiAnalysis` word vir bestaande formaatversoenbaarheid behou. Dit beteken nie dat 'n AI-diens gebruik is nie. Die aanbevelings vervang nie die adviseur se professionele oordeel nie.

## Volgende ontwikkelingsfase

- Aanmelding en 'n gedeelde databasis, met rolle vir adviseurs en toegangsbeheer per distrik.
- Datamigrasie, veranderingsgeskiedenis en bedienerrugsteun.
- Konsepte en aflyn-tou met veilige sinchronisering.
- Enige toekomstige AI-koppeling via 'n bediener, met die sleutel buite die browser en duidelike aanduiding van AI-gegenereerde inhoud.
- Verslagvergelyking tussen besoeke en verdere kringfilters.

Hierdie dienste benodig nog 'n gekose gasheer/databasis en hul opstelling. Geen wolkdatabasis is deur hierdie pakket geskep nie.

## Projekstruktuur

- `src/app.jsx`: bestaande React-skerm, skoollys, aanbevelings en verslagdruk.
- `src/core.js`: puntelogika, jongste-besoek-keuse, invoervalidering en uitvoer.
- `src/styles.css`: Tailwind-invoer.
- `tests/core.test.js`: toetse vir klassifikasie, opsommings, herstel en CSV.
- `.github/workflows/`: outomatiese kontroles en handmatige Pages-publikasie.

Beskryf veranderings en voer `npm test` en `npm run build` uit voordat veranderings saamgevoeg word. Die vyf kernlogika-toetse en twee gesimuleerde DOM-gebruikstoetse slaag. Die produksiebou slaag. 'n Volledige visuele browsertoets en druk/PDF-uitlegtoets is nog uitstaande; die plaaslike Chromium-proses kon nie in hierdie omgewing begin nie.

Die kode bevat WCED-benaming uit die oorspronklike instrument; publikasie van die kode impliseer nie amptelike WCED-goedkeuring nie. Geen lisensie is gekies nie.
