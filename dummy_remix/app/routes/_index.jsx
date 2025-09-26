import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { motion } from "framer-motion";

export const meta = () => {
  return [
    { title: "CoSchool - Learning Platform" },
    { name: "description", content: "Welcome to the CoSchool learning platform!" },
  ];
};

export const loader = async () => {
  // Add any data loading logic here
  return json({
    message: "Welcome to CoSchool!",
  });
};

export default function Index() {
  const data = useLoaderData();

  useEffect(() => {
    // Client-side code can go here
    console.log("Home page loaded");
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "2rem",
          textAlign: "center"
        }}
      >
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          {data.message}
        </h1>
        <p style={{ fontSize: "1.25rem", marginBottom: "2rem" }}>
          This is a Remix application for the CoSchool platform
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem",
          marginTop: "2rem"
        }}>
          <div style={{
            padding: "1.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            background: "#f8f9fa"
          }}>
            <h2 style={{ fontSize: "1.25rem" }}>Learn</h2>
            <p>Access interactive learning materials and resources</p>
          </div>

          <div style={{
            padding: "1.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            background: "#f8f9fa"
          }}>
            <h2 style={{ fontSize: "1.25rem" }}>Practice</h2>
            <p>Complete exercises to reinforce your knowledge</p>
          </div>

          <div style={{
            padding: "1.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            background: "#f8f9fa"
          }}>
            <h2 style={{ fontSize: "1.25rem" }}>Connect</h2>
            <p>Join study groups and collaborate with peers</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}