Here is the requirement,

There are 3 features

1. Login
2. Home
3. Self Study

The priority is Self Study Feature

there will be one test case on the login page which is the postive flow

1. We go to the BASE_URL (take from playwright-automation-framework/.env)
2. this is the login page - just check based on the URL, nothing else is needed,
3. use the TEST_USER_EMAIL from env at data-testid="login-user-id-input" and TEST_USER_PASSWORD at data-testid="login-password" and once entering this trigger data-testid="login-submit-button"
4. Post this you will go to the route http://localhost:3000/school/aitutor/home - this is the home page

In the home page

1. Verify based on the url - wait for sometime before doing this, once done
2. Next trigger data-testid="nav-item-Self Study", this will take us to http://localhost:3000/school/aitutor/syllabus route - this is the self study page

In the self study page

1. Verify based on the url - wait for sometime before doing this, once done

For now do this, nothing extra - this can act as test cases as well
