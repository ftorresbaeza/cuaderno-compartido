"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateSubjectDialog } from "@/components/subject/CreateSubjectDialog"
import { CreateEventDialog } from "@/components/event/CreateEventDialog"

interface CourseDialogsProps {
  courseId: string
  courseCode: string
  subjects: { id: string; name: string }[]
}

export function CourseDialogs({ courseId, courseCode, subjects }: CourseDialogsProps) {
  const [showSubjectDialog, setShowSubjectDialog] = useState(false)
  const [showEventDialog, setShowEventDialog] = useState(false)

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSubjectDialog(true)}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Asignatura
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEventDialog(true)}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Evento
        </Button>
      </div>

      <CreateSubjectDialog
        open={showSubjectDialog}
        onOpenChange={setShowSubjectDialog}
        courseId={courseId}
        courseCode={courseCode}
      />

      <CreateEventDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        courseId={courseId}
        courseCode={courseCode}
        subjects={subjects}
      />
    </>
  )
}
