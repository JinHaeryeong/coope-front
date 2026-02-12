'use client'

import React, { useRef, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { type DocumentResponse } from "@/api/documentApi"

interface TitleProps {
    initialData: DocumentResponse;
}

export function Title({ initialData }: TitleProps) {
    const inputRef = useRef<HTMLInputElement>(null)

    // 서버 데이터가 바뀌어도 로컬 상태는 유지되도록 초기값 설정
    const [title, setTitle] = useState(initialData.title)
    const [isEditing, setIsEditing] = useState(false)

    // 부모(Navbar)에서 넘겨준 데이터가 바뀌면 동기화
    useEffect(() => {
        setTitle(initialData.title);
    }, [initialData.title]);

    const enableInput = () => {
        setIsEditing(true)
        setTimeout(() => {
            inputRef.current?.focus()
            inputRef.current?.setSelectionRange(0, inputRef.current.value.length)
        }, 0);
    }

    const disableInput = () => setIsEditing(false)

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value)
        // 지금은 로그만 찍어보기
        console.log("새로운 제목 저장 시도:", event.target.value);
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            disableInput()
        }
    }

    return (
        <div className="flex gap-x-1 items-center">
            {isEditing ? (
                <Input
                    className="h-7 px-2 focus-visible:ring-transparent border-none bg-secondary/50"
                    ref={inputRef}
                    onBlur={disableInput}
                    value={title}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                />
            ) : (
                <Button
                    className="font-normal h-auto p-1"
                    variant='ghost'
                    size='sm'
                    onClick={enableInput}
                >
                    <span className="truncate max-w-50">
                        {title || "제목 없음"}
                    </span>
                </Button>
            )}
        </div>
    )
}

Title.Skeleton = function TitleSkeleton() {
    return (
        <Skeleton className="w-24 h-6 rounded-md bg-neutral-200 dark:bg-neutral-800" />
    )
}