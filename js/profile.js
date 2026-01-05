// ===== PROFILE PAGE LOGIC =====

// Check if user is logged in
if (!isLoggedIn()) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
}

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    // Display user info
    document.getElementById('userName').textContent = currentUser.fullname;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userPhone').textContent = currentUser.phone || 'Chưa cập nhật';
    document.getElementById('userRole').textContent = currentUser.role === 'admin' ? 'Quản trị viên' : 'Thành viên';
    document.getElementById('userJoined').textContent = new Date(currentUser.createdAt).toLocaleDateString('vi-VN');

    // Update header user info
    const userNameHeader = document.getElementById('userNameHeader');
    const userAvatarImg = document.getElementById('userAvatarImg');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (userNameHeader) {
        userNameHeader.textContent = currentUser.fullname || currentUser.email.split('@')[0];
    }
    
    // Update avatars
    if (currentUser.avatar) {
        if (userAvatarImg) {
            userAvatarImg.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.fullname}">`;
        }
        if (profileAvatar) {
            profileAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.fullname}">`;
        }
    } else {
        const firstLetter = (currentUser.fullname || currentUser.email).charAt(0).toUpperCase();
        if (userAvatarImg) {
            userAvatarImg.innerHTML = firstLetter;
        }
        if (profileAvatar) {
            profileAvatar.innerHTML = firstLetter;
        }
    }

    // Profile navigation
    const profileNav = document.querySelectorAll('.profile-nav a');
    const sections = document.querySelectorAll('.profile-section');

    profileNav.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);

            // Update active nav
            profileNav.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Show target section
            sections.forEach(s => s.style.display = 'none');
            const targetSection = document.getElementById(target + 'Section');
            if (targetSection) {
                targetSection.style.display = 'block';
            }

            // Load section data
            if (target === 'bookmarks') loadBookmarks();
            if (target === 'questions') loadQuestions();
            if (target === 'comments') loadUserComments();
            if (target === 'settings') loadSettings();
        });
    });

    // Load bookmarks by default
    loadBookmarks();

    // Handle hash navigation
    const hash = window.location.hash.substring(1);
    if (hash) {
        const link = document.querySelector(`.profile-nav a[href="#${hash}"]`);
        if (link) link.click();
    }
});

// Load bookmarks
async function loadBookmarks() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Get bookmarks using the same key format as article.html
    const bookmarksStr = localStorage.getItem('bookmarks_' + currentUser.id);
    const userBookmarks = bookmarksStr ? JSON.parse(bookmarksStr) : [];

    const bookmarksList = document.getElementById('bookmarksList');
    
    console.log('Loading bookmarks for user:', currentUser.id);
    console.log('Bookmarks:', userBookmarks);

    if (userBookmarks.length === 0) {
        bookmarksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bookmark"></i>
                <h3>Chưa có bài viết nào được lưu</h3>
                <p>Hãy lưu các bài viết yêu thích để xem lại sau</p>
                <a href="category.html" class="btn btn-primary">Khám phá bài viết</a>
            </div>
        `;
        return;
    }

    try {
        // Check localStorage first
        const localArticles = localStorage.getItem('articles');
        let articles = [];
        
        if (localArticles) {
            articles = JSON.parse(localArticles);
        } else {
            const response = await fetch('data/articles.json');
            articles = await response.json();
        }

        const savedArticles = articles.filter(a => userBookmarks.includes(a.id));
        
        console.log('Saved articles:', savedArticles);

        if (savedArticles.length === 0) {
            bookmarksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Không tìm thấy bài viết</h3>
                    <p>Các bài viết đã lưu có thể đã bị xóa</p>
                </div>
            `;
            return;
        }

        bookmarksList.innerHTML = savedArticles.map(article => `
            <div class="bookmark-item">
                <a href="article.html?id=${article.id}" class="article-item">
                    <div class="article-item-image">
                        <img src="${article.image}" alt="${article.title}">
                    </div>
                    <div class="article-item-content">
                        <h3>${article.title}</h3>
                        <p>${article.excerpt}</p>
                        <div class="article-card-meta">
                            <span><i class="fas fa-calendar"></i> ${new Date(article.publishedAt).toLocaleDateString('vi-VN')}</span>
                            <span><i class="fas fa-eye"></i> ${article.views} lượt xem</span>
                        </div>
                    </div>
                </a>
                <button class="btn-remove-bookmark" onclick="removeBookmark(${article.id})" title="Bỏ lưu">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading bookmarks:', error);
        bookmarksList.innerHTML = '<p class="error-message">Có lỗi khi tải bài viết đã lưu</p>';
    }
}

// Remove bookmark
window.removeBookmark = function(articleId) {
    if (!confirm('Bỏ lưu bài viết này?')) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Use the same key format as article.html
    const bookmarksStr = localStorage.getItem('bookmarks_' + currentUser.id);
    let bookmarks = bookmarksStr ? JSON.parse(bookmarksStr) : [];
    
    // Remove the article from bookmarks
    bookmarks = bookmarks.filter(id => id !== articleId);
    localStorage.setItem('bookmarks_' + currentUser.id, JSON.stringify(bookmarks));
    
    console.log('Bookmark removed:', articleId);
    console.log('Updated bookmarks:', bookmarks);
    
    // Reload bookmarks list
    loadBookmarks();
}

// Load questions
function loadQuestions() {
    const currentUser = getCurrentUser();
    const questionsStr = localStorage.getItem('questions');
    const allQuestions = questionsStr ? JSON.parse(questionsStr) : [];
    const userQuestions = allQuestions.filter(q => q.userId === currentUser.id);

    const questionsList = document.getElementById('questionsList');

    if (userQuestions.length === 0) {
        questionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-question-circle"></i>
                <h3>Chưa có câu hỏi nào</h3>
                <p>Đặt câu hỏi để nhận được tư vấn từ chuyên gia</p>
                <button class="btn btn-primary" onclick="showQuestionForm()">Đặt câu hỏi</button>
            </div>
        `;
        return;
    }

    questionsList.innerHTML = `
        <button class="btn btn-primary" onclick="showQuestionForm()" style="margin-bottom: 20px;">
            <i class="fas fa-plus"></i> Đặt câu hỏi mới
        </button>
        ${userQuestions.map(q => `
            <div class="chat-thread">
                <div class="chat-header">
                    <div>
                        <h4><i class="fas fa-question-circle"></i> ${q.question || q.title || 'Câu hỏi'}</h4>
                        <div class="chat-meta">
                            <span><i class="fas fa-folder"></i> ${q.category || 'Chung'}</span>
                            <span><i class="fas fa-calendar"></i> ${new Date(q.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                    <span class="badge ${q.answered ? 'badge-success' : 'badge-warning'}">
                        ${q.answered ? 'Đã trả lời' : 'Chờ trả lời'}
                    </span>
                </div>
                
                <div class="chat-messages">
                    <!-- User's question message -->
                    <div class="chat-message user-message">
                        <div class="message-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="message-content">
                            <div class="message-header">
                                <strong>Bạn</strong>
                                <span class="message-time">${new Date(q.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div class="message-text">${q.question || q.title || 'Câu hỏi'}</div>
                        </div>
                    </div>
                    
                    ${q.answers && q.answers.length > 0 ? q.answers.map(ans => `
                        <div class="chat-message admin-message">
                            <div class="message-avatar admin-avatar">
                                <i class="fas fa-user-tie"></i>
                            </div>
                            <div class="message-content">
                                <div class="message-header">
                                    <strong><i class="fas fa-shield-alt"></i> ${ans.answeredBy}</strong>
                                    <span class="message-time">${new Date(ans.answeredAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div class="message-text">${ans.text}</div>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="chat-empty">
                            <i class="fas fa-hourglass-half"></i>
                            <p>Đang chờ chuyên gia trả lời...</p>
                        </div>
                    `}
                </div>
                
                ${q.answered ? `
                    <div class="chat-reply-section">
                        <button class="btn btn-outline btn-sm" onclick="replyToQuestion(${q.id})">
                            <i class="fas fa-reply"></i> Trả lời thêm
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('')}
    `;
}

// Show question form
function showQuestionForm() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Đặt câu hỏi</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="questionForm">
                <div class="form-group">
                    <label>Tiêu đề câu hỏi *</label>
                    <input type="text" id="questionTitle" required placeholder="VD: Cách phòng bệnh tai xanh cho heo">
                </div>
                <div class="form-group">
                    <label>Danh mục *</label>
                    <select id="questionCategory" required>
                        <option value="">Chọn danh mục</option>
                        <option value="Chăn nuôi heo">Chăn nuôi heo</option>
                        <option value="Chăn nuôi bò">Chăn nuôi bò</option>
                        <option value="Chăn nuôi gà">Chăn nuôi gà</option>
                        <option value="Thủy sản">Thủy sản</option>
                        <option value="Phòng bệnh">Phòng bệnh</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Nội dung câu hỏi *</label>
                    <textarea id="questionContent" rows="6" required placeholder="Mô tả chi tiết câu hỏi của bạn..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Gửi câu hỏi</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('questionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitQuestion();
    });
}

// Submit question
function submitQuestion() {
    const currentUser = getCurrentUser();
    const title = document.getElementById('questionTitle').value;
    const category = document.getElementById('questionCategory').value;
    const content = document.getElementById('questionContent').value;

    const questionsStr = localStorage.getItem('questions');
    const questions = questionsStr ? JSON.parse(questionsStr) : [];

    const newQuestion = {
        id: questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1,
        userId: currentUser.id,
        userName: currentUser.fullname || currentUser.email,
        question: title, // Main field for admin display
        category: category,
        answered: false,
        answers: [],
        createdAt: new Date().toISOString()
    };

    questions.push(newQuestion);
    localStorage.setItem('questions', JSON.stringify(questions));
    
    document.querySelector('.modal').remove();
    alert('Câu hỏi đã được gửi! Chúng tôi sẽ trả lời sớm nhất.');
    loadQuestions();
}

// Reply to question (user can reply back)
function replyToQuestion(questionId) {
    const currentUser = getCurrentUser();
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Trả lời thêm</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="replyForm">
                <div class="form-group">
                    <label>Nội dung trả lời *</label>
                    <textarea id="replyContent" rows="5" required placeholder="Nhập câu trả lời của bạn (ví dụ: cảm ơn, hỏi thêm chi tiết...)"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-paper-plane"></i> Gửi trả lời
                </button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('replyForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const replyText = document.getElementById('replyContent').value.trim();
        
        if (replyText.length < 5) {
            alert('Nội dung quá ngắn (ít nhất 5 ký tự)');
            return;
        }
        
        const questionsStr = localStorage.getItem('questions');
        const questions = questionsStr ? JSON.parse(questionsStr) : [];
        const question = questions.find(q => q.id === questionId);
        
        if (question) {
            if (!question.answers) {
                question.answers = [];
            }
            
            question.answers.push({
                text: replyText,
                answeredBy: currentUser.fullname,
                answeredAt: new Date().toISOString()
            });
            
            localStorage.setItem('questions', JSON.stringify(questions));
            modal.remove();
            alert('Đã gửi trả lời!');
            loadQuestions();
        }
    });
}

// Load user comments
function loadUserComments() {
    const currentUser = getCurrentUser();
    const commentsStr = localStorage.getItem('comments');
    const allComments = commentsStr ? JSON.parse(commentsStr) : [];
    const userComments = allComments.filter(c => c.userId === currentUser.id);

    const commentsList = document.getElementById('commentsList');

    if (userComments.length === 0) {
        commentsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>Chưa có bình luận nào</h3>
                <p>Bình luận để chia sẻ ý kiến của bạn</p>
                <a href="category.html" class="btn btn-primary">Xem bài viết</a>
            </div>
        `;
        return;
    }

    commentsList.innerHTML = userComments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-date">${new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                <span class="badge ${comment.approved ? 'badge-success' : 'badge-warning'}">
                    ${comment.approved ? 'Đã duyệt' : 'Chờ duyệt'}
                </span>
            </div>
            <div class="comment-text">${comment.text}</div>
            <a href="article.html?id=${comment.articleId}" class="comment-link">
                <i class="fas fa-external-link-alt"></i> Xem bài viết
            </a>
        </div>
    `).join('');
}

// Load settings
function loadSettings() {
    const currentUser = getCurrentUser();
    document.getElementById('settingsName').value = currentUser.fullname;
    document.getElementById('settingsEmail').value = currentUser.email;
    document.getElementById('settingsPhone').value = currentUser.phone || '';

    const settingsForm = document.getElementById('settingsForm');
    settingsForm.onsubmit = function(e) {
        e.preventDefault();
        updateProfile();
    };
}

// Update profile
function updateProfile() {
    const currentUser = getCurrentUser();
    const newName = document.getElementById('settingsName').value;
    const newPhone = document.getElementById('settingsPhone').value;

    const users = getUsers();
    const user = users.find(u => u.id === currentUser.id);
    
    if (user) {
        user.fullname = newName;
        user.phone = newPhone;
        saveUsers(users);
        
        currentUser.fullname = newName;
        currentUser.phone = newPhone;
        setCurrentUser(currentUser);
        
        document.getElementById('userName').textContent = newName;
        document.getElementById('userPhone').textContent = newPhone || 'Chưa cập nhật';
        
        alert('Cập nhật thông tin thành công!');
    }
}

// Change password
function showChangePasswordForm() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Đổi mật khẩu</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="changePasswordForm">
                <div class="form-group">
                    <label>Mật khẩu hiện tại *</label>
                    <input type="password" id="currentPassword" required>
                </div>
                <div class="form-group">
                    <label>Mật khẩu mới *</label>
                    <input type="password" id="newPassword" required minlength="6">
                </div>
                <div class="form-group">
                    <label>Xác nhận mật khẩu mới *</label>
                    <input type="password" id="confirmNewPassword" required>
                </div>
                <div class="alert" id="passwordAlert" style="display: none;"></div>
                <button type="submit" class="btn btn-primary">Đổi mật khẩu</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('changePasswordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        changePassword();
    });
}

// Change password logic
function changePassword() {
    const currentUser = getCurrentUser();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    const alertDiv = document.getElementById('passwordAlert');
    alertDiv.style.display = 'block';

    if (currentUser.password !== currentPassword) {
        alertDiv.className = 'alert alert-error';
        alertDiv.textContent = 'Mật khẩu hiện tại không đúng';
        return;
    }

    if (newPassword.length < 6) {
        alertDiv.className = 'alert alert-error';
        alertDiv.textContent = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        return;
    }

    if (newPassword !== confirmPassword) {
        alertDiv.className = 'alert alert-error';
        alertDiv.textContent = 'Mật khẩu xác nhận không khớp';
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.id === currentUser.id);
    
    if (user) {
        user.password = newPassword;
        saveUsers(users);
        
        currentUser.password = newPassword;
        setCurrentUser(currentUser);
        
        alertDiv.className = 'alert alert-success';
        alertDiv.textContent = 'Đổi mật khẩu thành công!';
        
        setTimeout(() => {
            document.querySelector('.modal').remove();
        }, 1500);
    }
}


    // Change avatar functionality
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const avatarInput = document.getElementById('avatarInput');
    
    if (changeAvatarBtn && avatarInput) {
        changeAvatarBtn.addEventListener('click', function() {
            avatarInput.click();
        });
        
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('Kích thước ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 2MB.');
                    return;
                }
                
                // Check file type
                if (!file.type.startsWith('image/')) {
                    alert('Vui lòng chọn file ảnh!');
                    return;
                }
                
                // Read and convert to base64
                const reader = new FileReader();
                reader.onload = function(event) {
                    const avatarUrl = event.target.result;
                    
                    // Get current user
                    const user = getCurrentUser();
                    if (!user) return;
                    
                    // Update current user
                    user.avatar = avatarUrl;
                    setCurrentUser(user);
                    
                    // Update all users in localStorage
                    const users = getUsers();
                    const userIndex = users.findIndex(u => u.id === user.id);
                    if (userIndex !== -1) {
                        users[userIndex].avatar = avatarUrl;
                        saveUsers(users);
                    }
                    
                    // Update UI
                    if (profileAvatar) {
                        profileAvatar.innerHTML = `<img src="${avatarUrl}" alt="${user.fullname}">`;
                    }
                    if (userAvatarImg) {
                        userAvatarImg.innerHTML = `<img src="${avatarUrl}" alt="${user.fullname}">`;
                    }
                    
                    // Show success message
                    alert('✓ Đã cập nhật ảnh đại diện thành công!');
                };
                reader.readAsDataURL(file);
            }
        });
    }
