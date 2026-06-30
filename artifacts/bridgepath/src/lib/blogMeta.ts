export interface BlogMeta {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  author: { name: string; role: string; avatar: string };
}

export const blogMeta: BlogMeta[] = [
  {
    slug: "peo-vs-employment-agencies",
    tag: "Recruitment",
    title: "How Professional Employer Organizations Differ from Employment Agencies",
    excerpt: "We explore the key differences between PEOs and other types of HR service providers across Africa — and why it matters for your business.",
    date: "April 9, 2026",
    readTime: "6 min read",
    image: "/photos/blog-peo-hr-team.webp",
    author: { name: "Bridgepath Africa", role: "Editorial Team", avatar: "/logo-bridgepath.webp" },
  },
  {
    slug: "ai-africa-workforce",
    tag: "AI & Talent",
    title: "AI in Africa: Building a Modern Workforce",
    excerpt: "Artificial intelligence is rapidly changing how companies recruit and assess talent across Africa. Here is what HR leaders need to know.",
    date: "March 22, 2026",
    readTime: "7 min read",
    image: "/photos/blog-ai-africa-workforce.webp",
    author: { name: "Bridgepath Africa", role: "Editorial Team", avatar: "/logo-bridgepath.webp" },
  },
  {
    slug: "ssnit-compliance-ghana-2026",
    tag: "HR Strategy",
    title: "Ghana SSNIT Compliance: What Employers Must Know in 2026",
    excerpt: "Ghana's SSNIT regulations carry significant penalties for non-compliant employers. Here is what every business operating in Ghana needs to understand.",
    date: "March 10, 2026",
    readTime: "5 min read",
    image: "/photos/blog-nssf-compliance.webp",
    author: { name: "Bridgepath Africa", role: "Editorial Team", avatar: "/logo-bridgepath.webp" },
  },
  {
    slug: "africans-global-careers",
    tag: "Career Growth",
    title: "How Africans Are Building Global Careers Using Digital Tools",
    excerpt: "Top professionals are using platforms like Bridgepath Africa to find international opportunities from anywhere on the continent.",
    date: "February 28, 2026",
    readTime: "6 min read",
    image: "/photos/blog-african-global-careers.webp",
    author: { name: "Bridgepath Africa", role: "Editorial Team", avatar: "/logo-bridgepath.webp" },
  },
];
