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
            
            // On mobile, close the sidebar after selecting a link
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
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
        }
    }
    
    // Function to load content
    function loadContent(url) {
        // Show loading indicator
        contentContainer.innerHTML = '<div class="loading">Loading content...</div>';
        
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
});
