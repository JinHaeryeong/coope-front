import { cn } from "@/lib/utils";
import {
  ChevronsLeft,
  MenuIcon,
  PlusCircle,
  Search,
  Settings,
  Trash,
  User,
  UserPlus,
} from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery } from "usehooks-ts";
import { toast } from "sonner";

import { useSearch } from "@/hooks/useSearch";
import { useSettings } from "@/hooks/useSettings";
import { useInvite } from "@/hooks/useInvite";


import { Item } from "./Item";
import { TrashBox } from "./TrashBox";
import { Navbar } from "./Navbar";
import InviteModal from "@/components/Main/Modal/InviteModal";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import UserItem from "./UserItem";
import { DocumentList } from "./DocumentList";
import { apiCreateDocument } from "@/api/documentApi";
import { useTrashStore } from "@/store/useTrashStore";
import { SettingsModal } from "./Modal/SettingModal";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useFriendStore } from "@/store/useFriendStore";


export const Navigation = () => {
  const { workspaceCode, documentId } = useParams(); //
  const { pathname } = useLocation(); //
  const navigate = useNavigate(); //

  const isWorkspacePath = pathname.startsWith("/workspace");
  const { workspaces } = useWorkspaceStore();

  const currentWorkspace = workspaces.find(w => w.inviteCode === workspaceCode);

  const search = useSearch();
  const invite = useInvite();
  const settings = useSettings();

  const sidebarRef = useRef<HTMLElement | null>(null);
  const navbarRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery("(max-width:768px)");

  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [isResetting, setIsResetting] = useState(false);
  const { notifyTrashUpdate } = useTrashStore();
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const isChatActive = useFriendStore((state) => state.isChatActive);

  const shouldHideMenuIcon = isMobile && pathname.includes("/friends") && isChatActive;


  const MIN_WIDTH = 210;
  const MAX_WIDTH = 700;

  const toggleSidebar = useCallback(() => {
    setIsResetting(true);
    setIsCollapsed((prev) => !prev);
    setTimeout(() => setIsResetting(false), 300);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "\\" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleSidebar]);

  useEffect(() => {
    const shouldCollapse = pathname.includes("/friends");

    if (shouldCollapse) {
      setIsResetting(true); // 애니메이션 효과를 위해 true
      setIsCollapsed(true);

      const timer = setTimeout(() => setIsResetting(false), 300);
      return () => clearTimeout(timer);
    }

    else if (!isMobile && !pathname.includes("/friends")) {
      setIsCollapsed(false);
    }
  }, [pathname, isMobile]);

  // 워크스페이스 아이디가 필요한 경로인데 없는 경우 처리
  if (isWorkspacePath && !workspaceCode) return null;

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarRef.current?.getBoundingClientRect().width || 240;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH && sidebarRef.current && navbarRef.current) {
        sidebarRef.current.style.width = `${newWidth}px`;
        navbarRef.current.style.left = `${newWidth}px`;
        navbarRef.current.style.width = `calc(100% - ${newWidth}px)`;
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleAction = (callback: () => void) => {
    callback();
    if (isMobile) toggleSidebar();
  };

  const handleCreate = async () => {
    if (!workspaceCode) return;
    try {
      const newDocument = await apiCreateDocument({
        title: "제목 없음",
        workspaceCode: workspaceCode,
      });

      toast.success("새 문서가 생성되었습니다!");
      if (isMobile) toggleSidebar();
      notifyTrashUpdate();
      navigate(`/workspace/${workspaceCode}/documents/${newDocument.id}`);
    } catch (error) {
      toast.error("새 문서 생성에 실패했습니다.");
    }
  };

  return (
    <>
      {!isCollapsed && isMobile && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full bg-black overflow-y-auto relative flex flex-col z-9 md:rounded-r-xl",
          isCollapsed ? "w-0" : "w-full md:w-60",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "fixed inset-y-0 left-0 shadow-2xl"
        )}
      >
        <div className={cn(
          "w-full h-full flex flex-col transition-opacity duration-300",
          isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <div className="p-4 flex items-center justify-between">
            <img
              src="/logo-dark.png"
              alt="Logo"
              className="w-44 h-auto cursor-pointer hover:opacity-80 transition"
              onClick={() => navigate("/")}
            />
            <div
              role="button"
              onClick={toggleSidebar}
              className="h-6 w-6 text-muted-foreground rounded-sm opacity-40  group-hover/sidebar:opacity-100 transition cursor-pointer"
            >
              <ChevronsLeft className="h-6 w-6" />
            </div>
          </div>

          <div className={cn(isMobile && "px-2 space-y-2")}>
            <UserItem />
            <Item
              label="초대"
              icon={UserPlus}
              onClick={() => handleAction(invite.onOpen)}
            />
            {invite.isOpen && <InviteModal workspaceCode={workspaceCode!} />}
            <Item
              label="검색"
              icon={Search}
              isSearch
              onClick={() => handleAction(search.onOpen)}
            />
            <Item
              label="설정"
              icon={Settings}
              onClick={() => handleAction(settings.onOpen)}
            />
            {settings.isOpen && (
              <SettingsModal
                workspaceCode={workspaceCode!}
                initialName={currentWorkspace?.name}
              />
            )}
            <Item onClick={handleCreate} label="새 페이지" icon={PlusCircle} />
          </div>
          <DocumentList onItemClick={() => isMobile && toggleSidebar()} />

          <div className={cn("text-white", isMobile && "px-2 space-y-2")}>

            <Item
              icon={User}
              label="친구"
              onClick={() => handleAction(() => navigate(`/workspace/${workspaceCode}/friends`))}
            />
            <Popover open={isTrashOpen} onOpenChange={setIsTrashOpen}>
              <PopoverTrigger className="w-full mt-4">
                <Item label="휴지통" icon={Trash} />
              </PopoverTrigger>
              <PopoverContent
                className="p-0 w-72"
                side={isMobile ? "bottom" : "right"}
              >
                <TrashBox onClose={() => setIsTrashOpen(false)} />
              </PopoverContent>
            </Popover>
          </div>

          {!isMobile && (
            <div
              onMouseDown={handleMouseDown}
              className="cursor-ew-resize absolute h-full w-1 right-0 top-0 opacity-0 group-hover/sidebar:opacity-100 transition"
            />
          )}
        </div>
      </aside>

      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-10 pointer-events-none",
          isResetting && "transition-all ease-in-out duration-300",
          isCollapsed ? "left-0 w-full" : isMobile ? "left-0 w-0 opacity-0" : "left-60 w-[calc(100%-240px)]"
        )}
      >
        {!!documentId ? (
          <Navbar isCollapsed={isCollapsed} onResetWidth={toggleSidebar} />
        ) : (
          <nav className="bg-transparent px-3 py-2 w-full">
            {isCollapsed && !shouldHideMenuIcon && (
              <MenuIcon
                role="button"
                onClick={toggleSidebar}
                className="h-6 w-6 text-muted-foreground pointer-events-auto cursor-pointer transition"
              />
            )}
          </nav>
        )}
      </div>
    </>
  );
};