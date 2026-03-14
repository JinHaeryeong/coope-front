import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FindEmailForm } from "@/components/Marketing/FindEmailForm";
import { FindPasswordForm } from "@/components/Marketing/FindPasswordForm";

export default function FindAccountPage() {
    const [searchParams] = useSearchParams();
    const defaultTab = searchParams.get("type") || "email";

    return (
        <div className="w-full max-w-4xl m-auto mt-20 p-8 border rounded-2xl shadow-lg bg-white pb-20">
            <h1 className="text-3xl font-extrabold mb-8 text-center text-slate-800">계정 찾기</h1>

            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-14 bg-slate-100 p-1">
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