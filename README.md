# Simple Bank Application

**Description:**
A Beginner Express.js web application with MySQL database to simulate basic banking functionalities. The application provides both Customer and Admin user interfaces. Customers can perform actions such as creating an account, sending money, depositing money, requesting a loan, and withdrawing money. Admins receive and fulfill these requests, and Customers receive message notifications on their UI.

**Features:**

1. **Customer UI:**
   - Create an account.
   - Send money to other accounts.
   - Deposit money into the account.
   - Request a loan.
   - Withdraw money from the account.

2. **Admin UI:**
   - Receive and fulfill customer requests.
   - Send message notifications to users.

**Technologies:**

- **Express.js:**
  - The backend framework for handling HTTP requests, routing, and business logic.

- **MySQL:**
  - The database to store user accounts, transactions, and requests.

**Project Structure:**
The project follows a simple structure with separate routes and controllers for customers and admins.

- **`/customer` Endpoint:**
  - Handles customer-related functionalities.

- **`/admin` Endpoint:**
  - Manages admin-related actions.

**Database Schema:**
- `users` table: Stores customer account information.
- `transactions` table: Records transaction history.
- `requests` table: Captures customer requests for admins to fulfill.

**Installation:**

1. Clone the repository:
