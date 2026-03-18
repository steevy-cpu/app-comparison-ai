export interface Tool {
  slug: string;
  name: string;
  category: string;
  description: string;
  website: string;
  pricing: string;
  rating: number;
  features: string[];
  pros: string[];
  cons: string[];
  bestFor: string;
}

export const tools: Tool[] = [
  {
    slug: "notion",
    name: "Notion",
    category: "Project Management",
    description: "An all-in-one workspace that combines notes, docs, project management, and wikis into a single platform.",
    website: "notion.so",
    pricing: "Free / $10 per user/mo",
    rating: 4.7,
    features: ["Docs & Wikis", "Databases", "Project Boards", "Templates", "API Access", "AI Assistant"],
    pros: ["Extremely flexible and customizable", "Great for documentation", "Strong template ecosystem"],
    cons: ["Can feel slow with large databases", "Steep learning curve for advanced features", "Limited offline support"],
    bestFor: "Teams that need a flexible, all-in-one workspace for docs and light project management.",
  },
  {
    slug: "asana",
    name: "Asana",
    category: "Project Management",
    description: "A work management platform designed to help teams organize, track, and manage their work and projects.",
    website: "asana.com",
    pricing: "Free / $10.99 per user/mo",
    rating: 4.5,
    features: ["Task Management", "Timeline View", "Portfolios", "Workflows", "Reporting", "Integrations"],
    pros: ["Clean, intuitive interface", "Excellent timeline and portfolio views", "Strong automation features"],
    cons: ["Gets expensive at scale", "Limited customization compared to Notion", "No built-in docs"],
    bestFor: "Teams that need structured project tracking with clear timelines and accountability.",
  },
  {
    slug: "monday",
    name: "Monday.com",
    category: "Project Management",
    description: "A flexible work operating system that lets teams build custom workflows for any type of project.",
    website: "monday.com",
    pricing: "Free / $9 per seat/mo",
    rating: 4.4,
    features: ["Custom Workflows", "Dashboards", "Automations", "Time Tracking", "Gantt Charts", "Integrations"],
    pros: ["Highly visual and colorful interface", "Easy to set up automations", "Good for non-technical teams"],
    cons: ["Pricing can escalate quickly", "Can be overwhelming with too many boards", "Mobile app is limited"],
    bestFor: "Non-technical teams who want a visual, easy-to-customize project tracker.",
  },
  {
    slug: "clickup",
    name: "ClickUp",
    category: "Project Management",
    description: "A productivity platform that provides a comprehensive suite of tools to manage tasks, docs, goals, and more.",
    website: "clickup.com",
    pricing: "Free / $7 per member/mo",
    rating: 4.3,
    features: ["Task Management", "Docs", "Goals", "Whiteboards", "Time Tracking", "Dashboards"],
    pros: ["Feature-rich at every price tier", "Competitive pricing", "Constant product updates"],
    cons: ["Can feel cluttered and complex", "Performance issues reported", "Too many features can overwhelm"],
    bestFor: "Power users and teams who want maximum features at a competitive price.",
  },
  {
    slug: "trello",
    name: "Trello",
    category: "Project Management",
    description: "A visual collaboration tool that uses boards, lists, and cards to help teams organize tasks and projects.",
    website: "trello.com",
    pricing: "Free / $5 per user/mo",
    rating: 4.4,
    features: ["Kanban Boards", "Power-Ups", "Butler Automation", "Templates", "Calendar View", "Integrations"],
    pros: ["Simple and intuitive", "Great free tier", "Quick to set up"],
    cons: ["Limited for complex projects", "Lacks built-in reporting", "No native time tracking"],
    bestFor: "Small teams and individuals who prefer a simple, visual Kanban approach.",
  },
  {
    slug: "airtable",
    name: "Airtable",
    category: "Database",
    description: "A cloud-based platform that combines the simplicity of a spreadsheet with the power of a database.",
    website: "airtable.com",
    pricing: "Free / $20 per seat/mo",
    rating: 4.6,
    features: ["Spreadsheet-Database Hybrid", "Views", "Automations", "Apps", "API Access", "Sync"],
    pros: ["Incredibly flexible data modeling", "Beautiful interface", "Powerful API"],
    cons: ["Expensive at scale", "Row limits on lower tiers", "Steep learning curve for advanced use"],
    bestFor: "Teams that need a flexible database with spreadsheet-like usability.",
  },
  {
    slug: "slack",
    name: "Slack",
    category: "Communication",
    description: "A messaging platform for teams that organizes conversations into channels for focused discussions.",
    website: "slack.com",
    pricing: "Free / $7.25 per user/mo",
    rating: 4.5,
    features: ["Channels", "Direct Messages", "Huddles", "Workflows", "App Integrations", "Search"],
    pros: ["Excellent integration ecosystem", "Intuitive messaging experience", "Strong search functionality"],
    cons: ["Can become noisy and distracting", "Message history limits on free tier", "Expensive for large teams"],
    bestFor: "Teams of all sizes that need a central communication hub with strong integrations.",
  },
  {
    slug: "linear",
    name: "Linear",
    category: "Issue Tracking",
    description: "A streamlined issue tracking tool built for modern software teams who value speed and simplicity.",
    website: "linear.app",
    pricing: "Free / $8 per member/mo",
    rating: 4.8,
    features: ["Issue Tracking", "Cycles", "Roadmaps", "Projects", "Git Integration", "API"],
    pros: ["Blazing fast interface", "Opinionated but effective workflows", "Beautiful design"],
    cons: ["Less flexible than competitors", "Limited for non-engineering teams", "Smaller integration ecosystem"],
    bestFor: "Engineering teams who want a fast, opinionated issue tracker.",
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
