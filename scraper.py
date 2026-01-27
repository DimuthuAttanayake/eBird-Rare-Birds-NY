#!/usr/bin/env python3
"""
eBird Rare Bird Scraper
Fetches notable/rare bird sightings from eBird API for a specified region.
"""

import json
import os
import requests
from datetime import datetime

# Configuration
EBIRD_API_KEY = os.environ.get('EBIRD_API_KEY', 'YOUR_API_KEY_HERE')
REGION_CODE = os.environ.get('EBIRD_REGION', 'US-NY')  # Default: New York
DAYS_BACK = int(os.environ.get('DAYS_BACK', '14'))  # How many days of data to fetch

# eBird API endpoints
BASE_URL = 'https://api.ebird.org/v2'
NOTABLE_OBS_URL = f'{BASE_URL}/data/obs/{REGION_CODE}/recent/notable'

def fetch_notable_sightings():
    """Fetch notable/rare bird sightings from eBird API."""
    headers = {
        'X-eBirdApiToken': EBIRD_API_KEY
    }
    params = {
        'back': DAYS_BACK,
        'detail': 'full',
        'hotspot': False
    }

    print(f"Fetching notable sightings for {REGION_CODE} (last {DAYS_BACK} days)...")

    response = requests.get(NOTABLE_OBS_URL, headers=headers, params=params)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return []

def process_sightings(raw_data):
    """Process raw eBird data into a cleaner format for the dashboard."""
    sightings = []

    for obs in raw_data:
        sighting = {
            'speciesCode': obs.get('speciesCode', ''),
            'comName': obs.get('comName', 'Unknown'),
            'sciName': obs.get('sciName', ''),
            'locName': obs.get('locName', 'Unknown Location'),
            'lat': obs.get('lat', 0),
            'lng': obs.get('lng', 0),
            'obsDt': obs.get('obsDt', ''),
            'howMany': obs.get('howMany', 1),
            'obsValid': obs.get('obsValid', True),
            'obsReviewed': obs.get('obsReviewed', False),
            'locationPrivate': obs.get('locationPrivate', False),
            'subId': obs.get('subId', ''),
            'locId': obs.get('locId', ''),
            'checklistLink': f"https://ebird.org/checklist/{obs.get('subId', '')}" if obs.get('subId') else '',
            'speciesLink': f"https://ebird.org/species/{obs.get('speciesCode', '')}" if obs.get('speciesCode') else ''
        }
        sightings.append(sighting)

    return sightings

def save_data(sightings):
    """Save processed sightings to JSON file."""
    output = {
        'lastUpdated': datetime.utcnow().isoformat() + 'Z',
        'region': REGION_CODE,
        'totalSightings': len(sightings),
        'daysBack': DAYS_BACK,
        'sightings': sightings
    }

    # Ensure data directory exists
    os.makedirs('data', exist_ok=True)

    with open('data/sightings.json', 'w') as f:
        json.dump(output, f, indent=2)

    print(f"Saved {len(sightings)} sightings to data/sightings.json")
    return output

def main():
    """Main function to run the scraper."""
    print("=" * 50)
    print("eBird Rare Bird Scraper")
    print("=" * 50)

    # Fetch data from eBird API
    raw_data = fetch_notable_sightings()

    if not raw_data:
        print("No sightings found or error occurred.")
        # Create empty data file
        save_data([])
        return

    print(f"Found {len(raw_data)} raw observations")

    # Process and clean the data
    sightings = process_sightings(raw_data)

    # Remove duplicates (same species at same location on same date)
    unique_sightings = []
    seen = set()
    for s in sightings:
        key = (s['speciesCode'], s['locId'], s['obsDt'][:10] if s['obsDt'] else '')
        if key not in seen:
            seen.add(key)
            unique_sightings.append(s)

    print(f"After deduplication: {len(unique_sightings)} unique sightings")

    # Save to file
    save_data(unique_sightings)

    # Print summary
    species = set(s['comName'] for s in unique_sightings)
    print(f"\nUnique species: {len(species)}")
    print("\nSpecies found:")
    for sp in sorted(species):
        print(f"  - {sp}")

if __name__ == '__main__':
    main()
