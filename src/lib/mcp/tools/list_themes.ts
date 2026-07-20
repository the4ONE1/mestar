import { defineTool } from "@lovable.dev/mcp-js";

const THEMES = [
  "Space Adventure",
  "Underwater Journey",
  "Dinosaur Discovery",
  "Fairy Tale Kingdom",
  "Superhero Origin",
  "Jungle Safari",
  "Magical Forest",
  "Pirate Quest",
  "Farm Animals",
  "Sports Champion",
  "Dance & Music",
  "Bedtime Dreams",
  "Birthday Celebration",
  "Winter Wonderland",
  "Ocean Rescue",
  "Robot Friends",
];

export default defineTool({
  name: "list_story_themes",
  title: "List story themes",
  description:
    "List the story themes a customer can choose when personalizing a MeStar storybook.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: THEMES.join(", ") }],
    structuredContent: { themes: THEMES },
  }),
});
