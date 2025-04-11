document.addEventListener('DOMContentLoaded', function() {
    // Fetch restaurants from backend API
  let restaurants = [];
  
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
  
    // Display user balance
    function updateBalanceDisplay() {
        document.getElementById('userBalance').textContent = `$${userBalance.toFixed(2)}`;
        currentBalance.textContent = `$${userBalance.toFixed(2)}`;
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
                <img src="${restaurant.image}" alt="${restaurant.name}" class="restaurant-image">
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
        const searchTerm = searchInput.value.toLowerCase();
        const priceValue = priceFilter.value;
        const cuisineValue = cuisineFilter.value.toLowerCase();
        const ratingValue = ratingFilter.value;
  
        let filtered = [...restaurants];
  
        // Apply search
        if (searchTerm) {
            filtered = filtered.filter(restaurant => 
                restaurant.name.toLowerCase().includes(searchTerm) ||
                restaurant.cuisine.toLowerCase().includes(searchTerm) ||
                restaurant.description.toLowerCase().includes(searchTerm)
            );
        }
  
        // Apply price filter
        if (priceValue) {
            const priceLevels = ['$', '$$', '$$$', '$$$$'];
            filtered = filtered.filter(restaurant => 
                restaurant.price === priceLevels[priceValue - 1]
            );
        }
  
        // Apply cuisine filter
        if (cuisineValue) {
            filtered = filtered.filter(restaurant => 
                restaurant.cuisine.toLowerCase() === cuisineValue
            );
        }
  
        // Apply rating filter
        if (ratingValue) {
            filtered = filtered.filter(restaurant => 
                restaurant.rating >= parseFloat(ratingValue)
            );
        }
  
        displayRestaurants(filtered);
    }
  
    // Display reservations
    function displayReservations() {
        activeReservations.innerHTML = '';
        pastReservations.innerHTML = '';
  
        if (reservations.active.length === 0) {
            activeReservations.innerHTML = '<p class="no-results">No upcoming reservations.</p>';
        } else {
            reservations.active.forEach(reservation => {
                const card = createReservationCard(reservation);
                activeReservations.appendChild(card);
            });
        }
  
        if (reservations.past.length === 0) {
            pastReservations.innerHTML = '<p class="no-results">No past reservations.</p>';
        } else {
            reservations.past.forEach(reservation => {
                const card = createReservationCard(reservation);
                pastReservations.appendChild(card);
            });
        }
    }
  
    // Create reservation card
    function createReservationCard(reservation) {
        const card = document.createElement('div');
        card.className = 'reservation-card';
        
        const statusClass = `status-${reservation.status}`;
        
        card.innerHTML = `
            <div class="reservation-header">
                <span class="reservation-name">${reservation.restaurant}</span>
                <span class="reservation-status ${statusClass}">
                    ${reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                </span>
            </div>
            <div class="reservation-date">
                ${reservation.date} at ${reservation.time}
            </div>
            <div class="reservation-details">
                <span>${reservation.partySize} person${reservation.partySize > 1 ? 's' : ''}</span>
                <span>$${reservation.total.toFixed(2)}</span>
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
        displayReservations();
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
  
    confirmBooking.addEventListener('click', function() {
        if (!bookingDate.value || !bookingTime.value) {
            alert('Please select date and time');
            return;
        }
  
        const total = currentRestaurant.perHead * parseInt(partySize.value);
        
        if (userBalance < total) {
            alert('Insufficient balance. Please top up your wallet.');
            walletModal.style.display = 'block';
            bookingModal.style.display = 'none';
            return;
        }
  
        // Deduct from balance
        userBalance -= total;
        updateBalanceDisplay();
        
        // Create new reservation
        const newReservation = {
            id: reservations.active.length + reservations.past.length + 1,
            restaurant: currentRestaurant.name,
            date: bookingDate.value,
            time: bookingTime.value,
            partySize: parseInt(partySize.value),
            total: total,
            status: "upcoming"
        };
        
        reservations.active.push(newReservation);
        
        // Close modal and show success
        bookingModal.style.display = 'none';
        alert(`Booking confirmed at ${currentRestaurant.name} for ${partySize.value} people on ${bookingDate.value} at ${bookingTime.value}\nTotal: $${total.toFixed(2)}`);
    });
  
    // Top up wallet
    topupBtn.addEventListener('click', function() {
        const amount = parseFloat(topupAmount.value);
        
        if (isNaN(amount)) {
            alert('Please enter a valid amount');
            return;
        }
        
        if (amount < 10) {
            alert('Minimum top up amount is $10');
            return;
        }
        
        userBalance += amount;
        updateBalanceDisplay();
        topupAmount.value = '';
        alert(`Successfully topped up $${amount.toFixed(2)}`);
    });
  
    // Initial display
    updateBalanceDisplay();
    displayRestaurants(restaurants);
  });