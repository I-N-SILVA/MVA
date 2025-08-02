import * as React from 'react'

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

interface SlottableProps {
  asChild?: boolean
  children: React.ReactNode
}

const Slot = React.forwardRef<HTMLElement, SlotProps>(
  (props, ref) => {
    const { children, ...slotProps } = props

    if (React.Children.count(children) > 1) {
      React.Children.only(null) // will throw
    }

    if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...mergeProps(slotProps, children.props),
        ref: ref ? composeRefs(ref, (children as any).ref) : (children as any).ref,
      })
    }

    return React.Children.count(children) === 1 ? (
      React.Children.only(children)
    ) : null
  }
)
Slot.displayName = 'Slot'

const Slottable = ({ asChild, children }: SlottableProps) => {
  if (asChild) {
    return <Slot>{children}</Slot>
  }

  return <>{children}</>
}

// Utility functions
function mergeProps(slotProps: any, childProps: any) {
  const overrideProps = { ...childProps }

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName]
    const childPropValue = childProps[propName]

    const isHandler = /^on[A-Z]/.test(propName)
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args: unknown[]) => {
          childPropValue(...args)
          slotPropValue(...args)
        }
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue
      }
    } else if (propName === 'style') {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue }
    } else if (propName === 'className') {
      overrideProps[propName] = [slotPropValue, childPropValue]
        .filter(Boolean)
        .join(' ')
    }
  }

  return { ...slotProps, ...overrideProps }
}

function composeRefs(...refs: any[]) {
  return (node: any) => refs.forEach((ref) => setRef(ref, node))
}

function setRef(ref: any, value: any) {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref != null) {
    ref.current = value
  }
}

export { Slot, Slottable }