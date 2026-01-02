# OSL – OneSeatLeague

[OSL](https://www.osl-f1.com/) är en realtidsbaserad webbapplikation för analys av telemetridata från EA Sports F1 25. Applikationen visualiserar kördata i realtid och sparar avslutade sessioner för senare analys.

## Funktioner

- Live visualisering av telemetridata (hastighet, varvtider, sektorer)
- Skapa, starta och avsluta sessioner
- Session overview och historik
- Användarautentisering
- Realtidskommunikation via Socket.IO

## Tech Stack

### Frontend

- React
- TypeScript
- Material UI
- Socket.IO Client

### Backend

- Node.js
- NestJS
- Socket.IO
- MongoDB
- UDP Telemetry Listener

### Hosting

- Frontend: Vercel
- Backend: Railway
- Domän: osl-f1.com (Strato)

## Installation (lokalt)

```bash
git clone https://github.com/JanHakanViktor/osl.git
cd osl

cd api
npm install
npm start

cd..
cd client
npm install
npm run dev

cd..
cd telemetry-relay
npm install
npm run dev
```

## Betygskriterier

✔ Godkänt (G):

För att du ska få Godkänt (G) på ditt examensarbete, behöver du uppfylla samtliga kursmål och krav som nämnts i uppgiften. Här är en översikt av vad du ska uppnå för G:

### Planering och Research:

✔ Utföra en noggrann målgruppsanalys.

✔ Använda ett projekthanteringsverktyg för backlog, till exempel Linear, Trello, Jira, Github projects eller något liknande verktyg, för att strukturera arbetet.

### Design och Prototyping:

✔ Skapa wireframes och prototyp i Figma som följer UX/UI-principer.

✔ Se till att designen är responsiv för minst två olika skärmstorlekar och följer
WCAG 2.1-standarder.

### Applikationsutveckling:

✔ Utveckla med ett modernt JavaScript-ramverk.

✔ Använd en databas för lagring och hämtning av data.

✔ Implementera state-hantering och skapa dynamiska komponenter med
reaktivitet och interaktivitet.

✔ Följa WCAG 2.1-standarder och använda semantisk HTML.

✔ För webbapp: Produkten ska vara responsiv och fungera korrekt på minst två skärmstorlekar, till exempel mobil och dator. Gränssnittet ska anpassa sig för att ge en användarvänlig upplevelse på båda dessa enheter.

✔ README-fil med innehåll enligt projektbeskrivningen (info om hur projektet körs,
publik länk, checklista med betygskriterier ni uppfyllt).

### Versionshantering:

✔ Arbeta med Git och ha ett repo på GitHub.

### Slutrapport, skriv en 2-3 sidor lång rapport med:

✔ Abstract på engelska.

✔ Tech stack och motivering av valen.

✔ Dokumentation av arbetsprocess, planering och research.

### Deploy:

✔ Ditt projekt ska vara hostat och publikt tillgängligt för att kunna visas i en webbläsare eller simulator.

### Helhetsupplevelsen:

✔ Applikationen ska vara fri från tekniska fel såsom döda länkar eller kraschande sidor, ha en konsekvent design och möjliggöra en obruten navigation genom hela applikationen.

### ✔ Väl godkänd (VG):

För att du nå Väl Godkänt (VG) på ditt examensarbete, krävs det att du visar på en djupare förståelse, professionell kvalitet och avancerade tekniska lösningar. Här är specifika åtgärder
du kan vidta i varje del av projektet för att uppnå detta:

### Allt för Godkänt (G)

✔ Allt för Godkänt (G)

### Design och prototyping:

✔ Implementera interaktivitet i prototypen för att demonstrera hur användaren
interagerar med produkten.

✔ Prototypen ska vara väldigt lik den färdiga produkten.

✔ Designen följer, utan undantag, WCAG 2.1-standarder för nivå A och AA.

### Applikationsutveckling:

✔ Använd en state management-lösning som till exempel Redux eller Pinia för att
hantera global state i applikationen.

✔ Koden följer, utan undantag, WCAG 2.1-standarder för nivå A och AA.

✔ Testad i verktyget WebAIM WAVE utan fel på error- och varnings-nivåer.

✔ Optimering - Produkten ska vara optimerad och ha tillräckligt stora filfomrat, återanvända kod och komponenter samt använda optimeringstekniker där det behövs.

✔ Implementera CRUD-operationer, Create, Read, Update, Delete, med säker hantering av användardata.

✔ Implementera en säker autentiseringslösning för databasen, till exempel OAuth, JWT (JSON Web Tokens) eller Firebase Authentication, för att säkerställa att endast behöriga användare kan få åtkomst till och hantera data. Detta skyddar användardata genom att verifiera identiteten innan CRUD-operationer tillåts.

✔ För webbapp: Produkten ska vara fullt responsiv och anpassa sig dynamiskt till olika skärmstorlekar och enheter, från mobiltelefoner till större skärmar. Gränssnittet ska ge en optimal användarupplevelse oavsett enhet, med korrekt
layout och funktionalitet för både små och stora skärmar.

✔ Skriv en tydlig README som inte bara beskriver projektet och hur det körs, men som också förklarar projektets tekniska val och hur olika funktioner implementerats.

• Versionshantering:

✔ Arbeta med feature branches och gör pull requests innan du mergar till baskoden för att säkerställa ordning och spårbarhet.

✔ Dokumentera varje steg i din commit-historik med tydliga och informativa commit-meddelanden.

• Deploy:

✔ Automatiserat flöde för bygge och deploy av applikationen, där byggprocessen automatiskt triggar publicering till en produktionsmiljö utan manuell inblandning, vilket säkerställer effektivitet och kontinuerlig leverans.

### Slutrapport, genomför en djupgående analys i slutrapporten, 3-6 A4 sidor:

✔ I rapporten, gå igenom varje steg i din arbetsprocess och reflektera över de utmaningar du stött på. Beskriv hur du överkommit tekniska och designrelaterade hinder och vad du lärt dig.

✔ Inkludera detaljer om de verktyg och tekniker du använt, och varför du valt dessa över andra alternativ, till exempel varför du valde React istället för Vue.

✔ Förklara och motivera dina beslut inom UX/UI-design och tillgänglighet, och hur dessa har förbättrat användarupplevelsen.

### Helhetsupplevelsen:

✔ Applikationen ska, utöver att uppfylla G-kraven, erbjuda en
professionell och optimerad användarupplevelse med minimala laddningstider, tydlig återkoppling vid alla användarinteraktioner samt vara testad för enhetlig
funktion och design på flera enheter och webbläsare.
