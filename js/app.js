// ===== HOME PAGE LOGIC =====

// Load categories
async function loadCategories() {
    try {
        const response = await fetch('data/categories.json');
        const categories = await response.json();
        
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (categoriesGrid) {
            categoriesGrid.innerHTML = categories.map(cat => `
                <a href="category.html?id=${cat.id}" class="category-card">
                    <i class="${cat.icon}"></i>
                    <h3>${cat.name}</h3>
                    <p>${cat.description}</p>
                </a>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load articles
async function loadArticles() {
    try {
        let articles = [];
        
        // Check localStorage first
        const localArticles = localStorage.getItem('articles');
        if (localArticles) {
            articles = JSON.parse(localArticles);
        } else {
            // Load from JSON if no localStorage
            const response = await fetch('data/articles.json');
            articles = await response.json();
        }
        
        // Featured articles
        const featuredArticles = articles.filter(a => a.featured).slice(0, 3);
        const featuredGrid = document.getElementById('featuredArticles');
        if (featuredGrid) {
            featuredGrid.innerHTML = featuredArticles.map(article => createArticleCard(article)).join('');
        }
        
        // Latest articles
        const latestArticles = articles.sort((a, b) => 
            new Date(b.publishedAt) - new Date(a.publishedAt)
        ).slice(0, 6);
        const latestList = document.getElementById('latestArticles');
        if (latestList) {
            latestList.innerHTML = latestArticles.map(article => createArticleItem(article)).join('');
        }
    } catch (error) {
        console.error('Error loading articles:', error);
    }
}

// Create article card HTML
function createArticleCard(article) {
    const date = new Date(article.publishedAt).toLocaleDateString('vi-VN');
    return `
        <a href="article.html?id=${article.id}" class="article-card">
            <div class="article-card-image">
                <img src="${article.image}" alt="${article.title}">
            </div>
            <div class="article-card-content">
                <div class="article-card-meta">
                    <span><i class="fas fa-calendar"></i> ${date}</span>
                    <span><i class="fas fa-eye"></i> ${article.views}</span>
                </div>
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
            </div>
        </a>
    `;
}

// Create article item HTML (list view)
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

// Initialize home page
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadArticles();
});
