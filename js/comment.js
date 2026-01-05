// ===== ARTICLE DETAIL PAGE & COMMENTS =====

// Load article detail
async function loadArticleDetail() {
    try {
        const articleId = getUrlParameter('id');
        if (!articleId) {
            window.location.href = 'index.html';
            return;
        }
        
        let articles = [];
        
        // Check localStorage first
        const localArticles = localStorage.getItem('articles');
        if (localArticles) {
            articles = JSON.parse(localArticles);
        } else {
            const articlesRes = await fetch('data/articles.json');
            articles = await articlesRes.json();
        }
        
        const categoriesRes = await fetch('data/categories.json');
        const categories = await categoriesRes.json();
        
        const article = articles.find(a => a.id == articleId);
        if (!article) {
            window.location.href = 'index.html';
            return;
        }
        
        // Update views
        article.views++;
        
        // Save updated articles back to localStorage
        localStorage.setItem('articles', JSON.stringify(articles));
        
        // Display article - with null checks
        const titleEl = document.getElementById('articleTitle');
        const authorEl = document.getElementById('articleAuthor');
        const dateEl = document.getElementById('articleDate');
        const viewsEl = document.getElementById('articleViews');
        const imageEl = document.getElementById('articleImage');
        const contentEl = document.getElementById('articleContent');
        
        if (titleEl) titleEl.textContent = article.title;
        if (authorEl) authorEl.textContent = article.author;
        if (dateEl) dateEl.textContent = new Date(article.publishedAt).toLocaleDateString('vi-VN');
        if (viewsEl) viewsEl.textContent = article.views;
        if (imageEl) {
            imageEl.src = article.image;
            imageEl.alt = article.title;
        }
        if (contentEl) contentEl.innerHTML = article.content;
        
        // Update page title
        document.title = article.title + ' - Kỹ Thuật Chăn Nuôi';
        
        // Display excerpt
        const excerptEl = document.getElementById('articleExcerpt');
        if (excerptEl) excerptEl.textContent = article.excerpt || '';
        
        // Display category badge
        const category = categories.find(c => c.id === article.categoryId);
        if (category) {
            const categoryBadgeEl = document.getElementById('articleCategoryBadge');
            if (categoryBadgeEl) {
                categoryBadgeEl.innerHTML = `<i class="${category.icon}"></i> ${category.name}`;
            }
            
            const breadcrumbCategoryEl = document.getElementById('breadcrumbCategory');
            if (breadcrumbCategoryEl) {
                breadcrumbCategoryEl.textContent = category.name;
                breadcrumbCategoryEl.href = `category.html?id=${category.id}`;
            }
        }
        
        const breadcrumbTitleEl = document.getElementById('breadcrumbTitle');
        if (breadcrumbTitleEl) breadcrumbTitleEl.textContent = article.title;
        
        // Display author name in sidebar
        const authorNameEl = document.getElementById('authorName');
        if (authorNameEl) authorNameEl.textContent = article.author;
        
        // Count author articles
        const authorArticlesEl = document.getElementById('authorArticles');
        if (authorArticlesEl) {
            const authorArticleCount = articles.filter(a => a.author === article.author).length;
            authorArticlesEl.textContent = authorArticleCount;
        }
        
        // Tags
        const tagsEl = document.getElementById('articleTags');
        if (article.tags && article.tags.length > 0 && tagsEl) {
            tagsEl.innerHTML = article.tags.map(tag => 
                `<span class="tag">${tag}</span>`
            ).join('');
        }
        
        // Check bookmark status
        updateBookmarkButton(articleId);
        
        // Load related articles - pass articles array
        loadRelatedArticles(article.categoryId, articleId, articles);
        
        // Load comments
        loadComments(articleId);
        
        // Show comment form if logged in
        const currentUser = getCurrentUser();
        const loginRequiredEl = document.getElementById('loginRequired');
        const commentFormEl = document.getElementById('commentForm');
        
        if (currentUser) {
            if (loginRequiredEl) loginRequiredEl.style.display = 'none';
            if (commentFormEl) commentFormEl.style.display = 'block';
        } else {
            if (loginRequiredEl) loginRequiredEl.style.display = 'block';
            if (commentFormEl) commentFormEl.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error loading article:', error);
    }
}

// Load related articles
async function loadRelatedArticles(categoryId, currentArticleId) {
    try {
        let articles = [];
        
        // Check localStorage first
        const localArticles = localStorage.getItem('articles');
        if (localArticles) {
            articles = JSON.parse(localArticles);
        } else {
            const response = await fetch('data/articles.json');
            articles = await response.json();
        }
        
        const related = articles
            .filter(a => a.categoryId === categoryId && a.id != currentArticleId)
            .slice(0, 5);
        
        const relatedContainer = document.getElementById('relatedArticles');
        if (relatedContainer) {
            relatedContainer.innerHTML = related.map(article => `
                <a href="article.html?id=${article.id}" class="sidebar-article">
                    <div class="sidebar-article-image">
                        <img src="${article.image}" alt="${article.title}">
                    </div>
                    <div class="sidebar-article-content">
                        <h4>${article.title}</h4>
                        <div class="sidebar-article-meta">
                            ${new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                </a>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading related articles:', error);
    }
}

// Bookmark functionality
function updateBookmarkButton(articleId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const bookmarksStr = localStorage.getItem('bookmarks');
    const bookmarks = bookmarksStr ? JSON.parse(bookmarksStr) : {};
    
    const userBookmarks = bookmarks[currentUser.id] || [];
    const isBookmarked = userBookmarks.includes(parseInt(articleId));
    
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    if (bookmarkBtn) {
        if (isBookmarked) {
            bookmarkBtn.classList.add('active');
            bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i> Đã lưu';
        } else {
            bookmarkBtn.classList.remove('active');
            bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i> Lưu';
        }
        
        bookmarkBtn.addEventListener('click', function() {
            toggleBookmark(articleId);
        });
    }
}

function toggleBookmark(articleId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        return;
    }
    
    const bookmarksStr = localStorage.getItem('bookmarks');
    const bookmarks = bookmarksStr ? JSON.parse(bookmarksStr) : {};
    
    if (!bookmarks[currentUser.id]) {
        bookmarks[currentUser.id] = [];
    }
    
    const userBookmarks = bookmarks[currentUser.id];
    const index = userBookmarks.indexOf(parseInt(articleId));
    
    if (index > -1) {
        userBookmarks.splice(index, 1);
    } else {
        userBookmarks.push(parseInt(articleId));
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    updateBookmarkButton(articleId);
}

// Comments functionality
function loadComments(articleId) {
    const commentsStr = localStorage.getItem('comments');
    const allComments = commentsStr ? JSON.parse(commentsStr) : [];
    
    // Get only approved comments for this article
    const articleComments = allComments.filter(c => c.articleId == articleId && c.approved);
    
    // Separate parent comments and replies
    const parentComments = articleComments.filter(c => !c.replyTo);
    const replies = articleComments.filter(c => c.replyTo);
    
    document.getElementById('commentCount').textContent = parentComments.length;
    document.getElementById('commentCountSection').textContent = parentComments.length;
    
    const commentsList = document.getElementById('commentsList');
    if (commentsList) {
        if (parentComments.length === 0) {
            commentsList.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>';
        } else {
            commentsList.innerHTML = parentComments.map(comment => {
                // Find replies for this comment
                const commentReplies = replies.filter(r => r.replyTo === comment.id);
                
                let repliesHTML = '';
                if (commentReplies.length > 0) {
                    repliesHTML = `
                        <div class="comment-replies">
                            ${commentReplies.map(reply => `
                                <div class="comment-item comment-reply ${reply.isAdminReply ? 'admin-reply' : ''}">
                                    <div class="comment-header">
                                        <span class="comment-author">
                                            ${reply.isAdminReply ? '<i class="fas fa-shield-alt"></i> ' : ''}
                                            ${reply.userName}
                                            ${reply.isAdminReply ? '<span class="admin-badge">Admin</span>' : ''}
                                        </span>
                                        <span class="comment-date">${new Date(reply.createdAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div class="comment-text">${reply.text}</div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
                
                return `
                    <div class="comment-item">
                        <div class="comment-header">
                            <span class="comment-author">${comment.userName}</span>
                            <span class="comment-date">${new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div class="comment-text">${comment.text}</div>
                        ${repliesHTML}
                    </div>
                `;
            }).join('');
        }
    }
}

// Submit comment
document.addEventListener('DOMContentLoaded', function() {
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentUser = getCurrentUser();
            if (!currentUser) {
                window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
                return;
            }
            
            const articleId = getUrlParameter('id');
            const commentText = document.getElementById('commentText').value;
            
            const commentsStr = localStorage.getItem('comments');
            const comments = commentsStr ? JSON.parse(commentsStr) : [];
            
            comments.push({
                id: comments.length + 1,
                articleId: parseInt(articleId),
                userId: currentUser.id,
                userName: currentUser.fullname,
                text: commentText,
                approved: false, // Admin needs to approve
                createdAt: new Date().toISOString()
            });
            
            localStorage.setItem('comments', JSON.stringify(comments));
            
            document.getElementById('commentText').value = '';
            alert('Bình luận của bạn đã được gửi và đang chờ duyệt!');
        });
    }
    
    // Load article detail if on article page
    if (window.location.pathname.includes('article.html')) {
        loadArticleDetail();
        loadPopularArticles();
    }
});

// Load popular articles
async function loadPopularArticles() {
    try {
        let articles = [];
        
        // Check localStorage first
        const localArticles = localStorage.getItem('articles');
        if (localArticles) {
            articles = JSON.parse(localArticles);
        } else {
            const response = await fetch('data/articles.json');
            articles = await response.json();
        }
        
        const popular = articles.sort((a, b) => b.views - a.views).slice(0, 5);
        const popularContainer = document.getElementById('popularArticles');
        
        if (popularContainer) {
            popularContainer.innerHTML = popular.map(article => `
                <a href="article.html?id=${article.id}" class="sidebar-article">
                    <div class="sidebar-article-image">
                        <img src="${article.image}" alt="${article.title}">
                    </div>
                    <div class="sidebar-article-content">
                        <h4>${article.title}</h4>
                        <div class="sidebar-article-meta">
                            <i class="fas fa-eye"></i> ${article.views} lượt xem
                        </div>
                    </div>
                </a>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading popular articles:', error);
    }
}

// Helper function
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}
