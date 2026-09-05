🌍 Wanderlust
<p align="center"> <strong>A full-stack travel listing platform built with Node.js, Express.js, MongoDB & EJS</strong> </p>

<p align="center"> <img src="https://img.shields.io/badge/Node.js-Backend-green?logo=node.js" alt="Node.js"> <img src="https://img.shields.io/badge/Express.js-Framework-black?logo=express" alt="Express.js"> <img src="https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb" alt="MongoDB"> <img src="https://img.shields.io/badge/EJS-Templating-blue" alt="EJS"> <img src="https://img.shields.io/badge/Status-In%20Development-orange" alt="Status"> </p>

📌 Overview
Wanderlust is a full-stack travel listing web application designed to provide a platform where users can discover places, create and manage listings, and share their experiences through reviews.

The project is being developed as a hands-on full-stack web development project, with a focus on backend architecture, RESTful routing, database management, authentication, authorization, validation, and cloud-based image storage.

🚧 Project Status: Actively under development. New features and improvements are being added regularly.

✨ Key Features
🏡 Listings
Browse available travel/property listings

View detailed information about each listing

Create new listings

Edit existing listings

Delete listings

Upload and manage listing images

👤 User Authentication
User registration

User login and logout

Protected routes

Authentication-based access control

Authorization for listing and review operations

⭐ Reviews
Add reviews to listings

Display user reviews

Delete reviews

Rating functionality

Server-side validation

☁️ Image Management
Cloudinary integration

Cloud-based image upload

Image URL management

🛡️ Error Handling & Validation
Custom error handling

Async error handling

Request validation

Middleware-based authorization

🛠️ Tech Stack
Technology	Purpose
HTML5	Page structure
CSS3	Styling & responsive UI
JavaScript	Client-side functionality
EJS	Server-side templating
Bootstrap	UI components & responsive design
Node.js	Backend runtime
Express.js	Web framework & RESTful routing
MongoDB	Database
Mongoose	MongoDB ODM
Cloudinary	Image storage
Git & GitHub	Version control
🏗️ Project Architecture
Wanderlust/
│
├── controllers/          # Application/business logic
│   ├── listings.js
│   ├── reviews.js
│   └── users.js
│
├── init/                 # Database initialization & seed data
│   ├── data.js
│   └── index.js
│
├── models/               # Mongoose database models
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── public/               # Static assets
│   ├── css/
│   │   ├── rating.css
│   │   └── style.css
│   └── js/
│       └── script.js
│
├── routes/               # Application routes
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── utils/                # Reusable utility functions
│   ├── ExpressError.js
│   └── wrapAsync.js
│
├── views/                # EJS templates
│   ├── includes/
│   ├── layouts/
│   ├── listings/
│   └── users/
│
├── .env                  # Environment variables (not committed)
├── app.js                # Main application entry point
├── cloudConfig.js        # Cloudinary configuration
├── middleware.js         # Custom middleware
├── package.json
└── package-lock.json
🔄 Application Flow
User
  │
  ▼
EJS Views
  │
  ▼
Express Routes
  │
  ▼
Controllers
  │
  ▼
Mongoose Models
  │
  ▼
MongoDB
For image uploads:

User → Express → Cloudinary → Image URL → MongoDB
🚀 Getting Started
Prerequisites
Make sure you have the following installed:

Node.js

MongoDB / MongoDB Atlas account

Cloudinary account

Git

1. Clone the repository
git clone https://github.com/YOUR-USERNAME/Wanderlust.git
cd Wanderlust
2. Install dependencies
npm install
3. Configure environment variables
Create a .env file in the root directory:

ATLASDB_URL=your_mongodb_connection_string

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret

SECRET=your_session_secret
🔐 Security: Never commit .env, API keys, database credentials, or other secrets to GitHub.

4. Run the application
Development:

nodemon app.js
Or:

node app.js
Open your browser at:

http://localhost:8080
📊 Current Development Progress
Project structure

Express server setup

MongoDB/Mongoose integration

Listing model and routes

Review model and routes

User model and routes

EJS layouts and views

Custom middleware

Error handling utilities

Basic authentication flow

Cloudinary configuration

Complete remaining UI improvements

Complete additional features

Production deployment

Final testing and optimization

🔮 Future Roadmap
Planned improvements include:

🔎 Advanced search and filtering

🗺️ Interactive maps and location services

📅 Booking/reservation functionality

❤️ Wishlist/favourite listings

👤 User profile and dashboard

📱 Improved mobile responsiveness

⚡ Performance optimization

🧪 More comprehensive testing

🚀 Production deployment

🔐 Security
The project follows common security practices including:

Environment variables for sensitive credentials

Authentication and authorization

Server-side validation

Protected routes

Custom error handling

Sensitive configuration files such as .env are intentionally excluded from version control.


🤝 Contributing
This is currently a personal learning and development project. Suggestions and constructive feedback are welcome.

If you would like to contribute:

git fork
git clone <your-fork>
git checkout -b feature/your-feature
Make your changes, commit them, and create a pull request.

👩‍💻 Author
Dipanjali Gupta

Computer Science & Engineering Student

Interested in:

Full-Stack Development

MERN Stack

Data Structures & Algorithms

Software Engineering

📄 License
This project is currently intended for educational and portfolio purposes.

<p align="center"> ⭐ If you find this project interesting, consider giving it a star! <