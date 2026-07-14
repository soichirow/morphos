import { useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n-context"

type CopyTextButtonProps = {
  getText: () => string
  title: string
  label: string
  compact?: boolean
  variant?: "default" | "outline"
}

export function CopyTextButton({
  getText,
  title,
  label,
  compact = false,
  variant = "outline",
}: CopyTextButtonProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  async function copyText() {
    try {
      await navigator.clipboard.writeText(getText())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard access can be denied by the browser.
    }
  }

  return (
    <Button
      size="sm"
      variant={variant}
      onClick={copyText}
      title={title}
      aria-label={title}
    >
      {copied ? (
        <Check data-icon="inline-start" />
      ) : (
        <Copy data-icon="inline-start" />
      )}
      <span className={compact ? "hidden sm:inline" : undefined}>
        {copied ? t("common.copied") : label}
      </span>
    </Button>
  )
}
