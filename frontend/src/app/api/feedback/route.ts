import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, love, improved } = await req.json();

    // The user wants feedback sent to giramkarparth88@gmail.com
    const recipientEmail = "giramkarparth88@gmail.com";

    // Create a transporter using environment variables. 
    // The user needs to set SMTP_USER and SMTP_PASS in frontend/.env.local
    const transporter = nodemailer.createTransport({
      service: "gmail", // Using Gmail as default
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // App password if using Gmail
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #2563EB;">New Denoise X Feedback</h2>
        <p><strong>From User Email:</strong> ${email}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        
        <h3 style="color: #1f2937;">What did they love about Denoise X?</h3>
        <p style="background-color: #f8fafc; padding: 12px; border-radius: 6px; color: #334155;">
          ${love || "<em>No response</em>"}
        </p>

        <h3 style="color: #1f2937;">What would they like to see improved?</h3>
        <p style="background-color: #f8fafc; padding: 12px; border-radius: 6px; color: #334155;">
          ${improved || "<em>No response</em>"}
        </p>
        
        <br />
        <p style="font-size: 12px; color: #94a3b8;">This email was sent automatically from the Denoise X feedback form.</p>
      </div>
    `;

    // Send the email
    await transporter.sendMail({
      from: process.env.SMTP_USER || recipientEmail,
      to: recipientEmail,
      subject: `Denoise X Feedback from ${email}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending feedback email:", error);
    return NextResponse.json(
      { error: "Failed to send feedback email. Make sure SMTP_USER and SMTP_PASS are set in .env.local" },
      { status: 500 }
    );
  }
}
