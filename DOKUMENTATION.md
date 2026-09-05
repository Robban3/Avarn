# Avarn Hundtjänst – dokumentation

Operativt stöd för Avarn Securitys hundverksamhet. En mobil först-webbapp
(PWA) för hundförare i fält, med en adminpanel för instruktörer och ledning
på skärm.

Det här dokumentet beskriver hela appen, kategori för kategori. `README.md`
är den korta ingången – hur man startar appen. Här står varför den ser ut
som den gör.

## Innehåll

1. [Översikt](#1-översikt)
2. [Ordlista](#2-ordlista)
3. [Arkitektur](#3-arkitektur)
4. [Behörighet](#4-behörighet)
5. [Datamodell](#5-datamodell)
6. [Vyerna](#6-vyerna)
7. [Offline](#7-offline)
8. [Grafisk profil](#8-grafisk-profil)
9. [Drift](#9-drift)
10. [Utveckling](#10-utveckling)

---

## 1. Översikt

### Vad appen är

Ett verksamhetssystem för hundtjänst: träningen, uppdragen, rapporterna och
behörigheterna för de ekipage Avarn har i drift. Två gränssnitt över samma
data och samma behörighetsregler:

- **Förarappen** – mobilen. Fem flikar längst ner, ett uppdrag i taget,
  fungerar utan täckning. Det här är appen som används med en hund i andra
  handen.
- **Adminpanelen** (`/panel`) – skärmen. Menyn till vänster, listor och
  nyckeltal, för den som planerar och följer upp.

Samma inloggning, samma spärrar. Panelen ser aldrig något som rollen inte
redan får se i förarappen.

### De fem rollerna

Definierade i `src/lib/domain.ts`, rättigheterna i `src/lib/authz.ts`.

| Roll | Kod | Ser | Gör |
| --- | --- | --- | --- |
| Hundförare | `HANDLER` | egna ekipage | registrerar träning, svarar på uppdrag, skriver rapporter, registrerar egen hund |
| Instruktör | `INSTRUCTOR` | tilldelade ekipage | godkänner träning, lägger träningsplaner, kallar till uppföljning, registrerar certifikat |
| Regionalt ansvarig | `REGIONAL_MANAGER` | ekipage i egen region | allt ovan, plus skapa och tilldela uppdrag, godkänna rapporter, statistik |
| Nationellt ansvarig | `NATIONAL_MANAGER` | samtliga ekipage | som regionalt ansvarig, hela landet |
| Administratör | `ADMIN` | samtliga ekipage | som nationellt ansvarig, plus användare, organisation och systemlogg |

Rollen sitter på användaren, inte på ekipaget. Vad rollen får göra
(`can`) och vilka ekipage den ser (`teamScope`) är två skilda frågor – se
[Behörighet](#4-behörighet).

### Modulkarta

| Modul | Vad den håller | Var |
| --- | --- | --- |
| Hundar och ekipage | hundens uppgifter, sökinriktningar, utbildningar; kopplingen förare–hund | `/hundar`, `/panel/hundar`, `/panel/ekipage` |
| Träning | pass med gömmor och resultat, träningsplaner med övningar, godkännande | `/traning`, `/traning/plan`, `/panel/traning` |
| Uppdrag | uppdrag, tilldelning, den operativa vyn under pågående uppdrag | `/uppdrag`, `/panel/uppdrag` |
| Rapporter | operativ rapport efter uppdrag, markeringar och fynd, godkännande | `/rapporter`, `/panel/rapporter` |
| Certifikat | intyg med giltighetstid, automatiska påminnelser | `/certifikat`, `/panel/certifikat` |
| Kalender | uppdrag, träning och satt otillgänglighet i samma vy | `/kalender`, `/panel/kalender` |
| Sök | fritext över sex grupper, inom behörigheten | `/sok` |
| Meddelanden | notifieringar om uppdrag, kommentarer, träning och behörigheter | `/meddelanden`, `/panel/meddelanden` |
| Instruktörsvy | överblick per ekipage, uppföljningar | `/instruktor` |
| Ledningsvy | nyckeltal, diagram, geografisk täckning | `/ledning`, `/panel` |
| Administration | användare, regioner, kunder, inställningar, systemlogg | `/admin`, `/panel/anvandare` m.fl. |

Navet i allt är **ekipaget**. Träning, uppdrag, rapporter och certifikat
hänger på det, vilket gör behörighetsfiltreringen till en enda
återanvändbar fråga i stället för ett villkor per vy.

---

## 2. Ordlista

Koden och gränssnittet använder hundtjänstens ord. Utan dem är stora delar
av datamodellen obegriplig.

| Ord | Betyder | I koden |
| --- | --- | --- |
| **Ekipage** | En hundförare och en hund som arbetar tillsammans. Enheten som tas ut på uppdrag – inte hunden och inte föraren var för sig. | `Team` |
| **Sökinriktning** | Vad hunden är utbildad att söka efter: narkotika, sprängämnen, människa. Avgör vilka uppdrag ekipaget kan tas ut på. | `SearchDiscipline`, `DogDiscipline` |
| **Måldoft** | Den specifika doft hunden ska markera på under ett pass. | `TrainingSession.targetOdor` |
| **Gömma** | Ett utplacerat föremål med måldoft som hunden ska hitta under träning. Ett pass har flera, var och en med placering, höjd, svårighet och utfall. | `Hide` |
| **Markering** | Hundens signal att den hittat något – det tränade beteendet, inte fyndet i sig. En markering kan leda till fynd eller vara falsk. | `Hide.outcome`, `MissionEvent` med `kind = MARKING` |
| **Falsk markering** | Hunden markerar utan att det finns något. Följs upp i träningen. | `FALSE_INDICATION` |
| **Fynd** | Det som faktiskt hittades på uppdrag, efter en markering. | `Indication`, `MissionEvent` med `kind = FIND` |
| **Sökmiljö** | Var passet genomfördes: skog, lagerlokal, terminal. Skild från träningsområdet. | `TrainingSession.environment` |
| **Träningsområde** | Vilken typ av sök som tränades: områdessök, fordonssök, bagagesök. | `TrainingSession.trainingArea` |
| **Uppföljning** | En instruktörs begäran om att något ska tränas eller rättas, med förfallodatum. | `FollowUp` |
| **Tilldelning** | Att ett ekipage erbjuds ett uppdrag. Föraren accepterar eller avböjer; erbjudandet är inte samma sak som uppdraget. | `MissionAssignment` |
| **Genomsökt andel** | Hur stor del av området föraren bedömer som avsökt, satt i steg om tio procent under pågående uppdrag. | `MissionAssignment.progressPercent` |

---

## 3. Arkitektur

### Ramverket

Next.js 16 med App Router, React 19, TypeScript i strikt läge, Tailwind CSS
v4, Prisma 7 mot PostgreSQL. Utvecklingsservern kör Turbopack.

Sidorna är **serverkomponenter** som standard. De hämtar sin data direkt,
utan mellanliggande API-lager – det finns inget REST-skikt att glömma en
behörighetskontroll i. `"use client"` sätts bara där webbläsaren behövs:
kartan, kalenderns flikar, offline-kön, filväljare, diagramhovring.

Formulär går genom **server actions**, inte fetch-anrop. De ligger i en
`actions.ts` bredvid sidorna de tillhör (13 filer, 50 actions). Ett
formulär skrivs som `<form action={serverAction}>`, vilket gör att det
fungerar även innan sidans JavaScript hunnit ladda – viktigt på en telefon
med dålig uppkoppling. Där ett läge behövs i webbläsaren används
`useActionState` ovanpå samma action.

### Lagren

```
src/proxy.ts          Inloggad eller inte. Första spärren.
src/app/**/page.tsx   Vyn. Anropar requireUser / requireCapability först.
src/app/**/actions.ts Skrivningarna. Anropar assertCan först.
src/lib/queries.ts    Delade läsfrågor, alla med teamScope.
src/lib/authz.ts      Vad rollen får göra och vilka ekipage den ser.
src/lib/db.ts         PrismaClient via @prisma/adapter-pg.
```

`src/proxy.ts` är Next 16:s namn på middleware. Den gör bara en sak:
skickar utloggade till `/login` och inloggade bort från den. **Den är
ingen behörighetskontroll** – varje sida och varje action kontrollerar
själv, så att en gissad adress inte öppnar någon annans uppgifter.

### Mappstruktur

```
src/
  app/
    (app)/          Inloggade delen. layout.tsx kräver session.
      panel/        Adminpanelen.
    api/
      cron/paminnelser/   Schemalagda certifikatpåminnelser.
      media/[id]/         Utlämning av bilagor, efter behörighetskontroll.
    login/  nekad/  layout.tsx  globals.css
  components/       23 komponenter. ui.tsx är biblioteket.
  lib/              29 moduler. Domänlogik och databasfrågor.
  generated/prisma/ Genererad Prisma-klient. Granskas inte av ESLint.
prisma/             schema.prisma, migrations/, seed.ts, supabase-SQL.
e2e/                Playwright, 90 prov i 14 filer.
public/             sw.js, manifest, ikoner.
scripts/            Fyra hjälpskript, se kapitel 10.
data/               Länsgeometrin till Sverigekartan, med källhänvisning.
```

Ren logik ligger i egna moduler utan databasberoende – `kalender.ts`,
`handelser.ts`, `notiser.ts`, `fritext.ts`, `certifications.ts`,
`format.ts` – just för att den ska gå att prova med enhetsprov. Modulerna
som bara får köras på servern börjar med `import "server-only"`, vilket är
skälet till att `bokstavligt()` bor i `fritext.ts` och inte i `sok.ts`.

### Databasanslutningen

`src/lib/db.ts` skapar en delad `PrismaClient` med `@prisma/adapter-pg`
och återanvänder den över hot reloads i utveckling, så att inte varje
omladdning öppnar nya anslutningar. Prisma-CLI:t (migreringar, studio)
läser i stället sin anslutning ur `prisma.config.ts` och använder
`DIRECT_URL` – poolaren släpper inte igenom schemaändringar.

---

## 4. Behörighet

Det säkerhetskritiska kapitlet. Uppdrag och rapporter kan innehålla
skyddsvärd information; utgångsläget är alltid ingen åtkomst, och varje
utökning skrivs ut explicit.

### Två lager

All åtkomststyrning ligger i `src/lib/authz.ts` och används i två lager
som alltid gäller samtidigt:

**1. `can(user, action)` – vad rollen överhuvudtaget får göra.**

En uppslagning i `CAPABILITIES`, en lista per roll. Åtgärderna är
namngivna: `mission:assign`, `session:approve`, `report:create`,
`cert:manage`, `admin:manage` och ett tjugotal till. `assertCan` kastar
`AccessDeniedError` och anropas **först** i varje server action.

**2. `teamScope(user)` – vilka ekipage användaren får se data om.**

Ett Prisma-villkor, inte ett booleskt svar:

| Roll | Villkor |
| --- | --- |
| `HANDLER` | `{ handlerId: user.id }` |
| `INSTRUCTOR` | `{ instructorAssignments: { some: { instructorId: user.id } } }` |
| `REGIONAL_MANAGER` | `{ regionId: user.regionId ?? "__ingen_region__" }` |
| `NATIONAL_MANAGER`, `ADMIN` | `{}` |
| okänd roll | `{ id: "__ingen_atkomst__" }` |

Två detaljer är avsiktliga. En regionalt ansvarig **utan** region får ett
villkor som inte matchar något – hellre tom lista än hela landet. En okänd
roll får samma sak, i stället för att falla igenom till `{}`.

Kringliggande hjälpfunktioner: `nestedTeamScope` (samma sak uttryckt på en
relation som heter `team`), `regionScope` (för uppdrag och statistik),
`seesAllRegions`.

### Regeln: `AND`, aldrig spridning

Ett behörighetsvillkor kombineras med sökvillkor genom `AND: [...]` – inte
genom objektspridning:

```ts
// Rätt: villkoren gäller båda. Sökningen kan bara smalna av.
where: { AND: [ scope, { OR: [ { name: som(q) }, ... ] } ] }

// Fel: samma nyckel i båda objekten, och det senare vinner.
where: { ...scope, OR: [ ... ] }
```

Så uppstår en läcka. Skriver man `{ ...teamScope(user), handlerId: nagot }`
har man just skrivit över avgränsningen med ett villkor som kommer
utifrån. Med `AND` är det omöjligt: ett extra villkor kan bara göra
resultatet mindre, aldrig större. Sökningen i `src/lib/sok.ts` bär det
mönstret i alla sex delfrågor, kalendern i `queries.ts` i alla tre.

### Ingångarna i varje sida

Från `src/lib/auth.ts`:

- `requireUser()` – kräver session. **Roll, region och kontostatus läses ur
  databasen, inte ur kakan.** Kakan lever i tolv timmar; utan uppslagningen
  behöll en avstängd eller nedgraderad användare sina rättigheter tills
  token gick ut. `cache()` från React gör det till en fråga per rendering.
- `requireCapability(action)` – kräver dessutom en behörighet, annars
  `/nekad`.
- `requirePanelUser()` – kräver att rollen når adminpanelen: instruktör och
  uppåt. Hundföraren har mobilappen.
- `currentUserRecord()` – färsk användarpost med region och förarprofil.

Ett avstängt konto skickas till `/logga-ut`, inte till `/login`: kakan är
fortfarande giltig, och mellanlagret hade annars skickat tillbaka
besökaren till `/hem` i en slinga.

### Uppdrag: `missionForUser`

Frågan bor i `src/lib/queries.ts` och delas av tre vyer – uppdragssidan,
detaljvyn och redigeringssidan. Två kopior av en behörighetsfråga är precis
så en läcka uppstår.

Regeln: den som tilldelar uppdrag (`mission:assign`) ser sin regions
uppdrag; övriga bara dem deras egna ekipage är tilldelade. Frågan returnerar
`null` både när uppdraget inte finns och när det ligger utanför
behörigheten, och anroparen svarar 404 i båda fallen – annars går id:n att
räkna upp.

### Bilagor: `canAccessMedia`

Filer ligger aldrig i `public/`. De lämnas ut genom `/api/media/[id]`, som
först kör `canAccessMedia` i `src/lib/media-access.ts`. Den följer filen
till det den hör till – träningspass, rapport, certifikat, uppdrag,
hundfoto, profilbild – och prövar den kopplingen mot samma
ekipageavgränsning som resten av appen.

Två gränsfall är utskrivna: ett certifikat utan mottagare nekas uttryckligen
i stället för att skicka ett tomt `OR` till Prisma och hoppas på ett nej,
och ett uppdragsdokument prövas mot samma regel som `missionForUser`, så att
dokumentfliken inte blir en genväg förbi den. En fil utan koppling lämnas
bara ut till den som laddade upp den.

### Revisionsloggen

`src/lib/audit.ts` skriver till `AuditLog`. Läsning av uppdrag och rapporter
loggas, liksom ändringar, inloggningar och nekad åtkomst
(`READ | CREATE | UPDATE | DELETE | LOGIN | DENIED`). Loggningen fångar sina
egna fel – den får aldrig fälla anropet den följer. Loggen visas under
`/panel/systemlogg`, bara för administratör.

### Statistiken

`src/lib/stats.ts` läser siffror, aldrig rapporttexter. Statistik ska inte
kunna bli en väg runt behörigheterna, och aggregaten går genom samma
`teamScope` som listorna.

---

## 5. Datamodell

28 tabeller i `prisma/schema.prisma`. Navet är `Team`.

### Organisation

| Tabell | Innehåll |
| --- | --- |
| `Region` | Kod, namn, sorteringsordning. Fem stycken i exempeldatan. |
| `User` | Konto med `role`, valfri `regionId`, `passwordHash`, `active`. |
| `HandlerProfile` | Anställningsnummer, stationeringsort, presentation, foto. En per förare. |

### Hundar och ekipage

| Tabell | Innehåll |
| --- | --- |
| `Dog` | Namn, ras, födelsedatum, chipnummer, status, plus frivilliga uppgifter (vikt, mankhöjd, HD/ED, mentalindex, försäkring). |
| `SearchDiscipline` | Sökinriktningarna. `shortLabel` är taggen i uppdragslistan. |
| `DogDiscipline` | Hundens inriktningar med nivå och certifieringsdatum. |
| `DogEducation` | Genomgångna utbildningar. |
| `Team` | **Ekipaget.** Förare + hund + region, med start, slut och status. Unikt per `(handlerId, dogId)`. |
| `InstructorAssignment` | Vilken instruktör som följer vilket ekipage. Detta är instruktörens `teamScope`. |
| `TeamAvailability` | Perioder märkta `AVAILABLE` eller `UNAVAILABLE`. Styr tilldelningsförslag och syns i kalendern. |

### Certifikat

| Tabell | Innehåll |
| --- | --- |
| `CertificationType` | Kod, namn, giltighetstid i månader, `appliesTo` (`DOG`/`HANDLER`/`TEAM`). |
| `Certification` | Ett intyg. Pekar på **en** av hund, användare eller ekipage. Har `issuedAt`/`expiresAt` och kan ha bilagor. |

Giltigheten härleds ur `expiresAt` i `src/lib/certifications.ts` och lagras
inte – då kan status aldrig hamna i otakt med datumet.

### Träning

| Tabell | Innehåll |
| --- | --- |
| `TrainingPlan` | Instruktörens plan för ett ekipage under en period. |
| `PlannedExercise` | En övning i planen. Kan kopplas till det pass som genomförde den (`1:1`). |
| `TrainingSession` | Ett pass: tid, plats, träningsområde, sökmiljö, måldoft, antal gömmor och funna, kommentar, status. |
| `Hide` | En gömma: placering, höjd, svårighet, utfall, söktid. |

### Uppdrag

| Tabell | Innehåll |
| --- | --- |
| `Customer` | Uppdragsgivare med kontaktuppgifter. |
| `Mission` | Uppdraget: referens, typ, tid, adress och ort, mötesplats, parkering, utrustning, uppdragsområde och yta, koordinater och områdespolygon, region, sökinriktning, särskilda instruktioner, status. |
| `MissionAssignment` | Erbjudandet till ett ekipage: status, svarstid, `startedAt`/`endedAt`, `progressPercent`, `checklistDone`. Unikt per `(missionId, teamId)`. |
| `MissionEvent` | En registrering under pågående uppdrag: markering, fynd, avvikelse, notering. |

`checklistDone` sparar **bara vilka punkter som är avbockade**, inte
punkterna själva – de är en inställning och kan ändras av administratören.
Byter någon ut en punkt matchar den gamla bockningen inget och räknas inte,
vilket är bättre än en kopia av listan per uppdrag som tyst hamnar i otakt.

`areaPolygon` är uppdragsområdets hörn, en koordinat per rad. Saknas den men
ytan är känd ritas en cirkel av rätt storlek kring uppdragets koordinat i
stället – ungefärlig, och märkt så.

### Rapporter

| Tabell | Innehåll |
| --- | --- |
| `OperationalReport` | Rapporten efter ett uppdrag: genomsökta områden, yta, fynd, avvikelser, åtgärder, kommentar, tider, status. |
| `Indication` | En markering i rapporten: plats, beskrivning, utfall, överlämnad till. |

Registrerade händelser under uppdraget förifyller rapportformuläret –
`src/lib/handelser.ts` gör markeringar till rader, lägger fynd och
avvikelser i sina fält och samlar noteringar i kommentaren, var och en med
klockslaget. Poängen är att slippa skriva samma sak två gånger.

### Gemensamt

| Tabell | Innehåll |
| --- | --- |
| `MediaAsset` | En uppladdad fil. En valfri koppling per rad: pass, rapport, certifikat, hund, profil eller uppdrag. `missionSource` skiljer kundens underlag (`CUSTOMER`) från förarens bilaga (`ATTACHMENT`). |
| `Comment` | Kommentar på pass, rapport eller ekipage. |
| `FollowUp` | Instruktörens uppföljning med förfallodatum och status. |
| `Notification` | Notifiering till en användare, med typ, titel, länk och lästid. |
| `AuditLog` | Revisionslogg. |
| `Setting` | Verksamhetens inställningar. Värdet är JSON, så att både ett tal och en lista ryms utan en kolumn per inställning. |

### Statusfält

Statusfält lagras som `String`, inte som `enum` i databasen, så att nya
värden kan läggas till utan migrering. De tillåtna värdena definieras i
`src/lib/domain.ts` och valideras med Zod innan de skrivs. Där finns också
etiketterna som visas i gränssnittet och färgtonen per status
(`missionTone`, `reportTone`, `assignmentTone`, `eventTone`) – funktioner
och inte kopior, sedan tre olika listor sagt olika saker om samma status.

| Fält | Värden |
| --- | --- |
| `User.role` | `HANDLER` · `INSTRUCTOR` · `REGIONAL_MANAGER` · `NATIONAL_MANAGER` · `ADMIN` |
| `Dog.status` | `ACTIVE` · `RESTING` · `RETIRED` |
| `Team.status` | `ACTIVE` · `PAUSED` · `ENDED` |
| `TrainingSession.status`, `OperationalReport.status` | `DRAFT` · `SUBMITTED` · `APPROVED` · `CHANGES_REQUESTED` |
| `Mission.status` | `PLANNED` · `ASSIGNED` · `IN_PROGRESS` · `COMPLETED` · `CANCELLED` |
| `MissionAssignment.status` | `OFFERED` · `ACCEPTED` · `DECLINED` · `COMPLETED` |
| `MissionEvent.kind` | `MARKING` · `FIND` · `DEVIATION` · `NOTE` · `OTHER` |
| `Hide.outcome` | `FOUND` · `MISSED` · `FALSE_INDICATION` |
| `Indication.outcome` | `FIND` · `NO_FIND` · `FALSE_INDICATION` |
| `TeamAvailability.kind` | `AVAILABLE` · `UNAVAILABLE` |
| `MediaAsset.kind` | `IMAGE` · `VIDEO` · `DOCUMENT` |

### Migreringar

`npm run db:migrate` skapar och applicerar en migrering lokalt.
`prisma migrate deploy` applicerar i drift – det körs automatiskt före
`next build`. Efter en schemaändring genereras SQL-filerna för Supabase om,
aldrig för hand:

```bash
npm run db:sql             # prisma/supabase-setup.sql, hela uppsättningen
npm run db:sql:migrations  # prisma/supabase/, en fil per migrering
```

---

## 6. Vyerna

48 sidor. Kolumnen "Kräver" är den kontroll sidan gör själv, utöver att
`(app)/layout.tsx` kräver en giltig session.

### Förarappen

| Rutt | Kräver | Vad den gör |
| --- | --- | --- |
| `/` | – | Skickar vidare till `/hem`. |
| `/login` | – | Inloggning. Rensar även cache och offline-kö, se kapitel 7. |
| `/nekad` | – | Åtkomst nekad. |
| `/hem` | inloggad | Startsidan: dagens uppdrag, viktiga notiser, genvägar. |
| `/hundar` | inloggad | Hundarna inom behörigheten. |
| `/hundar/[id]` | inloggad | Hundprofil: uppgifter, inriktningar, utbildningar, certifikat, foton. |
| `/hundar/ny` | `dog:create` | Registrera hund. Skapar hund och ekipage i förarens region. |
| `/hundar/[id]/redigera` | `dog:create` | Ändra uppgifter och foto. |
| `/uppdrag` | inloggad | Kommande, pågående och avslutade uppdrag. |
| `/uppdrag/[id]` | inloggad | Uppdraget: tid, plats, kund, tilldelning, svar. |
| `/uppdrag/[id]/detaljer` | inloggad | Fyra flikar: Översikt, Plats (karta), Checklista, Dokument. |
| `/uppdrag/[id]/pagaende` | inloggad | Den operativa vyn: klocka, snabbregistrering av händelser, checklista, genomsökt andel. Fungerar offline. |
| `/uppdrag/nytt` | `mission:create` | Nytt uppdrag. |
| `/uppdrag/[id]/redigera` | `mission:create` | Rätta uppdraget. |
| `/traning` | inloggad | Träningsdagboken. |
| `/traning/[id]` | inloggad | Ett pass med gömmor, media och kommentarer. |
| `/traning/nytt` | `session:create` | Nytt pass. |
| `/traning/[id]/redigera` | `session:create` | Rätta pass som inte är godkänt. |
| `/traning/plan` | inloggad | Träningsplanen med övningar. |
| `/rapporter` | inloggad | Operativa rapporter, med fritextsökning. |
| `/rapporter/[id]` | inloggad | Rapporten i sex avsnitt. |
| `/rapporter/nytt` | `report:create` | Ny rapport, förifylld ur uppdragets händelser. |
| `/rapporter/[id]/redigera` | `report:create` | Rätta rapport som inte är godkänd. |
| `/certifikat` | inloggad | Certifikat grupperade som Utgångna, Går snart ut, Giltiga. |
| `/kalender` | inloggad | Månad eller vecka, med vald dag. Se nedan. |
| `/sok` | inloggad | Sökning över sex grupper. Se nedan. |
| `/meddelanden` | inloggad | Notifieringar. |
| `/mer` | inloggad | Menyn: Sök, Kalender, Certifikat, Meddelanden, Rapporter, Adminpanel, Instruktörsvy, Statistik, Administration, Min profil – de poster rollen når. |
| `/profil` | inloggad | Egna uppgifter, byta lösenord, sätta tillgänglighet. |
| `/instruktor` | `instructor:view` | Ekipagen instruktören följer. |
| `/instruktor/ekipage/[teamId]` | `instructor:view` | Ett ekipage: historik, utveckling, uppföljningar. |
| `/ledning` | `stats:view` | Nyckeltal och diagram. |
| `/admin` | `admin:manage` | Administration. |

De fem flikarna längst ner (`src/components/BottomNav.tsx`) är desamma för
alla roller – Hem, Hundar, Uppdrag, Träning, Mer. Instruktörs-, lednings-
och adminvyerna nås under "Mer", så att den operativa navigeringen ser
likadan ut oavsett vem som är inloggad.

### Kalendern

`/kalender` har två lägen, `?vy=manad` och `?vy=vecka`, och en vald dag i
`?dag=`. Läget ligger i adressen så att en vy går att länka till och
bakåtknappen fungerar.

Räkningen ligger i `src/lib/kalender.ts`, som rena funktioner utan databas:
`manadsrutnat` bygger hela veckor med måndag först så att kolumnerna alltid
står under rätt veckodag; `perDag` lägger en flerdygnshändelse på varje dag
den berör, inte bara den den råkade börja; `spalter` delar in krockande
händelser i klungor så att två dubbelbokade uppdrag hamnar bredvid varandra
i stället för ovanpå. `timfonster` utgår från en arbetsdag (06–19) och växer
bara när något faktiskt ligger utanför – och räknar medvetet **inte** in
satt otillgänglighet, som sätts i hela dygn och annars hade dragit ut
fönstret till midnatt–midnatt och klämt ihop veckans uppdrag till streck.

Hämtningen ligger i `kalenderhandelser` i `queries.ts`, med uppdrag,
träningspass och tillgänglighet var och en under sin egen avgränsning.

### Sökningen

`/sok?q=` söker i sex grupper: uppdrag, hundar, ekipage, träning, rapporter,
certifikat. Ett tecken räcker inte – sökningen börjar vid två, eftersom ett
tecken träffar allt och säger ingenting. Översikten hämtar fyra rader per
grupp och använder den fjärde för att avgöra om "Visa alla" ska visas, utan
en räknefråga per grupp. `?typ=` visar en grupp i sin helhet.

Varje delfråga bär sin egen avgränsning i `AND` (kapitel 4). Fritexten går
genom `bokstavligt()` i `src/lib/fritext.ts`, som gör `%` och `_`
bokstavliga: Prismas `contains` blir ett `LIKE`, och utan det hade en
sökning på `%` träffat varenda post och `_o_a` hittat Nova.

De senaste fem sökningarna sparas i `localStorage`, inte i databasen – de är
personliga, ointressanta för alla andra och ska inte överleva ett enhetsbyte.

### Adminpanelen

Menyn ligger i `src/components/AdminShell.tsx`, i två grupper.

| Rutt | Kräver | Vad den gör |
| --- | --- | --- |
| `/panel` | panelbehörighet | Översikt: nyckeltal, diagram, Sverigekarta. |
| `/panel/ekipage` | panelbehörighet | Ekipagen. |
| `/panel/hundar` | panelbehörighet | Hundarna. |
| `/panel/uppdrag` | panelbehörighet | Uppdragen. |
| `/panel/traning` | panelbehörighet | Träningspassen. |
| `/panel/rapporter` | panelbehörighet | Rapporterna. |
| `/panel/certifikat` | panelbehörighet | Certifikat och behörigheter. |
| `/panel/meddelanden` | panelbehörighet | Meddelanden. |
| `/panel/kalender` | panelbehörighet | Kalender. |
| `/panel/kunder` | `stats:view` | Kunder. |
| `/panel/regioner` | `stats:view` | Regioner med sina län. |
| `/panel/anvandare` | `admin:manage` | Användare och roller. |
| `/panel/organisation` | `admin:manage` | Organisation. |
| `/panel/installningar` | `admin:manage` | Inställningar. |
| `/panel/systemlogg` | `admin:manage` | Revisionsloggen. |

"Panelbehörighet" är `requirePanelUser()`: instruktör, regionalt och
nationellt ansvarig samt administratör. Hundföraren skickas till `/nekad` –
hen har mobilappen.

### API-vägarna

| Rutt | Vad den gör |
| --- | --- |
| `GET /api/media/[id]` | Lämnar ut en bilaga efter `canAccessMedia`. Enda vägen till uppladdade filer. |
| `POST /api/cron/paminnelser` | Skapar påminnelser om certifikat som snart går ut. Autentiserar med `CRON_KEY`, inte med session. |

### Inställningarna

`/panel/installningar` ändrar verksamhetens listor: träningsområden,
sökmiljöer, måldofter, uppdragstyper, checklistan under uppdrag och antal
dagars varning före ett certifikat går ut. Värdena ligger i `Setting`;
konstanterna i `domain.ts` är kvar som standardvärden och gäller så länge
ingen ändrat något. En trasig rad släcker inte appen – då används
standardvärdet.

Driftens värden – databasadress, lagringsnycklar, cron-nyckeln – finns
medvetet **inte** här. De sätts vid driftsättning och ska inte kunna ändras
av en knapp i en körande process.

---

## 7. Offline

Föraren står i en bagagehall utan täckning och trycker på "Markering".
Registreringen får inte försvinna. Det är hela kravet.

### Tre delar

| Del | Var | Ansvar |
| --- | --- | --- |
| Servicearbetaren | `public/sw.js` | Cachar sidor och filer, så att appen går att öppna utan nät. |
| Kön | `src/lib/offlineko.ts` | IndexedDB. Håller registreringar som ännu inte kommit fram. |
| Synkaren och statusraden | `src/components/Offline.tsx` | Tömmer kön när uppkopplingen är tillbaka och säger vad som gäller. |

Kön ligger i IndexedDB och **inte** hos servicearbetaren. Den senare är en
cache av appens resurser och överlever inte att webbläsaren rensar den,
medan en markering föraren gjort måste ligga kvar tills den faktiskt kommit
fram.

### Servicearbetaren

Cachen heter `avarn-v1`. Strategin skiljer på typ av begäran:

- `/_next/static/**` – **cache först**. Byggda filer har innehållshash i
  namnet och ändras aldrig.
- `/api/media/**` – **cache först**. En bilaga föraren öppnat en gång finns
  kvar.
- Navigeringar utom `/login` – **nät först, cache som reserv**. Ett uppdrag
  som ändrats ska visas som det ser ut nu; cachen är reserven, inte
  förstahandsvalet.
- Allt annat än `GET` – **aldrig**. En registrering får inte besvaras ur
  cache; då hade föraren fått ett kvitto på något som inte hänt.

I utveckling registreras arbetaren som `/sw.js?dev=1`, och hoppar då över
`/_next/static`. Utvecklingsserverns filer byter innehåll på samma adress,
och en cachad kopia hade blivit en gammal version av appen som inte går att
bli av med.

**Cachen töms vid sessionsgränsen.** `Rensacache` ligger på
inloggningssidan, dit man kommer både när man loggar ut och när man loggar
in, och tömmer både cachen och IndexedDB. Utan det hade nästa användare på
samma telefon kunnat öppna föregående användares uppdrag ur cachen.

### Kön

Tre typer av poster, `Kotyp`: `handelse` (registrerad markering, fynd,
avvikelse, notering), `checklista` (avbockad punkt) och `framdrift`
(genomsökt andel). Varje post håller formulärets fält som de såg ut när
föraren tryckte, plus tidpunkt och antal misslyckade försök.

**Alla tre server actions sätter ett läge och räknar inte fram det ur det
gamla.** `setChecklistItem` tar `klar`, inte "växla"; `setMissionProgress`
tar en absolut andel, inte ett steg. Det är förutsättningen för att en post
som ligger kvar i kön ska tåla att skickas om utan att ta tillbaka sig
själv.

### Vägen genom kön

`Kobartformular` lägger **alltid** registreringen i kön, även när
uppkopplingen ser bra ut. Att fråga `navigator.onLine` och skicka direkt när
svaret är ja såg enklare ut, men flaggan ligger kvar på "uppkopplad" en
stund efter att täckningen tagit slut – och då gick registreringen förlorad
i ett misslyckat anrop. Formuläret har kvar sin `action` för den som inte
fått sidans kod ännu; ett tryck ska fungera innan JavaScript laddat.

Synkaren tömmer kön i den ordning posterna gjordes, så snart det finns
uppkoppling och något i kön: när nätet kommer tillbaka, när en ny post läggs
i kön, och en gång vid start för det som köades innan appen stängdes. Efter
en lyckad omgång anropas `router.refresh()`, annars står räknarna kvar på
noll trots att markeringarna kommit fram.

Tre spärrar:

- **En synkning i taget** (`pagar`-flaggan). Kön krymper medan den töms och
  varje ändring väcker effekten igen; utan spärren hade en andra omgång
  hunnit skicka en post som den första redan skickat men inte hunnit stryka.
- **Misslyckade poster ligger kvar** och prövas igen. En registrering ska
  aldrig försvinna för att nätet svajade.
- **Men de får inte blockera.** Efter `MAX_FORSOK` (5) misslyckanden i rad
  hoppas posten över så att det som ligger bakom kommer fram. Den ligger
  kvar och räknas fortfarande.

### Statusraden

Fyra lägen, klistrad direkt under sidhuvudet – beskedet om att trycket
sparats är värdelöst om man måste rulla upp för att se det.

| Läge | Text | Färg |
| --- | --- | --- |
| `online` | Online | dämpad |
| `offline` | Offline – *n* registreringar sparade i telefonen | varning |
| `synkar` | Synkar … | info |
| `klart` | Allt synkroniserat | ok |

"Allt synkroniserat" är ett kvitto och ingen vilostatus; efter fem sekunder
räcker det med Online.

Uppkopplingen frågas en gång i sekunden utöver `online`/`offline`-
händelserna. De är inte att lita på i en telefon som tappar täckning i en
hall – de kommer sent eller inte alls.

### Knappar som svarar direkt

`useEgetVarde` låter checklistan och framdriften visa förarens tryck
omedelbart och följa servern så snart den svarat. Utan uppkoppling kommer
svaret först långt senare, och en knapp som inte rör sig när man trycker på
den trycker man på igen. Det egna värdet adopterar serverns **bara när kön
är tom** – annars hade två snabba tryck hoppat tillbaka ett steg när det
första svaret kom.

### Vad som inte fungerar offline

Medvetet utelämnat, eftersom det inte går att göra ärligt:

- **Avsluta uppdrag** – bekräftar ett slutläge som kräver serversvar.
- **Ladda upp dokument och bilder** – filer köas inte.
- **Skriva rapport** – ett formulär med många fält, inte en knapptryckning.
- **Dokument är inte förhämtade.** "Tillgänglig offline" visas bara för
  filer föraren själv öppnat medan hen hade täckning; statusen läses ur
  webbläsarens cache och inte ur databasen, så den ljuger aldrig – men
  löftet är inte hållet förrän filerna hämtas i förväg.

---

## 8. Grafisk profil

Antracit och svart bas, turkos accent, vit text. Mörkt läge är inte ett
alternativläge utan hela profilen.

### Färgtokens

Alla färger definieras överst i `src/app/globals.css`, i ett `@theme`-block,
och används ingen annanstans i klartext. Hela profilen justeras därifrån.

| Grupp | Tokens |
| --- | --- |
| Ytor | `--color-bg` `#0b0e0f`, `--color-bg-deep` `#070909`, `--color-surface` `#161a1c`, `--color-surface-2` `#1e2325`, `--color-surface-3` `#262c2e` |
| Linjer | `--color-line` `#272d2f`, `--color-line-soft` `#1f2426` |
| Varumärke | `--color-brand` `#4fd1c5`, `--color-brand-strong` `#6fe0d6`, `--color-brand-deep` `#2f9a91`, `--color-ink` `#2b2d2e` |
| Text | `--color-fg` `#f4f7f7`, `--color-fg-muted` `#98a2a3`, `--color-fg-dim` `#6b7476` |
| Diagram | `--color-chart` `#2aa79c`, `--color-chart-soft` `#1d3d3c` |
| Status | `--color-ok` `#46d07f`, `--color-warn` `#e9b44c`, `--color-danger` `#e86b6b`, `--color-info` `#5aa9e6` |

Diagramfärgen är en **egen** token och inte accentfärgen: den är vald för
att klara kontrast- och ljushetskrav mot den mörka kortytan. Enfärgad,
eftersom alla diagram i ledningsvyn visar en enda serie.

Typsnittet är Inter, laddat genom `next/font`. Kortradien är
`--radius-card: 1rem`.

### Klasserna

`@layer components` i samma fil håller de återkommande ytorna: `.card`,
`.section-label`, `.chip`, `.field` med `.field-label`, och knapparna
`.btn` med `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`.
Där ligger också anpassningen av Leaflet-kartan till den mörka ytan.

### Komponentbiblioteket

`src/components/ui.tsx` – 20 komponenter som vyerna byggs av:
`PageHeading`, `Tabs`, `SectionHeader`, `Card`, `CardHeader`, `LinkCard`,
`Badge`, `DisciplineTag`, `Chip`, `Avatar`, `PhotoCircle`, `DetailRow`,
`DetailList`, `DateBlock`, `StatTile`, `StatRow`, `StatCard`, `StatusPill`,
`IconStat`, `EmptyState`.

**Regeln: en ny vy återanvänder dessa.** En egen kortstil i en enda vy är
hur profilen glider isär. Behövs något som inte finns läggs det till i
`ui.tsx` och används därifrån.

### Ramen

- **Sidhuvudet** är minst 56 px (`min-h-14`), klistrat överst, med
  bakåtpil eller menyknapp till vänster, titel i mitten och en valfri
  åtgärd till höger. På startsidan visas logotypen med sidnamnet i turkos
  bredvid i stället för en centrerad rubrik.
- **Bottenraden** har fem flikar, 64 px höga, med utrymme för telefonens
  säkra zon. Aktiv flik är turkos.
- **Innehållet** ligger i `max-w-4xl` (`max-w-5xl` för instrumentpanelen).
  På större skärmar breddas ytan men strukturen är densamma – mobilen
  förblir det som styr designen.

### Ikoner och logotyp

Ikonerna är egna SVG-komponenter i `src/components/icons.tsx`, inget
ikonbibliotek. Logotypen ritas som SVG i
`src/components/AvarnLogo.tsx` och används även som appikon; ligger den
officiella filen i `public/` kan komponenten peka på den i stället.

### PWA

`public/manifest.webmanifest`: `standalone`, stående, start på `/hem`,
bakgrund och temafärg `#0b0e0f`, svenska. Ikonerna är SVG – en vanlig och
en maskable.

### Bilder på hundar och personal

Exempeldatan innehåller inga foton; avatarerna faller tillbaka på
initialer. Läggs en bildadress in i `Dog.photoUrl` eller
`HandlerProfile.photoUrl` visas den i stället, utan kodändring.

---

## 9. Drift

### Miljövariabler

| Variabel | Krävs | Vad den är |
| --- | --- | --- |
| `DATABASE_URL` | ja | Appens anslutning. Supabase: transaction pooler, port 6543. |
| `DIRECT_URL` | ja | Migreringarnas anslutning. Supabase: direct/session, port 5432. Poolaren släpper inte igenom schemaändringar. |
| `AUTH_SECRET` | ja | Signerar sessionskakan. Minst 16 tecken, annars startar inte appen. |
| `CRON_KEY` | för påminnelser | Nyckeln som certifikatjobbet autentiserar med. |
| `CRON_SECRET` | nej | Vercels egen cron-hemlighet, godtas som alternativ. |
| `SUPABASE_URL` | i drift | Projektets adress, för lagring av bilagor. |
| `SUPABASE_SERVICE_ROLE_KEY` | i drift | Nyckel till lagringen. |

`npm run setup` skapar `.env` med slumpade `AUTH_SECRET` och `CRON_KEY`.
Den rör inte en befintlig fil. Databasadresserna fylls i för hand.

`SUPABASE_SERVICE_ROLE_KEY` går förbi radsäkerheten och får aldrig hamna i
klientkod eller i en `NEXT_PUBLIC_`-variabel. Den används bara på servern,
för bilagorna.

### Vercel

1. **New Project → importera repot.** Ramverket känns igen automatiskt.
2. **Lägg in miljövariablerna** ovan.
3. **Deploy.**

Byggsteget är `prisma migrate deploy && next build`, så schemaändringar
följer med varje driftsättning. `vercel.json` lägger appen i Dublin
(`dub1`), samma region som en Supabase i `eu-west-1`, och schemalägger
`/api/cron/paminnelser` klockan 06 varje dag.

### Databasen i Supabase

Går det inte att köra `npm run db:setup` finns SQL:en färdig i repot:

| Läge | Kör | Var |
| --- | --- | --- |
| Ny, tom databas | hela uppsättningen | `prisma/supabase-setup.sql` |
| Databasen har redan tabellerna | en migrering i taget | filerna i `prisma/supabase/` |

Öppna **SQL Editor → New query**, klistra in filen och kör.
`supabase-setup.sql` skapar de 28 tabellerna, lägger in exempeldatan, slår
på radsäkerhet och bokför migreringarna. Den avbryts med
`relation ... already exists` om databasen redan är uppsatt – det är
avsiktligt, den ska inte skriva över befintlig data. Filerna i
`prisma/supabase/` hoppar över sig själva om de redan är körda och är
ofarliga att köra om, i valfri ordning.

Databaslösenordet lämnar aldrig din dator den här vägen – klistra aldrig in
anslutningssträngen i en chatt.

### Radsäkerhet

Supabase publicerar schemat `public` genom sitt REST-API, och `anon`-nyckeln
är gjord för att ligga öppet i en webbklient. Tabeller som skapas via SQL får
radsäkerhet avstängd som standard – utan åtgärd skulle vem som helst med den
nyckeln kunna läsa operativa rapporter, markeringar och fynd.

Därför slås radsäkerhet på för samtliga tabeller, **utan policyer**: `anon`
och `authenticated` nekas allt. Appen påverkas inte, eftersom den ansluter
som rollen `postgres` som äger tabellerna. Behörigheten mellan roller styrs
i appen, i `src/lib/authz.ts`.

Skapar du tabellerna med `npm run db:setup` i stället för SQL-filen behöver
du slå på radsäkerheten själv – kör raderna längst ner i
`prisma/supabase-setup.sql`.

### Bilagor

Vercels filsystem är flyktigt, så uppladdade bilder och filmer kan inte
ligga på disk. Är `SUPABASE_URL` och `SUPABASE_SERVICE_ROLE_KEY` satta
sparas de i en privat hink (`avarn-media`) i Supabase Storage, som skapas
automatiskt vid första uppladdningen. Saknas nycklarna används disken
(`storage/uploads/`), så att lokal utveckling fungerar utan moln.

Utlämningen går oavsett lagring genom `/api/media/[id]`, som gör
behörighetskontrollen först. Filerna är aldrig publikt åtkomliga.

### Påminnelser om certifikat

Ett schemalagt anrop skapar varningar innan behörigheter löper ut. Trösklarna
är den inställda varningstiden (standard 60 dagar) plus 30 och 7 dagar. Varje
mottagare varnas **en gång per certifikat och tröskel**, så att en daglig
körning inte fyller meddelandelistan.

```bash
curl -X POST -H "x-cron-key: $CRON_KEY" https://.../api/cron/paminnelser
```

Vercels schemaläggare kan inte sätta egna huvuden och skickar i stället
`Authorization: Bearer …`; båda formerna godtas.

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

---

## 10. Utveckling

### Köra lokalt

```bash
npm install
npm run setup     # skapar .env med slumpade hemligheter
# fyll i DATABASE_URL och DIRECT_URL i .env
npm run db:setup  # migrerar, genererar klienten, lägger in exempeldata
npm run dev       # http://localhost:3000
```

Kör alltid `npm install` först. Utan installerade beroenden hämtar `npx`
den senaste Prisma-versionen från nätet i stället för projektets, vilket ger
fel som ser ut att komma från konfigurationen. `npx prisma --version` ska
rapportera 7.10.0.

**Efter en migrering: starta om utvecklingsservern.** Prisma-klienten
laddas en gång, och en server som startades före schemaändringen svarar med
"column does not exist" på fält som finns.

### Skripten

| Kommando | Gör |
| --- | --- |
| `npm run dev` | Utvecklingsserver. |
| `npm run build` | `prisma migrate deploy && next build`. |
| `npm run start` | Produktionsserver. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run test` | Vitest – 91 enhetsprov i 5 filer. |
| `npm run test:e2e` | Playwright – 90 prov i 14 filer. |
| `npm run db:migrate` | Ny migrering efter schemaändring. |
| `npm run db:setup` | Migrerar, genererar och seedar. |
| `npm run seed` | Lägger in exempeldata på nytt. |
| `npm run db:studio` | Prisma Studio. |
| `npm run db:sql` | Genererar om `prisma/supabase-setup.sql`. |
| `npm run db:sql:migrations` | Genererar om filerna i `prisma/supabase/`. |
| `npm run setup` | Skapar `.env`. |
| `npm run map` | Genererar om `src/lib/sverige-karta.ts` ur `data/sverige-lan.geojson`. |

### Enhetsproven

Vitest, i filer som ligger bredvid koden de provar: `authz.test.ts`,
`berakningar.test.ts`, `format.test.ts`, `fritext.test.ts`,
`kalender.test.ts`.

De provar ren logik utan databas – behörighetsmatrisen, avgränsningarna,
datumräkningen över tidszonsgränser, kalenderns geometri, jokertecknen i
sökningen. Det är också skälet till att den logiken ligger i egna moduler:
en funktion som kräver en databasanslutning går inte att prova billigt, och
då blir den inte provad.

### E2E-proven

Playwright mot Pixel 7, projektet heter `mobil`. De provar det som inte går
att provköra i en funktion: att sidorna renderar, att flöden går igenom, och
framför allt **att ingen ser något hen inte ska se** – `behorighet.spec.ts`,
`atkomst.spec.ts`, `lackage.spec.ts` och `media.spec.ts`.

Två saker att veta:

**Varje provfil har sitt eget tidsfönster.** Proven skapar uppdrag långt
fram i tiden, och två filer som delade fönster gjorde varandras ekipage
upptagna och fällde varandra slumpvis. Därför har varje fil sin egen
förskjutning:

| Fil | Dagar fram |
| --- | --- |
| `offline.spec.ts` | 400 |
| `dokument.spec.ts` | 500 |
| `kalender.spec.ts` | 600 |
| `pagaende.spec.ts` | 800 |
| `uppdragsdetalj.spec.ts` | 1100 |

En ny provfil som skapar uppdrag ska ha sitt eget tal.

**Kör dem mot ett bygge, inte mot utvecklingsservern.** En kall Turbopack
kompilerar varje rutt vid första besöket, och sviten tar då över en halvtimme
i stället för ett par minuter:

```bash
npm run build && npx next start -p 3000
npx playwright test
```

`networkidle` fungerar inte som väntyp när servicearbetaren är registrerad –
den blir aldrig tyst. Vänta på ett element i stället.

### Namngivning

Koden är skriven på svenska: kommentarer, variabler och funktioner i den
kod som skrivits för det här projektet (`manadsrutnat`, `laggIKo`,
`bokstavligt`, `Kobartformular`). Undantaget är det som kommer utifrån och
inte kan döpas om – Prismas modeller och fält, Next.js API:er,
React-krokar, och `authz.ts` åtgärdsnamn som `mission:assign`, som är en del
av datamodellens ordförråd.

Kommentarerna förklarar **varför**, inte vad. En kommentar som säger vad
raden gör faller ur takt med koden; en som säger varför den ser ut så
överlever.

### Lint-regler att känna till

React Compiler-reglerna är på. Två fällor återkommer:

- `react-hooks/set-state-in-effect` – sätt inte tillstånd direkt i en effekt.
  Läs externa lager (`localStorage`, IndexedDB, `navigator.onLine`) med
  `useSyncExternalStore` i stället; det slipper också hydreringsvarningen.
- `rules-of-hooks` – en funktion som anropar en krok måste heta `useNagot`.
  En hjälpfunktion som råkade heta `anvandSenaste` fälldes av just det.

Generad kod (`src/generated/**`) granskas inte.
