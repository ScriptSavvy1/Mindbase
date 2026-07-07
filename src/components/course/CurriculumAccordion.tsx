"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Play, Lock, Clock } from "lucide-react";
import type { Module, Lesson } from "@/types";

interface CurriculumAccordionProps {
  modules: (Module & { lessons: Lesson[] })[];
  completedLessons?: string[];
  isEnrolled?: boolean;
  onLessonClick?: (lessonId: string) => void;
}

export function CurriculumAccordion({
  modules,
  completedLessons = [],
  isEnrolled = false,
  onLessonClick,
}: CurriculumAccordionProps) {
  const [openModules, setOpenModules] = useState<string[]>(
    modules.length > 0 ? [modules[0].id] : []
  );

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const totalLessons = modules.reduce(
    (sum, mod) => sum + (mod.lessons?.length || 0),
    0
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Course Content</h2>
        <span className="text-sm text-text-muted">
          {modules.length} sections • {totalLessons} lessons
        </span>
      </div>

      <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
        {modules.map((mod) => {
          const isOpen = openModules.includes(mod.id);
          return (
            <div key={mod.id}>
              {/* Module Header */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between p-4 bg-bg-elevated hover:bg-bg-hover transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-accent" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  )}
                  <div className="text-left">
                    <h3 className="text-sm font-semibold">{mod.title}</h3>
                    {mod.description && (
                      <p className="text-xs text-text-muted mt-0.5">
                        {mod.description}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-text-muted flex-shrink-0 ml-4">
                  {mod.lessons?.length || 0} lessons
                </span>
              </button>

              {/* Lessons */}
              {isOpen && mod.lessons && (
                <div className="divide-y divide-border/50">
                  {mod.lessons.map((lesson) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const canAccess = isEnrolled || lesson.is_free_preview;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() =>
                          canAccess && onLessonClick?.(lesson.id)
                        }
                        className={`flex items-center justify-between px-4 py-3 pl-12 ${
                          canAccess
                            ? "hover:bg-bg-hover cursor-pointer"
                            : "opacity-60"
                        } transition-colors`}
                      >
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-success" />
                            </div>
                          ) : canAccess ? (
                            <Play className="w-4 h-4 text-accent" />
                          ) : (
                            <Lock className="w-4 h-4 text-text-muted" />
                          )}
                          <span className="text-sm text-text-secondary">
                            {lesson.title}
                          </span>
                          {lesson.is_free_preview && !isEnrolled && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-accent/10 text-accent rounded">
                              Preview
                            </span>
                          )}
                        </div>
                        {lesson.duration && (
                          <span className="text-xs text-text-muted flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            {lesson.duration}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modules.length > 3 && (
        <button
          onClick={() =>
            setOpenModules(
              openModules.length === modules.length
                ? []
                : modules.map((m) => m.id)
            )
          }
          className="w-full mt-3 py-2.5 text-sm text-text-secondary hover:text-accent border border-border rounded-lg hover:border-accent/30 transition-all cursor-pointer"
        >
          {openModules.length === modules.length
            ? "Collapse All"
            : `Show ${modules.length - openModules.length} More Sections`}
        </button>
      )}
    </div>
  );
}
