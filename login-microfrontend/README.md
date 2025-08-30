# Login Microfrontend

A React-based login microfrontend that can be embedded in any application. This component provides a complete authentication flow including login form, validation, and API integration.

## Features

- Complete login form with validation
- Authentication API integration
- Event-based communication with parent applications
- Clean, modern UI with Tailwind CSS
- Fully typed with TypeScript
- Configurable branding and features

## Installation

### Using npm

```bash
npm install login-microfrontend
```

### Using a CDN

```html
<script src="https://unpkg.com/react@19/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js" crossorigin></script>
<script src="https://your-cdn-url/login-microfrontend.umd.js"></script>
```

## Usage

### Basic Usage

The login microfrontend can be used in two ways:

#### 1. UMD Script Tag (Global Variable)

```html
<!-- Include React dependencies -->
<script src="https://unpkg.com/react@19/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js" crossorigin></script>

<!-- Include the login microfrontend script -->
<script src="./dist/login-microfrontend.umd.js"></script>

<script>
  // Render the login form in a container
  window.LoginMicrofrontend.render('login-container');
  
  // Listen for login success events
  window.LoginMicrofrontend.onLoginSuccess((user) => {
    console.log('User logged in:', user);
    // Redirect or update UI as needed
  });
</script>

<!-- Container where the login form will be rendered -->
<div id="login-container"></div>
```

#### 2. ES Module Import

```javascript
import { createMicrofrontendAPI } from 'login-microfrontend';

// Create an instance of the API
const loginApp = createMicrofrontendAPI();

// Render the login form
loginApp.render('login-container');

// Subscribe to events
const unsubscribe = loginApp.onLoginSuccess((user) => {
  console.log('User logged in:', user);
  // Handle successful login
});

// Later, unsubscribe if needed
unsubscribe();
```

## API Reference

### Global API

The login microfrontend exposes a global `window.LoginMicrofrontend` object with the following methods:

#### Configuration

```javascript
// Configure the microfrontend
LoginMicrofrontend.configure({
  branding: {
    logo: 'https://example.com/logo.png',
    primaryColor: '#4285f4',
    companyName: 'Your Company'
  },
  features: {
    rememberMe: true,
    socialLogin: false,
    passwordReset: true
  }
});
```

#### Authentication Methods

```javascript
// Programmatically trigger login
const success = await LoginMicrofrontend.login('username', 'password');

// Logout the current user
LoginMicrofrontend.logout();

// Check if user is authenticated
const isAuth = LoginMicrofrontend.isAuthenticated();

// Get the current user data
const user = LoginMicrofrontend.getCurrentUser();
```

#### Event Handling

```javascript
// Listen for login success
const unsubscribeSuccess = LoginMicrofrontend.onLoginSuccess((user) => {
  console.log('Login successful', user);
});

// Listen for login errors
const unsubscribeError = LoginMicrofrontend.onLoginError((error) => {
  console.error('Login failed', error);
});

// Listen for logout events
const unsubscribeLogout = LoginMicrofrontend.onLogout(() => {
  console.log('User logged out');
});

// Unsubscribe when no longer needed
unsubscribeSuccess();
unsubscribeError();
unsubscribeLogout();
```

#### UI Methods

```javascript
// Render the login form in a container
LoginMicrofrontend.render('container-id', {
  // Optional configuration override
  branding: {
    primaryColor: '#00ff00'
  }
});

// Unmount the login form
LoginMicrofrontend.unmount();
```

## Environment Variables

The login microfrontend requires the following environment variables:

```
VITE_API_URL                    # Main API endpoint for authentication
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing

To test the integration with a parent application, you can use the included `integration-test.html` file:

1. Build the microfrontend: `npm run build`
2. Open `integration-test.html` in a browser
3. Test the login functionality and API methods

## License

MIT