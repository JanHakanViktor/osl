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

## Checklist

✔ Real-time data handling via UDP → Backend → Frontend  
✔ Backend implemented with NestJS and WebSockets (Socket.IO)  
✔ Frontend implemented with React and TypeScript  
✔ Persistent data storage using MongoDB  
✔ CRUD operations for sessions and users  
✔ Authentication with cookie-based sessions  
✔ Real-time visualization of telemetry data  
✔ Session lifecycle: Create → Active → Finished → Overview  
✔ State management implemented in frontend (Zustand)  
✔ UX/UI designed with accessibility in mind (WCAG 2.1 AA)  
✔ Responsive design for desktop and mobile  
✔ Deployment considerations including CORS and cookies  
✔ Clear motivation for technology choices  
✔ Reflections on challenges, scope management, and learning outcomes  
✔ Version control with GitHub and continuous commits
