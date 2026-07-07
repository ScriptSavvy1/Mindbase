import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white text-sm font-black">
                M
              </div>
              Mindbase Academy
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed">
              The technical e-learning platform for AI and Fintech. Build
              production-grade systems with industry experts.
            </p>
          </div>

          {/* Courses */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              Courses
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Artificial Intelligence", href: "/courses?category=ai" },
                { label: "Fintech Engineering", href: "/courses?category=fintech" },
                { label: "Web3 Development", href: "/courses?category=other" },
                { label: "Data Science", href: "/courses?category=ai" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "#" },
                { label: "Become an Instructor", href: "/signup" },
                { label: "Careers", href: "#" },
                { label: "Blog", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Help Center", href: "#" },
                { label: "Contact Support", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Mindbase Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Security", "Privacy Policy", "Terms of Service"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
