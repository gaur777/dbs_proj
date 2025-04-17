document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const reservationsGrid = document.getElementById('reservationsGrid');
    const restaurantName = document.getElementById('restaurantName');

    // Get username from URL
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    // Function to show error messages
    function showErrorMessage(message) {
        reservationsGrid.innerHTML = `
            <div class="error-message">
                ${message}
            
            </div>
        `;
    }

    // Display reservations
    function displayReservations(reservations) {
        reservationsGrid.innerHTML = '';
        
        if (reservations.length === 0) {
            reservationsGrid.innerHTML = '<p class="no-results">No reservations found</p>';
            return;
        }
        
        reservations.forEach(reservation => {
            const card = document.createElement('div');
            card.className = 'reservation-card';
            
            // Format the date and time
            const bookingDate = new Date(reservation.booking_date);
            const formattedDate = bookingDate.toLocaleDateString();
            const formattedTime = reservation.booking_time.substring(0, 5);
            
            card.innerHTML = `
                <div class="reservation-header">
                    <span class="reservation-name">${reservation.customer_name}</span>
                    <span class="reservation-phone">${reservation.phone}</span>
                </div>
                <div class="reservation-details">
                    <div class="detail-group">
                        <span class="detail-label">Date & Time</span>
                        <span class="detail-value">${formattedDate} at ${formattedTime}</span>
                    </div>
                    <div class="detail-group">
                        <span class="detail-label">Party Size</span>
                        <span class="detail-value">${reservation.number_of_people} people</span>
                    </div>
                    <div class="detail-group">
                        <span class="detail-label">Total</span>
                        <span class="detail-value">₹${reservation.amount.toFixed(2)}</span>
                    </div>
                </div>
            `;
            
            reservationsGrid.appendChild(card);
        });
    }

    // Fetch restaurant reservations from backend
    async function fetchRestaurantReservations(restaurantId) {
        try {
            const response = await fetch(`http://localhost:3000/api/restaurant/reservations/${restaurantId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch reservations');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            showErrorMessage(error.message || 'Failed to load reservations');
            return [];
        }
    }

    // Fetch restaurant details by username
    async function fetchRestaurantDetails(username) {
        try {
            const response = await fetch(`http://localhost:3000/api/restaurant/by-username?username=${encodeURIComponent(username)}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch restaurant details');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            showErrorMessage(error.message || 'Failed to load restaurant data');
            return null;
        }
    }

    // Initialize the page
    async function init() {
        if (!username) {
            showErrorMessage('No username provided');
            return;
        }

        try {
            // First get restaurant details
            const restaurantData = await fetchRestaurantDetails(username);
            if (!restaurantData) return;
            
            const restaurantId = restaurantData.restaurant_id;
            restaurantName.textContent = restaurantData.restaurant_name;

            // Then fetch reservations
            const reservations = await fetchRestaurantReservations(restaurantId);
            displayReservations(reservations);
        } catch (error) {
            console.error('Error:', error);
            showErrorMessage(error.message || 'Failed to initialize page');
        }
    }

    // Initialize the page
    init();
});