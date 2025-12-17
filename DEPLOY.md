# Deploy Henteklar til Vercel

## Raskeste måte (via GitHub)

1. **Opprett repo på GitHub**
   - Gå til github.com → New repository
   - Navn: `henteklar`

2. **Push koden**
   ```bash
   cd henteklar-app
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/DITT-BRUKERNAVN/henteklar.git
   git push -u origin main
   ```

3. **Deploy på Vercel**
   - Gå til [vercel.com](https://vercel.com)
   - Logg inn med GitHub
   - Klikk "Add New Project"
   - Velg `henteklar` repoet
   - **Root Directory:** `henteklar-app`
   - Klikk "Deploy"

4. **Ferdig!**
   Du får en URL som: `henteklar-abc123.vercel.app`

---

## Alternativ: Direkte opplasting

1. Gå til [vercel.com](https://vercel.com)
2. Dra og slipp `henteklar-app`-mappen
3. Vercel bygger automatisk

---

## Test lokalt først

```bash
cd henteklar-app
npm install
npm run web
```

Åpner appen på http://localhost:8081
