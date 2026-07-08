"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, BookOpen } from "lucide-react";
import { CourseCard } from "@/components/ui/CourseCard";
import { FilterSidebar } from "@/components/catalog/FilterSidebar";
import { Button } from "@/components/ui/Button";
import type { Course, CourseCategory, SkillLevel } from "@/types";
import { createClient } from "@/lib/supabase/client";

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "popular");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category")?.split(",").filter(Boolean) || []
  );
  const [selectedLevels, setSelectedLevels] = useState<string[]>(
    searchParams.get("level")?.split(",").filter(Boolean) || []
  );
  const [priceType, setPriceType] = useState(
    searchParams.get("price") || ""
  );
  const [totalCount, setTotalCount] = useState(0);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from("courses")
        .select("*, instructor:profiles!instructor_id(*)", { count: "exact" })
        .eq("status", "approved");

      if (selectedCategories.length > 0) {
        query = query.in("category", selectedCategories as CourseCategory[]);
      }
      if (selectedLevels.length > 0) {
        query = query.in("skill_level", selectedLevels as SkillLevel[]);
      }
      if (priceType === "free") query = query.eq("price", 0);
      if (priceType === "paid") query = query.gt("price", 0);
      if (search) query = query.ilike("title", `%${search}%`);

      switch (sort) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "price_asc":
          query = query.order("price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price", { ascending: false });
          break;
        default:
          query = query.order("total_students", { ascending: false });
      }

      query = query.limit(12);

      const { data, count, error } = await query;
      if (!error) {
        setCourses((data as Course[]) || []);
        setTotalCount(count || 0);
      }
    } catch {
      // Supabase not configured — show empty state
    }
    setLoading(false);
  }, [selectedCategories, selectedLevels, priceType, search, sort]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setPriceType("");
    setSearch("");
  };

  const categoryLabels: Record<string, string> = {
    ai: "AI & ML",
    fintech: "Fintech",
    other: "Other Tech",
  };

  const levelLabels: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  };

  const activeFilters = [
    ...selectedCategories.map((c) => ({
      key: `cat-${c}`,
      label: categoryLabels[c] || c,
      remove: () =>
        setSelectedCategories(selectedCategories.filter((x) => x !== c)),
    })),
    ...selectedLevels.map((l) => ({
      key: `lvl-${l}`,
      label: levelLabels[l] || l,
      remove: () =>
        setSelectedLevels(selectedLevels.filter((x) => x !== l)),
    })),
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <section className="bg-bg-secondary border-b border-border py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-accent font-medium uppercase tracking-wider mb-3">
            ── Explore Catalog
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold">
            Level up your technical stack
          </h1>
          <p className="mt-3 text-text-secondary max-w-xl">
            Master the world&apos;s most critical technologies through
            production-focused curriculum designed by active industry engineers.
          </p>
        </div>
      </section>

      {/* Search + Sort bar */}
      <section className="bg-bg-secondary/50 border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search for 'Generative AI', 'Rust', 'Quant'..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-text-muted">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <FilterSidebar
            selectedCategories={selectedCategories}
            selectedLevels={selectedLevels}
            priceType={priceType}
            onCategoryChange={setSelectedCategories}
            onLevelChange={setSelectedLevels}
            onPriceChange={setPriceType}
            onReset={resetFilters}
          />

          {/* Course Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filters + count */}
            <div className="flex items-center flex-wrap gap-2 mb-6">
              <span className="text-sm text-text-secondary">
                Showing <strong className="text-text-primary">{courses.length}</strong> of{" "}
                <strong className="text-text-primary">{totalCount}</strong> courses
              </span>
              {activeFilters.map((filter) => (
                <span
                  key={filter.key}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-md text-xs text-accent"
                >
                  {filter.label}
                  <button
                    onClick={filter.remove}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-bg-card border border-border rounded-xl overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[16/9] bg-bg-elevated" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-bg-elevated rounded w-1/3" />
                      <div className="h-5 bg-bg-elevated rounded w-full" />
                      <div className="h-4 bg-bg-elevated rounded w-2/3" />
                      <div className="h-8 bg-bg-elevated rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 stagger">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-bg-card border border-border rounded-xl">
                <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No courses published yet
                </h3>
                <p className="text-text-secondary text-sm max-w-md mx-auto">
                  Check back soon — our expert instructors are preparing the
                  first courses right now.
                </p>
              </div>
            )}

            {/* Load More */}
            {courses.length > 0 && totalCount > courses.length && (
              <div className="text-center mt-12">
                <p className="text-sm text-text-muted mb-4">
                  Showing{" "}
                  <span className="text-accent font-medium">{courses.length}</span> of{" "}
                  <span className="font-medium">{totalCount}</span> courses
                </p>
                <Button variant="secondary" size="lg">
                  Load More Courses
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CourseCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
