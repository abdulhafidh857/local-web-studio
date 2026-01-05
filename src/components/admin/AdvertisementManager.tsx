import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2,
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface UploadedFile {
  name: string;
  url: string;
  type: string;
}

interface Advertisement {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

interface AdvertisementManagerProps {
  onRefresh?: () => void;
}

const AdvertisementManager = ({ onRefresh }: AdvertisementManagerProps) => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    is_active: true,
    priority: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAdvertisements(data || []);
    } catch (error) {
      console.error("Error fetching advertisements:", error);
      toast.error("Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (ad?: Advertisement) => {
    if (ad) {
      setEditingAd(ad);
      setFormData({
        title: ad.title,
        content: ad.content,
        image_url: ad.image_url || "",
        is_active: ad.is_active,
        priority: ad.priority
      });
      // Parse existing files from image_url if it contains multiple URLs
      if (ad.image_url) {
        const urls = ad.image_url.split(',').filter(url => url.trim());
        setUploadedFiles(urls.map(url => ({
          name: url.split('/').pop() || 'file',
          url: url.trim(),
          type: getFileTypeFromUrl(url)
        })));
      } else {
        setUploadedFiles([]);
      }
    } else {
      setEditingAd(null);
      setFormData({
        title: "",
        content: "",
        image_url: "",
        is_active: true,
        priority: 0
      });
      setUploadedFiles([]);
    }
    setDialogOpen(true);
  };

  const getFileTypeFromUrl = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
    if (['pdf'].includes(extension || '')) return 'pdf';
    if (['doc', 'docx'].includes(extension || '')) return 'doc';
    return 'file';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newFiles: UploadedFile[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('advertisement-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('advertisement-files')
          .getPublicUrl(filePath);

        let fileType = 'file';
        if (file.type.startsWith('image/')) fileType = 'image';
        else if (file.type === 'application/pdf') fileType = 'pdf';
        else if (file.type.includes('document') || file.type.includes('msword')) fileType = 'doc';

        newFiles.push({
          name: file.name,
          url: publicUrl,
          type: fileType
        });
      }

      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      // Update image_url with all file URLs
      const allUrls = [...uploadedFiles, ...newFiles].map(f => f.url).join(',');
      setFormData(prev => ({ ...prev, image_url: allUrls }));
      
      toast.success(`${newFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeUploadedFile = async (fileToRemove: UploadedFile) => {
    try {
      // Extract file path from URL
      const urlParts = fileToRemove.url.split('/advertisement-files/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage
          .from('advertisement-files')
          .remove([filePath]);
      }

      const newFiles = uploadedFiles.filter(f => f.url !== fileToRemove.url);
      setUploadedFiles(newFiles);
      setFormData(prev => ({ ...prev, image_url: newFiles.map(f => f.url).join(',') }));
      toast.success("File removed");
    } catch (error) {
      console.error("Error removing file:", error);
      toast.error("Failed to remove file");
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'doc': return <FileText className="w-4 h-4 text-blue-500" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);
    try {
      if (editingAd) {
        const { error } = await supabase
          .from("advertisements")
          .update({
            title: formData.title,
            content: formData.content,
            image_url: formData.image_url || null,
            is_active: formData.is_active,
            priority: formData.priority
          })
          .eq("id", editingAd.id);

        if (error) throw error;
        toast.success("Advertisement updated");
      } else {
        const { error } = await supabase
          .from("advertisements")
          .insert({
            title: formData.title,
            content: formData.content,
            image_url: formData.image_url || null,
            is_active: formData.is_active,
            priority: formData.priority,
            created_by: user?.id
          });

        if (error) throw error;
        toast.success("Advertisement created");
      }

      setDialogOpen(false);
      fetchAdvertisements();
      onRefresh?.();
    } catch (error) {
      console.error("Error saving advertisement:", error);
      toast.error("Failed to save advertisement");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad: Advertisement) => {
    try {
      const { error } = await supabase
        .from("advertisements")
        .update({ is_active: !ad.is_active })
        .eq("id", ad.id);

      if (error) throw error;
      
      setAdvertisements(ads => 
        ads.map(a => a.id === ad.id ? { ...a, is_active: !a.is_active } : a)
      );
      toast.success(ad.is_active ? "Advertisement hidden" : "Advertisement published");
    } catch (error) {
      toast.error("Failed to update advertisement");
    }
  };

  const deleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) return;

    try {
      const { error } = await supabase
        .from("advertisements")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setAdvertisements(ads => ads.filter(a => a.id !== id));
      toast.success("Advertisement deleted");
    } catch (error) {
      toast.error("Failed to delete advertisement");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            Advertisements
          </h2>
          <p className="text-sm text-muted-foreground">
            {advertisements.length} total • {advertisements.filter(a => a.is_active).length} active
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          New Advertisement
        </Button>
      </div>

      {advertisements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Advertisements</h3>
            <p className="text-muted-foreground mb-4">
              Create your first advertisement to display on the homepage
            </p>
            <Button onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Advertisement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {advertisements.map((ad) => (
            <Card key={ad.id} className={!ad.is_active ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {ad.image_url && (
                    <img
                      src={ad.image_url}
                      alt={ad.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{ad.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {ad.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Created: {formatDate(ad.created_at)}</span>
                          <span>Priority: {ad.priority}</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            ad.is_active 
                              ? "bg-green-100 text-green-700" 
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {ad.is_active ? "Active" : "Hidden"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(ad)}
                          title={ad.is_active ? "Hide" : "Show"}
                        >
                          {ad.is_active ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(ad)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAd(ad.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAd ? "Edit Advertisement" : "New Advertisement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter advertisement title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter advertisement content"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Upload Files (Images, PDFs, Documents)</Label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {uploading ? "Uploading..." : "Upload Files"}
              </Button>
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 mt-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {getFileIcon(file.type)}
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUploadedFile(file)}
                        className="shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Or paste URL (optional)</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority (higher = shown first)</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Publish immediately</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingAd ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdvertisementManager;
