# 🍳 Recipe & Theme Forum Application

A full-stack web application built with **Node.js/Express** backend and **Angular** frontend, featuring a recipe sharing platform with advanced security features.

## ✨ Features

- **🍽️ Recipe Management** - Create, edit, and share recipes
- **📰 News System** - Publish and manage news articles
- **📅 Course Scheduling** - Manage cooking courses and schedules
- **🔐 Advanced Security** - SQL injection protection, XSS prevention, rate limiting
- **👥 User Management** - User registration, authentication, and role-based access
- **💬 Comments & Ratings** - Interactive recipe feedback system
- **📱 Responsive Design** - Modern, mobile-friendly interface

## 🏗️ Architecture

```
├── Backend (Node.js/Express)
│   ├── RESTful API endpoints
│   ├── Security middleware
│   ├── File-based JSON storage
│   └── Advanced validation
├── Frontend (Angular)
│   ├── Component-based architecture
│   ├── Reactive forms
│   ├── HTTP interceptors
│   └── Responsive UI
└── Security Features
    ├── SQL injection protection
    ├── XSS prevention
    ├── Rate limiting
    ├── CORS configuration
    └── Helmet security headers
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **MongoDB** 6.0 (optional - app uses file-based storage by default)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd zloiadkovcii-main
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cd ../server
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the backend server**
   ```bash
   cd server
   node index.js
   # Server runs on http://localhost:3000
   ```

6. **Start the frontend application**
   ```bash
   cd client
   npm start
   # Frontend runs on http://localhost:4200
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:4200

# Database (optional - app uses file-based storage by default)
MONGODB_URI=mongodb://localhost:27017/recipe-forum

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### Security Features

The application includes comprehensive security measures:

- **SQL Injection Protection** - Advanced pattern detection
- **XSS Prevention** - Input sanitization and validation
- **Rate Limiting** - Configurable request throttling
- **CORS Protection** - Cross-origin request security
- **Helmet Headers** - Security HTTP headers
- **Input Validation** - Comprehensive form validation

## 📚 API Endpoints

### Public Endpoints
- `GET /api/themes` - Get all recipes
- `GET /api/news` - Get news articles
- `GET /api/course-schedules` - Get course schedules

### Protected Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `GET /api/admin/*` - Admin-only operations

## 🛠️ Development

### Available Scripts

#### Backend (server/)
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm test           # Run tests
npm run security:audit  # Security audit
```

#### Frontend (client/)
```bash
npm start          # Start development server
npm run build      # Build for production
npm run test       # Run unit tests
npm run lint       # Run linting
```

### Code Quality

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit validation

## 🔒 Security Features

### Middleware Stack
1. **Helmet** - Security headers
2. **CORS** - Cross-origin protection
3. **Rate Limiting** - Request throttling
4. **Input Validation** - Data sanitization
5. **SQL Injection Protection** - Pattern detection
6. **XSS Prevention** - Content sanitization

### Security Patterns
- Comprehensive input validation
- Output encoding
- CSRF protection
- Secure session management
- Role-based access control

## 📁 Project Structure

```
├── server/                 # Backend application
│   ├── src/               # Source code
│   │   ├── controllers/   # API controllers
│   │   ├── middleware/    # Security & auth middleware
│   │   ├── models/        # Data models
│   │   ├── router/        # API routes
│   │   └── utils/         # Utility functions
│   ├── config/            # Configuration files
│   ├── tests/             # Test files
│   └── index.js           # Main server file
├── client/                # Frontend application
│   ├── src/               # Angular source
│   │   ├── app/           # Application components
│   │   ├── shared/        # Shared services & models
│   │   └── assets/        # Static assets
│   └── angular.json       # Angular configuration
└── docs/                  # Documentation
```

## 🧪 Testing

### Backend Tests
```bash
cd server
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:security      # Security tests
npm run test:all           # All tests
```

### Frontend Tests
```bash
cd client
npm test                   # Unit tests
npm run test:watch         # Watch mode
```

## 🚀 Deployment

### Production Build

1. **Build frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Configure production environment**
   ```bash
   cd server
   NODE_ENV=production node index.js
   ```

### Docker Support

The application can be containerized using Docker:

```dockerfile
# Example Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-username/your-repo/issues) page
2. Review the documentation
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- **Express.js** - Web framework
- **Angular** - Frontend framework
- **Security libraries** - Various security packages
- **Community** - Open source contributors

---

**Built with ❤️ using modern web technologies**
