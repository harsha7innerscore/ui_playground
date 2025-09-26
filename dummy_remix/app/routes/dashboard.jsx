import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";

export const meta = () => {
  return [
    { title: "Dashboard - CoSchool" },
    { name: "description", content: "Your learning dashboard" },
  ];
};

export const loader = async () => {
  // Mock data - in a real app, this would come from your API
  const courses = [
    { id: 1, title: "Mathematics", progress: 75, level: "Intermediate" },
    { id: 2, title: "Physics", progress: 45, level: "Advanced" },
    { id: 3, title: "Chemistry", progress: 90, level: "Beginner" },
    { id: 4, title: "Biology", progress: 30, level: "Intermediate" },
    { id: 5, title: "Computer Science", progress: 60, level: "Advanced" },
    { id: 6, title: "Literature", progress: 85, level: "Beginner" },
  ];

  const notifications = [
    { id: 1, message: "New assignment available in Physics", read: false },
    { id: 2, message: "You've completed 75% of Mathematics", read: true },
    { id: 3, message: "Quiz scheduled for Chemistry next week", read: false },
  ];

  return json({
    courses,
    notifications,
    user: {
      name: "Student User",
      email: "student@example.com",
      avatar: null, // In a real app, this would be a URL
    },
  });
};

export default function Dashboard() {
  const data = useLoaderData();
  const [loading, setLoading] = useState(true);
  const isDesktop = useMediaQuery({ minWidth: 992 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const breakpointColumnsObj = {
    default: 3,
    992: 2,
    576: 1
  };

  const ProgressBar = ({ progress }) => {
    return (
      <div style={{
        width: "100%",
        height: "8px",
        backgroundColor: "#e9ecef",
        borderRadius: "4px",
        marginTop: "0.5rem",
        marginBottom: "0.5rem"
      }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          backgroundColor: progress > 75 ? "#28a745" : progress > 50 ? "#ffc107" : "#dc3545",
          borderRadius: "4px",
          transition: "width 0.5s ease-in-out"
        }} />
      </div>
    );
  };

  const variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Welcome back, {data.user.name}</h1>
          <p>Continue your learning journey from where you left off.</p>
        </header>

        <div style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "3fr 1fr" : "1fr",
          gap: "2rem"
        }}>
          <section>
            <h2 style={{ marginBottom: "1.5rem" }}>Your Courses</h2>
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : isTablet ? "1fr 1fr" : "1fr", gap: "1rem" }}>
                {Array(6).fill().map((_, index) => (
                  <div key={index} style={{ padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                    <Skeleton height={30} width="80%" />
                    <Skeleton height={15} width="60%" style={{ marginTop: "0.5rem" }} />
                    <Skeleton height={8} style={{ marginTop: "1rem", marginBottom: "1rem" }} />
                    <Skeleton height={20} width="40%" />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                variants={variants}
                initial="hidden"
                animate="show"
              >
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="masonry-grid"
                  columnClassName="masonry-grid-column"
                  style={{ display: "flex" }}
                >
                  {data.courses.map((course) => (
                    <motion.div
                      key={course.id}
                      variants={itemVariants}
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        padding: "1.5rem",
                        marginBottom: "1.5rem"
                      }}
                    >
                      <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{course.title}</h3>
                      <p style={{ color: "#6c757d", fontSize: "0.875rem", marginBottom: "1rem" }}>Level: {course.level}</p>
                      <ProgressBar progress={course.progress} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.875rem" }}>{course.progress}% Complete</span>
                        <button style={{
                          backgroundColor: "#0066cc",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.875rem",
                          cursor: "pointer"
                        }}>
                          Continue
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </Masonry>
              </motion.div>
            )}
          </section>

          <section>
            <h2 style={{ marginBottom: "1.5rem" }}>Notifications</h2>
            {loading ? (
              Array(3).fill().map((_, index) => (
                <div key={index} style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "0.5rem" }}>
                  <Skeleton height={15} width="90%" />
                  <Skeleton height={10} width="60%" style={{ marginTop: "0.5rem" }} />
                </div>
              ))
            ) : (
              <motion.div
                variants={variants}
                initial="hidden"
                animate="show"
              >
                {data.notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    variants={itemVariants}
                    style={{
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      marginBottom: "1rem",
                      backgroundColor: notification.read ? "#f8f9fa" : "#e6f7ff",
                      borderLeft: notification.read ? "4px solid #e9ecef" : "4px solid #0066cc"
                    }}
                  >
                    <p style={{ margin: 0 }}>{notification.message}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}