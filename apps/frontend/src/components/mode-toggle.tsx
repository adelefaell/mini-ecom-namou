import { Menu } from "@base-ui/react/menu"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Check, Monitor, Moon, Sun } from "lucide-react"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Toggle theme">
            <Sun className="hidden dark:block" />
            <Moon className="dark:hidden" />
          </Button>
        }
      />
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={6}>
          <Menu.Popup className="z-50 min-w-36 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">
            <MenuItem
              active={theme === "light"}
              icon={<Sun className="size-3.5" />}
              label="Light"
              onClick={() => setTheme("light")}
            />
            <MenuItem
              active={theme === "dark"}
              icon={<Moon className="size-3.5" />}
              label="Dark"
              onClick={() => setTheme("dark")}
            />
            <MenuItem
              active={theme === "system"}
              icon={<Monitor className="size-3.5" />}
              label="System"
              onClick={() => setTheme("system")}
            />
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

function MenuItem({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Menu.Item
      onClick={onClick}
      data-active={active || undefined}
      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground data-[active]:bg-accent data-[active]:text-accent-foreground"
    >
      {icon}
      {label}
      {active && <Check className="ml-auto size-3.5" />}
    </Menu.Item>
  )
}