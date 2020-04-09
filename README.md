# webhoseAPIFetcherLambda
```bash
npm install
node webhoseFetcher.js
```

## Notes
- **sourceList.js** >> contains a list of all the sources that the fetcher uses. Follows the 
guidelines from moderation team focused (broken by priority.) Note that some sources aren't properly 
ingested by the Webhose API. 

- **webhoseFetcher.js** >> is the script that currently grabs the data from Webhose API and pushes it
into the moderation table in PostgreSQL. Should be pretty quick to change this to the staging / test
DB. Currently the fetcher is configured to get data from all the sources every 1 hour and to prevent
duplicates it uses **uuid**. 