"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/instructor/FileUpload";
import {
  CurriculumBuilder,
  type ModuleInput,
} from "@/components/instructor/CurriculumBuilder";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("ai");
  const [skillLevel, setSkillLevel] = useState("beginner");
  const [price, setPrice] = useState("");
  const [language, setLanguage] = useState("English");
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([""]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [modules, setModules] = useState<ModuleInput[]>([]);
  const [status, setStatus] = useState("draft");

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const supabase = createClient();

        const { data: course } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (course) {
          setTitle(course.title);
          setDescription(course.description);
          setCategory(course.category);
          setSkillLevel(course.skill_level);
          setPrice(course.price > 0 ? (course.price / 100).toString() : "");
          setLanguage(course.language || "English");
          setLearningOutcomes(
            course.learning_outcomes?.length > 0
              ? course.learning_outcomes
              : [""]
          );
          setThumbnailUrl(course.thumbnail_url);
          setStatus(course.status);
        }

        const { data: modulesData } = await supabase
          .from("modules")
          .select("*, lessons(*)")
          .eq("course_id", courseId)
          .order("order", { ascending: true });

        if (modulesData) {
          setModules(
            modulesData.map((m: any) => ({
              id: m.id,
              title: m.title,
              description: m.description || "",
              isOpen: true,
              lessons: (m.lessons || [])
                .sort((a: any, b: any) => a.order - b.order)
                .map((l: any) => ({
                  id: l.id,
                  title: l.title,
                  videoFile: null,
                  duration: l.duration || "",
                  is_free_preview: l.is_free_preview,
                })),
            }))
          );
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [courseId, user]);

  const handleSave = async (newStatus?: string) => {
    if (!user) return;
    setSaving(true);

    try {
      const supabase = createClient();

      let finalThumbnailUrl = thumbnailUrl;
      if (thumbnailFile) {
        const ext = thumbnailFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { data: uploadData } = await supabase.storage
          .from("thumbnails")
          .upload(path, thumbnailFile, { upsert: true });

        if (uploadData) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("thumbnails").getPublicUrl(uploadData.path);
          finalThumbnailUrl = publicUrl;
        }
      }

      const priceInCents = Math.round(parseFloat(price || "0") * 100);

      await supabase
        .from("courses")
        .update({
          title,
          description,
          category,
          skill_level: skillLevel,
          price: priceInCents,
          status: newStatus || status,
          thumbnail_url: finalThumbnailUrl,
          learning_outcomes: learningOutcomes.filter((o) => o.trim()),
          language,
          updated_at: new Date().toISOString(),
        })
        .eq("id", courseId);

      router.push("/instructor");
    } catch (err) {
      console.error("Error saving course:", err);
      alert("Failed to save. Please try again.");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/instructor">
              <button className="p-2 hover:bg-bg-hover rounded-lg transition-colors cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-text-muted" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Edit Course</h1>
              <p className="text-sm text-text-muted mt-1">{title || "Untitled"}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSave()}
              loading={saving}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
            {status === "draft" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSave("pending")}
                loading={saving}
              >
                <Send className="w-4 h-4" />
                Submit for Review
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-bg-card border border-border rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Course Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer">
                  <option value="ai">AI & Machine Learning</option>
                  <option value="fintech">Fintech Engineering</option>
                  <option value="other">Other Tech</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Skill Level</label>
                <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Price (USD)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 = Free" min="0" step="0.01" className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Thumbnail
              </label>
              <FileUpload
                type="image"
                accept="image/*"
                label="Upload new thumbnail"
                onFileSelect={setThumbnailFile}
                currentUrl={thumbnailUrl}
              />
            </div>
          </section>

          <section className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Learning Outcomes</h2>
            {learningOutcomes.map((outcome, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-6">{i + 1}.</span>
                <input type="text" value={outcome} onChange={(e) => { const u = [...learningOutcomes]; u[i] = e.target.value; setLearningOutcomes(u); }} placeholder="Learning outcome" className="flex-1 px-4 py-2.5 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent" />
                {learningOutcomes.length > 1 && (
                  <button onClick={() => setLearningOutcomes(learningOutcomes.filter((_, idx) => idx !== i))} className="text-xs text-text-muted hover:text-error cursor-pointer">Remove</button>
                )}
              </div>
            ))}
            <button onClick={() => setLearningOutcomes([...learningOutcomes, ""])} className="text-sm text-accent hover:text-accent-hover cursor-pointer">+ Add outcome</button>
          </section>

          <section className="bg-bg-card border border-border rounded-xl p-6">
            <CurriculumBuilder modules={modules} onChange={setModules} />
          </section>

          <div className="flex justify-end gap-3 pb-8">
            <Button variant="secondary" size="lg" onClick={() => handleSave()} loading={saving}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
