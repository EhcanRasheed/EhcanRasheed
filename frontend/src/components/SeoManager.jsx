import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Hire-Craft';
const DEFAULT_URL = 'https://hire-craft.app';
const DEFAULT_DESCRIPTION =
  'Hire-Craft helps candidates prepare smarter with AI mock interviews, resume analysis, and hiring workflows.';

function upsertMeta(name, content, attr = 'name') {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function isMatch(pathname, route) {
  if (route.exact) return pathname === route.path;
  return pathname.startsWith(route.path);
}

const PUBLIC_SEO_ROUTES = [
  {
    path: '/',
    exact: true,
    title: 'Hire-Craft | AI Interview Preparation Platform',
    description:
      'Prepare for interviews with AI coaching, realistic mock sessions, and actionable performance feedback.',
    index: true,
  },
  {
    path: '/hiring-ease',
    exact: true,
    title: 'Hire-Craft Hiring Ease | Smarter Candidate Interviews',
    description:
      'Run structured AI-assisted interview workflows and evaluate candidates with consistent scoring.',
    index: true,
  },
  {
    path: '/hiring-ease/login',
    exact: true,
    title: 'Hiring Ease Login | Hire-Craft',
    description: 'Sign in to your Hiring Ease account.',
    index: false,
  },
  {
    path: '/hiring-ease/register',
    exact: true,
    title: 'Create Hiring Ease Account | Hire-Craft',
    description: 'Create your Hiring Ease account to start managing interview sessions.',
    index: false,
  },
  {
    path: '/login',
    exact: true,
    title: 'Login | Hire-Craft',
    description: 'Log in to your Hire-Craft account.',
    index: false,
  },
  {
    path: '/register',
    exact: true,
    title: 'Create Account | Hire-Craft',
    description: 'Create your Hire-Craft account and start preparing for interviews.',
    index: false,
  },
  {
    path: '/forgot-password',
    exact: true,
    title: 'Reset Password | Hire-Craft',
    description: 'Request a password reset link for your Hire-Craft account.',
    index: false,
  },
  {
    path: '/reset-password',
    exact: true,
    title: 'Set New Password | Hire-Craft',
    description: 'Set a new password for your account securely.',
    index: false,
  },
];

const PRIVATE_PREFIXES = [
  '/dashboard',
  '/chatbot',
  '/resume',
  '/interview',
  '/subscription',
  '/change-password',
  '/change-username',
  '/admin',
  '/verify-otp',
  '/hiring-ease/dashboard',
  '/hiring-ease/banks',
  '/hiring-ease/create-session',
  '/hiring-ease/session',
  '/hiring-ease/candidate',
  '/hiring-ease/payment',
  '/hire/',
];

export default function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const siteUrl = (import.meta.env.VITE_SITE_URL || DEFAULT_URL).replace(/\/$/, '');
    const pathname = location.pathname || '/';
    const current = PUBLIC_SEO_ROUTES.find((r) => isMatch(pathname, r));
    const isPrivate = PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    const title = current?.title || `${SITE_NAME} | AI Interview & Hiring Platform`;
    const description = current?.description || DEFAULT_DESCRIPTION;
    const canIndex = current ? current.index : false;
    const canonical = `${siteUrl}${pathname}`;

    document.title = title;
    upsertMeta('description', description);
    upsertMeta('robots', canIndex ? 'index,follow' : 'noindex,nofollow,max-snippet:-1,max-image-preview:none');
    upsertMeta('theme-color', '#0f1117');

    upsertMeta('og:type', 'website', 'property');
    upsertMeta('og:site_name', SITE_NAME, 'property');
    upsertMeta('og:title', title, 'property');
    upsertMeta('og:description', description, 'property');
    upsertMeta('og:url', canonical, 'property');

    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);

    upsertLink('canonical', canonical);
  }, [location.pathname]);

  return null;
}
