# vrk-creations
Base Server for the VRK Creations page

# Project Documentation: VRK Creations Backend

This document outlines the key technologies, frameworks, and significant components used in the VRK Creations backend project.

## Core Technologies & Frameworks

*   **Node.js & Express.js**: The primary backend runtime environment and web application framework. Express.js is used for building robust APIs and handling HTTP requests.
    *   **Dependencies**: `express`, `morgan` (HTTP request logger), `cookie-parser`, `http-errors`, `debug`.
*   **MongoDB**: The NoSQL database used for data storage.
    *   **Dependencies**: `mongodb`, `connect-mongo` (MongoDB session store for Express).
*   **Greenlock Express**: Used for automated SSL/TLS certificates, enabling HTTPS for the application.
    *   **Dependencies**: `greenlock-express`.

## Authentication & Session Management

*   **Passport.js**: A flexible authentication middleware for Node.js.
    *   **Strategies**: `passport-custom` (for custom authentication logic) and `passport-google-oauth20` (for Google OAuth 2.0 integration).
    *   **Dependencies**: `passport`, `passport-custom`, `passport-google-oauth20`.
*   **Express Session**: Middleware for managing user sessions.
    *   **Dependencies**: `express-session`.
*   **Connect Ensure Login**: Middleware to ensure a user is authenticated before accessing certain routes.
    *   **Dependencies**: `connect-ensure-login`.

## File Handling & Storage

*   **Multer**: Middleware for handling `multipart/form-data`, primarily used for file uploads.
    *   **Dependencies**: `multer`.
*   **GridFS-Stream**: Used for streaming files to and from MongoDB's GridFS, suitable for storing large files.
    *   **Dependencies**: `gridfs-stream`.
*   **MIME Type Detection**: Libraries for detecting and handling MIME types.
    *   **Dependencies**: `mime`, `mime-type`.

## Utilities & Integrations

*   **Dotenv**: Loads environment variables from a `.env` file into `process.env`.
    *   **Dependencies**: `dotenv`.
*   **CORS**: Middleware to enable Cross-Origin Resource Sharing, allowing requests from different domains.
    *   **Dependencies**: `cors`.
*   **Nocache**: Middleware to disable client-side caching.
    *   **Dependencies**: `nocache`.
*   **Moment.js**: A lightweight JavaScript date library for parsing, validating, manipulating, and formatting dates.
    *   **Dependencies**: `moment`.
*   **Underscore.js**: A utility-belt library for JavaScript that provides helper functions for common programming tasks.
    *   **Dependencies**: `underscore`.
*   **Express HTTP Proxy**: Middleware for proxying HTTP requests.
    *   **Dependencies**: `express-http-proxy`.
*   **Jade (Pug)**: A high-performance template engine heavily influenced by Haml. While listed as a dependency, its explicit usage in the current project structure is not immediately apparent from file extensions. It might be used for specific, limited templating needs.
    *   **Dependencies**: `jade`.

## Project Structure Overview

The project follows a structured approach, likely an MVC-like pattern, with clear separation of concerns:

*   **`src/constants`**: Contains application-wide constants and configuration values.
*   **`src/controllers`**: Implements the core business logic and handles incoming requests, interacting with services and models.
*   **`src/model`**: Defines data models and interacts directly with the MongoDB database.
*   **`src/routers`**: Defines API endpoints and routes, mapping them to corresponding controller functions.
*   **`src/services`**: Encapsulates external integrations (e.g., Sentry, Slack, WhatsApp, IFTTT) and core functionalities (e.g., authentication, file operations, MongoDB interactions).
*   **`src/utils`**: Provides general utility functions used across the application.
*   **`public/`**: Serves static assets such as stylesheets (`public/stylesheets/style.css`), and potentially user-uploaded data (`public/data/uploads/`).
*   **`static/`**: Likely used to serve built frontend applications (e.g., `static/site`, `static/wedsite`), which are built by separate frontend projects as indicated by `package.json` scripts.

## Crawler Traps

The application includes a set of "crawler traps" designed to identify and block malicious bots and crawlers that scan for sensitive files. These traps are implemented in `src/routers/trap.js` and work by responding with a large amount of data to overwhelm the crawler, while also sending a notification to Slack.

Key trapped routes include:
*   `/.env`
*   `/wp-config.php`
*   `/config.js`
*   `/.aws/credentials`
*   `/.git/config`
*   `/docker-compose.yml`
*   `/config/database.yml`
*   `/wp-admin`
*   `/phpmyadmin`
*   `/.ssh/id_rsa`

## Development Dependencies

*   **Nodemon**: A utility that monitors for any changes in your source and automatically restarts your server. Used for development purposes.
    *   **Dependencies**: `nodemon`.
