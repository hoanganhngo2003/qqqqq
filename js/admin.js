// ===== ADMIN FUNCTIONALITY =====

// Check admin access on all admin pages
function checkAdminAccess() {
    if (!isAdmin()) {
        alert('Bạn không có quyền truy cập trang này');
        window.location.href = '../index.html';
        return false;
    }
    return true;
}

// Initialize admin page
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAdminAccess()) return;
    
    // Update admin name
    const currentUser = getCurrentUser();
    if (currentUser) {
        const adminNameElements = document.querySelectorAll('#adminName');
        adminNameElements.forEach(el => {
            el.textContent = currentUser.fullname;
        });
    }
    
    // Logout handler
    const logoutBtns = document.querySelectorAll('#adminLogout');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                logout();
            }
        });
    });
});

// Get all comments
function getAllComments() {
    const commentsStr = localStorage.getItem('comments');
    return commentsStr ? JSON.parse(commentsStr) : [];
}

// Save comments
function saveComments(comments) {
    localStorage.setItem('comments', JSON.stringify(comments));
}

// Approve comment
function approveComment(commentId) {
    const comments = getAllComments();
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
        comment.approved = true;
        saveComments(comments);
        return true;
    }
    return false;
}

// Delete comment
function deleteComment(commentId) {
    let comments = getAllComments();
    comments = comments.filter(c => c.id !== commentId);
    saveComments(comments);
    return true;
}

// Get all contacts
function getAllContacts() {
    const contactsStr = localStorage.getItem('contacts');
    return contactsStr ? JSON.parse(contactsStr) : [];
}

// Save contacts
function saveContacts(contacts) {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// Update contact status
function updateContactStatus(contactId, status) {
    const contacts = getAllContacts();
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
        contact.status = status;
        saveContacts(contacts);
        return true;
    }
    return false;
}

// Delete contact
function deleteContact(contactId) {
    let contacts = getAllContacts();
    contacts = contacts.filter(c => c.id !== contactId);
    saveContacts(contacts);
    return true;
}

// Update user role
function updateUserRole(userId, newRole) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
        user.role = newRole;
        saveUsers(users);
        return true;
    }
    return false;
}

// Delete user
function deleteUser(userId) {
    let users = getUsers();
    const currentUser = getCurrentUser();
    
    // Prevent deleting self
    if (userId === currentUser.id) {
        alert('Bạn không thể xóa tài khoản của chính mình');
        return false;
    }
    
    users = users.filter(u => u.id !== userId);
    saveUsers(users);
    return true;
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleString('vi-VN');
}

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// Hide modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal on outside click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});
