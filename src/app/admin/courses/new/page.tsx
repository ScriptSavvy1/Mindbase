"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/instructor/FileUpload";
import {
  CurriculumBuilder,
  type ModuleInput,
} from "@/components/instructor/CurriculumBuilder";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function AdminCreateCoursePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("ai");
  const [skillLevel, setSkillLevel] = useState("beginner");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [language] = useState("English");
  const [totalDuration, setTotalDuration] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>(["", "", ""]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [modules, setModules] = useState<ModuleInput[]>([]);

  const [instructorId, setInstructorId] = useState("");
  const [instructors, setInstructors] = useState<{ id: string; name: string; email: string }[]>([]);

  const loadInstructors = async () => {
    if (instructors.length > 0) return;
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("role", ["instructor", "admin"])
        .order("name");
      if (data) setInstructors(data);
    } catch {
      // ignore
    }
  };

  const handlePublish = async () => {
    if (!user) return;
    if (!title.trim()) {
      alert("Please enter a course title.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      let thumbnailUrl = null;
      if (thumbnailFile) {
        const ext = thumbnailFile.name.split(".").pop();
        const path = `admin/${Date.now()}.${ext}`;
        const { data: uploadData } = await supabase.storage
          .from("thumbnails")
          .upload(path, thumbnailFile, { upsert: true });

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage.from("thumbnails").getPublicUrl(uploadData.path);
          thumbnailUrl = publicUrl;
        }
      }

      const priceInCents = Math.round(parseFloat(price || "0") * 100);
      const originalPriceInCents = originalPrice ? Math.round(parseFloat(originalPrice) * 100) : null;
      const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .insert({
          title,
          description,
          category,
          skill_level: skillLevel,
          price: priceInCents,
          original_price: originalPriceInCents,
          instructor_id: instructorId || user.id,
          status: "approved",
          thumbnail_url: thumbnailUrl,
          total_lessons: totalLessons,
          total_duration: totalDuration || null,
          learning_outcomes: learningOutcomes.filter((o) => o.trim()),
          language,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      for (let mi = 0; mi < modules.length; mi++) {
        const mod = modules[mi];
        if (!mod.title.trim()) continue;

        const { data: modData, error: modError } = await supabase
          .from("modules")
          .insert({
            course_id: courseData.id,
            title: mod.title,
            description: mod.description || null,
            order: mi + 1,
          })
          .select()
          .single();

        if (modError) throw modError;

        for (let li = 0; li < mod.lessons.length; li++) {
          const lesson = mod.lessons[li];
          if (!lesson.title.trim()) continue;

          let videoUrl = null;
          if (lesson.videoFile) {
            const ext = lesson.videoFile.name.split(".").pop();
            const videoPath = `admin/${courseData.id}/${modData.id}/${Date.now()}.${ext}`;
            const { data: videoUpload } = await supabase.storage
              .from("videos")
              .upload(videoPath, lesson.videoFile);

            if (videoUpload) {
              const { data: { publicUrl } } = supabase.storage.from("videos").getPublicUrl(videoUpload.path);
              videoUrl = publicUrl;
            }
          }

          await supabase.from("lessons").insert({
            module_id: modData.id,
            course_id: courseData.id,
            title: lesson.title,
            video_url: videoUrl,
            duration: lesson.duration || null,
            order: li + 1,
            is_free_preview: lesson.is_free_preview,
          });
        }
      }

      router.push("/admin");
    } catch (err) {
      console.error("Error creating course:", err);
      alert("Failed to create course. Check the console for details.");
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen pt-16 bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <button className="p-2 hover:bg-bg-hover rounded-lg transition-colors cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-text-muted" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Post New Course</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-error/10 text-error border border-error/20 rounded uppercase">
                  Admin
                </span>
              </div>
              <p className="text-sm text-text-muted mt-1">
                Courses posted here are published immediately — no review queue.
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handlePublish} loading={saving}>
            <Eye className="w-4 h-4" />
            Publish Course
          </Button>
        </div>

        <div className="space-y-8">
          <section className="bg-bg-card border border-border rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-semibold">Course Details</h2>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Course Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Building Production RAG Systems" className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed course description..." rows={5} className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors resize-none" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer">
                  <option value="ai">AI & Machine Learning</option>
                  <option value="fintech">Fintech Engineering</option>
                  <option value="other">Other Tech</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Skill Level *</label>
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
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Original Price</label>
                <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="For strikethrough" min="0" step="0.01" className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Total Duration</label>
                <input type="text" value={totalDuration} onChange={(e) => setTotalDuration(e.target.value)} placeholder="e.g. 24 hours" className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Assign Instructor</label>
                <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)} onFocus={loadInstructors} className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer">
                  <option value="">Post as myself (Admin)</option>
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.name} ({inst.email})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Thumbnail Image</label>
              <FileUpload type="image" accept="image/*" label="Upload course thumbnail (16:9 recommended)" onFileSelect={setThumbnailFile} />
            </div>
          </section>

          <section className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">What Students Will Learn</h2>
            {learningOutcomes.map((outcome, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-6">{i + 1}.</span>
                <input type="text" value={outcome} onChange={(e) => { const u = [...learningOutcomes]; u[i] = e.target.value; setLearningOutcomes(u); }} placeholder="e.g. Build production-ready RAG pipelines" className="flex-1 px-4 py-2.5 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" />
                {learningOutcomes.length > 1 && (
                  <button onClick={() => setLearningOutcomes(learningOutcomes.filter((_, idx) => idx !== i))} className="text-text-muted hover:text-error text-xs cursor-pointer">Remove</button>
                )}
              </div>
            ))}
            <button onClick={() => setLearningOutcomes([...learningOutcomes, ""])} className="text-sm text-accent hover:text-accent-hover transition-colors cursor-pointer">+ Add another outcome</button>
          </section>

          <section className="bg-bg-card border border-border rounded-xl p-6">
            <CurriculumBuilder modules={modules} onChange={setModules} />
          </section>

          <div className="flex justify-end gap-3 pb-8">
            <Link href="/admin"><Button variant="secondary" size="lg">Cancel</Button></Link>
            <Button variant="primary" size="lg" onClick={handlePublish} loading={saving}>
              <Eye className="w-4 h-4" />
              Publish Course Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
