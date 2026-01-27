# eBird Rare Birds Dashboard - Session Summary

## What Was Built
An auto-updating dashboard for eBird rare/notable bird sightings in New York State, deployed to GitHub Pages with automated data refresh via GitHub Actions.

## Data Source
- **API**: eBird API v2 by Cornell Lab of Ornithology
- **Endpoint**: Notable observations for US-NY region
- **API Key**: `gj0h1agaelun`
- **Initial Scrape Results**:
  - 673 unique sightings
  - 120 rare species
  - Last 14 days of data

## Files Created

| File | Description |
|------|-------------|
| `index.html` | Main dashboard with map, filters, and data table |
| `style.css` | Responsive CSS styling (green birding theme) |
| `app.js` | Leaflet.js map with marker clustering, filtering, sorting |
| `scraper.py` | Python script to fetch data from eBird API |
| `data/sightings.json` | Scraped sightings data (auto-generated) |
| `.github/workflows/scrape.yml` | GitHub Actions workflow for auto-scraping |
| `README.md` | Setup and deployment instructions |
| `.gitignore` | Git ignore file |

## Dashboard Features
- **Interactive Map**: Leaflet.js with marker clustering
- **Filters**: Species dropdown, text search
- **Summary Cards**: Total sightings, unique species, locations, days covered
- **Data Table**: Sortable columns with species, location, date, count
- **Links**: Direct links to eBird species pages and checklists
- **Auto-Update**: GitHub Actions runs every 6 hours

## How to Run Locally
```bash
cd "/Users/dimuthuattanayake/Documents/Data Studio/eBird-Rare-Birds-NY"
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

## How to Deploy to GitHub Pages

1. **Create GitHub repo** and push code:
```bash
cd "/Users/dimuthuattanayake/Documents/Data Studio/eBird-Rare-Birds-NY"
git init
git add .
git commit -m "Initial commit: eBird rare birds dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

2. **Add API key secret**:
   - Settings → Secrets and variables → Actions
   - New secret: `EBIRD_API_KEY` = `gj0h1agaelun`

3. **Enable GitHub Pages**:
   - Settings → Pages → Source: GitHub Actions

4. **Run workflow**:
   - Actions → Scrape eBird Data → Run workflow

## Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `EBIRD_API_KEY` | (required) | Your eBird API key |
| `EBIRD_REGION` | `US-NY` | Region code (e.g., US-CA, US-TX) |
| `DAYS_BACK` | `14` | Days of historical data to fetch |

## Notable Species Found (Sample)
- Painted Bunting
- Golden Eagle
- Tundra Bean-Goose
- Barrow's Goldeneye
- Northern Shrike
- Evening Grosbeak
- Short-eared Owl
- Rough-legged Hawk

## Location
`/Users/dimuthuattanayake/Documents/Data Studio/eBird-Rare-Birds-NY/`

## eBird API Key Request
Get your own API key at: https://ebird.org/api/keygen
