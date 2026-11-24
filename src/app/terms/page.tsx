
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Yankee AI",
  description: "Read the terms and conditions for using Yankee AI.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-violet-400 hover:text-violet-300">
          ← Back to Yankee AI
        </Link>

        <h1 className="mt-8 text-4xl font-bold">Terms of Service</h1>
        <p className="mt-3 text-sm text-slate-400">
          Effective date: November 24, 2026
        </p>

        <p className="mt-8 leading-8 text-slate-300">
          Welcome to Yankee AI. These Terms of Service govern your access to
          and use of our AI-powered study companion. By using Yankee AI, you
          agree to these terms.
        </p>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">1. Purpose of the Platform</h2>
          <p className="leading-7 text-slate-300">
            Yankee AI provides tools to support learning and study
            organization, including AI-assisted tutoring, study materials,
            flashcards, study planning, and progress tracking.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">2. Eligibility and Accounts</h2>
          <p className="leading-7 text-slate-300">
            You must provide accurate information when creating an account
            and keep your login credentials secure. You are responsible for
            activity carried out through your account. Do not impersonate
            another person or access another user's account without
            authorization.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">3. Acceptable Use</h2>
          <p className="leading-7 text-slate-300">
            You agree not to misuse Yankee AI, interfere with its operation,
            attempt unauthorized access, distribute harmful code, violate
            other people's rights, or use the platform for unlawful purposes.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">4. AI-Generated Content</h2>
          <p className="leading-7 text-slate-300">
            AI-generated explanations, summaries, quizzes, and other
            responses are provided for educational assistance. AI outputs
            may contain errors, omissions, or outdated information. You
            should independently verify important information and use your
            own judgment. Yankee AI does not guarantee academic results or
            the accuracy of every AI response.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">5. Your Content</h2>
          <p className="leading-7 text-slate-300">
            You remain responsible for the materials, documents, prompts,
            and other content you submit or store. You should only upload
            content you have the right to use. You must not upload content
            that unlawfully violates another person's privacy or
            intellectual property rights.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">6. Third-Party Services</h2>
          <p className="leading-7 text-slate-300">
            Yankee AI relies on third-party services, including Supabase
            and Dify, to provide certain features. Your use of those
            features may involve processing under the third parties'
            applicable terms and privacy policies. We are not responsible
            for independent services outside our control.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">7. Availability and Changes</h2>
          <p className="leading-7 text-slate-300">
            We may update, modify, suspend, or discontinue features as the
            platform develops. We aim to keep Yankee AI available, but we
            cannot guarantee uninterrupted or error-free service.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">8. Account Suspension</h2>
          <p className="leading-7 text-slate-300">
            We may restrict or suspend access where we reasonably believe
            an account is being used unlawfully, abusively, or in a way
            that threatens the security or operation of Yankee AI.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">9. Disclaimer</h2>
          <p className="leading-7 text-slate-300">
            Yankee AI is provided on an available basis. To the extent
            permitted by applicable law, we make no guarantee that the
            platform will meet every user's needs or that its AI-generated
            content will always be accurate or suitable for a particular
            purpose.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">10. Changes to These Terms</h2>
          <p className="leading-7 text-slate-300">
            We may revise these terms as the platform changes. Updated
            terms will be published on this page with a revised effective
            date. Continued use after an update means you accept the
            revised terms, where permitted by applicable law.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">11. Contact</h2>
          <p className="leading-7 text-slate-300">
            If you have questions about these terms, contact:
          </p>
          <a
            href="mailto:yannickhirwa53@gmail.com"
            className="text-violet-400 hover:underline"
          >
            yannickhirwa53@gmail.com
          </a>
        </section>

        <footer className="mt-16 border-t border-white/10 pt-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-violet-400">Home</Link>
          {" · "}
          <Link href="/privacy" className="hover:text-violet-400">Privacy Policy</Link>
          <p className="mt-4">© 2026 Yankee AI</p>
        </footer>
      </article>
    </main>
  );
}
