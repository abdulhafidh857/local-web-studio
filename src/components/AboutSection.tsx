import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Eye, CheckCircle } from "lucide-react";

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const missions = [
    "Strengthen the capacity of social workers through training, collaboration, and professional leadership.",
    "Provide social, psychosocial, counselling, and intervention services that respond to diverse needs.",
    "Educate communities on rights, social welfare, development, and protection.",
    "Collaborate with Government, NGOs, and stakeholders to enhance community welfare.",
    "Uphold the highest standards of ethics, professionalism, and accountability.",
  ];

  return (
    <section id="about" ref={ref} className="section-padding bg-background">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-secondary text-primary rounded-full">
            About Us
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Who We Are
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Private Practice in Social Work Zanzibar (PPSWZ) is a professional
            body that brings together independent social workers dedicated to
            delivering high-quality, ethical, and innovative social work
            services within Zanzibar.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card rounded-2xl p-8 shadow-card border border-border"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-foreground">
                Our Vision
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              To become a strong and leading national network that champions
              high-quality, innovative, and ethically grounded social work
              services delivered through private practice in Zanzibar.
            </p>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-card rounded-2xl p-8 shadow-card border border-border"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                <Target className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-foreground">
                Our Mission
              </h3>
            </div>
            <ul className="space-y-3">
              {missions.map((mission, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm leading-relaxed">
                    {mission}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
