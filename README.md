# IVB High Care — Informatiegids

> **Digitale patiëntengids voor Afdeling ART / De Spreng — GGNet**

Een mobiele Progressive Web App (PWA) die patiënten tijdens hun verblijf op IVB High Care wegwijs maakt. De app is installeerbaar op telefoon en werkt ook offline.

🌐 **Live app:** [ivb-highcare-v2.netlify.app](https://ivb-highcare-v2.netlify.app)
🛠️ **CMS (beheer):** [ivb-highcare-v2.netlify.app/admin](https://ivb-highcare-v2.netlify.app/admin)

---

## Wat doet de app?

De app heeft vijf secties:

| Sectie | Inhoud |
|---|---|
| **Home** | Welkomsttekst, mededeling van de afdeling, link naar informatiemap |
| **Behandelteam** | Kaarten per teamlid met rol, beschrijving en contactinstructie |
| **Dagprogramma** | Weekrooster, therapieën, activiteiten en bezoektijden |
| **Regels & Visie** | Huisregels, ART-behandelmethodiek en behandelfases |
| **Contact** | Contactpersonen, telefoonnummers en openingstijden |

De app is beschikbaar in het **Nederlands en Engels** (schakelaar rechtsboven).

---

## Voor medewerkers — inhoud aanpassen

Alle teksten, kaarten en tijden worden beheerd via het **CMS-dashboard**, zonder dat je iets van code hoeft te weten.

### Hoe werkt het?

1. Ga naar [ivb-highcare-v2.netlify.app/admin](https://ivb-highcare-v2.netlify.app/admin)
2. Log in met je Netlify Identity account
3. Kies een sectie in de linkerzijbalk (Home, Behandelteam, Dagprogramma, etc.)
4. Pas de teksten aan — je ziet een live voorvertoning rechts in het scherm
5. Klik rechtsboven op **Publiceer** als je klaar bent
6. De live app wordt automatisch bijgewerkt binnen 1–2 minuten

> **Let op:** Klik altijd op *Publiceer* als je iets wilt opslaan naar de live site. Wijzigingen die je typt worden lokaal bewaard, maar pas zichtbaar voor patiënten na publicatie.

### Wat kun je aanpassen?

- Welkomstteksten op de homepagina
- Teamleden: naam, rol, beschrijving, icoon en kleur
- Dagprogramma: activiteiten, tijden en weekrooster
- Regels en huisregels, inclusief waarschuwingsblokjes
- Contactpersonen en telefoonnummers
- Bezoektijden en openingstijden
- Alle bovenstaande inhoud ook in het **Engels**

---

## Technische opbouw (voor beheerders)

```
ivb-highcare-v2/
├── index.html          # De app zelf (één pagina)
├── sw.js               # Service worker (offline werking)
├── manifest.json       # PWA installatie-instellingen
├── install.html        # Installatiepagina voor patiënten
├── css/                # Stijlen (variabelen, layout, componenten)
├── js/                 # App-logica (navigatie, rendering, zoeken, taal)
├── data/               # Alle inhoud als JSON-bestanden
│   ├── home.json       # Nederlandstalige homepagina-inhoud
│   ├── home.en.json    # Engelstalige variant
│   ├── team.json       # Behandelteam kaarten (NL)
│   ├── team.en.json    # Behandelteam kaarten (EN)
│   ├── programma.json  # Dagprogramma (NL)
│   ├── regels.json     # Regels & Visie (NL)
│   └── contact.json    # Contactgegevens (NL)
├── images/             # Afbeeldingen voor teamleden etc.
├── admin/
│   └── cms.html        # Het CMS-dashboard voor medewerkers
└── netlify/
    └── functions/      # Serverless functies (publiceren, afbeeldingen uploaden)
```

### Stack

- **Frontend:** Puur HTML, CSS en JavaScript — geen framework, geen build-stap
- **Hosting:** [Netlify](https://netlify.com) (gratis tier, automatisch via GitHub)
- **Fonts:** DM Sans + DM Serif Display (Google Fonts)
- **Iconen:** [Tabler Icons](https://tabler.io/icons)
- **CMS:** Zelfgebouwd dashboard dat wijzigingen via de GitHub API publiceert
- **Offline:** Service Worker met cache-first strategie

### Hoe werkt publiceren?

De *Publiceer*-knop in het CMS stuurt alle JSON-bestanden via de **GitHub API** naar deze repository. GitHub triggert dan automatisch een nieuwe Netlify-build. Na ±60 seconden is de live app bijgewerkt.

Er is geen FTP, geen server en geen deploymentpijplijn om te beheren.

---

## Installatie (lokale ontwikkeling)

Je hebt alleen een tekstverwerker en een lokale webserver nodig. Er is geen build-stap.

```bash
# Clone de repo
git clone https://github.com/ilmastro/ivb-highcare-v2.git
cd ivb-highcare-v2

# Start een eenvoudige lokale server (Python 3)
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

> Voor het CMS heb je een actieve Netlify Identity-sessie nodig. Lokaal testen van het CMS werkt het beste via de Netlify-preview-omgeving.

---

## Bijdragen

Wijzigingen aan de inhoud lopen altijd via het CMS-dashboard.

Wijzigingen aan de code (HTML, CSS, JS) kun je als volgt bijdragen:

1. Maak een branch aan: `git checkout -b mijn-aanpassing`
2. Maak je wijzigingen
3. Push naar GitHub en open een pull request
4. Netlify maakt automatisch een preview-deployment aan voor elke PR

---

## Licentie & eigenaarschap

Dit project is ontwikkeld voor intern gebruik bij **GGNet — IVB High Care, Afdeling ART (De Spreng)**.  
De broncode is eigendom van de organisatie. Neem contact op met de projectbeheerder voor vragen.
