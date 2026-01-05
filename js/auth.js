// ===== AUTHENTICATION SYSTEM =====

// Get current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Set current user
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Clear current user
function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

// Get all users from localStorage
function getUsers() {
    const usersStr = localStorage.getItem('users');
    return usersStr ? JSON.parse(usersStr) : [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Initialize default admin user
function initializeUsers() {
    let users = getUsers();
    if (users.length === 0) {
        users = [
            {
                id: 1,
                fullname: 'Admin',
                email: 'admin@channuoi.vn',
                password: 'admin123',
                phone: '0123456789',
                role: 'admin',
                createdAt: new Date().toISOString()
            }
        ];
        saveUsers(users);
    }
}

// Register new user
function register(fullname, email, password, phone = '') {
    const users = getUsers();
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email đã được sử dụng' };
    }
    
    // Create new user
    const newUser = {
        id: users.length + 1,
        fullname,
        email,
        password,
        phone,
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, message: 'Đăng ký thành công', user: newUser };
}

// Login
function login(email, password, remember = false) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return { success: false, message: 'Email hoặc mật khẩu không đúng' };
    }
    
    setCurrentUser(user);
    
    if (remember) {
        localStorage.setItem('rememberMe', 'true');
    }
    
    return { success: true, message: 'Đăng nhập thành công', user };
}

// Logout
function logout() {
    clearCurrentUser();
    localStorage.removeItem('rememberMe');
    window.location.href = 'index.html';
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Update UI based on auth status
function updateAuthUI() {
    const currentUser = getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const adminLink = document.getElementById('adminLink');
    const userName = document.getElementById('userName');
    const userAvatarImg = document.getElementById('userAvatarImg');
    
    if (currentUser) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        
        // Update user name
        if (userName) {
            userName.textContent = currentUser.fullname || currentUser.email.split('@')[0];
        }
        
        // Update avatar
        if (userAvatarImg) {
            if (currentUser.avatar) {
                userAvatarImg.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.fullname}">`;
            } else {
                // Show first letter of name
                const firstLetter = (currentUser.fullname || currentUser.email).charAt(0).toUpperCase();
                userAvatarImg.innerHTML = firstLetter;
            }
        }
        
        // Show admin link if user is admin
        if (adminLink && currentUser.role === 'admin') {
            adminLink.style.display = 'block';
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Load categories menu - Removed (using direct link now)

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeUsers();
    updateAuthUI();
    
    // User info button click toggle
    const userInfoBtn = document.getElementById('userInfoBtn');
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userInfoBtn && userDropdown) {
        userInfoBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.user-menu')) {
                userDropdown.classList.remove('show');
            }
        });
    } else if (userAvatar && userDropdown) {
        // Fallback for old avatar button
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.user-menu')) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const nav = document.querySelector('.nav');
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }
    
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const heroSearchBtn = document.getElementById('heroSearchBtn');
    const heroSearchInput = document.getElementById('heroSearchInput');
    
    function performSearch(query) {
        if (query.trim()) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    }
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => performSearch(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch(searchInput.value);
        });
    }
    
    if (heroSearchBtn && heroSearchInput) {
        heroSearchBtn.addEventListener('click', () => performSearch(heroSearchInput.value));
        heroSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch(heroSearchInput.value);
        });
    }
    
    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        // Toggle password visibility
        document.getElementById('togglePassword')?.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
        
        document.getElementById('toggleConfirmPassword')?.addEventListener('click', function() {
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const icon = this.querySelector('i');
            
            if (confirmPasswordInput.type === 'password') {
                confirmPasswordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                confirmPasswordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
        
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            
            const alertDiv = document.getElementById('registerAlert');
            alertDiv.style.display = 'block';
            
            // Validation
            if (password.length < 6) {
                alertDiv.className = 'alert alert-error';
                alertDiv.textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
                return;
            }
            
            if (password !== confirmPassword) {
                alertDiv.className = 'alert alert-error';
                alertDiv.textContent = 'Mật khẩu xác nhận không khớp';
                return;
            }
            
            if (!terms) {
                alertDiv.className = 'alert alert-error';
                alertDiv.textContent = 'Vui lòng đồng ý với điều khoản sử dụng';
                return;
            }
            
            const result = register(fullname, email, password, phone);
            
            if (result.success) {
                alertDiv.className = 'alert alert-success';
                alertDiv.textContent = 'Đăng ký thành công! Đang chuyển hướng...';
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                alertDiv.className = 'alert alert-error';
                alertDiv.textContent = result.message;
            }
        });
    }
    
    // Contact form handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Get existing contacts
            const contactsStr = localStorage.getItem('contacts');
            const contacts = contactsStr ? JSON.parse(contactsStr) : [];
            
            // Add new contact
            contacts.push({
                id: contacts.length + 1,
                name,
                email,
                subject,
                message,
                status: 'pending',
                createdAt: new Date().toISOString()
            });
            
            localStorage.setItem('contacts', JSON.stringify(contacts));
            
            const alertDiv = document.getElementById('contactAlert');
            alertDiv.style.display = 'block';
            alertDiv.className = 'alert alert-success';
            alertDiv.textContent = 'Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm.';
            
            contactForm.reset();
            
            setTimeout(() => {
                alertDiv.style.display = 'none';
            }, 5000);
        });
    }
});
