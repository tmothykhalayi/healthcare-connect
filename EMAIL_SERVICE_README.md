# Email Service Documentation

## Overview

The Healthcare Connect application includes a comprehensive email service that handles various types of notifications including login alerts, password reset requests, welcome emails, and security alerts.

## Features

### 1. Login Notification Emails
- Automatically sent when users log in successfully
- Includes login time, IP address, and user details
- Helps users monitor account security

### 2. Password Reset System
- **Forgot Password**: Sends OTP to user's email
- **Reset Password**: Verifies OTP and allows password change
- **Success Notification**: Confirms password reset completion
- OTP expires after 4 minutes for security

### 3. Welcome Emails
- Sent to new users upon registration
- Includes role-specific welcome messages
- Provides platform introduction

### 4. Security Alerts
- Notifies users of suspicious account activity
- Includes alert details and recommended actions
- Helps maintain account security

## Email Templates

All email templates are located in `src/mail/templates/` and use Handlebars for dynamic content:

### Template Files
- `login-notification.hbs` - Login alert emails
- `password-reset.hbs` - Password reset OTP emails
- `password-reset-success.hbs` - Password reset confirmation
- `welcome.hbs` - New user welcome emails
- `security-alert.hbs` - Security notification emails

### Template Variables
Each template supports dynamic variables:

```handlebars
{{firstName}} - User's first name
{{lastName}} - User's last name
{{email}} - User's email address
{{role}} - User's role (admin, doctor, patient, pharmacy)
{{loginTime}} - Login timestamp
{{ipAddress}} - Login IP address
{{otp}} - One-time password for reset
{{expiryMinutes}} - OTP expiry time
{{resetTime}} - Password reset timestamp
{{alertType}} - Type of security alert
{{alertTime}} - Alert timestamp
```

## Configuration

### Environment Variables
Add these to your `.env` file:

```env
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password as `MAIL_PASSWORD`

## API Endpoints

### Password Reset Flow

#### 1. Request Password Reset
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent successfully"
}
```

#### 2. Reset Password with OTP
```http
POST /auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

### Login Notification
Login notifications are automatically sent when users sign in via:
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## Testing

### Test File
Use `email-test.http` to test email functionality:

1. **Check existing users:**
   ```http
   GET /users/check-emails
   ```

2. **Test password reset:**
   ```http
   POST /auth/forgot-password
   {
     "email": "valid-user@example.com"
   }
   ```

3. **Test login notification:**
   ```http
   POST /auth/signin
   {
     "email": "valid-user@example.com",
     "password": "password123"
   }
   ```

### Valid Test Users
Based on your system, these users exist:
- `timoth@gmail.com` (password: `123`)
- `esthy.nandwa@example.com` (password: `123`)

## Error Handling

### Common Errors

1. **404 - User not found**
   - Email address doesn't exist in database
   - Solution: Use a valid email address

2. **Email sending failed**
   - SMTP configuration issues
   - Solution: Check email credentials and network

3. **Invalid OTP**
   - OTP expired or incorrect
   - Solution: Request new password reset

### Error Responses
```json
{
  "status": 404,
  "message": "User not found"
}
```

## Security Features

### OTP Security
- 6-digit numeric OTP
- 4-minute expiration
- One-time use only
- Generated using speakeasy library

### Email Security
- TLS encryption for email transmission
- No sensitive data in email content
- Secure password reset flow

## Troubleshooting

### Template Issues
If you get template file errors:
1. Ensure templates are copied to `dist/src/mail/templates/`
2. Check `nest-cli.json` assets configuration
3. Rebuild the project: `npm run build`

### Email Delivery Issues
1. Check SMTP credentials
2. Verify Gmail App Password
3. Check network connectivity
4. Review email service logs

### Database Issues
1. Ensure user exists in database
2. Check email field is unique
3. Verify OTP fields are properly set

## Logging

The email service includes comprehensive logging:
- Success/failure of email sending
- OTP generation and verification
- User authentication events
- Error details for debugging

## Future Enhancements

Potential improvements:
- Email verification for new accounts
- Bulk email notifications
- Email preferences per user
- Advanced security alerts
- Email templates customization
- Email delivery tracking 