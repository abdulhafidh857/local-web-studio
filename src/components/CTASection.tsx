import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-padding bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container-max relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/10 mb-6">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>

          <h2 className="text-3xl md:text-5xl font-heading font-bold text-primary-foreground mb-6">
            Join PPSWZ Today!
          </h2>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 leading-relaxed">
            Become part of a strong network committed to ethics, professionalism,
            and innovation in private social work practice in Zanzibar. Together,
            we can make a difference.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="lg" className="group">
              Become a Member
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="lg">
              Learn More About Us
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
