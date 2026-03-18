import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FindEmailForm } from "@/features/auth/components/FindEmailForm";
import { FindPasswordForm } from "@/features/auth/components/FindPasswordForm";

export default function FindAccountPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const type = searchParams.get("type");
    const activeTab = type === "email" || type === "password" ? type : "email";

    return (
        <div className="w-full max-w-4xl m-auto mt-20 p-8 border rounded-2xl shadow-lg pb-20">
            <h1 className="text-3xl font-extrabold mb-8 text-center">계정 찾기</h1>

            <Tabs
                value={activeTab}
                onValueChange={(val) => setSearchParams({ type: val })}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-2 h-14 p-1">
                    <TabsTrigger value="email" className="text-sm data-[state=active]:font-bold transition-all">
                        아이디 찾기
                    </TabsTrigger>
                    <TabsTrigger value="password" className="text-sm data-[state=active]:font-bold transition-all">
                        비밀번호 찾기
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="mt-6">
                    <FindEmailForm />
                </TabsContent>

                <TabsContent value="password" className="mt-6">
                    <FindPasswordForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}