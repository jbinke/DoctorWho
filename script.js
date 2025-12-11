"use strict";

const doctorWhoQuotes = [
    "Laugh hard. Run fast. Be kind.",
    "You want weapons? We're in a library! Books! Best weapons in the world!",
    "“The way I see it, every life is a pile of good things and bad things. The good things don't always soften the bad things, but vice-versa, the bad things don't necessarily spoil the good things or make them unimportant.”",
    "“We all change, when you think about it. We're all different people all through our lives. And that's OK, that's good, you gotta keep moving, so long as you remember all the people that you used to be.”",
    "I am and always will be the optimist. The hoper of far-flung hopes and the dreamer of improbable dreams."
];
//dialog pop up widget for quotes
jQuery(function($){
    $("#quote-dialog").dialog({
        autoOpen: false,
        modal: true,
        width: '80%',
        maxWidth: 500,
        buttons: {
            "OK": function(){
                $(this).dialog("close");
            }
        }
    });
    $("#open-quote").on("click", function(e){
        e.preventDefault();

        const randomQuote = doctorWhoQuotes[Math.floor(Math.random() * doctorWhoQuotes.length)];

        $("#quote-dialog").html("<q>" + randomQuote + "</q>");

        $("#quote-dialog").dialog("open");
    });
});

//color theme switcher
document.addEventListener('DOMContentLoaded', function(){
    let darkmode = localStorage.getItem('darkmode');
    const themeSwitch = document.getElementById('themeSwitch');
    
    const enableDarkmode = () => {
        document.body.classList.add('darkmode');
        localStorage.setItem('darkmode', 'active');
    };
    
    const disableDarkmode = () => {
        document.body.classList.remove('darkmode');
        localStorage.setItem('darkmode');
    };
    
    if(darkmode === "active") enableDarkmode();
    
    //switches theme on click
    themeSwitch.addEventListener("click", () => {
        document.body.classList.contains('darkmode') ? disableDarkmode() : enableDarkmode();
    });
});

// TMDB API Configuration
const TMDB_API_KEY = '56971d321e43c80ee671d17289fa2b9d';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Doctor Who content IDs
const doctorWhoContent = {
    "All Main Series": [
        { id: 57243, type: 'tv' },    // Doctor Who (2005)
        { id: 239770, type: 'tv' },     // Doctor Who (2024)
        { id: 121, type: 'tv'}       // Doctor Who (1963)
    ],
    "Spin-offs": [
        { id: 424, type: 'tv' },    // Torchwood
        { id: 203, type: 'tv' }     // The Sarah Jane Adventures
    ]
};

// Debugging function
function logError(context, error) {
    console.error(`Error in ${context}:`, error);
    if (error.response) {
        console.error('Response status:', error.response.status);
    }
}

async function fetchDoctorWhoContent() {
    try {
        const contentContainer = document.getElementById('media-content') || createContentContainer();
        
        for (const [category, items] of Object.entries(doctorWhoContent)) {
            const categorySection = createCategorySection(category);
            const grid = document.createElement('div');
            grid.className = 'content-grid';
            categorySection.appendChild(grid);
            contentContainer.appendChild(categorySection);

            for (const item of items) {
                try {
                    const data = await fetchTMDBContent(item.id, item.type);
                    if (data) {
                        grid.appendChild(createContentCard(data, item.type));
                    }
                } catch (error) {
                    logError(`fetching item ${item.id}`, error);
                }
            }
        }
    } catch (error) {
        logError('fetchDoctorWhoContent', error);
        showErrorMessage();
    }
}

function createContentContainer() {
    const container = document.createElement('div');
    container.id = 'media-content';
    const mediaSection = document.getElementById('media') || document.querySelector('main');
    mediaSection.appendChild(container);
    return container;
}

function createCategorySection(category) {
    const section = document.createElement('section');
    section.className = 'content-category';
    section.innerHTML = `<h3>${category}</h3>`;
    return section;
}

async function fetchTMDBContent(id, type = 'tv') {
    try {
        const endpoint = `/${type}/${id}`;
        const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        logError(`fetchTMDBContent for ID ${id}`, error);
        return null;
    }
}

function createContentCard(data, type) {
    const card = document.createElement('div');
    card.className = 'content-card';
    
    const posterUrl = data.poster_path 
        ? `https://image.tmdb.org/t/p/w300${data.poster_path}`
        : '';
    
    const title = type === 'movie' ? data.title : data.name;
    const date = type === 'movie' ? data.release_date : data.first_air_date;
    const year = date ? new Date(date).getFullYear() : '';
    
    card.innerHTML = `
        <img src="${posterUrl}" alt="${title}" loading="lazy">
        <div class="content-info">
            <h4>${title} ${year ? `(${year})` : ''}</h4>
            <p>${data.overview?.substring(0, 100) || 'Description not available'}...</p>
            <button class="more-info" data-id="${data.id}" data-type="${type}">
                More Info
            </button>
        </div>
    `;
    
    return card;
}

function showErrorMessage() {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <p>Failed to load content. Please try again later.</p>
        <button id="retry-button">Retry</button>
    `;
    document.getElementById('media-content')?.replaceWith(errorDiv);
    document.getElementById('retry-button')?.addEventListener('click', fetchDoctorWhoContent);
}

// Event delegation for modal
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('more-info')) {
        const id = e.target.dataset.id;
        const type = e.target.dataset.type;
        try {
            const data = await fetchTMDBContent(id, type);
            if (data) showContentModal(data, type);
        } catch (error) {
            logError('showing content modal', error);
        }
    }
});

function showContentModal(data, type) {
    const modal = document.createElement('div');
    modal.className = 'content-modal';
    
    const posterUrl = data.poster_path 
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : 'images/placeholder-tardis.jpg';
    
    const title = type === 'movie' ? data.title : data.name;
    const date = type === 'movie' ? data.release_date : data.first_air_date;
    const year = date ? new Date(date).getFullYear() : '';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img src="${posterUrl}" alt="${title}">
            <div class="modal-info">
                <h2>${title} ${year ? `(${year})` : ''}</h2>
                <p>${data.overview || 'No description available'}</p>
                <div class="modal-details">
                    ${data.vote_average ? `<p><strong>Rating:</strong> ${data.vote_average.toFixed(1)}/10</p>` : ''}
                    ${type === 'tv' && data.number_of_seasons ? `<p><strong>Seasons:</strong> ${data.number_of_seasons}</p>` : ''}
                    ${type === 'movie' && data.runtime ? `<p><strong>Runtime:</strong> ${Math.floor(data.runtime/60)}h ${data.runtime%60}m</p>` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchDoctorWhoContent);
} else {
    fetchDoctorWhoContent();
}
// Initialize Doctors Carousel
$(document).ready(function(){
    $('.doctors-carousel').slick({
        dots: true,
        infinite: true,
        speed: 300,
        slidesToShow: 3,
        slidesToScroll: 1
    });
});