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
