# eBird Rare Bird Sightings Dashboard

An auto-updating dashboard that displays notable/rare bird sightings from eBird for New York State.

## Features

- Interactive map with clustered markers (Leaflet.js)
- Filterable data table with sorting
- Species and location search
- Auto-updates every 6 hours via GitHub Actions
- Deployed to GitHub Pages

## Quick Start

### 1. Create a GitHub Repository

1. Create a new repository on GitHub
2. Push this project to the repository:

```bash
cd "/Users/dimuthuattanayake/Documents/Data Studio/eBird-Rare-Birds-NY"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Add Your eBird API Key

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Name: `EBIRD_API_KEY`
5. Value: Your eBird API key (get one at https://ebird.org/api/keygen)

### 3. Enable GitHub Pages

1. Go to **Settings** > **Pages**
2. Source: **GitHub Actions**
3. The workflow will automatically deploy after the first scrape

### 4. Run the Workflow

1. Go to **Actions** > **Scrape eBird Data**
2. Click **Run workflow** to trigger manually
3. Or wait for the scheduled run (every 6 hours)

## Configuration

You can customize the scraper by adding repository variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `EBIRD_REGION` | `US-NY` | eBird region code (e.g., US-CA, US-TX) |
| `DAYS_BACK` | `14` | Number of days of data to fetch |

To add variables:
1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Click the **Variables** tab
3. Add new repository variables

## Local Development

### Run the scraper locally:

```bash
export EBIRD_API_KEY="your-api-key"
python3 scraper.py
```

### Start a local server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Files

| File | Description |
|------|-------------|
| `index.html` | Main dashboard page |
| `style.css` | Responsive CSS styling |
| `app.js` | Map and table JavaScript |
| `scraper.py` | Python script to fetch eBird data |
| `data/sightings.json` | Scraped data (auto-generated) |
| `.github/workflows/scrape.yml` | GitHub Actions workflow |

## Data Source

Data is fetched from the [eBird API](https://documenter.getpostman.com/view/664302/S1ENwy59) by Cornell Lab of Ornithology.

## Region Codes

Common US region codes:
- `US-NY` - New York
- `US-CA` - California
- `US-TX` - Texas
- `US-FL` - Florida
- `US-AZ` - Arizona

Full list: https://support.ebird.org/en/support/solutions/articles/48000838205
