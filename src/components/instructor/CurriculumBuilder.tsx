"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/instructor/FileUpload";

interface LessonInput {
  id: string;
  title: string;
  videoFile: File | null;
  duration: string;
  is_free_preview: boolean;
}

interface ModuleInput {
  id: string;
  title: string;
  description: string;
  lessons: LessonInput[];
  isOpen: boolean;
}

interface CurriculumBuilderProps {
  modules: ModuleInput[];
  onChange: (modules: ModuleInput[]) => void;
}

let idCounter = 0;
const genId = () => `temp_${++idCounter}_${Date.now()}`;

export function CurriculumBuilder({
  modules,
  onChange,
}: CurriculumBuilderProps) {
  const addModule = () => {
    onChange([
      ...modules,
      {
        id: genId(),
        title: "",
        description: "",
        lessons: [],
        isOpen: true,
      },
    ]);
  };

  const removeModule = (moduleId: string) => {
    onChange(modules.filter((m) => m.id !== moduleId));
  };

  const updateModule = (moduleId: string, updates: Partial<ModuleInput>) => {
    onChange(
      modules.map((m) => (m.id === moduleId ? { ...m, ...updates } : m))
    );
  };

  const toggleModule = (moduleId: string) => {
    updateModule(moduleId, {
      isOpen: !modules.find((m) => m.id === moduleId)?.isOpen,
    });
  };

  const addLesson = (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    updateModule(moduleId, {
      lessons: [
        ...mod.lessons,
        {
          id: genId(),
          title: "",
          videoFile: null,
          duration: "",
          is_free_preview: false,
        },
      ],
    });
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    updateModule(moduleId, {
      lessons: mod.lessons.filter((l) => l.id !== lessonId),
    });
  };

  const updateLesson = (
    moduleId: string,
    lessonId: string,
    updates: Partial<LessonInput>
  ) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    updateModule(moduleId, {
      lessons: mod.lessons.map((l) =>
        l.id === lessonId ? { ...l, ...updates } : l
      ),
    });
  };

  const moveModule = (index: number, direction: "up" | "down") => {
    const newModules = [...modules];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newModules.length) return;
    [newModules[index], newModules[targetIndex]] = [
      newModules[targetIndex],
      newModules[index],
    ];
    onChange(newModules);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Curriculum</h3>
        <Button variant="secondary" size="sm" onClick={addModule}>
          <Plus className="w-4 h-4" />
          Add Module
        </Button>
      </div>

      {modules.length === 0 && (
        <div className="text-center py-12 bg-bg-card border border-border border-dashed rounded-xl">
          <p className="text-text-muted text-sm">
            No modules yet. Click &ldquo;Add Module&rdquo; to start building
            your curriculum.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {modules.map((mod, modIndex) => (
          <div
            key={mod.id}
            className="bg-bg-card border border-border rounded-xl overflow-hidden"
          >
            {/* Module Header */}
            <div className="flex items-center gap-3 p-4 bg-bg-elevated">
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveModule(modIndex, "up")}
                  disabled={modIndex === 0}
                  className="p-0.5 text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveModule(modIndex, "down")}
                  disabled={modIndex === modules.length - 1}
                  className="p-0.5 text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              <span className="text-xs text-text-muted font-medium w-16">
                Module {modIndex + 1}
              </span>

              <input
                type="text"
                value={mod.title}
                onChange={(e) =>
                  updateModule(mod.id, { title: e.target.value })
                }
                placeholder="Module title (e.g. Introduction to Neural Networks)"
                className="flex-1 bg-transparent text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none"
              />

              <button
                onClick={() => toggleModule(mod.id)}
                className="p-1.5 hover:bg-bg-hover rounded cursor-pointer"
              >
                {mod.isOpen ? (
                  <ChevronUp className="w-4 h-4 text-text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                )}
              </button>
              <button
                onClick={() => removeModule(mod.id)}
                className="p-1.5 hover:bg-error/10 rounded cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-text-muted hover:text-error" />
              </button>
            </div>

            {/* Lessons */}
            {mod.isOpen && (
              <div className="p-4 space-y-3">
                {mod.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    className="flex items-start gap-3 p-3 bg-bg-primary border border-border rounded-lg"
                  >
                    <GripVertical className="w-4 h-4 text-text-muted mt-2.5 flex-shrink-0" />

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-muted w-6">
                          {lessonIndex + 1}.
                        </span>
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) =>
                            updateLesson(mod.id, lesson.id, {
                              title: e.target.value,
                            })
                          }
                          placeholder="Lesson title"
                          className="flex-1 bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                        />
                        <input
                          type="text"
                          value={lesson.duration}
                          onChange={(e) =>
                            updateLesson(mod.id, lesson.id, {
                              duration: e.target.value,
                            })
                          }
                          placeholder="MM:SS"
                          className="w-20 bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent text-center"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <FileUpload
                          type="video"
                          accept="video/*"
                          label="Upload lesson video"
                          onFileSelect={(file) =>
                            updateLesson(mod.id, lesson.id, {
                              videoFile: file,
                            })
                          }
                          className="flex-1"
                        />
                        <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={lesson.is_free_preview}
                            onChange={(e) =>
                              updateLesson(mod.id, lesson.id, {
                                is_free_preview: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded border-border bg-bg-input accent-[#6c5ce7] cursor-pointer"
                          />
                          <span className="text-xs text-text-muted">
                            Free preview
                          </span>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={() => removeLesson(mod.id, lesson.id)}
                      className="p-1.5 hover:bg-error/10 rounded mt-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-error" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addLesson(mod.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-border rounded-lg text-sm text-text-muted hover:text-accent hover:border-accent/30 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Lesson
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export type { ModuleInput, LessonInput };
