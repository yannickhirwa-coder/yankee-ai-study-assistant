
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Yankee AI",
  description: "Learn how Yankee AI collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-violet-400 hover:text-violet-300">
          ← Back to Yankee AI
        </Link>

        <h1 className="mt-8 text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-400">
          Effective date: November 24, 2026
        </p>

        <p className="mt-8 leading-8 text-slate-300">
          Yankee AI is a personal AI-powered study companion designed to help
          users organize their learning, understand difficult topics, practice
          concepts, and monitor their progress. This Privacy Policy explains
          how information is handled when you use our platform.
        </p>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <p className="leading-7 text-slate-300">
            Depending on how you use Yankee AI, we may process:
          </p>
          <ul className="list-disc space-y-2 pl-6 leading-7 text-slate-300">
            <li>Account information, such as your email address and authentication details.</li>
            <li>Study materials, documents, notes, flashcards, and study tasks you choose to save.</li>
            <li>Questions, prompts, and learning content you submit to the AI tutor.</li>
            <li>Learning activity and progress information associated with your account.</li>
            <li>Basic technical information needed to operate and secure the platform.</li>
          </ul>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">2. How We Use Information</h2>
          <p className="leading-7 text-slate-300">
            We use information to provide and maintain your account, operate
            learning tools, generate AI-assisted explanations, save your
            learning activity, improve platform functionality, and protect
            the security of Yankee AI.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">3. AI Services and Third Parties</h2>
          <p className="leading-7 text-slate-300">
            Yankee AI uses Dify to facilitate AI-powered learning features.
            When you submit a question or learning content to the AI tutor,
            that content may be transmitted to Dify and the AI model providers
            configured to generate a response. Those providers may process
            the submitted information under their own terms and privacy
            practices.
          </p>
          <p className="leading-7 text-slate-300">
            We also use Supabase for authentication, database services, and
            file storage. These services process information as needed to
            provide the platform.
          </p>
          <p className="leading-7 text-slate-300">
            Please avoid submitting passwords, financial details, sensitive
            personal information, or other confidential information to the
            AI tutor.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">4. Data Sharing</h2>
          <p className="leading-7 text-slate-300">
            We do not sell your personal information. Information may be
            processed by service providers that help operate Yankee AI, or
            disclosed when required by law or necessary to protect the
            platform and its users.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">5. Data Storage and Security</h2>
          <p className="leading-7 text-slate-300">
            Account and learning information is stored using services such as
            Supabase. We use security measures intended to protect information,
            including account authentication and database access controls.
            However, no online service can guarantee absolute security.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">6. Your Choices and Rights</h2>
          <p className="leading-7 text-slate-300">
            You should keep your account credentials secure and avoid sharing
            information you do not want processed by the platform or its AI
            service providers. You may contact us to ask about accessing,
            correcting, or deleting information associated with your account.
            Some information may need to be retained where required by law or
            for legitimate security purposes.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">7. Children's Privacy</h2>
          <p className="leading-7 text-slate-300">
            Yankee AI is not intended to knowingly collect personal
            information from children in circumstances where parental or
            guardian consent is required. If you believe a child has provided
            personal information inappropriately, contact us.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">8. Changes to This Policy</h2>
          <p className="leading-7 text-slate-300">
            We may update this Privacy Policy as Yankee AI develops. Any
            updated version will be published on this page with a revised
            effective date.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">9. Contact Us</h2>
          <p className="leading-7 text-slate-300">
            For privacy questions or requests, contact:
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
          <Link href="/terms" className="hover:text-violet-400">Terms of Service</Link>
          <p className="mt-4">© 2026 Yankee AI</p>
        </footer>
      </article>
    </main>
  );
}
