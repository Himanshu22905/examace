import { LegalLayout } from "./LegalShared";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>Mockies.in collects limited personal information required for account creation, exam analytics, and platform security. This includes your name, email, optional mobile number, profile fields, and test performance data.</p>
      <p>We use your information to provide mock tests, generate performance analysis, personalize study recommendations, detect abuse, and improve quality of service.</p>
      <p>We do not sell personal data to third parties. We may share data only with essential service providers (hosting, database, email, authentication, AI providers) solely for operating the platform.</p>
      <p>We apply industry-standard controls including authenticated access, role-based authorization, and audit logging for sensitive actions. However, no platform can guarantee absolute security.</p>
      <p>Students can request correction or deletion of profile data by contacting the support email listed on the website footer.</p>
      <p>Where applicable under Indian law, this policy is intended to align with Digital Personal Data Protection requirements and Information Technology law obligations.</p>
    </LegalLayout>
  );
}
