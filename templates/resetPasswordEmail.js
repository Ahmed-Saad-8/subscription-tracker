const resetPasswordEmail = (resetURL, userName = "User") => `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f4f6; font-family:Arial, sans-serif; padding:20px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <tr>
          <td style="background-color:#1d4ed8; padding:20px; text-align:center;">
            <img src="https://res.cloudinary.com/dohewzrcm/image/upload/v1763635604/logo_n08hzz.png" alt="Your App Logo" width="120" style="display:block; margin:0 auto 10px;">
            <h1 style="color:#ffffff; font-size:24px; margin:0;">Reset Your Password</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:30px; color:#333333; font-size:16px; line-height:1.6;">
            <p>Hello ${userName},</p>
            <p>You requested to reset your password. Click the button below to set a new password:</p>
            <p style="text-align:center; margin:30px 0;">
              <a href="${resetURL}" style="
                background-color:#1d4ed8;
                color:#ffffff;
                padding:12px 25px;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;
                display:inline-block;
              ">Reset Password</a>
            </p>
            <p>If you did not request this change, you can safely ignore this email.</p>
            <p>Thank you,<br>Your App Team</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#f2f4f6; text-align:center; padding:20px; font-size:12px; color:#999999;">
            &copy; ${new Date().getFullYear()} LoopIt All rights reserved.<br>
            Khaled Ebn El Waleed, Alexandria, Egypt
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;

export default resetPasswordEmail;
