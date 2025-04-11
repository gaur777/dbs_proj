document.addEventListener('DOMContentLoaded', function() {
    // Toggle between user and admin login
    const userLoginBtn = document.getElementById('userLogin');
    const adminLoginBtn = document.getElementById('adminLogin');
    const loginBtn = document.getElementById('loginBtn');
    
    userLoginBtn.addEventListener('click', function() {
        userLoginBtn.classList.add('active');
        adminLoginBtn.classList.remove('active');
    });

    adminLoginBtn.addEventListener('click', function() {
        adminLoginBtn.classList.add('active');
        userLoginBtn.classList.remove('active');
    });

    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    const password = document.getElementById('password');
    
    togglePassword.addEventListener('click', function() {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('fa-eye');
        
        const lockIcon = this.parentElement.querySelector('.fa-lock');
        if (type === 'text') {
            lockIcon.classList.replace('fa-lock', 'fa-unlock');
        } else {
            lockIcon.classList.replace('fa-unlock', 'fa-lock');
        }
    });

    // Modal functionality for Sign Up
    const userModal = document.getElementById('userModal');
    const adminModal = document.getElementById('adminModal');
    const signupUserBtn = document.getElementById('signupUser');
    const signupAdminBtn = document.getElementById('signupAdmin');
    const closeButtons = document.querySelectorAll('.close');

    signupUserBtn.addEventListener('click', function() {
        userModal.style.display = 'block';
    });

    signupAdminBtn.addEventListener('click', function() {
        adminModal.style.display = 'block';
    });

    closeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            userModal.style.display = 'none';
            adminModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target === userModal) {
            userModal.style.display = 'none';
        }
        if (event.target === adminModal) {
            adminModal.style.display = 'none';
        }
    });

    // Form submissions
    document.getElementById('userSignupForm').addEventListener('submit', function (e) {
        e.preventDefault();
    
        const inputs = this.querySelectorAll('input');
        const fullName = inputs[0].value.trim(); // Full Name (optional)
        const username = inputs[1].value.trim();
        const password = inputs[2].value.trim();
        const phone = inputs[3].value.trim();
    
        if (!username || !password || !phone) {
            alert("Please fill out all fields.");
            return;
        }
    
        fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password,
                phone
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Diner account created successfully!");
                userModal.style.display = "none";
            } else {
                alert("Signup failed. Username might already exist.");
            }
        })
        .catch(err => {
            console.error("Signup error:", err);
            alert("Something went wrong during signup.");
        });
    });
    
    document.getElementById('adminSignupForm').addEventListener('submit', function(e) {
        e.preventDefault();
    
        const form = e.target;
        const data = {
            restaurant_name: form[0].value,
            seating_capacity: parseInt(form[1].value),
            price_per_person: parseFloat(form[2].value),
            opening_time: form[3].value,
            closing_time: form[4].value,
            username: form[5].value,
            passwordhash: form[6].value
        };
    
        fetch('http://localhost:3000/signup/restaurant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                alert("Restaurant registered successfully!");
                adminModal.style.display = 'none';
            } else {
                alert(response.message || "Signup failed.");
            }
        })
        .catch(err => {
            console.error("Error:", err);
            alert("An error occurred during signup.");
        });
    });
    

    loginBtn.addEventListener('click', function () {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const isAdmin = adminLoginBtn.classList.contains('active');
    
        if (!username || !password) {
            alert("Please enter both username and password.");
            return;
        }
    
        const url = isAdmin 
    ? "http://localhost:3000/login/restaurant" 
    : "http://localhost:3000/login";

fetch(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
})

        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Login successful!");
    
                // Redirect based on role
                if (isAdmin) {
                    window.location.href = `restaurant.html?username=${encodeURIComponent(username)}`;
                } else {
                    window.location.href = `home.html?username=${encodeURIComponent(username)}`;
                }
            } else {
                alert("Invalid username or password.");
            }
        })
        .catch(error => {
            console.error("Login error:", error);
            alert("Something went wrong. Please try again.");
        });
    });
    
});
