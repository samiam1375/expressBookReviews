const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// This should be stored securely, e.g., in environment variables
const JWT_SECRET = "your_jwt_secret_key"; // IMPORTANT: Replace with a strong, secret key

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    // Hint: Use the session authorization feature
    if (req.session.authorization) { // Check if session has authorization details
        let token = req.session.authorization['accessToken']; // Assuming the JWT is stored under 'accessToken' in the session

        if (token) {
            jwt.verify(token, JWT_SECRET, (err, user) => {
                if (!err) {
                    req.user = user; // Attach user payload to the request
                    next(); // Proceed to the next middleware/route handler
                } else {
                    // Token is invalid or expired
                    return res.status(403).json({ message: "User not authenticated or token invalid." });
                }
            });
        } else {
            // Token was not found in the session authorization object
            return res.status(401).json({ message: "No access token found in session. User not logged in." });
        }
    } else {
        // No authorization object found in the session
        return res.status(401).json({ message: "No session authorization found. User not logged in." });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
