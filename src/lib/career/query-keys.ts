export const careerKeys = {
  all: ["career"] as const,
  context: () => [...careerKeys.all, "context"] as const,
};
