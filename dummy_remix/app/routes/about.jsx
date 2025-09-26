import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export const meta = () => {
  return [
    { title: "About CoSchool" },
    { name: "description", content: "About the CoSchool learning platform" },
  ];
};

const markdownContent = `
# About CoSchool

CoSchool is an innovative learning platform designed to provide students with an engaging and interactive educational experience.

## Our Mission

To make high-quality education accessible to everyone by leveraging technology to create immersive learning experiences.

## Features

- **Interactive Lessons**: Learn through engaging content and activities
- **Progress Tracking**: Monitor your learning journey with detailed analytics
- **Collaborative Learning**: Connect with peers and instructors
- **Personalized Learning**: Content tailored to your learning style and pace

## Math Support

We support mathematical notation using KaTeX:

$E = mc^2$

$\\frac{n!}{k!(n-k)!} = \\binom{n}{k}$

## Contact Us

For more information, reach out to our support team.
`;

export default function About() {
  useEffect(() => {
    // Client-side code can go here
    console.log("About page loaded");
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {markdownContent}
      </ReactMarkdown>

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <a href="/" style={{ color: "#0066cc", textDecoration: "none" }}>
          Back to Home
        </a>
      </div>
    </div>
  );
}