// Global state
let allSightings = [];
let filteredSightings = [];
let map = null;
let markerCluster = null;
let sortColumn = 'obsDt';
let sortDirection = 'desc';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadData();
    setupEventListeners();
});

// Initialize Leaflet map
function initMap() {
    // Center on New York State
    map = L.map('map').setView([42.9538, -75.5268], 7);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Initialize marker cluster group
    markerCluster = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false
    });
    map.addLayer(markerCluster);
}

// Load sighting data from JSON file
async function loadData() {
    try {
        const response = await fetch('data/sightings.json');
        if (!response.ok) {
            throw new Error('Data file not found');
        }
        const data = await response.json();

        allSightings = data.sightings || [];
        filteredSightings = [...allSightings];

        // Update UI
        updateLastUpdated(data.lastUpdated);
        updateRegionName(data.region);
        updateSummaryCards(data);
        populateSpeciesFilter();
        updateMap();
        updateTable();

    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('sightings-body').innerHTML =
            '<tr><td colspan="5" class="loading">No data available. Run the scraper first.</td></tr>';
    }
}

// Update the "Last Updated" display
function updateLastUpdated(timestamp) {
    if (!timestamp) return;
    const date = new Date(timestamp);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    };
    document.getElementById('last-updated').textContent = date.toLocaleDateString('en-US', options);
}

// Update region name in header
function updateRegionName(region) {
    const regionNames = {
        'US-NY': 'New York',
        'US-CA': 'California',
        'US-TX': 'Texas',
        'US-FL': 'Florida'
    };
    document.getElementById('region-name').textContent = regionNames[region] || region;
}

// Update summary cards
function updateSummaryCards(data) {
    const sightings = data.sightings || [];

    // Total sightings
    document.getElementById('total-sightings').textContent = sightings.length.toLocaleString();

    // Unique species
    const uniqueSpecies = new Set(sightings.map(s => s.speciesCode));
    document.getElementById('unique-species').textContent = uniqueSpecies.size;

    // Unique locations
    const uniqueLocations = new Set(sightings.map(s => s.locId));
    document.getElementById('unique-locations').textContent = uniqueLocations.size;

    // Days covered
    document.getElementById('days-covered').textContent = data.daysBack || '-';
}

// Populate species filter dropdown
function populateSpeciesFilter() {
    const speciesSelect = document.getElementById('species-filter');
    const species = [...new Set(allSightings.map(s => s.comName))].sort();

    species.forEach(sp => {
        const option = document.createElement('option');
        option.value = sp;
        option.textContent = sp;
        speciesSelect.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Species filter
    document.getElementById('species-filter').addEventListener('change', applyFilters);

    // Search filter
    document.getElementById('search-filter').addEventListener('input', debounce(applyFilters, 300));

    // Reset button
    document.getElementById('reset-filters').addEventListener('click', resetFilters);

    // Table sorting
    document.querySelectorAll('#sightings-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            if (sortColumn === column) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = column;
                sortDirection = 'asc';
            }
            updateTable();
        });
    });
}

// Apply filters
function applyFilters() {
    const speciesFilter = document.getElementById('species-filter').value;
    const searchFilter = document.getElementById('search-filter').value.toLowerCase();

    filteredSightings = allSightings.filter(sighting => {
        // Species filter
        if (speciesFilter && sighting.comName !== speciesFilter) {
            return false;
        }

        // Search filter
        if (searchFilter) {
            const searchableText = `${sighting.comName} ${sighting.sciName} ${sighting.locName}`.toLowerCase();
            if (!searchableText.includes(searchFilter)) {
                return false;
            }
        }

        return true;
    });

    updateMap();
    updateTable();
}

// Reset all filters
function resetFilters() {
    document.getElementById('species-filter').value = '';
    document.getElementById('search-filter').value = '';
    filteredSightings = [...allSightings];
    updateMap();
    updateTable();
}

// Update map markers
function updateMap() {
    markerCluster.clearLayers();

    filteredSightings.forEach(sighting => {
        if (sighting.lat && sighting.lng) {
            const marker = L.marker([sighting.lat, sighting.lng]);

            const popupContent = `
                <div class="popup-content">
                    <h3>${escapeHtml(sighting.comName)}</h3>
                    <p class="sci-name">${escapeHtml(sighting.sciName)}</p>
                    <p><strong>Location:</strong> ${escapeHtml(sighting.locName)}</p>
                    <p><strong>Date:</strong> ${formatDate(sighting.obsDt)}</p>
                    <p><strong>Count:</strong> ${sighting.howMany || 1}</p>
                    <p>
                        <a href="${sighting.speciesLink}" target="_blank">Species Info</a>
                        ${sighting.checklistLink ? `| <a href="${sighting.checklistLink}" target="_blank">Checklist</a>` : ''}
                    </p>
                </div>
            `;

            marker.bindPopup(popupContent);
            markerCluster.addLayer(marker);
        }
    });

    // Fit map to markers if there are any
    if (filteredSightings.length > 0) {
        const bounds = markerCluster.getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
}

// Update data table
function updateTable() {
    const tbody = document.getElementById('sightings-body');

    // Sort data
    const sortedData = [...filteredSightings].sort((a, b) => {
        let valA = a[sortColumn] || '';
        let valB = b[sortColumn] || '';

        if (sortColumn === 'howMany') {
            valA = Number(valA) || 0;
            valB = Number(valB) || 0;
        } else {
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Update sort indicators
    document.querySelectorAll('#sightings-table th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (th.dataset.sort === sortColumn) {
            th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    });

    // Generate table rows
    if (sortedData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No sightings match your filters.</td></tr>';
        return;
    }

    tbody.innerHTML = sortedData.map(sighting => `
        <tr>
            <td>
                <span class="species-name">${escapeHtml(sighting.comName)}</span>
                <br><span class="sci-name">${escapeHtml(sighting.sciName)}</span>
            </td>
            <td>${escapeHtml(sighting.locName)}</td>
            <td>${formatDate(sighting.obsDt)}</td>
            <td>${sighting.howMany || 1}</td>
            <td>
                <a href="${sighting.speciesLink}" target="_blank" title="Species Info">Species</a>
                ${sighting.checklistLink ? `<a href="${sighting.checklistLink}" target="_blank" title="View Checklist">Checklist</a>` : ''}
            </td>
        </tr>
    `).join('');
}

// Utility: Format date string
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
