import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const goals = [
  {
    number: "01",
    title: "Promote Professional Practice",
    description:
      "Strengthen the quality, credibility, and visibility of private practice in social work throughout Zanzibar.",
  },
  {
    number: "02",
    title: "Strengthen Ethical Standards",
    description:
      "Ensure all practitioners adhere to a clear and enforceable Code of Ethics that promotes dignity, justice, and integrity.",
  },
  {
    number: "03",
    title: "Continuous Professional Development",
    description:
      "Offer training, workshops, supervision, and resources that enhance skills and update practitioners with modern methods.",
  },
  {
    number: "04",
    title: "Advocate for Social Justice",
    description:
      "Work with government, NGOs, and communities to shape policies that protect vulnerable groups.",
  },
  {
    number: "05",
    title: "Build Strong Networks",
    description:
      "Connect social workers for mentorship, career growth, research, and collaboration.",
  },
  {
    number: "06",
    title: "Promote Accessible Services",
    description:
      "Ensure individuals and families can access reliable, affordable, and culturally responsive social services.",
  },
];

const GoalsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding bg-background">
      <div className="container-max" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-secondary text-primary rounded-full">
            Our Goals
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6">
            What We Strive For
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our strategic objectives guide our work towards building a stronger
            social work community in Zanzibar.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute -top-4 -left-2 text-6xl font-heading font-bold text-primary/10 group-hover:text-primary/20 transition-colors duration-300">
                {goal.number}
              </div>
              <div className="relative bg-card rounded-2xl p-6 pt-8 shadow-soft border border-border hover:shadow-card transition-shadow duration-300">
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                  {goal.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {goal.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoalsSection;
