# WanderWise - Your Perfect Stay Companion

WanderWise is a full-stack web application that helps travelers find and book unique accommodations. Built with Node.js, Express, MongoDB, and EJS, it provides a seamless experience for both hosts and guests.

## 🌟 Features

- **User Authentication**
  - Secure signup and login using Passport.js
  - Role-based access (Admin, Host, User)
  - Session-based authentication
  - Flash messages for user feedback

- **Listing Management**
  - Create, read, update, and delete listings
  - Image upload with Cloudinary
  - Advanced search and filtering
  - Location-based suggestions
  - Price range filtering

- **Reviews & Ratings**
  - User reviews for listings
  - Rating system
  - Review management

- **Search & Discovery**
  - Advanced search functionality
  - Auto-suggestions
  - Location-based search
  - Price range filtering
  - Sorting options

- **Responsive Design**
  - Mobile-first approach
  - Bootstrap 5 integration
  - Modern UI/UX

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/wanderwise.git
   cd wanderwise
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string (do NOT hardcode this in app.js)
   SECRET=your_session_secret
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   PORT=3000
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## 🛠️ Tech Stack

- **Backend**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - Passport.js for authentication
  - Express Session

- **Frontend**
  - EJS Templates
  - Bootstrap 5
  - JavaScript (ES6+)
  - AJAX for dynamic content

- **Services**
  - Cloudinary (Image Storage)

## 📁 Project Structure

```
wanderwise/
├── config/
│   └── cloudinary.js
├── middleware/
│   └── auth.js
├── models/
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── routes/
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── utils/
│   ├── ExpressError.js
│   └── wrapAsync.js
├── views/
│   ├── layouts/
│   ├── partials/
│   └── pages/
├── .env
├── .gitignore
├── app.js
└── package.json
```

## 🔒 Security Features

- Session-based authentication with Passport.js
- Password hashing with passport-local-mongoose
- Input validation using Joi
- Role-based access control
- Secure session configuration
- HTTP-only cookies
- Environment variable protection

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📝 API Documentation

The API documentation is available at `/api-docs` when running the server.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Bootstrap for the UI components
- MongoDB for the database
- Cloudinary for image hosting
- All contributors who have helped shape this project

## 📞 Support

For support, email support@wanderwise.com or create an issue in the repository.

