export interface Comparison {
  slug: string;
  toolA: string;
  toolB: string;
  category: string;
  summary: string;
  verdict: string;
  criteria: { label: string; toolA: string; toolB: string }[];
}

export const comparisons: Comparison[] = [
  {
    slug: "notion-vs-asana",
    toolA: "notion",
    toolB: "asana",
    category: "Project Management",
    summary: "Notion excels as a flexible workspace for docs and knowledge bases, while Asana is purpose-built for structured project and task management.",
    verdict: "Choose Notion if documentation is central to your workflow. Choose Asana if you need clear task ownership, timelines, and project reporting.",
    criteria: [
      { label: "Task Management", toolA: "Good", toolB: "Excellent" },
      { label: "Documentation", toolA: "Excellent", toolB: "Limited" },
      { label: "Ease of Use", toolA: "Moderate", toolB: "Easy" },
      { label: "Pricing", toolA: "$10/user/mo", toolB: "$10.99/user/mo" },
      { label: "Integrations", toolA: "Good", toolB: "Excellent" },
      { label: "Reporting", toolA: "Basic", toolB: "Advanced" },
    ],
  },
  {
    slug: "monday-vs-clickup",
    toolA: "monday",
    toolB: "clickup",
    category: "Project Management",
    summary: "Monday.com prioritizes visual simplicity and ease of use, while ClickUp offers more features and flexibility at a lower price point.",
    verdict: "Choose Monday if your team values a polished, easy-to-adopt interface. Choose ClickUp if you want maximum features per dollar.",
    criteria: [
      { label: "Ease of Use", toolA: "Easy", toolB: "Moderate" },
      { label: "Features", toolA: "Good", toolB: "Excellent" },
      { label: "Pricing", toolA: "$9/seat/mo", toolB: "$7/member/mo" },
      { label: "Customization", toolA: "Good", toolB: "Excellent" },
      { label: "Automations", toolA: "Good", toolB: "Good" },
      { label: "Mobile App", toolA: "Basic", toolB: "Good" },
    ],
  },
  {
    slug: "trello-vs-asana",
    toolA: "trello",
    toolB: "asana",
    category: "Project Management",
    summary: "Trello is a lightweight Kanban tool ideal for simple workflows, while Asana is a full-featured project management platform.",
    verdict: "Choose Trello for small teams with simple needs. Choose Asana when projects require timelines, dependencies, and cross-team visibility.",
    criteria: [
      { label: "Simplicity", toolA: "Excellent", toolB: "Good" },
      { label: "Scalability", toolA: "Limited", toolB: "Excellent" },
      { label: "Pricing", toolA: "$5/user/mo", toolB: "$10.99/user/mo" },
      { label: "Views", toolA: "Board only", toolB: "Multiple" },
      { label: "Reporting", toolA: "None", toolB: "Advanced" },
      { label: "Free Tier", toolA: "Generous", toolB: "Good" },
    ],
  },
  {
    slug: "notion-vs-clickup",
    toolA: "notion",
    toolB: "clickup",
    category: "Project Management",
    summary: "Both are all-in-one platforms, but Notion leans toward knowledge management while ClickUp is more task-oriented.",
    verdict: "Choose Notion for a docs-first approach. Choose ClickUp if task tracking and project execution are your priorities.",
    criteria: [
      { label: "Documentation", toolA: "Excellent", toolB: "Good" },
      { label: "Task Management", toolA: "Good", toolB: "Excellent" },
      { label: "Pricing", toolA: "$10/user/mo", toolB: "$7/member/mo" },
      { label: "Flexibility", toolA: "Excellent", toolB: "Excellent" },
      { label: "Performance", toolA: "Moderate", toolB: "Moderate" },
      { label: "Learning Curve", toolA: "Steep", toolB: "Steep" },
    ],
  },
  {
    slug: "slack-vs-linear",
    toolA: "slack",
    toolB: "linear",
    category: "Team Productivity",
    summary: "Slack is a team messaging platform, while Linear is an issue tracker. They serve different purposes but often coexist in engineering workflows.",
    verdict: "These tools complement each other. Use Slack for communication and Linear for issue tracking—most teams use both.",
    criteria: [
      { label: "Primary Use", toolA: "Messaging", toolB: "Issue Tracking" },
      { label: "Speed", toolA: "Fast", toolB: "Blazing Fast" },
      { label: "Pricing", toolA: "$7.25/user/mo", toolB: "$8/member/mo" },
      { label: "Integrations", toolA: "Excellent", toolB: "Good" },
      { label: "Design", toolA: "Good", toolB: "Excellent" },
      { label: "Free Tier", toolA: "Limited", toolB: "Generous" },
    ],
  },
  {
    slug: "airtable-vs-notion",
    toolA: "airtable",
    toolB: "notion",
    category: "Database",
    summary: "Airtable is a powerful spreadsheet-database hybrid, while Notion offers database features within a broader workspace context.",
    verdict: "Choose Airtable for serious data management. Choose Notion if you need databases alongside docs and project management.",
    criteria: [
      { label: "Data Modeling", toolA: "Excellent", toolB: "Good" },
      { label: "Documentation", toolA: "None", toolB: "Excellent" },
      { label: "Pricing", toolA: "$20/seat/mo", toolB: "$10/user/mo" },
      { label: "API", toolA: "Excellent", toolB: "Good" },
      { label: "Views", toolA: "Excellent", toolB: "Good" },
      { label: "Ease of Use", toolA: "Moderate", toolB: "Moderate" },
    ],
  },
];

export function getComparisonBySlug(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}
