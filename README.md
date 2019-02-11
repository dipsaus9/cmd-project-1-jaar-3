# cmd-project

> My solid Matise Nuxt.js project

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev
```

# Project

Dit project geeft inzicht in je luistergedrag op Last.fm. In de eerste fase van de applicatie is het mogelijk om je gebruikersnaam in te voeren. Wanneer je op submit klikt zal de applicatie verbinding maken met Last.fm. Last.fm haalt de top 50 meest geluisterde nummers van de afgelopen maand.

De variablen in deze dataset zijn:

- duration
- playcount
- artist name
- image
- name

Last.fm biedt geeft hier een maxiumum van 50 nummers terug. Deze data heb ik in een overzicht gebracht waardoor je snel en overzichtelijk kan zien hoeveel je naar welke artiest luisterd. Ook zie je hier elk nummer beschikbaar. Wanneer er 2 of meerderen artiesten zijn geselecteerd is het mogelijk om deze artiesten te vergelijken met elkaar.

Wanneer op de knop wordt gedrukt zal de applicatie opnieuw verbinding maken met Last.fm en de volgende data ophalen:

- artist name
- name
- date
- image
- album

Deze data is per nummer met een precieze unix timestamp. Hierdoor is het mogelijk om een visualisatie te maken die inzicht geeft in wanneer het nummer is geluisterd. Zo kwam ik op de tweede visualisatie.

Deze visualisatie heeft alleen wat technische problemen waardoor ik het niet voor elkaar heb gekregen om dit mooier af te ronden.

## Techniek

Voor deze applicatie heb ik gebruik gemaakt van Vue.js, Nuxt, axios, d3.
