import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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

function HomePage({ user, setUser }: HomePageProps) {
  const navigate = useNavigate();
  const loginContainerRef = useRef<HTMLDivElement>(null);
  const loginScriptRef = useRef<HTMLScriptElement | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
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
                  setUser(loggedInUser);
                  navigate('/dashboard');
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
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (loginScriptRef.current) {
        document.body.removeChild(loginScriptRef.current);
      }
      
      // Clean up global React references by using the any type to bypass type checking
      const win = window as any;
      if ('React' in win) {
        delete win.React;
      }
      if ('ReactDOM' in win) {
        delete win.ReactDOM;
      }
    };
  }, [setUser, navigate, user]);

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