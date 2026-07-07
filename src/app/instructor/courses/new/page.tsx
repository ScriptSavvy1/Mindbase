"use client";

import { useState } from "react";
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

export default function CreateCoursePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("ai");
  const [skillLevel, setSkillLevel] = useState("beginner");
  const [price, setPrice] = useState("");
  const [language, setLanguage] = useState("English");
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([""]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [modules, setModules] = useState<ModuleInput[]>([]);

  const handleSave = async (status: "draft" | "pending") => {
    if (!user) return;
    if (!title.trim()) {
      alert("Please enter a course title.");
      return;
    }

    if (status === "pending") {
      setSubmitting(true);
    } else {
      setSaving(true);
    }

    try {
      const supabase = createClient();

      // Upload thumbnail if present
      let thumbnailUrl = null;
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
          thumbnailUrl = publicUrl;
        }
      }

      // Create course
      const priceInCents = Math.round(parseFloat(price || "0") * 100);
      const totalLessons = modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0
      );

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .insert({
          title,
          description,
          category,
          skill_level: skillLevel,
          price: priceInCents,
          instructor_id: user.id,
          status,
          thumbnail_url: thumbnailUrl,
          total_lessons: totalLessons,
          learning_outcomes: learningOutcomes.filter((o) => o.trim()),
          language,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Create modules and lessons
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

          // Upload video if present
          let videoUrl = null;
          if (lesson.videoFile) {
            const ext = lesson.videoFile.name.split(".").pop();
            const videoPath = `${user.id}/${courseData.id}/${modData.id}/${Date.now()}.${ext}`;
            const { data: videoUpload } = await supabase.storage
              .from("videos")
              .upload(videoPath, lesson.videoFile);

            if (videoUpload) {
              const {
                data: { publicUrl },
              } = supabase.storage
                .from("videos")
                .getPublicUrl(videoUpload.path);
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

      router.push("/instructor");
    } catch (err) {
      console.error("Error creating course:", err);
      alert("Failed to create course. Please try again.");
    }

    setSaving(false);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen pt-16 bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/instructor">
              <button className="p-2 hover:bg-bg-hover rounded-lg transition-colors cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-text-muted" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Create New Course</h1>
              <p className="text-sm text-text-muted mt-1">
                Fill in the details and build your curriculum
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSave("draft")}
              loading={saving}
            >
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSave("pending")}
              loading={submitting}
            >
              <Send className="w-4 h-4" />
              Submit for Review
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Info */}
          <section className="bg-bg-card border border-border rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Course Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Building Production RAG Systems"
                className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn and build..."
                rows={5}
                className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="ai">AI & Machine Learning</option>
                  <option value="fintech">Fintech Engineering</option>
                  <option value="other">Other Tech</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Skill Level *
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Price (USD)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0 = Free"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Thumbnail Image
              </label>
              <FileUpload
                type="image"
                accept="image/*"
                label="Upload course thumbnail (16:9 recommended)"
                onFileSelect={setThumbnailFile}
              />
            </div>
          </section>

          {/* Learning Outcomes */}
          <section className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">What Students Will Learn</h2>
            {learningOutcomes.map((outcome, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-6">{i + 1}.</span>
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => {
                    const updated = [...learningOutcomes];
                    updated[i] = e.target.value;
                    setLearningOutcomes(updated);
                  }}
                  placeholder="e.g. Build production-ready RAG pipelines"
                  className="flex-1 px-4 py-2.5 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                />
                {learningOutcomes.length > 1 && (
                  <button
                    onClick={() =>
                      setLearningOutcomes(
                        learningOutcomes.filter((_, idx) => idx !== i)
                      )
                    }
                    className="text-text-muted hover:text-error text-xs cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setLearningOutcomes([...learningOutcomes, ""])}
              className="text-sm text-accent hover:text-accent-hover transition-colors cursor-pointer"
            >
              + Add another outcome
            </button>
          </section>

          {/* Curriculum */}
          <section className="bg-bg-card border border-border rounded-xl p-6">
            <CurriculumBuilder modules={modules} onChange={setModules} />
          </section>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-8">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleSave("draft")}
              loading={saving}
            >
              Save as Draft
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleSave("pending")}
              loading={submitting}
            >
              Submit for Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
