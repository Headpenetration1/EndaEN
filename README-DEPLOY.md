# 🎓 Henteklar - Barnehage Check-in System

> Moderne, sikker løsning for inn/ut-sjekking i barnehager

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React_Native-0.81-blue.svg)
![Expo](https://img.shields.io/badge/Expo-54-black.svg)

---

## 🚀 Rask Deploy til Vercel (Anbefalt!)

### Metode 1: Ett-kommando deployment

**Mac/Linux:**
```bash
cd henteklar-app
./deploy.sh
```

**Windows:**
```bash
cd henteklar-app
deploy.bat
```

Dette scriptet:
- ✅ Installerer Vercel CLI hvis nødvendig
- ✅ Installerer avhengigheter
- ✅ Deployer til Vercel
- ✅ Gir deg en live URL!

### Metode 2: Manuell deployment

```bash
cd henteklar-app
npm install -g vercel
npm install
vercel --prod
```

**Ferdig!** Du får en URL som: `https://henteklar-app-xxxxx.vercel.app`

📖 **Full guide**: Les [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md) for alle detaljer

---

## 💻 Kjøre lokalt (Utviklingsmodus)

Hvis du vil teste lokalt først:

```bash
cd henteklar-app
npm install
npm run web
```

Åpnes automatisk på: **http://localhost:8081**

---

## 🔐 Innlogging

Når nettsiden er live (eller kjører lokalt):

- **E-post**: `staff@barnehagen.no`
- **Passord**: `password123`

---

## ✨ Hva er nytt i denne versjonen?

### Nye funksjoner fra Barneprofil og ChildCheck:

1. **📝 Registrer nye barn**
   - Komplett skjema med validering
   - Legg til foreldreinformasjon
   - Tilgjengelig fra Dashboard

2. **📅 Historikk med dato-velger**
   - Se alle hendelser per dag
   - Interaktiv dato-navigering
   - Statistikk og tidsstempler

3. **💾 API-integrasjon**
   - Fullstendig datalagring
   - Automatisk historikk-logging
   - Backend-klar arkitektur

4. **📞 Kontaktinformasjon**
   - Ring/e-post direkte fra appen
   - Oversikt over alle foresatte

📖 **Full oversikt**: Les [CHANGELOG.md](CHANGELOG.md)

---

## 📱 Funksjoner

- ✅ Sjekk inn/ut barn med ett trykk
- ✅ Full oversikt over alle barn
- ✅ Registrer nye barn i systemet
- ✅ Se historikk per dag med dato-velger
- ✅ Kontaktinformasjon med ring/e-post-knapper
- ✅ Flerspråklig støtte (Norsk/Engelsk)
- ✅ Responsivt design (mobil, nettbrett, desktop)
- ✅ Fungerer offline med lokal lagring
- ✅ Backend-klar (enkel migrering)

---

## 🗂️ Prosjektstruktur

```
henteklar-app/
├── deploy.sh              ← Deploy-script (Mac/Linux)
├── deploy.bat             ← Deploy-script (Windows)
├── vercel.json            ← Vercel-konfigurasjon
├── src/
│   ├── screens/
│   │   ├── AddChildScreen.js      ← NY: Registrer barn
│   │   ├── HistoryScreen.js       ← NY: Historikk
│   │   └── ...
│   ├── data/
│   │   └── api.js                 ← NY: API-modul
│   └── ...
└── ...
```

---

## 📚 Dokumentasjon

- [📖 INSTALLASJON.md](INSTALLASJON.md) - Lokal kjøring og testing
- [🚀 VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md) - Full Vercel-guide
- [📋 CHANGELOG.md](CHANGELOG.md) - Alle nye funksjoner
- [🔍 SAMMENLIGNING.md](SAMMENLIGNING.md) - Funksjonsoversikt

---

## 🛠️ Teknologi

- **Frontend**: React Native + Expo
- **Navigasjon**: React Navigation
- **Styling**: Custom theme system
- **Lagring**: AsyncStorage (lokal) / Backend-klar
- **Språk**: i18next (Norsk/Engelsk)
- **Deployment**: Vercel

---

## 🌐 Deploy-alternativer

### 1. Vercel (Anbefalt) - GRATIS
- ✅ Automatisk HTTPS
- ✅ Global CDN
- ✅ Automatiske deployments
- ⚡ 5 minutters oppsett

### 2. Netlify - GRATIS
```bash
npm run build:web
# Drag & drop dist-mappen til Netlify
```

### 3. Firebase Hosting - GRATIS
```bash
npm install -g firebase-tools
npm run build:web
firebase deploy
```

---

## 🔄 Oppdater nettsiden

Etter du har gjort endringer:

```bash
# Med deploy-script
./deploy.sh

# Eller manuelt
vercel --prod
```

---

## 🐛 Feilsøking

### "Vercel ikke funnet"
```bash
npm install -g vercel
```

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Build failed"
Sjekk at du er i `henteklar-app`-mappen

---

## 💰 Kostnad

**100% GRATIS** for små team og hobby-prosjekter:
- Vercel: Ubegrenset deployments
- Expo: Gratis for web
- React Native: Open source

---

## 📞 Support

- 📧 Kontakt: FrostByte AS
- 🐛 Issues: Opprett i GitHub
- 📖 Dokumentasjon: Les markdown-filene

---

## ✅ Rask sjekkliste

Deploy i 3 steg:

1. **📦 Last ned**
   ```bash
   unzip henteklar-updated.zip
   cd henteklar-vercel/henteklar-app
   ```

2. **🚀 Deploy**
   ```bash
   ./deploy.sh
   # eller: vercel --prod
   ```

3. **✨ Ferdig!**
   Åpne URL-en og logg inn!

---

## 🎯 Neste steg

1. ✅ Deploy til Vercel
2. ✅ Test alle funksjoner
3. ✅ Legg til egne barn
4. ✅ Konfigurer eget domene (valgfritt)
5. ✅ Koble til backend (når klar)

---

## 📄 Lisens

© 2024 FrostByte AS. Alle rettigheter reservert.

---

## 🎉 Takk!

Utviklet med ❤️ for norske barnehager.

**Live demo**: [Din Vercel URL kommer her]

**Versjon**: 1.0.0 (med nye funksjoner)  
**Sist oppdatert**: Desember 2024
