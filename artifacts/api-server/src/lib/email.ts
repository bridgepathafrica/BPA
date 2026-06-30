import { Resend } from "resend";
import { escapeHtml } from "./html";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

const TERRACOTTA = "#C04020";
const MARIGOLD = "#F0A010";
const INK = "#1E1511";
const CREAM = "#FEF9F4";
const MUTED = "#7A6A5A";
const BORDER = "#E0D4C4";

function getFromAddress(): string {
  if (process.env.RESEND_FROM) return process.env.RESEND_FROM;
  return "Bridgepath Africa <noreply@bridgepathnetwork.com>";
}

function getResend(): Resend | null {
  const k = process.env.RESEND_API_KEY;
  return k ? new Resend(k) : null;
}

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2EDE6;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F2EDE6;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(28,16,8,0.10);">
      <tr>
        <td style="background:${INK};padding:28px 36px;">
          <span style="display:inline-block;background:${TERRACOTTA};color:${CREAM};font-size:15px;font-weight:900;letter-spacing:0.3px;padding:8px 16px;border-radius:8px;">Bridgepath Africa</span>
          <p style="color:rgba(254,249,244,0.50);font-size:11px;margin:8px 0 0;letter-spacing:0.06em;text-transform:uppercase;">Shaping People. Strengthening Institutions.</p>
        </td>
      </tr>
      <tr>
        <td style="background:${CREAM};padding:36px 36px 28px;">
          ${content}
        </td>
      </tr>
      <tr>
        <td style="background:#F2EDE6;padding:20px 36px;border-top:1px solid ${BORDER};">
          <p style="margin:0;font-size:11px;color:${MUTED};text-align:center;line-height:1.7;">
            Bridgepath Africa · Across Africa ·
            <a href="https://bridgepathnetwork.com" style="color:${TERRACOTTA};text-decoration:none;">bridgepathnetwork.com</a><br/>
            Questions? <a href="mailto:support@bridgepathnetwork.com" style="color:${TERRACOTTA};text-decoration:none;">support@bridgepathnetwork.com</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function ctaButton(label: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr><td style="background:${TERRACOTTA};border-radius:10px;">
      <a href="${href}" style="display:inline-block;color:${CREAM};text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">${label} →</a>
    </td></tr>
  </table>`;
}

function bodyText(html: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#2D2015;line-height:1.7;">${html}</p>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid ${BORDER};margin:24px 0;" />`;
}

function eyebrow(text: string): string {
  return `<p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${MARIGOLD};">${text}</p>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 20px;font-size:24px;font-weight:900;color:${INK};line-height:1.25;">${text}</h1>`;
}

// ── SEND ────────────────────────────────────────────────────────────────────

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.log(`[email] Resend not configured — would send "${payload.subject}" to ${payload.to}`);
    return false;
  }
  try {
    await resend.emails.send({ from: getFromAddress(), to: [payload.to], subject: payload.subject, html: payload.html });
    return true;
  } catch (err) {
    console.error("[email] Send failed:", err);
    return false;
  }
}

// ── TRANSACTIONAL AUTH TEMPLATES ────────────────────────────────────────────

export function verificationEmail(opts: {
  name: string;
  email: string;
  link: string;
}): EmailPayload {
  const first = escapeHtml(opts.name.split(" ")[0]);
  return {
    to: opts.email,
    subject: "Confirm your Bridgepath Africa account",
    html: emailWrapper(`
      ${eyebrow("Account Verification")}
      ${heading(`Hi ${first}, almost there!`)}
      ${bodyText(`Welcome to Bridgepath Africa. Please verify your email address to activate your account and start connecting with opportunities.`)}
      ${ctaButton("Verify Email Address", opts.link)}
      ${divider()}
      ${bodyText(`<span style="font-size:13px;color:${MUTED};">This link expires in <strong>24 hours</strong>. If you did not create an account, you can safely ignore this email.</span>`)}
    `),
  };
}

export function passwordResetEmail(opts: {
  name: string;
  email: string;
  link: string;
}): EmailPayload {
  const first = escapeHtml(opts.name.split(" ")[0]);
  return {
    to: opts.email,
    subject: "Reset your Bridgepath Africa password",
    html: emailWrapper(`
      ${eyebrow("Password Reset")}
      ${heading("Reset your password")}
      ${bodyText(`Hi <strong>${first}</strong>,`)}
      ${bodyText(`We received a request to reset the password for your Bridgepath Africa account. Click the button below — this link expires in <strong>1 hour</strong>.`)}
      ${ctaButton("Reset Password", opts.link)}
      ${divider()}
      ${bodyText(`<span style="font-size:13px;color:${MUTED};">If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.</span>`)}
    `),
  };
}

export function magicLinkEmail(opts: {
  name: string;
  email: string;
  link: string;
}): EmailPayload {
  const first = escapeHtml(opts.name.split(" ")[0]);
  return {
    to: opts.email,
    subject: "Your Bridgepath Africa sign-in link",
    html: emailWrapper(`
      ${eyebrow("Magic Sign-In")}
      ${heading("Your instant sign-in link")}
      ${bodyText(`Hi <strong>${first}</strong>,`)}
      ${bodyText(`Click the button below to sign in instantly — no password needed. This link expires in <strong>30 minutes</strong> and can only be used once.`)}
      ${ctaButton("Sign In to Bridgepath Africa", opts.link)}
      ${divider()}
      ${bodyText(`<span style="font-size:13px;color:${MUTED};">If you did not request this link, you can safely ignore this email.</span>`)}
    `),
  };
}

// ── NOTIFICATION TEMPLATES ───────────────────────────────────────────────────

export function newApplicationEmail(opts: {
  employerName: string;
  employerEmail: string;
  candidateName: string;
  jobTitle: string;
}): EmailPayload {
  const eN = escapeHtml(opts.employerName);
  const cN = escapeHtml(opts.candidateName);
  const jT = escapeHtml(opts.jobTitle);
  return {
    to: opts.employerEmail,
    subject: `New application for ${opts.jobTitle} — Bridgepath Africa`,
    html: emailWrapper(`
      ${eyebrow("New Application")}
      ${heading("A new candidate has applied")}
      ${bodyText(`Hi <strong>${eN}</strong>,`)}
      ${bodyText(`<strong>${cN}</strong> has just applied for your <strong>${jT}</strong> role. Head to your pipeline to review their profile.`)}
      ${ctaButton("Review in Pipeline", "https://bridgepathnetwork.com/dashboard/pipeline")}
      ${divider()}
      ${bodyText(`<span style="font-size:13px;color:${MUTED};">If you believe this is an error, contact us at <a href="mailto:support@bridgepathnetwork.com" style="color:${TERRACOTTA};">support@bridgepathnetwork.com</a>.</span>`)}
    `),
  };
}

export function applicationViewedEmail(opts: {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  companyName: string;
}): EmailPayload {
  const cN = escapeHtml(opts.candidateName);
  const jT = escapeHtml(opts.jobTitle);
  const co = escapeHtml(opts.companyName);
  return {
    to: opts.candidateEmail,
    subject: `Your application for ${opts.jobTitle} was viewed — Bridgepath Africa`,
    html: emailWrapper(`
      ${eyebrow("Application Update")}
      ${heading("Your profile caught attention")}
      ${bodyText(`Hi <strong>${cN}</strong>,`)}
      ${bodyText(`An employer at <strong>${co}</strong> has viewed your application for <strong>${jT}</strong>. Make sure your profile is complete to stand out.`)}
      ${ctaButton("View My Dashboard", "https://bridgepathnetwork.com/dashboard/jobseeker")}
      ${divider()}
      ${bodyText(`<span style="font-size:13px;color:${MUTED};">A complete profile gets 3× more employer views. Update your skills, experience, and bio today.</span>`)}
    `),
  };
}

export function feedbackEmail(opts: {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  fromName: string;
  isAnonymous: boolean;
  feedback: string;
}): EmailPayload {
  const cN     = escapeHtml(opts.candidateName);
  const jT     = escapeHtml(opts.jobTitle);
  const sender = opts.isAnonymous ? "An employer" : escapeHtml(opts.fromName);
  const fb     = escapeHtml(opts.feedback);
  return {
    to: opts.candidateEmail,
    subject: `New career feedback on your Bridgepath Africa profile`,
    html: emailWrapper(`
      ${eyebrow("Career Feedback")}
      ${heading("You have new professional feedback")}
      ${bodyText(`Hi <strong>${cN}</strong>,`)}
      ${bodyText(`<strong>${sender}</strong> left you feedback regarding your application for <strong>${jT}</strong>:`)}
      <blockquote style="background:#F2EDE6;border-left:4px solid ${TERRACOTTA};padding:16px 20px;border-radius:0 10px 10px 0;margin:0 0 24px;font-style:italic;color:#2D2015;font-size:14px;line-height:1.7;">${fb}</blockquote>
      ${ctaButton("View Feedback", "https://bridgepathnetwork.com/dashboard/jobseeker")}
      ${divider()}
      ${bodyText(`<span style="font-size:13px;color:${MUTED};">Use this feedback to strengthen your next application.</span>`)}
    `),
  };
}

export function welcomeJobSeekerEmail(opts: {
  name: string;
  email: string;
}): EmailPayload {
  const first = escapeHtml(opts.name.split(" ")[0]);
  return {
    to: opts.email,
    subject: `Welcome to Bridgepath Africa, ${opts.name.split(" ")[0]}!`,
    html: emailWrapper(`
      ${eyebrow("Welcome to Bridgepath Africa")}
      ${heading(`Welcome aboard, ${first}!`)}
      ${bodyText(`Your account is now active. You're joining a growing network of professionals connecting with opportunities across across Africa and globally.`)}
      ${bodyText(`Here's what you can do right now:`)}
      <ul style="margin:0 0 24px;padding-left:20px;color:#2D2015;font-size:15px;line-height:2.1;">
        <li>Browse open roles across Africa</li>
        <li>Complete your professional profile</li>
        <li>Get your CV reviewed with our AI tool</li>
        <li>Apply to jobs in one click</li>
      </ul>
      ${ctaButton("Go to My Dashboard", "https://bridgepathnetwork.com/dashboard/jobseeker")}
      ${divider()}
      ${bodyText(`<span style="font-size:13px;color:${MUTED};">Questions? <a href="mailto:support@bridgepathnetwork.com" style="color:${TERRACOTTA};">support@bridgepathnetwork.com</a></span>`)}
    `),
  };
}

export function emailChangeEmail(opts: {
  name: string;
  newEmail: string;
  link: string;
}): EmailPayload {
  const first = escapeHtml(opts.name.split(" ")[0]);
  return {
    to: opts.newEmail,
    subject: "Confirm your new email address — Bridgepath Africa",
    html: emailWrapper(`
      ${eyebrow("Email Change Request")}
      ${heading(`Confirm your new email, ${first}`)}
      ${bodyText(`We received a request to change the email address on your Bridgepath Africa account to <strong>${escapeHtml(opts.newEmail)}</strong>.`)}
      ${bodyText(`Click below to confirm the change. If you did not request this, ignore this email — your current email stays the same.`)}
      ${ctaButton("Confirm New Email Address", opts.link)}
      ${divider()}
      ${bodyText(`<span style="font-size:13px;color:${MUTED};">This link expires in <strong>1 hour</strong>. Only one confirmation link can be active at a time.</span>`)}
    `),
  };
}

export function welcomeEmployerEmail(opts: {
  name: string;
  companyName: string;
  email: string;
}): EmailPayload {
  const first = escapeHtml(opts.name.split(" ")[0]);
  const co    = escapeHtml(opts.companyName);
  return {
    to: opts.email,
    subject: `Welcome to Bridgepath Africa, ${opts.name.split(" ")[0]}!`,
    html: emailWrapper(`
      ${eyebrow("Welcome to Bridgepath Africa")}
      ${heading(`Welcome, ${first}!`)}
      ${bodyText(`<strong>${co}</strong>'s employer account is now active. You have access to Africa's fastest-growing talent network.`)}
      ${bodyText(`Here's what you can do right now:`)}
      <ul style="margin:0 0 24px;padding-left:20px;color:#2D2015;font-size:15px;line-height:2.1;">
        <li>Post your first job listing</li>
        <li>Browse pre-screened candidate profiles</li>
        <li>Explore HR services: EOR, payroll, outsourcing</li>
        <li>Manage applications from your pipeline</li>
      </ul>
      ${ctaButton("Go to My Dashboard", "https://bridgepathnetwork.com/dashboard/employer")}
      ${divider()}
      ${bodyText(`<span style="font-size:13px;color:${MUTED};">Need help? <a href="mailto:support@bridgepathnetwork.com" style="color:${TERRACOTTA};">support@bridgepathnetwork.com</a></span>`)}
    `),
  };
}
