# Henteklar - Krysselista

En moderne, kryssplattform app for barnehage inn/ut-sjekking. Bygget med React Native og Expo for å støtte Web, iOS og Android.

## 🚀 Funksjoner

- **Rask inn/utsjekking** - Kryss barn inn og ut med ett trykk
- **Full oversikt** - Se hvem som er i barnehagen
- **Kontaktinformasjon** - Tilgang til foreldres kontaktinfo
- **Flerspråklig** - Støtter norsk og engelsk (i18next)
- **Kryssplattform** - Fungerer på web, iOS og Android

## 📱 Skjermbilder

Appen inneholder følgende skjermer:
- **Landingsside** - Informasjon om appen
- **Innlogging** - Sikker innlogging for ansatte og foreldre
- **Dashboard** - Oversikt over alle barn og status
- **Sjekk inn/ut** - Enkel inn/ut-sjekking av barn
- **Barneprofil** - Detaljert informasjon om hvert barn
- **Innstillinger** - Brukerinnstillinger og preferanser

## 🛠️ Teknologier

- **React Native** - Kryssplattform mobilutvikling
- **Expo** - Utviklingsplattform og bygging
- **React Navigation** - Navigasjon mellom skjermer
- **i18next** - Internasjonalisering (norsk/engelsk)
- **AsyncStorage** - Lokal datalagring
- **Expo Linear Gradient** - Gradienteffekter

## 📦 Installasjon

1. **Klon prosjektet:**
   \`\`\`bash
   cd henteklar-app
   \`\`\`

2. **Installer avhengigheter:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start utviklingsserver:**
   \`\`\`bash
   npm start
   \`\`\`

## 🖥️ Kjør appen

### Web
\`\`\`bash
npm run web
\`\`\`

### iOS (krever Mac med Xcode)
\`\`\`bash
npm run ios
\`\`\`

### Android (krever Android Studio/emulator)
\`\`\`bash
npm run android
\`\`\`

### Expo Go (fysisk enhet)
Skann QR-koden fra terminalen med Expo Go-appen.

## 📁 Prosjektstruktur

\`\`\`
henteklar-app/
├── App.js                 # Hovedapp med providers
├── app.json               # Expo-konfigurasjon
├── assets/                # Bilder og ikoner
│   └── logo.png
├── src/
│   ├── components/        # Gjenbrukbare UI-komponenter
│   │   ├── Avatar.js
│   │   ├── Badge.js
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Input.js
│   │   └── index.js
│   ├── context/           # React Context (Auth)
│   │   └── AuthContext.js
│   ├── data/              # Mock data
│   │   └── mockData.js
│   ├── i18n/              # Språkfiler
│   │   └── index.js
│   ├── navigation/        # Navigasjonsstruktur
│   │   ├── AppNavigator.js
│   │   └── index.js
│   ├── screens/           # App-skjermer
│   │   ├── CheckInOutScreen.js
│   │   ├── ChildProfileScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── LandingScreen.js
│   │   ├── LoginScreen.js
│   │   ├── SettingsScreen.js
│   │   └── index.js
│   └── theme/             # Farger og stiler
│       ├── colors.js
│       ├── styles.js
│       └── index.js
└── package.json
\`\`\`

## 🔐 Innlogging (Demo)

For demo-formål aksepterer appen alle innloggingsforsøk:
- **E-post:** Hvilken som helst
- **Passord:** Hvilken som helst

## 🌐 Backend-integrasjon

Appen bruker for øyeblikket mock-data. For produksjon, koble til en backend med:

- **Firebase** - Autentisering og Firestore-database
- **AWS** - Cognito for auth, DynamoDB for data
- **Azure** - Azure AD B2C og Cosmos DB

## 🎨 Tilpassing

### Farger
Rediger `src/theme/colors.js` for å endre fargepaletten.

### Språk
Legg til nye språk i `src/i18n/index.js`.

## 📄 Lisens

© 2024 FrostByte AS. Alle rettigheter reservert.

---

Utviklet som del av DS3103 Web Development ved Kristiania University College.
