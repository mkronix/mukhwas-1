import { Resend } from "resend";
import { config } from "../../config/env";
import { logger } from "../../utils/logger";

const resend = config.RESEND_API_KEY ? new Resend(config.RESEND_API_KEY) : null;

interface VerificationEmailInput {
  to: string;
  name: string;
  token: string;
  verifyUrl: string;
  correlationId?: string;
}

interface PasswordResetEmailInput {
  to: string;
  name: string;
  token: string;
  resetUrl: string;
  correlationId?: string;
}

async function sendEmail(
  input: { to: string; subject: string; html: string; correlationId?: string },
  throwOnError: boolean
): Promise<void> {
  if (!resend) {
    logger.warn({
      message: "Resend not configured, skipping email",
      correlationId: input.correlationId,
      to: input.to,
    });
    if (throwOnError) throw new Error("Email service not configured");
    return;
  }

  try {
    await resend.emails.send({
      from: config.RESEND_FROM_EMAIL,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
  } catch (err) {
    logger.error({
      message: "Failed to send email",
      correlationId: input.correlationId,
      to: input.to,
      error: err instanceof Error ? err.message : String(err),
    });
    if (throwOnError) throw err;
  }
}

export async function sendVerificationEmail(input: VerificationEmailInput): Promise<void> {
  const link = `${input.verifyUrl}?token=${encodeURIComponent(input.token)}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2>Verify your email</h2>
      <p>Hi ${input.name},</p>
      <p>Click below to verify your email address:</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;border-radius:6px;text-decoration:none">Verify Email</a>
      <p style="color:#666;font-size:13px;margin-top:24px">This link expires in 24 hours.</p>
    </div>
  `;
  await sendEmail({ to: input.to, subject: "Verify your email — Mukhwas", html, correlationId: input.correlationId }, false);
}

export async function sendVerificationEmailStrict(input: VerificationEmailInput): Promise<void> {
  const link = `${input.verifyUrl}?token=${encodeURIComponent(input.token)}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2>Verify your email</h2>
      <p>Hi ${input.name},</p>
      <p>Click below to verify your email address:</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;border-radius:6px;text-decoration:none">Verify Email</a>
      <p style="color:#666;font-size:13px;margin-top:24px">This link expires in 24 hours.</p>
    </div>
  `;
  await sendEmail({ to: input.to, subject: "Verify your email — Mukhwas", html, correlationId: input.correlationId }, true);
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void> {
  const link = `${input.resetUrl}?token=${encodeURIComponent(input.token)}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2>Reset your password</h2>
      <p>Hi ${input.name},</p>
      <p>Click below to reset your password:</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;border-radius:6px;text-decoration:none">Reset Password</a>
      <p style="color:#666;font-size:13px;margin-top:24px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
  `;
  await sendEmail({ to: input.to, subject: "Reset your password — Mukhwas", html, correlationId: input.correlationId }, false);
}

export async function sendStaffPasswordResetEmail(input: PasswordResetEmailInput): Promise<void> {
  const link = `${input.resetUrl}?token=${encodeURIComponent(input.token)}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2>Reset your admin password</h2>
      <p>Hi ${input.name},</p>
      <p>Click below to reset your password:</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;border-radius:6px;text-decoration:none">Reset Password</a>
      <p style="color:#666;font-size:13px;margin-top:24px">This link expires in 1 hour.</p>
    </div>
  `;
  await sendEmail({ to: input.to, subject: "Reset your admin password — Mukhwas", html, correlationId: input.correlationId }, false);
}
