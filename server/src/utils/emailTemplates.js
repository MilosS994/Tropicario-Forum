export const resetPasswordTemplate = ({
  username,
  resetUrl,
  expireMins = 15,
}) => `
  <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;padding:24px 32px 32px 32px;border-radius:8px;box-shadow:0 2px 8px #eaeaea;">
    <div style="text-align:center;margin-bottom:20px;">
      <img src="https://tropicario.com/favicon.png" alt="Tropicario Forum" style="height:40px;">
    </div>
    <h2 style="color:#4CAF50;margin-bottom:8px;">Reset your password</h2>
    <p style="color:#333;">Hi${username ? `, <b>${username}</b>` : ""},</p>
    <p style="color:#333;">
      We received a request to reset your Tropicario Forum account password.
      Click the button below to set a new password. This link is valid for <b>${expireMins} minutes</b>.
    </p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${resetUrl}" style="background:#4CAF50;color:#fff;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:16px;display:inline-block;">Reset password</a>
    </div>
    <p style="color:#888;font-size:13px;">
      If you didn’t request this, please ignore this email.<br>
      For security, this link will expire in <b>${expireMins} minutes</b>.
    </p>
    <hr style="margin:32px 0 18px 0;">
    <div style="color:#b6b6b6;font-size:12px;text-align:center;">
      &copy; ${new Date().getFullYear()} Tropicario Forum<br>
      Please do not reply to this email.
    </div>
  </div>
`;
