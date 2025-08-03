# EatWise Frontend Testing Guide

## Testing Strategy

This document outlines the comprehensive testing approach for the EatWise frontend application, covering both automated and manual testing scenarios.

## User Flow Testing

### 1. Authentication Flow
**Test Case: User Registration & Login**

```
✅ Test Steps:
1. Navigate to landing page (/)
2. Click "Get started free" 
3. Fill registration form with valid email/password
4. Verify email verification prompt appears
5. Click "Sign in" to test login
6. Enter valid credentials
7. Verify successful redirect to onboarding

✅ Expected Results:
- Registration creates new user account
- Email verification prompt shows
- Login with valid credentials succeeds
- Invalid credentials show error message
- Successful auth redirects to /onboarding
```

**Test Case: Password Reset**
```
✅ Test Steps:
1. Go to login page
2. Click "Forgot password"
3. Enter valid email address
4. Check for success message
5. Check email for reset link

✅ Expected Results:
- Reset email sent successfully
- User receives password reset link
- Reset link works and allows password change
```

### 2. Onboarding Flow
**Test Case: Complete Profile Setup**

```
✅ Test Steps:
1. Start onboarding after successful login
2. Step 1: Enter age (25), height (170cm), weight (70kg)
3. Click "Next"
4. Step 2: Select activity level (Medium), goal (Weight Loss)
5. Click "Next" 
6. Step 3: Review calculated goals (calories ~1700)
7. Click "Complete Setup"
8. Verify redirect to dashboard

✅ Expected Results:
- Form validation works on each step
- Cannot proceed without required fields
- Calorie calculation updates in real-time
- Profile saves successfully
- Redirects to dashboard after completion
```

**Test Case: Validation & Error Handling**
```
✅ Test Steps:
1. Try to proceed without filling required fields
2. Enter invalid values (age: -5, height: 300)
3. Test form reset functionality

✅ Expected Results:
- Validation errors appear immediately
- Cannot proceed with invalid data
- Error messages are clear and helpful
```

### 3. Meal Logging Flow
**Test Case: Photo Upload & AI Analysis**

```
✅ Test Steps:
1. Navigate to /dashboard/add-meal
2. Select "Photo" method
3. Upload meal image (use sample food photo)
4. Wait for AI analysis to complete
5. Review suggested nutrition values
6. Edit description and calories if needed
7. Save meal
8. Verify AI feedback appears
9. Check meal appears in dashboard timeline

✅ Expected Results:
- Photo upload works smoothly
- AI analysis provides reasonable nutrition estimates
- User can edit suggested values
- Meal saves successfully with feedback
- Dashboard updates with new meal
```

**Test Case: Text Entry Analysis**
```
✅ Test Steps:
1. Choose "Text" method
2. Enter: "Grilled chicken breast with steamed broccoli and brown rice"
3. Click "Analyze Meal"
4. Review AI-generated nutrition breakdown
5. Save meal

✅ Expected Results:
- Text analysis provides accurate nutrition estimates
- Description is properly parsed
- Meal components are identified correctly
```

**Test Case: Manual Entry**
```
✅ Test Steps:
1. Choose "Manual" method
2. Fill all nutrition fields manually
3. Verify macro breakdown visualization
4. Save meal

✅ Expected Results:
- All manual values save correctly
- Macro percentages calculate properly
- Visual breakdown displays correctly
```

### 4. Dashboard Functionality
**Test Case: Daily Overview**

```
✅ Test Steps:
1. Log several meals throughout the day
2. Check nutrition progress bars update
3. Verify meal timeline shows all meals
4. Test "Add Meal" quick action
5. Check daily tip loads

✅ Expected Results:
- Progress bars reflect current nutrition totals
- All logged meals appear in timeline
- Quick actions work correctly
- Stats are accurate and up-to-date
```

**Test Case: Navigation & Quick Actions**
```
✅ Test Steps:
1. Test all navigation links from dashboard
2. Use mobile navigation if on mobile device
3. Test back buttons on all pages
4. Verify breadcrumb navigation

✅ Expected Results:
- All navigation works correctly
- Mobile nav appears on small screens
- Back buttons return to previous pages
- User never gets lost in navigation
```

### 5. Meal History & Management
**Test Case: Search & Filtering**

```
✅ Test Steps:
1. Navigate to /dashboard/history
2. Log multiple meals over several days
3. Test search functionality with meal descriptions
4. Apply date filters (today, last 7 days)
5. Filter by calorie ranges (200-500 calories)
6. Test sorting options (newest first, highest calories)

✅ Expected Results:
- Search finds meals by description
- Date filters work correctly
- Calorie filters apply properly
- Sorting changes meal order
- No meals when filters don't match
```

**Test Case: Meal Management**
```
✅ Test Steps:
1. Click "View" on a meal card
2. Review detailed meal information
3. Click "Edit" to modify meal
4. Change nutrition values and save
5. Delete a meal with confirmation
6. Verify meal no longer appears

✅ Expected Results:
- Detailed view shows complete meal info
- Edit functionality works properly
- Changes save and reflect immediately
- Delete confirmation prevents accidents
- Deleted meals removed from history
```

### 6. Progress Charts & Analytics
**Test Case: Chart Functionality**

```
✅ Test Steps:
1. Navigate to /dashboard/progress
2. Test different time ranges (7d, 30d, 90d)
3. Switch between chart views (calories, macros, goals)
4. Verify charts display properly on mobile
5. Test chart interactions (hover tooltips)

✅ Expected Results:
- Charts load and display data correctly
- Time range changes update data
- All chart types render properly
- Mobile charts are readable and interactive
- Tooltips show accurate information
```

**Test Case: Goal Tracking**
```
✅ Test Steps:
1. Set nutrition goals in profile
2. Log meals to reach various percentages
3. Check goal achievement charts
4. Verify summary statistics

✅ Expected Results:
- Goal lines appear on charts
- Achievement percentages calculate correctly
- Summary stats reflect actual progress
```

### 7. AI Coaching System
**Test Case: Free User Limitations**

```
✅ Test Steps:
1. As free user, try to ask AI coach question
2. Verify upgrade prompt appears
3. Check daily tips still work
4. Test meal feedback generation

✅ Expected Results:
- Free users see upgrade prompts for chat
- Daily tips available to all users
- Meal feedback works for all users
- Premium features clearly marked
```

**Test Case: Premium AI Features** (requires premium account)
```
✅ Test Steps:
1. Upgrade to premium (use test mode)
2. Ask AI coach nutrition questions
3. Request meal improvement suggestions
4. Test conversation history

✅ Expected Results:
- Unlimited AI questions work
- Responses are relevant and helpful
- Conversation history saves properly
- All premium features unlocked
```

### 8. Premium Upgrade Flow
**Test Case: Upgrade Process**

```
✅ Test Steps:
1. Hit a free tier limitation
2. Click upgrade prompt
3. Review premium features page
4. Start checkout process (test mode)
5. Complete simulated payment
6. Verify premium features unlock

✅ Expected Results:
- Limitations clearly explained
- Premium benefits highlighted
- Checkout process is smooth
- Premium features activate immediately
- Free limitations removed
```

**Test Case: Subscription Management**
```
✅ Test Steps:
1. Navigate to premium management page
2. Review current subscription status
3. Test subscription cancellation flow
4. Verify downgrade behavior

✅ Expected Results:
- Current status displayed accurately
- Cancellation works properly
- Downgrade happens at period end
- User retains access until expiration
```

### 9. Profile & Settings
**Test Case: Profile Updates**

```
✅ Test Steps:
1. Navigate to /dashboard/profile
2. Update weight, height, or goals
3. Verify calorie goals recalculate
4. Save changes
5. Check updates reflect in dashboard

✅ Expected Results:
- Form pre-fills with current data
- Goal calculations update in real-time
- Changes save successfully
- Dashboard reflects new goals
```

**Test Case: Account Management**
```
✅ Test Steps:
1. Review account information
2. Test account deletion flow
3. Verify confirmation requirements

✅ Expected Results:
- Account info displays correctly
- Deletion requires confirmation
- Process is secure and clear
```

### 10. Mobile Experience
**Test Case: Mobile Navigation**

```
✅ Test Steps:
1. Access app on mobile device/responsive mode
2. Test bottom navigation bar
3. Verify all buttons are touch-friendly
4. Test swipe gestures where applicable

✅ Expected Results:
- Mobile nav appears at bottom
- All touch targets are 44px minimum
- Navigation works smoothly
- No UI elements are cut off
```

**Test Case: Camera Functionality**
```
✅ Test Steps:
1. Try meal photo capture on mobile
2. Test camera permissions
3. Verify photo quality and upload
4. Test fallback to gallery selection

✅ Expected Results:
- Camera opens correctly
- Permissions handled gracefully
- Photos upload successfully
- Gallery fallback works
```

## Browser Testing Matrix

### Desktop Browsers
- ✅ Chrome 88+ (Windows, Mac, Linux)
- ✅ Firefox 85+ (Windows, Mac, Linux)  
- ✅ Safari 14+ (Mac only)
- ✅ Edge 88+ (Windows)

### Mobile Browsers
- ✅ iOS Safari 14+ (iPhone, iPad)
- ✅ Chrome Mobile 88+ (Android)
- ✅ Samsung Internet (Android)
- ✅ Firefox Mobile (Android)

## Performance Testing

### Load Time Testing
```
✅ Test Scenarios:
1. Initial page load (< 3 seconds)
2. Dashboard load after login (< 2 seconds)
3. Chart rendering time (< 1 second)
4. Image upload and processing (< 10 seconds)
5. Search results display (< 1 second)

✅ Tools:
- Chrome DevTools Lighthouse
- WebPageTest.org
- GTmetrix
```

### Offline Testing
```
✅ Test Steps:
1. Load app while online
2. Disconnect internet
3. Try to navigate between cached pages
4. Attempt to log meal (should queue)
5. Reconnect and verify sync

✅ Expected Results:
- Cached pages work offline
- User gets clear offline indicators
- Actions queue for later sync
- Data syncs when reconnected
```

## Error Handling Testing

### Network Error Scenarios
```
✅ Test Cases:
1. Complete network failure
2. Slow/intermittent connection
3. Server errors (500, 503)
4. Authentication token expiry
5. API rate limiting

✅ Expected Results:
- Clear error messages for users
- Automatic retry for transient errors
- Graceful degradation of features
- No data loss during network issues
```

### Validation Error Testing
```
✅ Test Cases:
1. Invalid form inputs
2. Missing required fields
3. File upload errors
4. Image processing failures

✅ Expected Results:
- Immediate validation feedback
- Clear, actionable error messages
- Form state preservation
- No app crashes or freezes
```

## Accessibility Testing

### Keyboard Navigation
```
✅ Test Steps:
1. Navigate entire app using only Tab/Shift+Tab
2. Verify all interactive elements reachable
3. Test Enter/Space activation
4. Check focus indicators are visible

✅ Expected Results:
- Logical tab order throughout app
- All buttons/links keyboard accessible
- Clear focus indicators
- No keyboard traps
```

### Screen Reader Testing
```
✅ Test Tools:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (Mac/iOS)
- TalkBack (Android)

✅ Test Scenarios:
- Complete user registration flow
- Log a meal using screen reader
- Navigate charts and data
- Use AI coaching features
```

### Color Contrast Testing
```
✅ Requirements:
- WCAG 2.1 AA compliance (4.5:1 ratio)
- Color is not the only indicator
- High contrast mode support

✅ Test Tools:
- WebAIM Contrast Checker
- Chrome DevTools accessibility audit
- Colour Contrast Analyser
```

## Security Testing

### Authentication Security
```
✅ Test Cases:
1. Session timeout handling
2. JWT token validation
3. Protected route access
4. Password strength requirements
5. Rate limiting on auth endpoints

✅ Expected Results:
- Sessions expire appropriately
- Invalid tokens rejected
- Unauthorized access blocked
- Strong password enforcement
- Brute force protection active
```

### Data Protection
```
✅ Test Cases:
1. Personal data encryption
2. Secure API communication (HTTPS)
3. File upload validation
4. XSS prevention
5. CSRF protection

✅ Expected Results:
- All data transmitted securely
- File uploads validated properly
- No script injection possible
- CSRF tokens implemented
- User data properly protected
```

## Automated Testing Setup

### Unit Tests
```javascript
// Example test structure
describe('Meal Logging', () => {
  test('should calculate nutrition totals correctly', () => {
    const meals = [
      { calories: 300, protein: 20 },
      { calories: 400, protein: 30 }
    ];
    
    const totals = calculateNutritionTotals(meals);
    
    expect(totals.calories).toBe(700);
    expect(totals.protein).toBe(50);
  });
});
```

### Integration Tests
```javascript
// Example API integration test
describe('Meal API', () => {
  test('should create meal successfully', async () => {
    const mealData = {
      description: 'Test meal',
      calories: 500
    };
    
    const response = await mealsApi.createMeal(mealData);
    
    expect(response.data).toMatchObject(mealData);
    expect(response.data.id).toBeDefined();
  });
});
```

### E2E Tests
```javascript
// Example Playwright test
test('complete meal logging flow', async ({ page }) => {
  await page.goto('/dashboard/add-meal');
  await page.click('[data-testid="photo-method"]');
  await page.setInputFiles('input[type="file"]', 'test-meal.jpg');
  await page.waitForSelector('[data-testid="analysis-results"]');
  await page.click('[data-testid="save-meal"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## Testing Checklist

### Pre-Release Testing
- [ ] All user flows tested manually
- [ ] Cross-browser testing completed
- [ ] Mobile responsive testing done
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Security review completed
- [ ] Error scenarios tested
- [ ] Offline functionality verified

### Post-Release Monitoring
- [ ] Error tracking active (Sentry)
- [ ] Performance monitoring setup
- [ ] User feedback collection
- [ ] Analytics tracking working
- [ ] A/B test framework ready

## Bug Reporting Template

```
Bug Title: [Concise description]

Environment:
- Browser: [Chrome 91, Safari 14, etc.]
- Device: [Desktop, iPhone 12, etc.]
- OS: [Windows 10, iOS 14, etc.]

Steps to Reproduce:
1. 
2. 
3. 

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Screenshots/Videos:
[Attach relevant media]

Additional Notes:
[Any other relevant information]
```

This comprehensive testing guide ensures the EatWise frontend delivers a robust, accessible, and user-friendly experience across all supported platforms and use cases.