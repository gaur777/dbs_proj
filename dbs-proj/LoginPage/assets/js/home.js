document.addEventListener('DOMContentLoaded', function() {
    // Fetch restaurants from backend API
  let restaurants = [];
  fetchAndDisplayReservations();

  fetch('http://localhost:3000/restaurants')
    .then(response => response.json())
    .then(data => {
      restaurants = data.map(restaurant => ({
        name: restaurant.restaurant_name,
        cuisine: restaurant.cuisine,
        price: `₹${restaurant.price_per_person}`,  // Show actual price
        perHead: parseFloat(restaurant.price_per_person),
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4", // Use actual image path if you have one
        id: restaurant.restaurant_id,
        rating: restaurant.rating,
        description: restaurant.description
      }));
  
      displayRestaurants(restaurants);
    })
    .catch(error => console.error('Error fetching restaurants:', error));
  
  
    
      // Sample data
    let userBalance = 500.00;
    let currentRestaurant = null;
    const reservations = {
        active: [
            {
                id: 1,
                restaurant: "Italian Bistro",
                date: "2023-06-15",
                time: "19:00",
                partySize: 2,
                total: 50.00,
                status: "upcoming"
            },
            {
                id: 2,
                restaurant: "Spice Route",
                date: "2023-06-18",
                time: "20:30",
                partySize: 4,
                total: 140.00,
                status: "upcoming"
            }
        ],
        past: [
            {
                id: 3,
                restaurant: "Taco Fiesta",
                date: "2023-05-20",
                time: "18:00",
                partySize: 3,
                total: 45.00,
                status: "completed"
            },
            {
                id: 4,
                restaurant: "Dragon Palace",
                date: "2023-04-10",
                time: "19:30",
                partySize: 2,
                total: 40.00,
                status: "completed"
            }
        ]
    };
  
    // DOM Elements
    const restaurantsGrid = document.getElementById('restaurantsGrid');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const priceFilter = document.getElementById('priceFilter');
    const cuisineFilter = document.getElementById('cuisineFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const clearFilters = document.getElementById('clearFilters');
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const walletBtn = document.getElementById('walletBtn');
    const viewReservations = document.getElementById('viewReservations');
    const logoutBtn = document.getElementById('logoutBtn');
    const bookingModal = document.getElementById('bookingModal');
    const walletModal = document.getElementById('walletModal');
    const reservationsModal = document.getElementById('reservationsModal');
    const bookingDate = document.getElementById('bookingDate');
    const bookingTime = document.getElementById('bookingTime');
    const partySize = document.getElementById('partySize');
    const pricePerHead = document.getElementById('pricePerHead');
    const totalPrice = document.getElementById('totalPrice');
    const confirmBooking = document.getElementById('confirmBooking');
    const currentBalance = document.getElementById('currentBalance');
    const topupAmount = document.getElementById('topupAmount');
    const topupBtn = document.getElementById('topupBtn');
    const activeReservations = document.getElementById('activeReservations');
    const pastReservations = document.getElementById('pastReservations');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const ratingModal = document.getElementById('ratingModal');
    const ratingScore = document.getElementById('ratingScore');
    const ratingComment = document.getElementById('ratingComment');
    const submitRating = document.getElementById('submitRating');
  
    // Initialize date and time pickers
    flatpickr(bookingDate, {
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: [
            function(date) {
                // Disable weekends
                return (date.getDay() === 0 || date.getDay() === 6);
            }
        ]
    });
  
    flatpickr(bookingTime, {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        minTime: "11:00",
        maxTime: "22:00"
    });
  
    // Display username from login
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    if (username) {
        document.getElementById('usernameDisplay').textContent = username;
    }
    if (username) {
        fetch(`http://localhost:3000/customer/balance/${username}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log("Customer Balance:", data.balance);
                    userBalance = parseFloat(data.balance);  // Update the global variable
                    updateBalanceDisplay();  // Refresh UI with correct value
                } else {
                    console.error("Balance fetch failed");
                }
            })
            .catch(err => {
                console.error("Error fetching balance:", err);
            });
    }
    
  
    // Display user balance
    function updateBalanceDisplay() {
        // Update both wallet display and modal balance
        const balanceElements = [
            document.getElementById('userBalance'),
            document.getElementById('currentBalance')
        ];
        
        balanceElements.forEach(el => {
            if (el) el.textContent = `₹${userBalance.toFixed(2)}`;
        });
    }
  
    // Sample restaurant data
  //   const restaurants = [
  //       {
  //           id: 1,
  //           name: "Italian Bistro",
  //           image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
  //           cuisine: "Italian",
  //           price: "$$",
  //           rating: 4.5,
  //           description: "Authentic Italian cuisine with homemade pasta and wood-fired pizzas in a cozy atmosphere.",
  //           capacity: 50,
  //           perHead: 25
  //       },
  //       {
  //           id: 2,
  //           name: "Spice Route",
  //           image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
  //           cuisine: "Indian",
  //           price: "$$$",
  //           rating: 4.8,
  //           description: "Experience the vibrant flavors of India with our carefully crafted traditional dishes.",
  //           capacity: 40,
  //           perHead: 35
  //       },
  //       {
  //           id: 3,
  //           name: "Taco Fiesta",
  //           image: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f",
  //           cuisine: "Mexican",
  //           price: "$",
  //           rating: 4.2,
  //           description: "Colorful Mexican street food with fresh ingredients and bold flavors.",
  //           capacity: 60,
  //           perHead: 15
  //       },
  //       {
  //           id: 4,
  //           name: "Dragon Palace",
  //           image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
  //           cuisine: "Chinese",
  //           price: "$$",
  //           rating: 4.3,
  //           description: "Traditional Chinese dishes prepared with authentic techniques and premium ingredients.",
  //           capacity: 70,
  //           perHead: 20
  //       },
  //       {
  //           id: 5,
  //           name: "Le Petit Paris",
  //           image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
  //           cuisine: "French",
  //           price: "$$$$",
  //           rating: 4.9,
  //           description: "Elegant French dining with exquisite dishes and an extensive wine selection.",
  //           capacity: 30,
  //           perHead: 75
  //       },
  //       {
  //           id: 6,
  //           name: "Sushi Zen",
  //           image: "https://images.unsplash.com/photo-1563612116625-3012372fcc28",
  //           cuisine: "Japanese",
  //           price: "$$$",
  //           rating: 4.7,
  //           description: "Masterfully prepared sushi and sashimi using the freshest seafood available.",
  //           capacity: 25,
  //           perHead: 45
  //       }
  //   ];
  
    // Display restaurants
    function displayRestaurants(restaurantsToDisplay) {
        restaurantsGrid.innerHTML = '';
  
        if (restaurantsToDisplay.length === 0) {
            restaurantsGrid.innerHTML = '<p class="no-results">No restaurants found matching your criteria.</p>';
            return;
        }
  
        restaurantsToDisplay.forEach(restaurant => {
            const restaurantCard = document.createElement('div');
            restaurantCard.className = 'restaurant-card';
            restaurantCard.innerHTML = `
    <div class="restaurant-image-container">
        <img src="${restaurant.image}" alt="${restaurant.name}" class="restaurant-image">
    </div>
    <div class="restaurant-info">
        <h3 class="restaurant-name">${restaurant.name}</h3>
        <div class="restaurant-details">
            <span class="restaurant-cuisine">${restaurant.cuisine}</span>
            <span class="restaurant-price">${restaurant.price}</span>
        </div>
        <div class="restaurant-rating">
            <i class="fas fa-star"></i>
            <span>${restaurant.rating}</span>
        </div>
        <p class="restaurant-description">${restaurant.description}</p>
        <button class="book-btn" data-id="${restaurant.id}">Book Table</button>
        <button class="rate-btn" data-id="${restaurant.id}">Rate & Review</button>
    </div>
`;
            restaurantsGrid.appendChild(restaurantCard);
        });
  
        // Add event listeners to book buttons
        document.querySelectorAll('.book-btn').forEach(button => {
            button.addEventListener('click', function() {
                const restaurantId = this.getAttribute('data-id');
                currentRestaurant = restaurants.find(r => r.id == restaurantId);
                openBookingModal(currentRestaurant);
            });
        });
    }
  
    // Open booking modal
    function openBookingModal(restaurant) {
        // Reset form
        bookingDate.value = '';
        bookingTime.value = '';
        partySize.value = 1;
        pricePerHead.textContent = `$${restaurant.perHead.toFixed(2)}`;
        updateTotalPrice();
        
        // Show modal
        bookingModal.style.display = 'block';
    }
  
    // Update total price
    function updateTotalPrice() {
        if (!currentRestaurant) return;
        const total = currentRestaurant.perHead * parseInt(partySize.value);
        totalPrice.textContent = `$${total.toFixed(2)}`;
    }
  
    // Filter restaurants
    function filterRestaurants() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const priceValue = priceFilter.value;
        const cuisineValue = cuisineFilter.value.toLowerCase();
        const ratingValue = ratingFilter.value;
    
        // If all filters are empty, show all restaurants
        if (!searchTerm && !priceValue && !cuisineValue && !ratingValue) {
            displayRestaurants(restaurants);
            return;
        }
    
        let filtered = restaurants.filter(restaurant => {
            // Search term matching (name, cuisine, or description)
            const matchesSearch = !searchTerm || 
                restaurant.name.toLowerCase().includes(searchTerm) ||
                restaurant.cuisine.toLowerCase().includes(searchTerm) ||
                restaurant.description.toLowerCase().includes(searchTerm);
    
            // Price filter matching
            const matchesPrice = !priceValue || 
                (priceValue === "301" ? 
                    restaurant.perHead > 300 : 
                    restaurant.perHead <= parseFloat(priceValue));
    
            // Cuisine filter matching
            const matchesCuisine = !cuisineValue || 
                restaurant.cuisine.toLowerCase() === cuisineValue;
    
            // Rating filter matching
            const matchesRating = !ratingValue || 
                restaurant.rating >= parseFloat(ratingValue);
    
            return matchesSearch && matchesPrice && matchesCuisine && matchesRating;
        });
    
        displayRestaurants(filtered);
    }
    async function fetchAndDisplayReservations() {
        const username = urlParams.get('username');
        if (!username) return;
    
        try {
            const response = await fetch(`http://localhost:3000/api/reservations/${username}`);
            const reservations = await response.json();
    
            if (!response.ok) {
                throw new Error(reservations.error || 'Failed to fetch reservations');
            }
    
            // Get current date in YYYY-MM-DD format
            const currentDate = new Date().toISOString().split('T')[0];
            
            // Separate into active (today or future) and past reservations
            const activeReservations = reservations.filter(r => r.status === 'upcoming');
            const pastReservations = reservations.filter(r => r.status === 'completed');
    
            // Display them
            displayReservations(activeReservations, pastReservations);
        } catch (error) {
            console.error('Error fetching reservations:', error);
            alert('Failed to load reservations: ' + error.message);
        }
    }
    // Display reservations
    // Initialize the first tab as active
document.querySelector('.tab-btn[data-tab="active"]')?.classList.add('active');
document.getElementById('activeReservations')?.classList.remove('hidden');

    function displayReservations(activeReservations, pastReservations) {
        const activeReservationsList = document.getElementById('activeReservations');
        const pastReservationsList = document.getElementById('pastReservations');
        
        activeReservationsList.innerHTML = '';
        pastReservationsList.innerHTML = '';
    
        if (activeReservations.length === 0) {
            activeReservationsList.innerHTML = '<p class="no-results">No upcoming reservations</p>';
        } else {
            activeReservations.forEach(reservation => {
                activeReservationsList.appendChild(createReservationCard(reservation));
            });
        }
    
        if (pastReservations.length === 0) {
            pastReservationsList.innerHTML = '<p class="no-results">No past reservations</p>';
        } else {
            pastReservations.forEach(reservation => {
                pastReservationsList.appendChild(createReservationCard(reservation));
            });
        }
    }
    
  
    // Create reservation card
    function createReservationCard(reservation) {
        const card = document.createElement('div');
        card.className = 'reservation-card';
        
        const statusClass = `status-${reservation.status}`;
        const formattedDate = new Date(reservation.booking_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const formattedTime = reservation.booking_time.substring(0, 5); // HH:MM format
        
        // Convert amount to number if it's not already
        const amount = typeof reservation.amount === 'string' ? 
            parseFloat(reservation.amount) : 
            reservation.amount;
        
        card.innerHTML = `
            <div class="reservation-header">
                <h3 class="reservation-name">${reservation.restaurant_name}</h3>
                <span class="reservation-status ${statusClass}">
                    ${reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                </span>
            </div>
            <div class="reservation-details">
                <div class="detail-group">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Time</span>
                    <span class="detail-value">${formattedTime}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Party Size</span>
                    <span class="detail-value">${reservation.number_of_people}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Total</span>
                    <span class="detail-value">₹${amount.toFixed(2)}</span>
                </div>
            </div>
        `;
        
        return card;
    }
   
  
    // Event Listeners
    searchBtn.addEventListener('click', filterRestaurants);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') filterRestaurants();
    });
  
    priceFilter.addEventListener('change', filterRestaurants);
    cuisineFilter.addEventListener('change', filterRestaurants);
    ratingFilter.addEventListener('change', filterRestaurants);
  
    clearFilters.addEventListener('click', function() {
        searchInput.value = '';
        priceFilter.value = '';
        cuisineFilter.value = '';
        ratingFilter.value = '';
        filterRestaurants();
    });
  
    // Profile dropdown
    profileBtn.addEventListener('click', function() {
        profileDropdown.classList.toggle('show-dropdown');
    });
  
    // Close dropdown when clicking outside
    window.addEventListener('click', function(event) {
        if (!event.target.matches('#profileBtn') && !event.target.closest('#profileBtn')) {
            if (profileDropdown.classList.contains('show-dropdown')) {
                profileDropdown.classList.remove('show-dropdown');
            }
        }
    });
  
    // Wallet button
    walletBtn.addEventListener('click', function() {
        walletModal.style.display = 'block';
    });
  
    // View reservations
    viewReservations.addEventListener('click', function(e) {
        e.preventDefault();
        profileDropdown.classList.remove('show-dropdown');
        fetchAndDisplayReservations(); // This will load fresh data
        reservationsModal.style.display = 'block';
    });
  
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            const tab = this.getAttribute('data-tab');
            document.querySelectorAll('.reservations-list').forEach(list => {
                list.classList.add('hidden');
            });
            document.getElementById(`${tab}Reservations`).classList.remove('hidden');
        });
    });
  
    // Modal close buttons
    document.querySelectorAll('.modal .close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
  
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
  
    // Booking form
    partySize.addEventListener('change', updateTotalPrice);
    partySize.addEventListener('input', updateTotalPrice);
  
  
    confirmBooking.addEventListener('click', async function() {
        // Validate all fields
        if (!bookingDate.value || !bookingTime.value || !partySize.value) {
            alert('Please fill in all booking details');
            return;
        }
    
        const username = urlParams.get('username');
        if (!username) {
            alert('User not identified');
            return;
        }
    
        if (!currentRestaurant) {
            alert('No restaurant selected');
            return;
        }
    
        const totalAmount = currentRestaurant.perHead * parseInt(partySize.value);
    
        // Check if user has sufficient balance
        if (totalAmount > userBalance) {
            alert('Insufficient balance. Please top up your wallet.');
            return;
        }
    
        try {
            // Make the reservation
            const response = await fetch('http://localhost:3000/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customer_username: username,
                    restaurant_id: currentRestaurant.id,
                    booking_date: bookingDate.value,
                    booking_time: bookingTime.value,
                    number_of_people: parseInt(partySize.value),
                    amount: totalAmount
                })
            });
    
            const result = await response.json();
    
            if (response.ok) {
                // Update local balance
                userBalance -= totalAmount;
                updateBalanceDisplay();
                
                // Close modal and show success
                bookingModal.style.display = 'none';
                alert(`Booking confirmed at ${currentRestaurant.name}!\nTotal: ₹${totalAmount.toFixed(2)}`);
                
                // Refresh reservations
                await fetchAndDisplayReservations();
                
                // Update wallet balance from server (to ensure sync)
                const balanceResponse = await fetch(`http://localhost:3000/customer/balance/${username}`);
                const balanceData = await balanceResponse.json();
                if (balanceData.success) {
                    userBalance = parseFloat(balanceData.balance);
                    updateBalanceDisplay();
                }
            } else {
                alert('Booking failed: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    });
       
  
  // Top up wallet
  topupBtn.addEventListener('click', function() {
    const amount = parseFloat(topupAmount.value);
    const username = document.getElementById('usernameDisplay').textContent;  // Assuming this is where username is displayed.

    if (isNaN(amount)) {
        alert('Please enter a valid amount');
        return;
    }

    if (amount < 10) {
        alert('Minimum top up amount is $10');
        return;
    }

    // Send top-up request to the server
    fetch('http://localhost:3000/customer/topup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            amount: amount
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            userBalance += amount;
            updateBalanceDisplay();
            topupAmount.value = '';
            alert(`Successfully topped up $${amount.toFixed(2)}`);
        } else {
            alert('Top-up failed: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Error during top-up:', err);
        alert('Error during top-up');
    });
});
// Replace the submit rating event listener with this:
// Add this near your other modal declarations


// Add this function to open the rating modal
function openRatingModal(restaurant) {
    // Reset the form
    ratingScore.value = '5';
    ratingComment.value = '';
    
    // Show modal
    ratingModal.style.display = 'block';
}

// Add this after the book button event listeners
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('rate-btn')) {
        const restaurantId = e.target.getAttribute('data-id');
        currentRestaurant = restaurants.find(r => r.id == restaurantId);
        openRatingModal(currentRestaurant);
    }
});

// Add submit rating functionality
submitRating.addEventListener('click', async function() {
    const username = urlParams.get('username');
    if (!username) {
        alert('Please log in to submit a rating');
        return;
    }

    const rating = parseInt(ratingScore.value);
    const comment = ratingComment.value.trim();

    if (!rating || rating < 1 || rating > 5) {
        alert('Please select a valid rating between 1 and 5');
        return;
    }

    try {
        // Get customer ID
        const customerResponse = await fetch(`http://localhost:3000/customer/get-id/${username}`);
        const customerText = await customerResponse.text();
        
        // First check if response is JSON
        let customerData;
        try {
            customerData = JSON.parse(customerText);
        } catch (e) {
            console.error('Failed to parse JSON:', customerText);
            throw new Error('Server returned invalid response');
        }

        if (!customerResponse.ok) {
            throw new Error(customerData.error || 'Failed to get customer ID');
        }

        const customer_id = customerData.customer_id;

        // Submit feedback
        const response = await fetch('http://localhost:3000/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: customer_id,
                restaurant_id: currentRestaurant.id,
                rating: rating,
                comment: comment
            })
        });

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse JSON:', responseText);
            throw new Error('Server returned invalid response');
        }

        if (!response.ok) {
            throw new Error(result.error || 'Failed to submit feedback');
        }

        alert('Thank you for your feedback!');
        ratingModal.style.display = 'none';
        
        // Refresh restaurant data
        const dataResponse = await fetch('http://localhost:3000/restaurants');
        const dataText = await dataResponse.text();
        let data;
        try {
            data = JSON.parse(dataText);
        } catch (e) {
            console.error('Failed to parse JSON:', dataText);
            throw new Error('Failed to load restaurant data');
        }

        restaurants = data.map(restaurant => ({
            name: restaurant.restaurant_name,
            cuisine: restaurant.cuisine,
            price: `₹${restaurant.price_per_person}`,
            perHead: parseFloat(restaurant.price_per_person),
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
            id: restaurant.restaurant_id,
            rating: restaurant.average_rating,
            description: restaurant.description
        }));
        displayRestaurants(restaurants);
        
    } catch (error) {
        console.error('Full error:', error);
        alert(`Error: ${error.message || 'An error occurred. Please try again later.'}`);
    }
});
// Add close event listener for rating modal
ratingModal.querySelector('.close').addEventListener('click', function() {
    ratingModal.style.display = 'none';
});
// In your home.js, add a function to generate invoice cards
function generateInvoiceCard(invoice) {
    // Convert string amounts to numbers
    const totalAmount = typeof invoice.total_amount === 'string' 
        ? parseFloat(invoice.total_amount) 
        : invoice.total_amount;
    
    // Format the date
    const formattedDate = new Date(invoice.created_at || invoice.payment_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return `
        <div class="invoice-card" data-invoice-id="${invoice.invoice_id}">
            <div class="invoice-header">
                <div>
                    <span class="invoice-id">Invoice #${invoice.invoice_id}</span>
                    <div class="invoice-date">${formattedDate}</div>
                </div>
                <span class="invoice-amount">₹${totalAmount.toFixed(2)}</span>
            </div>
            <div class="invoice-details">
                <div class="detail-group">
                    <span class="detail-label">Restaurant</span>
                    <span class="detail-value">${invoice.restaurant_name}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Booking Date</span>
                    <span class="detail-value">${invoice.booking_date}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Party Size</span>
                    <span class="detail-value">${invoice.number_of_people}</span>
                </div>
            </div>
            <!-- Removed the invoice-actions div completely -->
        </div>
    `;
}

// Example function to load invoices (you'll need to implement the actual API call)
async function loadInvoices() {
    try {
        const username = urlParams.get('username');
        console.log('Loading invoices for:', username); // Debug log
        
        if (!username) {
            alert('Please log in to view invoices');
            return;
        }

        console.log('Making API request...'); // Debug log
        const response = await fetch(`http://localhost:3000/api/invoices/${username}`);
        
        console.log('Response status:', response.status); // Debug log
        const responseText = await response.text();
        console.log('Raw response:', responseText); // Debug log
        
        // Try to parse JSON only if response is OK
        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${responseText}`);
        }

        const invoices = JSON.parse(responseText);
        console.log('Parsed invoices:', invoices); // Debug log

        const invoiceList = document.getElementById('invoiceList');
        invoiceList.innerHTML = '';

        if (invoices.length === 0) {
            console.log('No invoices found'); // Debug log
            invoiceList.innerHTML = '<div class="no-results">No invoices found</div>';
            return;
        }

        invoices.forEach(invoice => {
            console.log('Processing invoice:', invoice); // Debug log
            invoiceList.innerHTML += generateInvoiceCard(invoice);
        });

    } catch (error) {
        console.error('Error loading invoices:', error);
        alert('Failed to load invoices: ' + error.message);
    }
}

// Add event listener for the invoices tab
document.querySelector('[data-tab="invoices"]').addEventListener('click', loadInvoices);
  
// Function to show invoice details
async function showInvoiceDetails(invoiceId) {
    try {
        const response = await fetch(`http://localhost:3000/api/invoices/details/${invoiceId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch invoice details');
        }

        const invoice = await response.json();

        // Convert string amounts to numbers if needed
        const amount = typeof invoice.amount === 'string' ? parseFloat(invoice.amount) : invoice.amount;
        const totalAmount = typeof invoice.total_amount === 'string' ? parseFloat(invoice.total_amount) : invoice.total_amount;
        const pricePerPerson = amount / invoice.number_of_people;
        const taxAmount = totalAmount - amount;

        const formattedDate = new Date(invoice.created_at || invoice.payment_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const invoiceDetails = document.getElementById('invoiceDetails');
        invoiceDetails.innerHTML = `
            <div class="invoice-detail-row">
                <span class="invoice-detail-label">Invoice Number</span>
                <span class="invoice-detail-value">#${invoice.invoice_id}</span>
            </div>
            <div class="invoice-detail-row">
                <span class="invoice-detail-label">Date</span>
                <span class="invoice-detail-value">${formattedDate}</span>
            </div>
            <div class="invoice-detail-row">
                <span class="invoice-detail-label">Restaurant</span>
                <span class="invoice-detail-value">${invoice.restaurant_name}</span>
            </div>
            <div class="invoice-detail-row">
                <span class="invoice-detail-label">Booking Date</span>
                <span class="invoice-detail-value">${invoice.booking_date}</span>
            </div>
            <div class="invoice-detail-row">
                <span class="invoice-detail-label">Booking Time</span>
                <span class="invoice-detail-value">${invoice.booking_time.substring(0, 5)}</span>
            </div>
            <div class="invoice-detail-row">
                <span class="invoice-detail-label">Party Size</span>
                <span class="invoice-detail-value">${invoice.number_of_people}</span>
            </div>
            <div class="invoice-detail-row">
                <span class="invoice-detail-label">Price per Person</span>
                <span class="invoice-detail-value">₹${pricePerPerson.toFixed(2)}</span>
            </div>
            <div class="invoice-detail-row">
                <span class="invoice-detail-label">Subtotal</span>
                <span class="invoice-detail-value">₹${amount.toFixed(2)}</span>
            </div>
            <div class="invoice-detail-row">
                <span class="invoice-detail-label">Tax</span>
                <span class="invoice-detail-value">₹${taxAmount.toFixed(2)}</span>
            </div>
            <div class="invoice-detail-row">
                <span class="invoice-detail-label">Total Amount</span>
                <span class="invoice-detail-value">₹${totalAmount.toFixed(2)}</span>
            </div>
        `;

        document.getElementById('invoiceModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading invoice details:', error);
        alert('Failed to load invoice details: ' + error.message);
    }
}

// Function to handle invoice download (mock implementation)
function downloadInvoice(invoiceId) {
    // In a real implementation, this would call your backend to generate a PDF
    console.log(`Downloading invoice ${invoiceId}`);
    alert('Invoice download would start here in a real implementation');
}

// Add event delegation for view invoice buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('view-invoice-btn') || 
        e.target.closest('.view-invoice-btn')) {
        const invoiceId = e.target.getAttribute('data-invoice-id') || 
                         e.target.closest('.view-invoice-btn').getAttribute('data-invoice-id');
        showInvoiceDetails(invoiceId);
    }
});
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Only proceed if button exists
        if (!this) return;
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Show corresponding content
        const tab = this.getAttribute('data-tab');
        const tabContent = document.getElementById(`${tab}Reservations`);
        const invoiceContent = document.getElementById('invoiceList');
        
        // Hide all first
        document.querySelectorAll('.reservations-list').forEach(list => {
            if (list) list.classList.add('hidden');
        });
        
        // Show the correct one
        if (tabContent) tabContent.classList.remove('hidden');
        if (invoiceContent && tab === 'invoices') {
            invoiceContent.classList.remove('hidden');
            loadInvoices();
        }
    });
});
    // Initial display
    updateBalanceDisplay();
    displayRestaurants(restaurants);
  });