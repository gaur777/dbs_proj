document.addEventListener('DOMContentLoaded', function() {
  // Sample data with Indian details
  let restaurant = {
      name: "Spice Garden",
      pricePerHead: 500,
      seatingCapacity: 50,
      availableSeats: 12,
      balance: 62500.00,
      reservations: [
          {
              id: 1,
              customerName: "Rahul Sharma",
              date: "2023-06-15",
              time: "19:00",
              partySize: 4,
              total: 2000.00,
              status: "pending",
              phone: "+91 98765 43210"
          },
          {
              id: 2,
              customerName: "Priya Patel",
              date: "2023-06-16",
              time: "20:30",
              partySize: 2,
              total: 1000.00,
              status: "confirmed",
              phone: "+91 87654 32109"
          },
          {
              id: 3,
              customerName: "Amit Singh",
              date: "2023-06-14",
              time: "18:00",
              partySize: 6,
              total: 3000.00,
              status: "pending",
              phone: "+91 76543 21098"
          },
          {
              id: 4,
              customerName: "Neha Gupta",
              date: "2023-06-13",
              time: "19:30",
              partySize: 3,
              total: 1500.00,
              status: "cancelled",
              phone: "+91 65432 10987"
          }
      ]
  };

  // DOM Elements
  const restaurantName = document.getElementById('restaurantName');
  const seatsDisplay = document.getElementById('seatsDisplay');
  const restaurantBalance = document.getElementById('restaurantBalance');
  const pendingCount = document.getElementById('pendingCount');
  const confirmedCount = document.getElementById('confirmedCount');
  const cancelledCount = document.getElementById('cancelledCount');
  const reservationsGrid = document.getElementById('reservationsGrid');
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  const updatePricing = document.getElementById('updatePricing');
  const logoutBtn = document.getElementById('logoutBtn');
  const pricingModal = document.getElementById('pricingModal');
  const newPrice = document.getElementById('newPrice');
  const newCapacity = document.getElementById('newCapacity');
  const updatePricingBtn = document.getElementById('updatePricingBtn');

  // Initialize restaurant data
  function initRestaurantData() {
      const urlParams = new URLSearchParams(window.location.search);
      const username = urlParams.get('username');
      if (username) {
          document.getElementById('usernameDisplay').textContent = username;
      }

      restaurantName.textContent = restaurant.name;
      seatsDisplay.textContent = `${restaurant.availableSeats}/${restaurant.seatingCapacity} seats available`;
      restaurantBalance.textContent = `₹${restaurant.balance.toFixed(2)}`;
      
      const pending = restaurant.reservations.filter(r => r.status === 'pending').length;
      const confirmed = restaurant.reservations.filter(r => r.status === 'confirmed').length;
      const cancelled = restaurant.reservations.filter(r => r.status === 'cancelled').length;
      
      pendingCount.textContent = pending;
      confirmedCount.textContent = confirmed;
      cancelledCount.textContent = cancelled;
      
      displayReservations();
  }

  // Display reservations
  function displayReservations() {
      reservationsGrid.innerHTML = '';
      
      if (restaurant.reservations.length === 0) {
          reservationsGrid.innerHTML = '<p class="no-results">No reservation requests yet.</p>';
          return;
      }
      
      restaurant.reservations.forEach(reservation => {
          const card = document.createElement('div');
          card.className = 'reservation-card';
          
          const statusClass = `status-${reservation.status}`;
          const actions = reservation.status === 'pending' ? `
              <div class="reservation-actions">
                  <button class="action-btn confirm-btn" data-id="${reservation.id}">Confirm</button>
                  <button class="action-btn cancel-btn" data-id="${reservation.id}">Cancel</button>
              </div>
          ` : '';
          
          card.innerHTML = `
              <div class="reservation-header">
                  <span class="reservation-name">${reservation.customerName}</span>
                  <span class="reservation-status ${statusClass}">
                      ${reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                  </span>
              </div>
              <div class="reservation-details">
                  <div class="detail-group">
                      <span class="detail-label">Date & Time</span>
                      <span class="detail-value">${reservation.date} at ${reservation.time}</span>
                  </div>
                  <div class="detail-group">
                      <span class="detail-label">Party Size</span>
                      <span class="detail-value">${reservation.partySize} people</span>
                  </div>
                  <div class="detail-group">
                      <span class="detail-label">Total</span>
                      <span class="detail-value">₹${reservation.total.toFixed(2)}</span>
                  </div>
                  <div class="detail-group">
                      <span class="detail-label">Phone</span>
                      <span class="detail-value">${reservation.phone}</span>
                  </div>
              </div>
              ${actions}
          `;
          
          reservationsGrid.appendChild(card);
      });
      
      document.querySelectorAll('.confirm-btn').forEach(btn => {
          btn.addEventListener('click', function() {
              const reservationId = parseInt(this.getAttribute('data-id'));
              confirmReservation(reservationId);
          });
      });
      
      document.querySelectorAll('.cancel-btn').forEach(btn => {
          btn.addEventListener('click', function() {
              const reservationId = parseInt(this.getAttribute('data-id'));
              cancelReservation(reservationId);
          });
      });
  }

  function confirmReservation(id) {
      const reservation = restaurant.reservations.find(r => r.id === id);
      if (reservation) {
          reservation.status = 'confirmed';
          restaurant.balance += reservation.total;
          restaurant.availableSeats -= reservation.partySize;
          updateRestaurantData();
          alert(`Reservation #${id} confirmed successfully!\nAmount: ₹${reservation.total.toFixed(2)}`);
      }
  }

  function cancelReservation(id) {
      const reservation = restaurant.reservations.find(r => r.id === id);
      if (reservation) {
          reservation.status = 'cancelled';
          if (reservation.status === 'confirmed') {
              restaurant.availableSeats += reservation.partySize;
          }
          updateRestaurantData();
          alert(`Reservation #${id} has been cancelled.\nRefund: ₹${reservation.total.toFixed(2)}`);
      }
  }

  function updateRestaurantData() {
      seatsDisplay.textContent = `${restaurant.availableSeats}/${restaurant.seatingCapacity} seats available`;
      restaurantBalance.textContent = `₹${restaurant.balance.toFixed(2)}`;
      
      const pending = restaurant.reservations.filter(r => r.status === 'pending').length;
      const confirmed = restaurant.reservations.filter(r => r.status === 'confirmed').length;
      const cancelled = restaurant.reservations.filter(r => r.status === 'cancelled').length;
      
      pendingCount.textContent = pending;
      confirmedCount.textContent = confirmed;
      cancelledCount.textContent = cancelled;
      
      displayReservations();
  }

  function updatePricingHandler() {
      const price = parseFloat(newPrice.value);
      const capacity = parseInt(newCapacity.value);
      
      if (!isNaN(price)) {
          restaurant.pricePerHead = price;
      }
      
      if (!isNaN(capacity)) {
          const diff = capacity - restaurant.seatingCapacity;
          restaurant.seatingCapacity = capacity;
          restaurant.availableSeats += diff;
      }
      
      updateRestaurantData();
      pricingModal.style.display = 'none';
      newPrice.value = '';
      newCapacity.value = '';
      alert(`Pricing updated successfully!\nNew price: ₹${restaurant.pricePerHead.toFixed(2)}`);
  }

  // Event Listeners
  profileBtn.addEventListener('click', function() {
      profileDropdown.classList.toggle('show-dropdown');
  });

  updatePricing.addEventListener('click', function(e) {
      e.preventDefault();
      profileDropdown.classList.remove('show-dropdown');
      pricingModal.style.display = 'block';
      newPrice.value = restaurant.pricePerHead;
      newCapacity.value = restaurant.seatingCapacity;
  });

  updatePricingBtn.addEventListener('click', updatePricingHandler);

  window.addEventListener('click', function(event) {
      if (event.target.classList.contains('modal')) {
          event.target.style.display = 'none';
      }
      
      if (!event.target.matches('#profileBtn') && !event.target.closest('#profileBtn')) {
          if (profileDropdown.classList.contains('show-dropdown')) {
              profileDropdown.classList.remove('show-dropdown');
          }
      }
  });

  // Initialize
  initRestaurantData();
});