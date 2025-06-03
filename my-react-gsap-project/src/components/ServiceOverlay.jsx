import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import useWindowSize from '../hooks/useWindowSize';

// The same eight services from your P5 sketch
const services = [
  {
    title: "Web Development",
    description:
      "We create stunning, responsive websites that engage your audience and drive results. Our team specializes in modern web technologies and best practices to deliver exceptional user experiences.",
    features: [
      "Custom website design and development",
      "Responsive and mobile-optimized layouts",
      "E-commerce solutions",
      "Content management systems",
    ],
  },
  {
    title: "Mobile Development",
    description:
      "Transform your ideas into powerful mobile applications. We develop native and cross-platform apps that provide seamless user experiences across all devices and operating systems.",
    features: [
      "iOS and Android native apps",
      "Cross-platform development",
      "App store optimization",
      "Mobile app maintenance and updates",
    ],
  },
  {
    title: "UI/UX Design",
    description:
      "Create intuitive and visually appealing user interfaces that delight your customers. Our design team focuses on user research, wireframing, and prototyping to ensure optimal user experiences.",
    features: [
      "User research and persona development",
      "Wireframing and prototyping",
      "Visual design and branding",
      "Usability testing and optimization",
    ],
  },
  {
    title: "Cloud Solutions",
    description:
      "Leverage the power of cloud computing to scale your business efficiently. We provide comprehensive cloud migration, infrastructure setup, and ongoing management services.",
    features: [
      "Cloud migration strategies",
      "Infrastructure as Code",
      "Auto-scaling and load balancing",
      "Cloud security and compliance",
    ],
  },
  {
    title: "Data Analytics",
    description:
      "Turn your data into actionable insights. Our analytics team helps you collect, process, and analyze data to make informed business decisions and drive growth.",
    features: [
      "Data collection and integration",
      "Business intelligence dashboards",
      "Predictive analytics and machine learning",
      "Real-time reporting and monitoring",
    ],
  },
  {
    title: "Digital Marketing",
    description:
      "Boost your online presence and reach your target audience effectively. Our digital marketing strategies combine creativity with data-driven approaches to maximize your ROI.",
    features: [
      "Search engine optimization (SEO)",
      "Pay-per-click advertising (PPC)",
      "Social media marketing",
      "Content marketing and strategy",
    ],
  },
  {
    title: "Consulting",
    description:
      "Get expert guidance on your technology strategy and business transformation. Our consultants work closely with you to identify opportunities and implement solutions that drive success.",
    features: [
      "Technology strategy and roadmapping",
      "Digital transformation consulting",
      "Process optimization",
      "Change management and training",
    ],
  },
  {
    title: "Support & Maintenance",
    description:
      "Keep your systems running smoothly with our comprehensive support and maintenance services. We provide ongoing monitoring, updates, and technical support to ensure optimal performance.",
    features: [
      "24/7 system monitoring",
      "Regular updates and patches",
      "Performance optimization",
      "Technical support and troubleshooting",
    ],
  },
];

export default function ServiceOverlay({ scrollPos, active }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const { width, height } = useWindowSize();

  const headerOffset = 120;
  const canvasH = height - headerOffset;

  // Update activeIdx whenever scrollPos changes (only in stacked mode)
  useEffect(() => {
    if (!active) return;
    let raw = scrollPos - 1;
    raw = Math.max(0, Math.min(7, raw));
    setActiveIdx(Math.floor(raw));
  }, [scrollPos, active]);

  // Whenever activeIdx changes, animate the container up/down so the correct panel is visible
  useEffect(() => {
    if (!active) return;

    const targetY = -activeIdx * canvasH;
    gsap.to("#services-container", {
      y: targetY,
      duration: 0.5,
      ease: "power2.out",
    });
  }, [activeIdx, active, canvasH]);

  // If not active, don't render anything
  if (!active) return null;

  return (
    <div id="service-overlay" className={active ? "active" : ""}>
      <div
        id="services-container"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
        }}
      >
        {services.map((svc, idx) => (
          <div
            key={idx}
            className="service-content"
            style={{
              height: canvasH,
            }}
          >
            <h2>{svc.title}</h2>
            <p>{svc.description}</p>
            <ul>
              {svc.features.map((feat, j) => (
                <li key={j}>{feat}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
