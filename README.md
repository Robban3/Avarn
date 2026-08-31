# Avarn Hundtjänst

Operativt stöd för Avarn Securitys hundverksamhet: hundförare, instruktörer,
regional och nationell ledning. Byggd som en mobil först-webbapp (PWA) i
Avarns grafiska profil.

## Vad appen gör

| Område | Innehåll |
| --- | --- |
| **Hundförare och hundar** | Personlig profil kopplad till ett eller flera ekipage. Varje hund har ras, ålder, sökinriktningar, utbildningar, certifikat och status. |
| **Träningsdagbok** | Pass med datum, plats, träningsområde, sökmiljö, måldoft, gömmor, resultat och kommentar. Bilder och filmer kan bifogas. Instruktören kommenterar och godkänner. |
| **Träningsplanering** | Instruktören lägger upp planer och övningar per ekipage. Hundföraren ser vad som ska tränas och rapporterar direkt mot övningen. |
| **Uppdrag** | Kommande, pågående och avslutade uppdrag med tid, plats, kund, kontaktperson, uppdragstyp och särskilda instruktioner. Tilldelning med förslag utifrån kompetens, tillgänglighet och geografi. |
| **Operativa rapporter** | Digital rapport efter uppdrag: genomsökta områden, markeringar, fynd, avvikelser, åtgärder och bilder. Fritextsökbar. |
| **Certifikat och behörigheter** | Giltighetstider med automatiska påminnelser innan något löper ut. |
| **Instruktörsvy** | Överblick per ekipage: träningshistorik, uppdrag, rapporter, utveckling och brister. Kommentera, godkänna och kalla till uppföljning. |
| **Ledningsvy** | Nyckeltal och diagram över ekipage, uppdrag, sökinriktningar, träningstimmar, geografisk täckning och tillgänglig kapacitet. |
| **Meddelanden** | Notifieringar om nya uppdrag, kommentarer, planerad träning och behörigheter som snart går ut. |
| **Administration** | Användare, roller, regioner, certifikattyper och revisionslogg. |

## Kom igång

```bash
npm install
npm run setup               # skapar .env, migrerar databasen och lägger in exempeldata
npm run dev                 # http://localhost:3000
```

`npm run setup` skapar en `.env` med slumpade hemligheter om filen saknas, och
låter en befintlig vara. `.env.example` visar vilka variabler som finns.

Kör alltid `npm install` först. Utan installerade beroenden hämtar `npx` den
senaste Prisma-versionen från nätet i stället för projektets, vilket ger fel
som ser ut att komma från konfigurationen. Kontrollera med
`npx prisma --version` att 7.10.0 rapporteras.

### Konton i exempeldatan

Lösenord för samtliga: `avarn123`

| Roll | E-post |
| --- | --- |
| Hundförare (Region Öst) | `erik.andersson@avarn.se` |
| Hundförare (Region Väst) | `johan.larsson@avarn.se` |
| Instruktör | `anna.karlsson@avarn.se` |
| Regionalt ansvarig | `karin.dahl@avarn.se` |
| Nationellt ansvarig | `magnus.oberg@avarn.se` |
| Administratör | `admin@avarn.se` |

## Behörighetsmodellen

All åtkomststyrning ligger i `src/lib/authz.ts` och används i två lager:

1. **`can(user, action)`** – vad rollen överhuvudtaget får göra.
2. **`teamScope(user)`** – vilka ekipage användaren får se data om. Villkoret
   återanvänds i varje fråga, så att en ny vy inte kan råka visa för mycket:

   | Roll | Ser |
   | --- | --- |
   | Hundförare | egna ekipage |
   | Instruktör | tilldelade ekipage |
   | Regionalt ansvarig | ekipage i egen region |
   | Nationellt ansvarig / administratör | samtliga |

Utgångsläget är alltid ingen åtkomst; varje utökning skrivs ut explicit.
Sidorna kontrollerar behörigheten själva utöver proxyn, så att en gissad
adress inte öppnar någon annans uppgifter. Uppdrag och rapporter kan
innehålla skyddsvärd information – därför skrivs varje läsning till
`AuditLog`, och bilagor ligger utanför `public/` och lämnas ut via
`/api/media/[id]` först efter kontroll.

## Påminnelser om certifikat

Ett schemalagt anrop skapar varningar innan behörigheter löper ut (60, 30
och 7 dagar före). Varje mottagare varnas en gång per certifikat och nivå,
så att en daglig körning inte fyller meddelandelistan.

```bash
curl -X POST -H "x-cron-key: $CRON_KEY" https://.../api/cron/paminnelser
```

## Utveckling

```bash
npm run dev        # utvecklingsserver
npm run build      # produktionsbygge
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run test       # Vitest – behörighetslogik och domänregler
npm run test:e2e   # Playwright – rökprov och åtkomstkontroller
npm run db:studio  # Prisma Studio
```

`npm run test:e2e` kräver att utvecklingsservern är igång.

### Teknik

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma 7 med
SQLite i utveckling. Inloggningen är en signerad cookie (JWT via `jose`) med
bcrypt-hashade lösenord; formulär går genom Server Actions med Zod-validering.

### Byta till Postgres

Ändra `provider` till `postgresql` i `prisma/schema.prisma`, peka
`DATABASE_URL` mot databasen och byt drivrutinsadaptern i `src/lib/db.ts`
till `@prisma/adapter-pg`. Övrig kod är oförändrad.

### Grafisk profil

Färgerna är definierade som tokens överst i `src/app/globals.css` och används
ingen annanstans i klartext – hela profilen justeras därifrån. Antracit bär
ramen, turkos används som accent och för primära handlingar, innehållsytorna
är mörka kort.

Diagramfärgen är en egen token (`--color-chart`), vald för att klara
kontrast- och ljushetskraven mot den mörka kortytan i stället för att låna
accentfärgen rakt av.

Logotypen ritas som SVG i `src/components/AvarnLogo.tsx` och används även som
appikon. Ligger den officiella filen i `public/` kan komponenten peka på den
i stället.

### Bilder på hundar och personal

Exempeldatan innehåller inga foton; avatarerna faller tillbaka på initialer.
Läggs en bildadress in i `Dog.photoUrl` eller `HandlerProfile.photoUrl` visas
den i stället, utan kodändring.
