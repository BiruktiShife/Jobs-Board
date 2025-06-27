import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailParams = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
};

export async function sendEmail({
  to,
  subject,
  text,
  html,
  from,
}: EmailParams) {
  try {
    const data = await resend.emails.send({
      from: from || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject,
      html: html || `<p>${text?.replace(/\n/g, "<br>")}</p>` || "",
    });

    console.log("Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// Company approval email template
export function getCompanyApprovalEmailTemplate(
  companyName: string,
  adminEmail: string
) {
  return {
    subject: `🎉 Welcome to JobBoard! Your company "${companyName}" has been approved`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Company Approved - JobBoard</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .success-icon { width: 80px; height: 80px; background-color: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; }
            .content h2 { color: #1f2937; font-size: 24px; margin: 0 0 20px 0; text-align: center; }
            .content p { color: #6b7280; font-size: 16px; margin: 0 0 20px 0; }
            .highlight-box { background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 25px 0; }
            .highlight-box h3 { color: #0369a1; margin: 0 0 15px 0; font-size: 18px; }
            .highlight-box ul { margin: 0; padding-left: 20px; color: #374151; }
            .highlight-box li { margin: 8px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer p { color: #6b7280; font-size: 14px; margin: 5px 0; }
            .footer a { color: #10b981; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>Your company has been approved on JobBoard</p>
            </div>

            <div class="content">
              <div class="success-icon">
                <svg width="40" height="40" fill="#10b981" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </div>

              <h2>Welcome to JobBoard, ${companyName}!</h2>

              <p>Great news! Your company registration has been reviewed and approved by our admin team. You can now access your company dashboard and start posting job opportunities.</p>

              <div class="highlight-box">
                <h3>🚀 What you can do now:</h3>
                <ul>
                  <li><strong>Access your company dashboard</strong> - View analytics and manage your account</li>
                  <li><strong>Post job listings</strong> - Create and publish job opportunities</li>
                  <li><strong>Manage applications</strong> - Review and respond to candidate applications</li>
                  <li><strong>Update company profile</strong> - Keep your information current</li>
                  <li><strong>View candidate profiles</strong> - Browse our talent pool</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/company" class="cta-button">
                  Access Your Dashboard
                </a>
              </div>

              <p><strong>Login Details:</strong></p>
              <p>Email: ${adminEmail}<br>
              Password: [Use the password you created during registration]</p>

              <p>If you have any questions or need assistance getting started, our support team is here to help!</p>
            </div>

            <div class="footer">
              <p><strong>JobBoard Team</strong></p>
              <p>Connecting talent with opportunity</p>
              <p>
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/contact">Contact Support</a> |
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/help">Help Center</a>
              </p>
              <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                This email was sent to ${adminEmail} because your company was approved on JobBoard.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

// Company rejection email template
export function getCompanyRejectionEmailTemplate(
  companyName: string,
  adminEmail: string,
  reason?: string
) {
  return {
    subject: `Update on your JobBoard application for "${companyName}"`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Update - JobBoard</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .info-icon { width: 80px; height: 80px; background-color: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; }
            .content h2 { color: #1f2937; font-size: 24px; margin: 0 0 20px 0; text-align: center; }
            .content p { color: #6b7280; font-size: 16px; margin: 0 0 20px 0; }
            .reason-box { background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 25px 0; }
            .reason-box h3 { color: #92400e; margin: 0 0 10px 0; font-size: 18px; }
            .reason-box p { color: #78350f; margin: 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 10px; }
            .cta-button.secondary { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer p { color: #6b7280; font-size: 14px; margin: 5px 0; }
            .footer a { color: #10b981; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Update</h1>
              <p>Regarding your JobBoard company registration</p>
            </div>

            <div class="content">
              <div class="info-icon">
                <svg width="40" height="40" fill="#ef4444" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
              </div>

              <h2>Application Status Update</h2>

              <p>Thank you for your interest in joining JobBoard. After careful review, we are unable to approve your company registration for "${companyName}" at this time.</p>

              ${
                reason
                  ? `
                <div class="reason-box">
                  <h3>📋 Reason for rejection:</h3>
                  <p>${reason}</p>
                </div>
              `
                  : ""
              }

              <p>We encourage you to review our company registration requirements and resubmit your application. Our team is also available to help you understand what changes might be needed.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/register/company" class="cta-button">
                  Resubmit Application
                </a>
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/contact" class="cta-button secondary">
                  Contact Support
                </a>
              </div>

              <p>We appreciate your understanding and look forward to potentially working with you in the future.</p>
            </div>

            <div class="footer">
              <p><strong>JobBoard Team</strong></p>
              <p>
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/contact">Contact Support</a> |
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/help">Help Center</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

// Send company approval email
export async function sendCompanyApprovalEmail(
  companyName: string,
  adminEmail: string
): Promise<boolean> {
  try {
    const emailTemplate = getCompanyApprovalEmailTemplate(
      companyName,
      adminEmail
    );
    await sendEmail({
      to: adminEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });
    console.log(
      `Approval email sent successfully to ${adminEmail} for company ${companyName}`
    );
    return true;
  } catch (error) {
    console.error("Failed to send approval email:", error);
    return false;
  }
}

// Send company rejection email
export async function sendCompanyRejectionEmail(
  companyName: string,
  adminEmail: string,
  reason?: string
): Promise<boolean> {
  try {
    const emailTemplate = getCompanyRejectionEmailTemplate(
      companyName,
      adminEmail,
      reason
    );
    await sendEmail({
      to: adminEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });
    console.log(
      `Rejection email sent successfully to ${adminEmail} for company ${companyName}`
    );
    return true;
  } catch (error) {
    console.error("Failed to send rejection email:", error);
    return false;
  }
}
