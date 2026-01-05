// ===== ARTICLE & CATEGORY PAGE LOGIC =====

// Get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Load category page
async function loadCategoryPage() {
    try {
        const categoryId = getUrlParameter('id');
        const searchQuery = getUrlParameter('search');
        
        let articles = [];
        let allArticles = [];
        
        // Check localStorage first
        const localArticles = localStorage.getItem('articles');
        if (localArticles) {
            allArticles = JSON.parse(localArticles);
            articles = [...allArticles];
        } else {
            const articlesRes = await fetch('data/articles.json');
            allArticles = await articlesRes.json();
            articles = [...allArticles];
        }
        
        const categoriesRes = await fetch('data/categories.json');
        const categories = await categoriesRes.json();
        
        // Update category icon and info
        const categoryIcon = document.getElementById('categoryIcon');
        
        // Filter by category
        if (categoryId) {
            articles = articles.filter(a => a.categoryId == categoryId);
            const category = categories.find(c => c.id == categoryId);
            if (category) {
                document.getElementById('categoryTitle').textContent = category.name;
                document.getElementById('categoryDescription').textContent = category.description;
                document.getElementById('breadcrumbCategory').textContent = category.name;
                if (categoryIcon) {
                    categoryIcon.innerHTML = `<i class="${category.icon}"></i>`;
                }
            }
        }
        
        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            articles = articles.filter(a => 
                a.title.toLowerCase().includes(query) || 
                a.excerpt.toLowerCase().includes(query) ||
                a.content.toLowerCase().includes(query)
            );
            document.getElementById('categoryTitle').textContent = `Kết quả tìm kiếm: "${searchQuery}"`;
            document.getElementById('categoryDescription').textContent = `Tìm thấy ${articles.length} bài viết`;
        }
        
        // Update stats
        updateCategoryStats(articles, allArticles);
        
        // Load sidebar categories with count
        const sidebarCategories = document.getElementById('sidebarCategories');
        if (sidebarCategories) {
            sidebarCategories.innerHTML = `
                <li>
                    <a href="category.html" class="${!categoryId ? 'active' : ''}">
                        <span>Tất cả bài viết</span>
                        <span class="count">${allArticles.length}</span>
                    </a>
                </li>
            ` + categories.map(cat => {
                const count = allArticles.filter(a => a.categoryId == cat.id).length;
                return `
                    <li>
                        <a href="category.html?id=${cat.id}" class="${cat.id == categoryId ? 'active' : ''}">
                            <span><i class="${cat.icon}"></i> ${cat.name}</span>
                            <span class="count">${count}</span>
                        </a>
                    </li>
                `;
            }).join('');
        }
        
        // Display articles
        displayArticles(articles);
        
        // Load popular articles
        loadPopularArticles();
        
        // Sort functionality
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                const sorted = sortArticles(articles, this.value);
                displayArticles(sorted);
            });
        }
        
        // View toggle functionality
        setupViewToggle();
        
    } catch (error) {
        console.error('Error loading category page:', error);
    }
}

// Update category stats
function updateCategoryStats(articles, allArticles) {
    const totalArticles = document.getElementById('totalArticles');
    const totalViews = document.getElementById('totalViews');
    
    if (totalArticles) {
        totalArticles.textContent = articles.length;
    }
    
    if (totalViews) {
        const views = articles.reduce((sum, a) => sum + (a.views || 0), 0);
        totalViews.textContent = views.toLocaleString('vi-VN');
    }
}

// Setup view toggle
function setupViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const articlesList = document.getElementById('articlesList');
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.dataset.view;
            if (view === 'grid') {
                articlesList.classList.add('grid-view');
            } else {
                articlesList.classList.remove('grid-view');
            }
        });
    });
}

// Display articles
function displayArticles(articles, page = 1, perPage = 10) {
    currentArticles = articles;
    currentPage = page;
    
    const articlesList = document.getElementById('articlesList');
    const articleCount = document.getElementById('articleCount');
    const pagination = document.getElementById('pagination');
    const emptyState = document.getElementById('emptyState');
    
    if (articleCount) {
        articleCount.textContent = `${articles.length} bài viết`;
    }
    
    // Pagination
    const totalPages = Math.ceil(articles.length / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedArticles = articles.slice(start, end);
    
    if (articlesList) {
        if (paginatedArticles.length === 0) {
            articlesList.style.display = 'none';
            if (emptyState) {
                emptyState.style.display = 'block';
            }
        } else {
            articlesList.style.display = 'flex';
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            articlesList.innerHTML = paginatedArticles.map(article => createArticleItem(article)).join('');
        }
    }
    
    // Pagination controls
    if (pagination) {
        if (totalPages > 1) {
            let paginationHTML = '';
            
            paginationHTML += `<button ${page === 1 ? 'disabled' : ''} onclick="changePage(${page - 1})">
                <span><i class="fas fa-chevron-left"></i> Trước</span>
            </button>`;
            
            // Show max 5 page numbers
            let startPage = Math.max(1, page - 2);
            let endPage = Math.min(totalPages, startPage + 4);
            
            if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
            }
            
            if (startPage > 1) {
                paginationHTML += `<button onclick="changePage(1)"><span>1</span></button>`;
                if (startPage > 2) {
                    paginationHTML += `<span class="page-info">...</span>`;
                }
            }
            
            for (let i = startPage; i <= endPage; i++) {
                paginationHTML += `<button class="${i === page ? 'active' : ''}" onclick="changePage(${i})">
                    <span>${i}</span>
                </button>`;
            }
            
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    paginationHTML += `<span class="page-info">...</span>`;
                }
                paginationHTML += `<button onclick="changePage(${totalPages})"><span>${totalPages}</span></button>`;
            }
            
            paginationHTML += `<button ${page === totalPages ? 'disabled' : ''} onclick="changePage(${page + 1})">
                <span>Sau <i class="fas fa-chevron-right"></i></span>
            </button>`;
            
            pagination.innerHTML = paginationHTML;
            pagination.style.display = 'flex';
        } else {
            pagination.style.display = 'none';
        }
    }
}

// Sort articles
function sortArticles(articles, sortBy) {
    let sorted = [...articles];
    
    switch(sortBy) {
        case 'latest':
            sorted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
            break;
        case 'popular':
            sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            break;
        case 'oldest':
            sorted.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
            break;
        case 'views':
            sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
    }
    
    return sorted;
}

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

// Create article item (reuse from app.js)
function createArticleItem(article) {
    const date = new Date(article.publishedAt).toLocaleDateString('vi-VN');
    return `
        <a href="article.html?id=${article.id}" class="article-item">
            <div class="article-item-image">
                <img src="${article.image}" alt="${article.title}">
            </div>
            <div class="article-item-content">
                <div class="article-card-meta">
                    <span><i class="fas fa-calendar"></i> ${date}</span>
                    <span><i class="fas fa-eye"></i> ${article.views} lượt xem</span>
                    <span><i class="fas fa-user"></i> ${article.author}</span>
                </div>
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
            </div>
        </a>
    `;
}

// Change page function (for pagination)
let currentArticles = [];
let currentPage = 1;

function changePage(page) {
    currentPage = page;
    displayArticles(currentArticles, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize category page
if (window.location.pathname.includes('category.html')) {
    document.addEventListener('DOMContentLoaded', loadCategoryPage);
}
