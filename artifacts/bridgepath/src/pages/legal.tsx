import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageSEO } from "@/components/seo/PageSEO";
import { Link } from "wouter";

const TERRACOTTA = "#C04020";
const INK = "#1E1511";

const EFFECTIVE_DATE = "1 June 2025";
const CONTROLLER = "Bridgepath Africa Ltd";
const CONTROLLER_ADDRESS = "Accra, Ghana";
const DPO_EMAIL = "dpo@bridgepathnetwork.com";
const SUPPORT_EMAIL = "support@bridgepathnetwork.com";

const content = {
  privacy: {
    title: "Privacy Policy",
    eyebrow: "How Bridgepath Africa protects your data",
    intro: `This Privacy Policy explains how ${CONTROLLER} ("Bridgepath Africa", "we", "us") collects, uses, shares, and protects personal data in connection with the Bridgepath Africa platform. This policy applies to job seekers, employers, HR service enquirers, and visitors. Effective date: ${EFFECTIVE_DATE}.`,
    sections: [
      {
        title: "1. Data Controller",
        body: `${CONTROLLER}, ${CONTROLLER_ADDRESS}, is the data controller for personal data processed through the Bridgepath Africa platform. For data protection enquiries contact our Data Protection Officer at ${DPO_EMAIL}.`,
      },
      {
        title: "2. Data we collect",
        body: "We collect: (a) Account data — name, email address, hashed password, account role (job seeker or employer), and registration timestamp. (b) Profile data — location, skills, education, work history, professional summary, CV documents, and a profile photo. (c) Application data — job applications, cover letters, and application status. (d) Employer data — company name, website, posted job listings, and candidate pipeline activity. (e) CV review submissions — CV text you submit for AI-assisted review. (f) Contact enquiries — messages sent via the contact form. (g) Technical data — authentication tokens, browser type, and approximate IP address for fraud prevention. We do not collect special-category data (health, ethnicity, biometrics) and ask that users do not include it in their CVs.",
      },
      {
        title: "3. Lawful basis for processing (GDPR Article 6)",
        body: "We rely on the following lawful bases: (a) Performance of a contract (Art. 6(1)(b)) — processing necessary to create and manage your account, match applications to job listings, and deliver services you request. (b) Legitimate interests (Art. 6(1)(f)) — fraud prevention, platform security, improving service quality, and aggregate analytics (balanced against your rights). (c) Legal obligation (Art. 6(1)(c)) — retaining records we are required to keep under applicable law. (d) Consent (Art. 6(1)(a)) — analytics cookies and optional email marketing, where you have given explicit consent that can be withdrawn at any time.",
      },
      {
        title: "4. How we use your data",
        body: "We use your data to: authenticate your account and route you to the correct dashboard; display your profile to relevant employers (if you are a job seeker) or your company listing to candidates (if you are an employer); process and track job applications; deliver AI-assisted CV review scores and feedback; respond to HR service enquiries; send essential account communications (verification, password reset); improve the platform through aggregate, anonymised analytics; and comply with legal and regulatory obligations.",
      },
      {
        title: "5. Data sharing and recipients",
        body: "We do not sell your personal data. We share data only: (a) Between job seekers and employers — your profile and application materials are shared with employers for roles you have applied to. (b) Service providers — sub-processors who assist with database hosting (PostgreSQL / Supabase), email delivery (Resend), AI processing (OpenAI), and payment processing (Stripe). Each sub-processor is bound by data processing agreements. (c) Legal requirements — if required by court order, law enforcement request, or applicable regulation. We will notify you where legally permitted to do so.",
      },
      {
        title: "6. International data transfers",
        body: "Bridgepath Africa is headquartered in Ghana. Some sub-processors (OpenAI, Resend, Stripe) are based in the United States. Where personal data is transferred outside the European Economic Area or Ghana, we ensure adequate safeguards are in place through Standard Contractual Clauses (SCCs) approved by the European Commission, or equivalent mechanisms. You may request a copy of relevant transfer safeguards from our DPO.",
      },
      {
        title: "7. Retention periods",
        body: "We retain personal data as follows: Active accounts — for the lifetime of your account. Inactive accounts — data is retained for 90 days after inactivity before anonymisation. Job applications — retained for 24 months after the application date, then anonymised. CV review submissions — processed and discarded within 30 days; no raw CV text is stored after the session. Contact enquiries — retained for 24 months. Employer job postings — retained for 36 months after expiry. Financial records — retained for 7 years as required by Ghanaian tax law.",
      },
      {
        title: "8. Your rights",
        body: "Subject to applicable law, you have the right to: (Art. 15) Access — request a copy of the personal data we hold about you. (Art. 16) Rectification — correct inaccurate or incomplete data. (Art. 17) Erasure — request deletion of your data ('right to be forgotten'). (Art. 18) Restriction — limit how we process your data in certain circumstances. (Art. 20) Portability — receive your data in a structured, machine-readable format. (Art. 21) Object — object to processing based on legitimate interests. (Art. 22) Automated decisions — you will not be subject to solely automated decisions with significant legal effect. To exercise any right, email us at " + DPO_EMAIL + ". We will respond within 30 days.",
      },
      {
        title: "9. Security",
        body: "We implement appropriate technical and organisational measures: all data is encrypted in transit (TLS 1.2+); authentication tokens are HMAC-SHA256 signed and expire after 90 days; passwords are salted and hashed (PBKDF2); API routes enforce rate limiting and role-based access control; file uploads are validated for type and size; server access is restricted to authorised personnel.",
      },
      {
        title: "10. Supervisory authority",
        body: "If you are located in the European Economic Area and believe we have not addressed your concern adequately, you have the right to lodge a complaint with your local data protection authority. For Ghana-based users, the relevant authority is the Data Protection Commission of Ghana (www.dataprotection.gov.gh).",
      },
      {
        title: "11. Changes to this policy",
        body: `We may update this Privacy Policy from time to time. We will notify registered users of material changes via email or an in-platform notice at least 14 days before the change takes effect. The current version is always available at bridgepathnetwork.com/privacy. Last updated: ${EFFECTIVE_DATE}.`,
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    eyebrow: "Using Bridgepath Africa",
    intro: `These Terms of Service ("Terms") govern your access to and use of the Bridgepath Africa platform operated by ${CONTROLLER}, ${CONTROLLER_ADDRESS}. By creating an account or using the platform, you agree to these Terms. Effective date: ${EFFECTIVE_DATE}.`,
    sections: [
      {
        title: "1. Platform purpose and eligibility",
        body: "Bridgepath Africa provides recruitment, HR, and talent management services connecting African professionals with employers operating across the African continent and internationally. You must be at least 18 years old and legally able to enter a binding contract in your jurisdiction to use this platform. By registering, you represent that all information you provide is accurate and up to date.",
      },
      {
        title: "2. Account responsibilities",
        body: "You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Notify us immediately at " + SUPPORT_EMAIL + " if you suspect unauthorised access. Do not share your account or use another person's account without permission. We may suspend or terminate accounts that are used in breach of these Terms.",
      },
      {
        title: "3. Job seeker obligations",
        body: "Job seekers must: provide accurate and truthful information in their profile, CV, and applications; only apply for roles they are genuinely interested in and qualified for; not submit false credentials, fabricated work history, or misleading information; not use the platform to spam employers or misuse the application system.",
      },
      {
        title: "4. Employer obligations",
        body: "Employers must: post accurate, genuine job listings that comply with applicable employment law; treat all candidates fairly and without discrimination based on protected characteristics; comply with data protection law when accessing candidate profiles; not use candidate data for purposes unrelated to the stated role; promptly update or close listings that are no longer active.",
      },
      {
        title: "5. Prohibited conduct",
        body: "You must not: use the platform for any unlawful purpose; scrape, harvest, or systematically download platform data; attempt to reverse-engineer, decompile, or interfere with platform systems; upload malicious code, viruses, or harmful content; impersonate another person or organisation; use AI-generated or automated tools to mass-apply for roles without genuine intent.",
      },
      {
        title: "6. Intellectual property",
        body: `The Bridgepath Africa platform, brand, design, software, and content are the exclusive property of ${CONTROLLER}. No licence is granted to reproduce, distribute, or create derivative works without written consent. User-generated content (profiles, CVs, job listings) remains the intellectual property of the user who created it. By uploading content you grant Bridgepath Africa a non-exclusive licence to display and process that content for the purposes of operating the platform.`,
      },
      {
        title: "7. AI CV Review",
        body: "The AI CV Review feature provides automated feedback generated by a third-party large language model. This feedback is for informational purposes only and does not constitute professional careers advice. Bridgepath Africa does not guarantee the accuracy or completeness of AI-generated feedback. We do not store submitted CV text beyond the active session.",
      },
      {
        title: "8. Limitation of liability",
        body: `To the fullest extent permitted by law, ${CONTROLLER} shall not be liable for: indirect, incidental, special, or consequential damages; loss of profits, data, or business opportunities; conduct of third parties including employers and candidates; temporary unavailability of the platform. Our total aggregate liability to any user shall not exceed the amount paid by that user to Bridgepath Africa in the 12 months preceding the claim.`,
      },
      {
        title: "9. Governing law and disputes",
        body: "These Terms are governed by and construed in accordance with the laws of the Republic of Ghana. Any dispute arising from these Terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts of Ghana. If you are a consumer in the European Union, you may also benefit from mandatory consumer protection provisions in your country of residence.",
      },
      {
        title: "10. Changes to these Terms",
        body: `We may update these Terms to reflect changes in law or platform functionality. We will give registered users at least 14 days' notice of material changes via email or in-platform notice. Continued use of the platform after changes take effect constitutes acceptance of the updated Terms. Last updated: ${EFFECTIVE_DATE}.`,
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    eyebrow: "How we use cookies and local storage",
    intro: `This Cookie Policy explains the cookies and local storage technologies Bridgepath Africa uses on our platform, and how you can manage your preferences. Effective date: ${EFFECTIVE_DATE}.`,
    sections: [
      {
        title: "1. What are cookies?",
        body: "Cookies are small text files placed on your device by a website. Bridgepath Africa uses both cookies and browser localStorage (a similar technology) for authentication and preference management. localStorage data is stored on your device and is not transmitted to servers automatically.",
      },
      {
        title: "2. Essential storage (always active)",
        body: "These are strictly necessary to operate the platform and cannot be disabled: Authentication token (localStorage) — stores a signed, expiring session token that identifies your account. Without this you would need to log in on every page visit. User role (localStorage) — records whether you are a job seeker or employer so we can route you to the correct dashboard. Consent preference (localStorage) — records your cookie consent choice so we do not ask you repeatedly.",
      },
      {
        title: "3. Functional storage",
        body: "These improve your experience but are not strictly essential. We currently use no functional third-party cookies beyond the essential items above. If we introduce preference-based features (language, display mode) in future, they will be listed here.",
      },
      {
        title: "4. Analytics cookies (requires consent)",
        body: "We do not currently load analytics scripts without your explicit consent. If you click 'Accept All' on our cookie banner, we may in future use privacy-respecting analytics tools (such as Plausible Analytics or Fathom) to understand aggregate traffic patterns. No analytics tools that track you across third-party sites (e.g. Google Analytics with cross-site tracking) are or will be used without a separate, granular consent request.",
      },
      {
        title: "5. Third-party technologies",
        body: "Google Fonts — we load the Montserrat and Inter typefaces from Google Fonts CDN. Google's privacy policy governs the font serving request (fonts.googleapis.com). This is a technical necessity for consistent typography and involves only a standard HTTP request (no tracking cookies are set by Google Fonts). No other third-party scripts are embedded without your consent.",
      },
      {
        title: "6. Managing your preferences",
        body: "You can change or withdraw your cookie consent at any time by visiting our Cookie Settings page or clearing your browser's localStorage (Settings → Privacy → Clear site data in most browsers). Note: clearing site data will sign you out. You can also configure your browser to block cookies globally, though this may affect platform functionality.",
      },
      {
        title: "7. Contact",
        body: `For questions about our use of cookies or to exercise your data rights, contact our Data Protection Officer at ${DPO_EMAIL} or write to ${CONTROLLER}, ${CONTROLLER_ADDRESS}.`,
      },
    ],
  },
};

export default function LegalPage({ type }: { type: keyof typeof content }) {
  const page = content[type];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageSEO
        title={`${page.title} | Bridgepath Africa`}
        description={`Bridgepath Africa ${page.title.toLowerCase()} — our commitment to protecting your data and ensuring fair, transparent use of our platform.`}
        path={`/${type}`}
        noIndex={true}
      />
      <Navbar />
      <main className="flex-1">
        <section className="py-20 section-ink">
          <div className="container mx-auto px-4 md:px-8 max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] mb-4 text-accent">
              {page.eyebrow}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-5">{page.title}</h1>
            <p className="text-foreground/60 text-lg leading-relaxed max-w-2xl">{page.intro}</p>
          </div>
        </section>
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 md:px-8 max-w-4xl">
            <div className="grid gap-5">
              {page.sections.map((section) => (
                <article key={section.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="text-xl font-bold mb-3" style={{ color: INK }}>{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{section.body}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-2xl p-5 border border-border bg-card">
              <p className="text-xs text-muted-foreground text-center">
                These documents were last updated on <strong>{EFFECTIVE_DATE}</strong>. 
                For questions, email{" "}
                <a href={`mailto:${DPO_EMAIL}`} style={{ color: TERRACOTTA }}>{DPO_EMAIL}</a>.
              </p>
            </div>

            <div className="mt-5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              style={{ backgroundColor: TERRACOTTA + "14", border: `1px solid ${TERRACOTTA}30` }}>
              <div>
                <h3 className="font-bold text-foreground">Need help with your account?</h3>
                <p className="text-sm text-muted-foreground mt-1">Contact our team for privacy, access, or platform support.</p>
              </div>
              <Link href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-white font-semibold shrink-0"
                style={{ backgroundColor: TERRACOTTA }}>
                Contact Bridgepath
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
