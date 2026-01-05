import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Megaphone, ChevronLeft, ChevronRight, FileText, Download, ExternalLink } from "lucide-react";
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

interface ParsedFile {
  url: string;
  type: 'image' | 'pdf' | 'doc' | 'file';
  name: string;
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

  const parseFiles = (imageUrl: string | null): ParsedFile[] => {
    if (!imageUrl) return [];
    
    return imageUrl.split(',').filter(url => url.trim()).map(url => {
      const trimmedUrl = url.trim();
      const extension = trimmedUrl.split('.').pop()?.toLowerCase();
      const name = trimmedUrl.split('/').pop() || 'file';
      
      let type: 'image' | 'pdf' | 'doc' | 'file' = 'file';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) type = 'image';
      else if (extension === 'pdf') type = 'pdf';
      else if (['doc', 'docx'].includes(extension || '')) type = 'doc';
      
      return { url: trimmedUrl, type, name };
    });
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
  const files = parseFiles(currentAd.image_url);
  const images = files.filter(f => f.type === 'image');
  const documents = files.filter(f => f.type !== 'image');
  const primaryImage = images[0];

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
                <div className={`grid ${primaryImage ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                  {primaryImage && (
                    <div className="h-64 md:h-80">
                      <img
                        src={primaryImage.url}
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
                    
                    {/* Additional Images */}
                    {images.length > 1 && (
                      <div className="flex gap-2 mt-4 flex-wrap">
                        {images.slice(1).map((img, idx) => (
                          <a
                            key={idx}
                            href={img.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-16 h-16 rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
                          >
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                    
                    {/* Document Attachments */}
                    {documents.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-foreground">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {documents.map((doc, idx) => (
                            <a
                              key={idx}
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-sm"
                            >
                              <FileText className={`w-4 h-4 ${doc.type === 'pdf' ? 'text-red-500' : 'text-blue-500'}`} />
                              <span className="max-w-[150px] truncate">{doc.name}</span>
                              <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
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
