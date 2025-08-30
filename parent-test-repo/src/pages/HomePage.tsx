import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

interface User {
  userId?: number;
  userName?: string;
  email?: string;
  roleId?: number;
  roleName?: string;
}

interface HomePageProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

function HomePage(props: HomePageProps) {
  // Use our custom hook for consistent auth state
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const loginContainerRef = useRef<HTMLDivElement>(null);
  const loginScriptRef = useRef<HTMLScriptElement | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      console.log('User is authenticated, redirecting to dashboard', user);
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Load login microfrontend
  useEffect(() => {
    if (!user) {
      // Only load if user is not authenticated
      const loadLoginMicrofrontend = () => {
        // First, expose React and ReactDOM to the window for the microfrontend to use
        // This is required because the microfrontend was built with external React dependencies
        import('react').then(React => {
          window.React = React;

          import('react-dom').then(ReactDOM => {
            window.ReactDOM = ReactDOM;

            // Now load the microfrontend script after providing React dependencies
            const script = document.createElement('script');
            script.src = 'http://localhost:5173/dist/login-microfrontend.umd.js';
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.onload = () => {
              if (window.LoginMicrofrontend && loginContainerRef.current) {
                // Register event handlers
                const unsubscribeSuccess = window.LoginMicrofrontend.onLoginSuccess((loggedInUser) => {
                  console.log('Login successful:', loggedInUser);

                  // Add detailed debugging to verify the login process
                  console.log('Setting user state and navigating to dashboard');
                  console.log('Current path:', window.location.pathname);

                  // Set user state and force navigation to dashboard
                  setUser(loggedInUser);
                  
                  // Make sure it's also stored in localStorage right away
                  localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
                  
                  // Also update props.setUser for compatibility
                  props.setUser?.(loggedInUser);

                  // Add a small delay to ensure state is updated before navigation
                  setTimeout(() => {
                    console.log('Navigation triggered after delay');
                    console.log('LocalStorage contains:', localStorage.getItem('currentUser'));

                    // Manually unmount the login component before navigation
                    try {
                      console.log('Manually unmounting LoginMicrofrontend before navigation');
                      if (window.LoginMicrofrontend) {
                        window.LoginMicrofrontend.unmount();
                      }
                    } catch (error) {
                      console.error('Error unmounting LoginMicrofrontend:', error);
                    }

                    // Now navigate to dashboard
                    navigate('/dashboard', { replace: true });
                    console.log('Navigate command issued');
                  }, 100);
                });

                const unsubscribeError = window.LoginMicrofrontend.onLoginError((error) => {
                  console.error('Login error:', error);
                });

                // Combine unsubscribe functions
                unsubscribeRef.current = () => {
                  unsubscribeSuccess();
                  unsubscribeError();
                };

                // Render the login component
                window.LoginMicrofrontend.render('login-container');
              }
            };

            // Add script to document
            document.body.appendChild(script);
            loginScriptRef.current = script;
          });
        });
      };

      loadLoginMicrofrontend();
    }

    // Clean up function
    return () => {
      console.log('HomePage cleanup - unmounting login microfrontend');

      // First, unmount the login component if it exists
      if (window.LoginMicrofrontend) {
        try {
          console.log('Calling unmount on LoginMicrofrontend');
          window.LoginMicrofrontend.unmount();
        } catch (error) {
          console.error('Error unmounting LoginMicrofrontend:', error);
        }
      }

      // Clean up event subscriptions
      if (unsubscribeRef.current) {
        console.log('Unsubscribing from login events');
        unsubscribeRef.current();
      }

      // Remove the script element
      if (loginScriptRef.current) {
        console.log('Removing login script from DOM');
        document.body.removeChild(loginScriptRef.current);
      }

      // Clean up global React references by using the any type to bypass type checking
      const win = window as any;
      if ('React' in win) {
        console.log('Removing global React reference');
        delete win.React;
      }
      if ('ReactDOM' in win) {
        console.log('Removing global ReactDOM reference');
        delete win.ReactDOM;
      }

      console.log('HomePage cleanup complete');
    };
  }, [setUser, navigate, user]);

  // If user is already authenticated, don't render the login form at all
  // This helps prevent flickering when refreshing the page
  if (user) {
    return null; // Will redirect to dashboard via useEffect
  }

  return (
    <div className="layout">
      <header>
        <h1>Parent Test App</h1>
      </header>
      <main>
        <h2>Welcome to the Test App</h2>
        <p>Please log in to continue</p>

        <div className="login-container" ref={loginContainerRef} id="login-container">
          {/* Login microfrontend will be loaded here */}
          <p>Loading login component...</p>
        </div>
      </main>
    </div>
  );
}

export default HomePage;