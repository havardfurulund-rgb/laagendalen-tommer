# Lågendalen Tømmer - Premium Vedhandel

En moderne web-applikasjon for Lågendalen Tømmer bygget med React, Vite, og Google Gemini AI.

## Funksjoner

- 📦 **E-handel** - Butikk med vedprodukter og handlekurv
- 🤖 **AI-assistent** (Ved-Leif) - Spesialkunnskapsbot med Google Search grounding
- 🎨 **AI Studio** - Generer og rediger bilder av ved med AI
- 💳 **Betalingsintegrasjon** - Vipps og kortbetaling
- 📱 **Responsiv design** - Optimalisert for mobil, tablet og desktop

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (@google/genai)
- **Icons**: Lucide React
- **Deployment**: Vercel

## Installasjon

```bash
# Installer dependencies
npm install

# Sett opp environment variables
cp .env.example .env.local
# Rediger .env.local og legg til din Google Gemini API-nøkkel

# Start dev server
npm run dev
```

## Struktur

```
src/
├── components/        # React komponenter
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── WoodMarketplace.tsx
│   ├── AIAssistant.tsx
│   ├── CartSidebar.tsx
│   ├── AIStudio.tsx
│   └── Logo.tsx
├── services/          # AI og API services
│   └── geminiService.ts
├── App.tsx           # Hovedkomponent
├── main.tsx          # Entry point
├── index.css         # Global styling
├── types.ts          # TypeScript definisjoner
└── constants.tsx     # Konstanter og produkter
```

## Bruk

### Dev server
```bash
npm run dev
```
Åpnes på `http://localhost:5173`

### Build for produksjon
```bash
npm run build
npm run preview
```

## API-nøkkel

For å bruke AI-funksjonalitet, treng du en Google Gemini API-nøkkel:

1. Gå til [Google AI Studio](https://aistudio.google.com)
2. Opprett en ny API-nøkkel
3. Legg den til i `.env.local`:
   ```
   VITE_API_KEY=din_api_nøkkel_her
   ```

## Lisens

Privat prosjekt for Lågendalen Tømmer