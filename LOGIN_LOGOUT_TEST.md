# Login and Logout Functionality Test

## Test Cases

### 1. Login Functionality
- [ ] **Valid Login**: Enter valid credentials (admin@company.com / password)
  - Should show loading spinner
  - Should redirect to dashboard
  - Should show welcome toast notification
  - Should display user info in header and sidebar

- [ ] **Invalid Login**: Enter invalid credentials
  - Should show error message with icon
  - Should not redirect to dashboard
  - Should clear error on retry

- [ ] **Empty Fields**: Submit form with empty fields
  - Should not submit form
  - Should show validation

### 2. Logout Functionality
- [ ] **Header Logout**: Click logout button in header
  - Should show loading spinner
  - Should redirect to login page
  - Should clear user data from localStorage

- [ ] **Sidebar Logout**: Click logout button in sidebar
  - Should show loading spinner
  - Should redirect to login page
  - Should clear user data from localStorage

### 3. Authentication State Management
- [ ] **Page Refresh**: Refresh page while logged in
  - Should maintain login state
  - Should not redirect to login page

- [ ] **Token Expiry**: Clear localStorage manually
  - Should redirect to login page
  - Should clear user state

### 4. UI/UX Features
- [ ] **Loading States**: All buttons show loading spinners
- [ ] **Error Handling**: Proper error messages with icons
- [ ] **Success Feedback**: Welcome toast on successful login
- [ ] **Responsive Design**: Works on mobile and desktop

## Demo Accounts
- **Admin**: admin@company.com / password
- **HR**: hr@company.com / password  
- **Employee**: employee@company.com / password

## Expected Behavior

### Login Flow
1. User enters credentials
2. Loading spinner appears
3. On success: Welcome toast + redirect to dashboard
4. On error: Error message with retry option

### Logout Flow
1. User clicks logout button
2. Loading spinner appears
3. User data cleared from localStorage
4. Redirect to login page

### State Persistence
1. User data stored in localStorage
2. Page refresh maintains login state
3. Token validation on app load
