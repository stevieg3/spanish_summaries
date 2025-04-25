document.addEventListener('DOMContentLoaded', function() {
    // Get the content container
    const contentContainer = document.getElementById('content');
    
    // Get all navigation links
    const navLinks = document.querySelectorAll('.sidebar a');
    
    // Initialize the site
    initSite();
    
    // Add click event to all navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get the level page URL from data attribute
            const levelUrl = this.getAttribute('data-level');
            
            // Save the current selection to localStorage
            localStorage.setItem('lastSelectedLevel', levelUrl);
            
            // Load the content
            loadContent(levelUrl);
            
            // Scroll to the top of the page
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // On mobile, close the sidebar after selecting a link
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
    // Random Topic Button Event Listener
    const randomButton = document.getElementById('random-topic-btn');
    if (randomButton) {
        randomButton.addEventListener('click', getRandomTopic);
    }
    
    // Function to initialize the site
    function initSite() {
        // Check if there's a saved level in localStorage
        const lastLevel = localStorage.getItem('lastSelectedLevel');
        
        if (lastLevel) {
            // Find the matching link and simulate a click
            const matchingLink = document.querySelector(`.sidebar a[data-level="${lastLevel}"]`);
            if (matchingLink) {
                matchingLink.classList.add('active');
                loadContent(lastLevel);
            }
        } else {
            // No saved level, load Level 1 by default
            const defaultLevel = 'levels/a1/level_1.html';
            const defaultLink = document.querySelector(`.sidebar a[data-level="${defaultLevel}"]`);
            if (defaultLink) {
                defaultLink.classList.add('active');
                loadContent(defaultLevel);
            }
        }
    }
    
    // Function to load content
    function loadContent(url) {
        // Track the page view in Google Analytics
        if (typeof gtag === 'function') {
            gtag('event', 'page_view', {
                'page_location': window.location.href,
                'page_path': url,
                'page_title': url.split('/').pop()
            });
        }
        
        // Fetch the HTML content
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                // Extract just the body content using a helper function
                const bodyContent = extractBodyContent(html);
                
                // Insert the content
                contentContainer.innerHTML = bodyContent;
                
                // Make tables responsive by wrapping them in scrollable containers
                makeTablesResponsive();
            })
            .catch(error => {
                contentContainer.innerHTML = `
                    <div class="error-message">
                        <h2>Error Loading Content</h2>
                        <p>Sorry, we couldn't load the requested page. Please try again later.</p>
                        <p>Error details: ${error.message}</p>
                    </div>
                `;
                console.error('Error loading content:', error);
            });
    }
    
    // Helper function to extract just the body content from an HTML string
    function extractBodyContent(html) {
        // Create a temporary div
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Find the body element or its contents
        const bodyElement = tempDiv.querySelector('body');
        
        if (bodyElement) {
            // Create a wrapper div with level-content class
            const wrapperDiv = document.createElement('div');
            wrapperDiv.className = 'level-content';
            
            // Copy all body children to our wrapper
            wrapperDiv.innerHTML = bodyElement.innerHTML;
            
            // Return our wrapped content
            return wrapperDiv.outerHTML;
        } else {
            // If no body found, return the entire content
            return '<div class="level-content">' + tempDiv.innerHTML + '</div>';
        }
    }

    // Function to make tables responsive with horizontal scrolling
    function makeTablesResponsive() {
        const tables = contentContainer.querySelectorAll('table');
        tables.forEach(table => {
            // Check if table is not already wrapped
            if (!table.parentElement.classList.contains('table-wrapper')) {
                // Create wrapper div
                const wrapper = document.createElement('div');
                wrapper.className = 'table-wrapper';
                
                // Replace table with wrapper containing table
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });
    }

    // Desktop sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
    });
    
    // Mobile menu functionality
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    // Toggle mobile menu
    mobileMenuButton.addEventListener('click', function() {
        toggleMobileMenu();
    });
    
    // Close when clicking overlay
    sidebarOverlay.addEventListener('click', closeMobileMenu);
    
    function toggleMobileMenu() {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
        
        // Toggle body scrolling
        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            document.body.style.overflow = ''; // Restore scrolling
        }
    }
    
    function closeMobileMenu() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });

    // Function to get a random topic
    function getRandomTopic() {
        // Track the random topic button click in Google Analytics
        if (typeof gtag === 'function') {
            gtag('event', 'random_topic_click', {
                'event_category': 'engagement',
                'event_label': 'Random Topic Button'
            });
        }
        
        // Define all possible level files
        const levelFiles = [
            'levels/a1/level_1.html',
            'levels/a1/level_2.html',
            'levels/a1/level_3.html',
            'levels/a2/level_4.html',
            'levels/a2/level_5.html',
            'levels/a2/level_6.html',
            'levels/b1/level_7.html'
        ];
        
        // Fetch all files in parallel
        Promise.all(levelFiles.map(file => 
            fetch(file)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load ${file}`);
                    }
                    return response.text();
                })
                .then(html => {
                    return { file, html };
                })
                .catch(error => {
                    console.error(`Error loading ${file}:`, error);
                    return { file, error };
                })
        ))
        .then(results => {
            // Filter out any failed fetches
            const successfulResults = results.filter(result => !result.error);
            
            if (successfulResults.length === 0) {
                throw new Error('Could not load any content files');
            }
            
            // Collect all topics from all files
            const allTopics = [];
            
            successfulResults.forEach(result => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = result.html;
                
                const h2Elements = tempDiv.querySelectorAll('h2');
                
                h2Elements.forEach(h2Element => {
                    // Create an object for each topic
                    const topic = {
                        file: result.file,
                        header: h2Element,
                        // Store all elements until the next h2
                        content: []
                    };
                    
                    // Add the h2 element itself
                    topic.content.push(h2Element.outerHTML);
                    
                    // Add all elements until the next h2
                    let currentElement = h2Element.nextElementSibling;
                    while (currentElement && currentElement.tagName !== 'H2') {
                        topic.content.push(currentElement.outerHTML);
                        currentElement = currentElement.nextElementSibling;
                    }
                    
                    allTopics.push(topic);
                });
            });
            
            if (allTopics.length === 0) {
                throw new Error('No topics found in any file');
            }
            
            // Select a random topic from the pool of all topics
            const randomIndex = Math.floor(Math.random() * allTopics.length);
            const randomTopic = allTopics[randomIndex];
            
            // Extract level information
            const levelFile = randomTopic.file;
            const levelName = levelFile.split('/').pop().replace('.html', '');
            const levelNumber = levelName.replace('level_', '');
            
            // Create wrapper with source information
            const wrapperHTML = `
                <div class="level-content">
                    <div class="topic-source">
                        <p><a href="#" class="level-link" data-level="${levelFile}">Level ${levelNumber}</a></p>
                    </div>
                    ${randomTopic.content.join('')}
                </div>
            `;
            
            // Display the content
            contentContainer.innerHTML = wrapperHTML;
            
            // Add click event listener to the level link
            const levelLink = contentContainer.querySelector('.level-link');
            if (levelLink) {
                levelLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    const levelUrl = this.getAttribute('data-level');
                    
                    // Update sidebar active link
                    navLinks.forEach(link => link.classList.remove('active'));
                    const matchingLink = document.querySelector(`.sidebar a[data-level="${levelUrl}"]`);
                    if (matchingLink) {
                        matchingLink.classList.add('active');
                    }
                    
                    // Save to localStorage
                    localStorage.setItem('lastSelectedLevel', levelUrl);
                    
                    // Load the full level content
                    loadContent(levelUrl);
                    
                    // Scroll to the top of the page
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
            
            // Make any tables responsive
            makeTablesResponsive();
        })
        .catch(error => {
            console.error('Error loading random topic:', error);
            contentContainer.innerHTML = `
                <div class="error-message">
                    <h2>Error Loading Content</h2>
                    <p>Sorry, we couldn't load a random topic. Please try again.</p>
                    <p>Error: ${error.message}</p>
                </div>
            `;
        });
    }
});
