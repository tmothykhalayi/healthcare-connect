# Email Service Setup Guide

## The 500 Error Issue

The 500 internal server error you're experiencing is caused by **missing email configuration**. The email service requires environment variables to be set up properly.

## Step 1: Create Environment File

Create a `.env` file in your project root with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=healthcare_connect

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret_key_here_make_it_long_and_secure
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here_make_it_long_and_secure

# Email Configuration (REQUIRED for email service)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Server Configuration
PORT=8000
NODE_ENV=development
```

## Step 2: Gmail Setup

### Option A: Use Gmail App Password (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
3. **Use the generated password** as `MAIL_PASSWORD`

### Option B: Use Gmail with Less Secure Apps (Not Recommended)

If you don't want to use 2FA:
1. Enable "Less secure app access" in Gmail settings
2. Use your regular Gmail password as `MAIL_PASSWORD`

## Step 3: Test Configuration

After creating the `.env` file:

1. **Restart your server**:
   ```bash
   npm run start:dev
   ```

2. **Test with the debug file**:
   ```bash
   # Use the debug-email.http file I created
   ```

3. **Expected behavior**:
   - ✅ 200 OK for valid email addresses
   - ✅ Email sent to your inbox
   - ❌ 404 for non-existent emails (correct behavior)

## Step 4: Alternative Testing

If you don't want to set up real email right now, you can:

### Option A: Use a Test Email Service
- Use services like Mailtrap or Ethereal Email
- Update the `.env` with their SMTP settings

### Option B: Disable Email Temporarily
Comment out the email sending in `auth.service.ts`:

```typescript
// In sendPasswordResetEmail method, comment out:
// await this.mailService.sendPasswordResetEmail(user, otp);
```

## Common Issues

### 1. "Invalid login" error
- Check Gmail credentials
- Verify App Password is correct
- Ensure 2FA is enabled if using App Password

### 2. "Connection timeout"
- Check internet connection
- Verify SMTP settings
- Try different port (465 with secure: true)

### 3. "Authentication failed"
- Double-check email and password
- Ensure App Password is used (not regular password)
- Check if Gmail account is locked

## Quick Test

Once configured, test with:

```http
POST /auth/forgot-password
{
  "email": "your-email@gmail.com"
}
```

**Expected Response:**
```json
{
  "message": "Password reset email sent successfully"
}
```

## Security Notes

- Never commit `.env` file to version control
- Use App Passwords instead of regular passwords
- Consider using environment-specific configurations
- Monitor email sending logs for security

## Next Steps

1. Create the `.env` file with your email settings
2. Restart the server
3. Test with valid email addresses
4. Check your email inbox for test messages 