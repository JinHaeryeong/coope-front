import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type PostCategory } from "../types/posts";

const CATEGORY_TABS = [
    { value: "all", label: "전체" },
    { value: "RECRUITMENT", label: "모집" },
    { value: "SHOWCASE", label: "자랑" },
    { value: "QNA", label: "질문" },
    { value: "GENERAL", label: "자유" },
] as const;

interface CategoryTabsProps {
    currentCategory: PostCategory | "all";
    onCategoryChange: (value: PostCategory | "all") => void;
}

export const CategoryTabs = ({ currentCategory, onCategoryChange }: CategoryTabsProps) => {
    return (
        <Tabs
            value={currentCategory}
            onValueChange={(value) => onCategoryChange(value as PostCategory | "all")}
            className="w-full"
        >
            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                {CATEGORY_TABS.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="inline-flex items-center justify-center极 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
};