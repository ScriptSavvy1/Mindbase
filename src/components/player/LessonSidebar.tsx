"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import type { Module, Lesson } from "@/types";

interface LessonSidebarProps {
  modules: (Module & { lessons: Lesson[] })[];
  currentLessonId: string;
  completedLessons: string[];
  totalLessons: number;
  completedCount: number;
  onLessonSelect: (lessonId: string) => void;
}

export function LessonSidebar({
  modules,
  currentLessonId,
  completedLessons,
  totalLessons,
  completedCount,
  onLessonSelect,
}: LessonSidebarProps) {
  const [openModules, setOpenModules] = useState<string[]>(
    modules.map((m) => m.id)
  );

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <div className="h-full bg-bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Course Content</h3>
          <span className="text-xs text-text-muted bg-bg-elevated px-2 py-1 rounded">
            {completedCount} / {totalLessons} Complete
          </span>
        </div>
      </div>

      {/* Module List */}
      <div className="flex-1 overflow-y-auto">
        {modules.map((mod) => {
          const isOpen = openModules.includes(mod.id);
          return (
            <div key={mod.id}>
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-bg-hover transition-colors border-b border-border/50 cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1 h-8 rounded-full bg-accent/30 flex-shrink-0" />
                  <span className="text-xs font-medium truncate">
                    {mod.title}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                )}
              </button>

              {isOpen &&
                mod.lessons?.map((lesson) => {
                  const isCurrent = lesson.id === currentLessonId;
                  const isCompleted = completedLessons.includes(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onLessonSelect(lesson.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 pl-8 text-left transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-accent/10 border-l-2 border-accent text-text-primary"
                          : "hover:bg-bg-hover text-text-secondary"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      ) : isCurrent ? (
                        <Play className="w-4 h-4 text-accent flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-text-muted flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs truncate">{lesson.title}</p>
                        {lesson.duration && (
                          <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {lesson.duration}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
