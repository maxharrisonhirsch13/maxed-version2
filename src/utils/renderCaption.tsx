import React from 'react'

/**
 * Renders a caption string with @mentions highlighted in green.
 */
export function renderCaption(caption: string, className?: string): React.ReactNode {
  const parts = caption.split(/(@\w+)/g)
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          return (
            <span key={i} className="text-[#00ff00] font-medium">
              {part}
            </span>
          )
        }
        return <React.Fragment key={i}>{part}</React.Fragment>
      })}
    </span>
  )
}
