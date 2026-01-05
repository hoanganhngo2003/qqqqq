# Website Kỹ Thuật Chăn Nuôi - HA Farm Academy

Website cung cấp kiến thức chuyên môn về kỹ thuật chăn nuôi gia súc, gia cầm và thủy sản.

## 🚀 Tính năng chính

### Người dùng
- 📰 Xem bài viết theo danh mục (Heo, Bò-Trâu, Gà-Vịt, Dê-Cừu, Thủy sản, Phòng bệnh)
- 🔍 Tìm kiếm bài viết
- 💬 Bình luận và thảo luận
- 🔖 Lưu bài viết yêu thích
- 👤 Quản lý trang cá nhân
- ❓ Hỏi đáp với chuyên gia
- 📧 Liên hệ gửi câu hỏi

### Admin
- 📝 Quản lý bài viết (CRUD)
- 👥 Quản lý người dùng
- 💬 Quản lý bình luận
- ❓ Quản lý câu hỏi và trả lời
- 📬 Quản lý liên hệ
- 📊 Dashboard thống kê

## 🛠️ Công nghệ sử dụng

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js (Express)
- **Database**: LocalStorage (JSON)
- **Icons**: Font Awesome 6.4.0

## 📁 Cấu trúc thư mục

```
├── admin/              # Trang quản trị
│   ├── dashboard.html
│   ├── articles.html
│   ├── users.html
│   ├── comments.html
│   ├── questions.html
│   └── contacts.html
├── css/               # Stylesheet
│   ├── main.css
│   ├── admin.css
│   └── responsive.css
├── js/                # JavaScript
│   ├── app.js
│   ├── auth.js
│   ├── admin.js
│   ├── article.js
│   ├── comment.js
│   └── profile.js
├── data/              # Dữ liệu JSON
│   ├── articles.json
│   ├── categories.json
│   ├── users.json
│   ├── comments.json
│   └── contacts.json
├── image/             # Hình ảnh
├── index.html         # Trang chủ
├── category.html      # Danh mục
├── article.html       # Chi tiết bài viết
├── contact.html       # Liên hệ
├── faq.html          # Câu hỏi thường gặp
├── about.html        # Giới thiệu
├── search.html       # Tìm kiếm
├── login.html        # Đăng nhập
├── register.html     # Đăng ký
├── profile.html      # Trang cá nhân
├── 404.html          # Trang lỗi
└── server.js         # Server Node.js
```

## 🚦 Cài đặt và chạy

### Yêu cầu
- Node.js (v14 trở lên)
- npm hoặc yarn

### Cài đặt

```bash
# Clone repository
git clone <repository-url>

# Di chuyển vào thư mục
cd website-chan-nuoi

# Cài đặt dependencies
npm install
```

### Chạy ứng dụng

```bash
# Khởi động server
npm start

# Hoặc
node server.js
```

Truy cập: `http://localhost:3000`

## 👤 Tài khoản mặc định

### Admin
- **Email**: admin@channuoi.vn
- **Mật khẩu**: admin123

## 📱 Responsive Design

Website tương thích với:
- 💻 Desktop (1200px+)
- 📱 Tablet (768px - 1199px)
- 📱 Mobile (< 768px)

## 🎨 Danh mục chăn nuôi

1. **Kỹ thuật nuôi heo** - Hướng dẫn chăn nuôi heo
2. **Kỹ thuật nuôi bò - trâu** - Bò sữa, bò thịt
3. **Kỹ thuật nuôi gà - vịt** - Chăn nuôi gia cầm
4. **Kỹ thuật nuôi dê - cừu** - Chăn nuôi dê và cừu
5. **Kỹ thuật nuôi thủy sản** - Nuôi cá, tôm
6. **Phòng và trị bệnh** - Phòng ngừa và điều trị

## 📄 License

© 2024 HA Farm Academy. All rights reserved.

## 👨‍💻 Phát triển bởi

HA Farm Academy Team
