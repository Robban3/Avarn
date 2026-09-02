# Källa till kartunderlaget

`sverige-lan.geojson` innehåller Sveriges 21 län som GeoJSON.

| | |
| --- | --- |
| Hämtad från | [okfse/sweden-geojson](https://github.com/okfse/sweden-geojson) (`swedish_regions.geojson`) |
| Ursprung | Sveriges län, öppna data, ursprungligen via Valmyndigheten |
| Bearbetning | Förenklad till 10 % med [mapshaper](https://mapshaper.org) av källrepot |
| Villkor | Källrepots README: "Feel free to reuse." |
| Storlek | 48 kB |

Filen ligger i repot i stället för att hämtas vid bygget, så att en
byggning inte beror på nätet och alltid ger samma karta.

`scripts/generate-sweden-map.mjs` läser den här filen, projicerar med
Mercator, slår ihop länen till appens regioner enligt `REGION_LAN` i
`src/lib/domain.ts` och skriver `src/lib/sverige-karta.ts`. Kör med:

```
npm run map
```

Behöver kartan uppdateras – ett län byter form, eller regionindelningen
ändras – rättas `REGION_LAN` och skriptet körs om. Den genererade filen
ska inte redigeras för hand.
