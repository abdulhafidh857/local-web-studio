import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Heart,
  GraduationCap,
  Users,
  FileSearch,
  Handshake,
  Shield,
  Accessibility,
  Briefcase,
} from "lucide-react";

const services = [
  {
    icon: Heart,
    title: "Professional Social Work Services",
    description:
      "Counselling for individuals, couples, and families. Case management and psychosocial services for vulnerable groups.",
  },
  {
    icon: GraduationCap,
    title: "Capacity Building",
    description:
      "Training for social work professionals, workshops on professional ethics, coaching and mentorship.",
  },
  {
    icon: Users,
    title: "Community Outreach & Education",
    description:
      "Awareness campaigns on rights, mental health, child protection, family wellbeing, and substance abuse.",
  },
  {
    icon: FileSearch,
    title: "Research & Policy Engagement",
    description:
      "Research on social issues, professional consultation on policies, and publishing reports.",
  },
  {
    icon: Handshake,
    title: "Networking & Collaboration",
    description:
      "Connecting social workers, building partnerships, and sharing knowledge and best practices.",
  },
  {
    icon: Shield,
    title: "Ethical Oversight & Standards",
    description:
      "Enforcement of PPSWZ Code of Ethics, review of ethical complaints, and compliance monitoring.",
  },
  {
    icon: Accessibility,
    title: "Support to Vulnerable Groups",
    description:
      "Counselling, family therapy, child protection, rehabilitation support, and empowerment programs.",
  },
  {
    icon: Briefcase,
    title: "Private Practice Development",
    description:
      "Business skills training, practice management, financial literacy, and marketing guidance.",
  },
];

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" ref={ref} className="section-padding bg-secondary">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full">
            Our Services
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Core Activities
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive social work services designed to enhance the
            well-being of individuals, families, and communities across
            Zanzibar.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card rounded-2xl p-6 shadow-soft border border-border hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <service.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
