import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export interface SendOtpResult {
  success: boolean;
  message?: string;
  error?: string;
  devCode?: string;
}

/**
 * Generate a cryptographically secure 6-digit OTP, store in database, and send via email.
 */
export async function generateAndSaveEmailOtp(
  rawEmail: string
): Promise<SendOtpResult> {
  try {
    const email = rawEmail.toLowerCase().trim();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { success: false, error: "Format alamat email tidak valid." };
    }

    // 1. Remove any pending tokens for this email to avoid duplicate states
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // 2. Generate 6-digit code (e.g. "584920")
    const code = crypto.randomInt(100000, 1000000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 3. Save to VerificationToken table
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: code,
        expires,
      },
    });

    // 4. Send email if SMTP is configured
    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASSWORD?.replace(/\s+/g, "").trim();

    if (smtpHost && smtpUser && smtpPass) {
      const port = Number(process.env.SMTP_PORT) || 587;
      const isSecure = process.env.SMTP_SECURE === "true" || port === 465;

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Format pengirim sesuai standar RFC 5321 untuk mencegah syntax error di Gmail SMTP
      await transporter.sendMail({
        from: {
          name: "Ravenlink",
          address: smtpUser,
        },
        to: email,
        subject: `${code} is your Ravenlink verification code`,
        text: `Your Ravenlink verification code is: ${code}. This code is valid for 10 minutes. If you did not request this code, please ignore this email.`,
        html: `
          <div style="background-color: #FFF8E7; font-family: monospace, sans-serif; padding: 32px; border: 4px solid #0D0D0D; max-width: 520px; margin: 0 auto;">
            <div style="background-color: #FFDE59; padding: 12px; border: 3px solid #0D0D0D; font-weight: 900; font-size: 18px; text-transform: uppercase; margin-bottom: 24px; text-align: center; letter-spacing: 1px;">
              RAVENLINK VERIFICATION
            </div>
            <p style="font-size: 14px; font-weight: 700; color: #0D0D0D; margin-bottom: 16px;">
              Use the following verification code to sign in to your Ravenlink account:
            </p>
            <div style="background-color: #FFFFFF; border: 3px solid #0D0D0D; padding: 18px; font-size: 32px; font-weight: 900; letter-spacing: 6px; text-align: center; color: #0D0D0D; box-shadow: 4px 4px 0px #0D0D0D; margin-bottom: 24px;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #555555; margin-bottom: 8px;">
              * This code is valid for 10 minutes.
            </p>
            <p style="font-size: 12px; color: #777777;">
              Never share this code with anyone, including Ravenlink staff.
            </p>
          </div>
        `,
      });
      console.log(`[RAVENLINK EMAIL OTP] ✅ Email terkirim nyata ke: ${email}`);
    } else {
      // Local development or unconfigured SMTP: Log to console
      console.log("\n=======================================================");
      console.log(`[RAVENLINK EMAIL OTP] Target: ${email}`);
      console.log(`[RAVENLINK EMAIL OTP] Verification Code: ${code}`);
      console.log(`[RAVENLINK EMAIL OTP] Valid for 10 minutes`);
      console.log("=======================================================\n");
    }

    // Only return devCode if SMTP is not yet configured, ensuring users must check real email when SMTP is active
    const isUnconfigured = !smtpHost || !smtpUser || !smtpPass;

    return {
      success: true,
      message: "Kode verifikasi telah dikirim ke email tujuan.",
      devCode: isUnconfigured ? code : undefined,
    };
  } catch (error) {
    console.error("Error in generateAndSaveEmailOtp:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengirim kode verifikasi.",
    };
  }
}
