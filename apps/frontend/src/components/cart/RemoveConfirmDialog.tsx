import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"

interface RemoveConfirmDialogProps {
  pending: { id: number; name: string } | null
  onClose: () => void
  onConfirm: (id: number) => void
}

function RemoveConfirmDialog({ pending, onClose, onConfirm }: RemoveConfirmDialogProps) {
  return (
    <AlertDialog
      open={pending != null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 className="size-4" />
          </AlertDialogMedia>
          <AlertDialogTitle>Remove item?</AlertDialogTitle>
          <AlertDialogDescription>
            All {pending?.name} quantities will be removed from your cart. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              if (pending) onConfirm(pending.id)
              onClose()
            }}
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { RemoveConfirmDialog }