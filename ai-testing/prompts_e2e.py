BASE_PROMPT = """

**Objective:**

As a QA engineer performing regression you will make sure that all test flows listed were executed successfully.
If test passes you will log Flow name: passed.
If test fails or you are not sure if it passes you will log Flow name: failed and step on which it failed. Add possible root cause if you can identify it.

**Important:**
- Mark test as passed only if you are sure that all steps were executed successfully and in accordance with AC
- Log all the selectors used throughout each test in format: step_name: action_performed: selector_used
---
*** Flow: {scenario_name} ***
---
 **Steps:**
{steps}

**Important:** Use only test data provided in test case. Do not use any other extra data.
**Important:** Ensure efficiency and accuracy throughout the process.
"""


class PromptE2E:
    def __init__(self, scenario_name, steps):
        self.scenario_name = scenario_name
        self.content = BASE_PROMPT.format(scenario_name=scenario_name, steps=steps)

LOGIN_PROMPT = PromptE2E("Login_Flow", """
 1.  Navigate to http://localhost:5173/login
 2.  Find the username input field (it has id="login-username").
 3.  Enter 'testuser' into the username input field.
 4.  Make sure the username field contains 'testuser'. If not, clear and re-enter.
 5.  Find and click the Login/Submit button (it has id="login-submit-btn").
 6.  Wait for the page to navigate away from /login.

 **Expected Result:**
 *   The user is redirected to the dashboard page (URL should be http://localhost:5173/ or http://localhost:5173).
 *   The text "Welcome, testuser!" is visible on the page.
 *   A job creation form section is visible on the dashboard.
""")

JOB_CREATION_PROMPT = PromptE2E("Job_Creation", """
 1.  Navigate to http://localhost:5173/login
 2.  Find the username input field (id="login-username").
 3.  Enter 'testuser' into the username input field.
 4.  Make sure the username field contains 'testuser'. If not, clear and re-enter.
 5.  Click the Login/Submit button (id="login-submit-btn").
 6.  Wait for the dashboard page to load. Verify that the job creation form is visible (id="job-form-section").
 7.  Find the text input area for creating a new job/task (id="job-text-input").
 8.  Enter the following text into the job text input: 'Some test text for NLP analysis.'
 9.  Make sure the text input contains the entered text.
 10. Find and click the Submit/Create job button (id="submit-job-btn").
 11. Wait for the response.

 **Expected Result:**
 *   A success message "Analysis started!" is visible on the page.
 *   The job/task appears in the job list section.
""")

VALIDATION_ERROR_PROMPT = PromptE2E("Validation_Error", """
 1.  Navigate to http://localhost:5173/login
 2.  Find the username input field (id="login-username").
 3.  Enter 'testuser' into the username input field.
 4.  Make sure the username field contains 'testuser'. If not, clear and re-enter.
 5.  Click the Login/Submit button (id="login-submit-btn").
 6.  Wait for the dashboard page to load. Verify that the job creation form is visible (id="job-form-section").
 7.  Find the text input area for creating a new job/task (id="job-text-input").
 8.  Enter the short text 'short' into the job text input (this is intentionally too short to pass validation).
 9.  Find and click the Submit/Create job button (id="submit-job-btn").
 10. Wait for validation feedback.

 **Expected Result:**
 *   A validation error message "Text must be at least 10 characters long" is visible on the page.
 *   No success message appears.
 *   The user stays on the same dashboard page.
""")

LOGIN_NEGATIVE_PROMPT = PromptE2E("Login_Negative", """
 1.  Navigate to http://localhost:5173/login
 2.  Do NOT enter any text into the username input field (id="login-username"). Leave it empty.
 3.  Click the Login/Submit button (id="login-submit-btn").
 4.  Wait for any feedback.

 **Expected Result:**
 *   The user stays on the login page (URL remains http://localhost:5173/login).
 *   An error or validation message is displayed indicating that username is required.
 *   The user is NOT redirected to the dashboard.
""")
