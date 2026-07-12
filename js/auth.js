 
// Authentication for MaintainIQ

const Auth = {
    // Check if user is logged in
    isLoggedIn() {
        return !!Storage.getCurrentUser();
    },
    
    // Get current user
    getCurrentUser() {
        return Storage.getCurrentUser();
    },
    
    // Login user
    login(email, password) {
        const users = Storage.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            Storage.setCurrentUser(user);
            return { success: true, user };
        }
        return { success: false, message: 'Invalid email or password' };
    },
    
    // Signup user
    signup(name, email, password) {
        const users = Storage.getUsers();
        
        // Check if user exists
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'User already exists' };
        }
        
        // Create new user
        const user = {
            id: Utils.generateId(),
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        
        users.push(user);
        Storage.setUsers(users);
        Storage.setCurrentUser(user);
        
        return { success: true, user };
    },
    
    // Logout user
    logout() {
        Storage.setCurrentUser(null);
        window.location.href = 'login.html';
    },
    
    // Check auth and redirect
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    
    // Redirect if already logged in
    redirectIfLoggedIn() {
        if (this.isLoggedIn()) {
            window.location.href = 'index.html';
            return true;
        }
        return false;
    }
};

// Export for browser
window.Auth = Auth;