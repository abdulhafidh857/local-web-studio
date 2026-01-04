import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Megaphone, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Advertisement {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  is_active: boolean;
  priority: number;
  created_at: string;
}

const AdvertisementSection = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAdvertisements(data || []);
    } catch (error) {
      console.error("Error fetching advertisements:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % advertisements.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + advertisements.length) % advertisements.length);
  };

  useEffect(() => {
    if (advertisements.length > 1) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [advertisements.length]);

  if (loading || advertisements.length === 0) {
    return null;
  }

  const currentAd = advertisements[currentIndex];

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Megaphone className="w-4 h-4" />
            <span className="text-sm font-medium">Announcements</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Latest Updates
          </h2>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <motion.div
            key={currentAd.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden border-primary/20 shadow-lg">
              <CardContent className="p-0">
                <div className={`grid ${currentAd.image_url ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                  {currentAd.image_url && (
                    <div className="h-64 md:h-80">
                      <img
                        src={currentAd.image_url}
                        alt={currentAd.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
                      {currentAd.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {currentAd.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Posted: {new Date(currentAd.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {advertisements.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background shadow-md"
                onClick={prevSlide}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background shadow-md"
                onClick={nextSlide}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <div className="flex justify-center gap-2 mt-6">
                {advertisements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? "bg-primary" : "bg-primary/30"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdvertisementSection;
