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

Appen kör mot PostgreSQL. Använd ett Supabase-projekt eller en egen Postgres.

```bash
npm install
npm run setup     # skapar .env med slumpade hemligheter
```

Öppna sedan `.env` och fyll i de två databasadresserna. I Supabase finns de
under **Project Settings → Database → Connection string**:

| Variabel | Vilken anslutning | Varför |
| --- | --- | --- |
| `DATABASE_URL` | Transaction pooler, port 6543 | Appens anslutning. Poolaren klarar många korta anslutningar. |
| `DIRECT_URL` | Direct connection, port 5432 | Migreringar. Poolaren släpper inte igenom schemaändringar. |

Kör du en egen Postgres kan båda peka på samma adress. Därefter:

```bash
npm run db:setup  # skapar tabellerna och lägger in exempeldata
npm run dev       # http://localhost:3000
```

### Alternativ: skapa tabellerna direkt i Supabase

Går det inte att köra `db:setup` – eller vill du bara få igång databasen
utan att installera något – finns hela uppsättningen som en färdig SQL-fil:

1. Öppna **SQL Editor → New query** i Supabase.
2. Klistra in hela `prisma/supabase-setup.sql` och kör.

Filen skapar de 27 tabellerna, lägger in exempeldatan, slår på radsäkerhet
och markerar migreringen som körd, så att ett senare `prisma migrate deploy`
blir en tom operation. Databaslösenordet lämnar aldrig din dator den här
vägen — klistra aldrig in anslutningssträngen i en chatt.

Filen genereras om med `npm run db:sql` efter en schemaändring; den skrivs
aldrig för hand.

## Driftsättning på Vercel

Appen är förberedd för Vercel, som når Supabase utan de brandväggsspärrar
som ofta blockerar Postgres-portar på kontorsnät.

1. **New Project → importera `Robban3/Avarn`.** Ramverket känns igen
   automatiskt; inga byggkommandon behöver ändras.
2. **Lägg in miljövariablerna:**

   | Variabel | Var den hämtas |
   | --- | --- |
   | `DATABASE_URL` | Supabase → Connect → Transaction pooler (port 6543) |
   | `DIRECT_URL` | Supabase → Connect → Session pooler (port 5432) |
   | `AUTH_SECRET` | valfri lång slumpsträng, t.ex. från `npm run setup` |
   | `CRON_KEY` | valfri slumpsträng |
   | `SUPABASE_URL` | Supabase → Settings → API → Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` |

3. **Deploy.**

Byggsteget kör `prisma migrate deploy` före `next build`, så schemaändringar
följer med varje driftsättning. `vercel.json` lägger appen i Dublin (`dub1`),
samma region som en Supabase i `eu-west-1`, och schemalägger
`/api/cron/paminnelser` klockan 06 varje dag.

`SUPABASE_SERVICE_ROLE_KEY` går förbi radsäkerheten och får aldrig hamna i
klientkod eller i en `NEXT_PUBLIC_`-variabel. Den används bara på servern,
för bilagorna.

### Bilagor i drift

Vercels filsystem är flyktigt, så uppladdade bilder och filmer kan inte
ligga på disk. Är `SUPABASE_URL` och `SUPABASE_SERVICE_ROLE_KEY` satta
sparas de i stället i en privat hink i Supabase Storage, som skapas
automatiskt vid första uppladdningen. Saknas nycklarna används disken, så
att lokal utveckling fungerar utan moln.

Utlämningen går oavsett lagring genom `/api/media/[id]`, som gör
behörighetskontrollen först — filerna är aldrig publikt åtkomliga.

### Radsäkerhet i Supabase

Supabase publicerar schemat `public` genom sitt REST-API, och `anon`-nyckeln
är gjord för att ligga öppet i en webbklient. Tabeller som skapas via SQL får
radsäkerhet avstängd som standard — utan åtgärd skulle vem som helst med den
nyckeln kunna läsa operativa rapporter, markeringar och fynd.

Därför slås radsäkerhet på för samtliga tabeller, utan policyer: `anon` och
`authenticated` nekas allt. Appen påverkas inte, eftersom den ansluter som
rollen `postgres` som äger tabellerna. Behörigheten mellan roller styrs i
appen, i `src/lib/authz.ts`.

Skapar du tabellerna med `npm run db:setup` i stället för SQL-filen behöver
du slå på radsäkerheten själv — kör då raderna längst ner i
`prisma/supabase-setup.sql`.

`npm run setup` rör inte en befintlig `.env`. `.env.example` visar formatet på
adresserna.

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
npm run db:migrate # ny migrering efter schemaändring
npm run db:sql     # genererar om prisma/supabase-setup.sql
npm run seed       # lägger in exempeldata på nytt
npm run db:studio  # Prisma Studio
```

`npm run test:e2e` kräver att utvecklingsservern är igång.

### Teknik

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma 7 mot
PostgreSQL. Inloggningen är en signerad cookie (JWT via `jose`) med
bcrypt-hashade lösenord; formulär går genom Server Actions med Zod-validering.

### Databasen

PostgreSQL via Prisma med `@prisma/adapter-pg`. Appen ansluter genom adaptern
i `src/lib/db.ts`, medan Prisma-CLI:t (migreringar, studio) läser sin
anslutning ur `prisma.config.ts` och använder `DIRECT_URL`.

Statusfält lagras som `String` i stället för `enum`, så att nya värden kan
läggas till utan migrering. De tillåtna värdena definieras i
`src/lib/domain.ts` och valideras med Zod innan de skrivs.

Efter en schemaändring: `npm run db:migrate` skapar och applicerar en ny
migrering lokalt, `npx prisma migrate deploy` applicerar den i drift.

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
