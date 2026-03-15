// Mobile Menu Toggle
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (mobileMenu) mobileMenu.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
    });
});

// Smooth Scrolling for Anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Account for fixed navbar height
            const headerOffset = 70;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    });
});

// Change Navbar Background on Scroll
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.15)";
        } else {
            navbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
        }
    }
});

// Scroll Spy (Highlight menu on scroll)
const sections = document.querySelectorAll('section[id]');
const scrollSpyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const currentId = entry.target.getAttribute('id');
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, {
    rootMargin: '-50% 0px -50% 0px' // Trigger when section hits the middle of viewport
});

sections.forEach(section => {
    scrollSpyObserver.observe(section);
});

// Master-Detail Timeline Logic
let currentTimelineYear = 1976;
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const timelineScroll = document.getElementById('timeline-scroll');
const displayImage = document.getElementById('display-image');
const displayYear = document.getElementById('display-year');
const displayTitle = document.getElementById('display-title');
const displayDesc = document.getElementById('display-desc');

if (timelineScroll) {
    timelineScroll.innerHTML = '';

    // Wrapper for horizontal content
    const content = document.createElement('div');
    content.classList.add('timeline-content');

    // Infinite Horizontal Line
    const line = document.createElement('div');
    line.classList.add('timeline-line');
    content.appendChild(line);

    for (let year = 1976; year <= 2026; year++) {
        // Timeline Item (The Tick Area)
        const item = document.createElement('div');
        item.classList.add('timeline-item');
        item.dataset.year = year;

        // Alternating logic: Top vs Bottom
        const position = (year % 2 === 0) ? 'bottom' : 'top';
        item.classList.add(position);

        // The Vertical Tick
        const tick = document.createElement('div');
        tick.classList.add('timeline-tick');
        item.appendChild(tick);

        // Year Label (Visible on Hover)
        const yearLabel = document.createElement('span');
        yearLabel.classList.add('year-label');
        yearLabel.textContent = year;
        item.appendChild(yearLabel);

        // Interaction: Click to update Master Display
        item.addEventListener('click', () => {
            selectYear(year);
        });

        // Auto-select 1976
        if (year === 1976) {
            // Trigger initial display update to load the real image but DONT scroll
            setTimeout(() => selectYear(1976, true), 100);
        }

        content.appendChild(item);
    }

    timelineScroll.appendChild(content);
}

function selectYear(year, isInitial = false) {
    if (year < 1976 || year > 2026) return;
    currentTimelineYear = year;

    // Remove active class from all
    document.querySelectorAll('.timeline-item.active').forEach(activeItem => {
        activeItem.classList.remove('active');
    });

    // Add active to current
    const activeItem = document.querySelector(`.timeline-item[data-year="${year}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        // Smoothly center the active item in the scrubber (skip if initial load to prevent page jump)
        if (!isInitial) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    // Update Display
    updateDisplay(year);

    // Update Arrow Visibility bounds
    if (prevBtn) prevBtn.style.display = currentTimelineYear === 1976 ? 'none' : 'flex';
    if (nextBtn) nextBtn.style.display = currentTimelineYear === 2026 ? 'none' : 'flex';
}

// Arrow Button Listeners
if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        selectYear(currentTimelineYear - 1);
    });
}
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        selectYear(currentTimelineYear + 1);
    });
}

function updateDisplay(year) {
    // animate out
    const imgWrapper = document.querySelector('.display-img-wrapper img');
    imgWrapper.style.opacity = '0';

    setTimeout(() => {
        // Update Content
        displayYear.textContent = year;

        // Image Source Logic
        // Try to load real image: `images/timeline/${year}.jpg`
        const imagePath = `images/timeline/${year}.jpg`;

        displayImage.onerror = () => {
            // Fallback if image not found
            displayImage.src = `https://via.placeholder.com/800x400?text=Rotaract+${year}`;
        };

        displayImage.src = imagePath;

        // Text Logic
        let title = `Year ${year}`;
        let desc = `Celebrating our journey and milestones achieved in ${year}.`;

        if (year === 1976) {
            title = "Club Chartered";
            desc = "The beginning of a legacy. The Rotaract Club of Satna was officially chartered, starting 50 years of service.";
        } else if (year === 2001) {
            title = "Silver Jubilee";
            desc = "Celebrating 25 years of impact. A major milestone in our history marked by grand celebrations.";
        } else if (year === 2026) {
            title = "Golden Jubilee";
            desc = "50 Years of Service, Fellowship, and Leadership. Join us on July 11, 2026 for the grand celebration.";
        }

        displayTitle.textContent = title;
        displayDesc.textContent = desc;

        // animate in
        imgWrapper.style.opacity = '1';

    }, 300); // match transition time
}

// Background Image Preloading (Performance Optimization)
// Wait until the main page and default image are fully loaded before downloading the rest
window.addEventListener('load', () => {
    // 1. Preload Timeline Images
    // We already loaded 1976 natively, so start preloading from 1977
    for (let year = 1977; year <= 2026; year++) {
        const img = new Image();
        img.src = `images/timeline/${year}.jpg`;
    }

    // 2. Initialize and Preload Activity Carousels
    const carousels = document.querySelectorAll('.activity-carousel');

    carousels.forEach(carousel => {
        const folder = carousel.dataset.folder;
        let total = 1;
        const imageContainer = carousel.querySelector('.carousel-images');
        const prevBtn = carousel.querySelector('.car-prev');
        const nextBtn = carousel.querySelector('.car-next');

        let currentSlide = 1;

        // Recursively probe for images until one fails (e.g. 404 Not Found)
        function loadNextImage(index) {
            const img = new Image();
            
            img.onload = () => {
                // The image exists! Add it to the carousel
                img.classList.add('slide');
                img.alt = `Activity Image ${index}`;
                imageContainer.appendChild(img);
                
                total = index; // Update our known total
                
                // Try to see if the NEXT image exists
                loadNextImage(index + 1);
            };
            
            img.onerror = () => {
                // The image does not exist. We've hit the end of the folder.
                // If there is only 1 image total, hide the navigation arrows.
                if (total <= 1) {
                    if (prevBtn) prevBtn.style.display = 'none';
                    if (nextBtn) nextBtn.style.display = 'none';
                }
            };

            // Trigger the network request
            img.src = `images/activities/${folder}/${index}.jpg`;
        }

        // Start probing from image #2
        loadNextImage(2);

        // Setup Carousel Navigation
        const updateCarousel = () => {
            const slides = imageContainer.querySelectorAll('.slide');
            slides.forEach((slide, index) => {
                if (index + 1 === currentSlide) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });
        };

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (total <= 1) return;
                currentSlide = currentSlide > 1 ? currentSlide - 1 : total;
                updateCarousel();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (total <= 1) return;
                currentSlide = currentSlide < total ? currentSlide + 1 : 1;
                updateCarousel();
            });
        }
    });
});

console.log('Rotaract Website Loaded (Master-Detail Timeline & Activity Carousels)');
