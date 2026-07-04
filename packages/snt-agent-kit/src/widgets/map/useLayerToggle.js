/**
 * useLayerToggle — publish a chip into <SntMap>'s bottom-left Layers control
 * and own the visibility state for your layer.
 *
 * Replaces the manual useState + useEffect(registerLayerToggle) pattern that
 * custom layers used to write. Must be called inside a component rendered
 * under <SntMap> — throws otherwise (same constraint as useSntMap).
 *
 * Options:
 *   id              - unique within the parent SntMap (required)
 *   label           - chip caption (required)
 *   icon            - image URL/data URI; default: generic "layer" glyph
 *   defaultVisible  - initial state in uncontrolled mode (default: true)
 *   visible         - presence switches the hook to controlled mode
 *   onChange(next)  - fires on user toggle, with the new visibility
 *   enabled         - skip registration when false (default: true). Useful
 *                     when the layer has nothing to show (e.g. empty data).
 *
 * Returns the current visibility boolean — gate your layer effect on it.
 */
import { useCallback, useEffect, useState } from 'react'
import { useSntMap } from './SntMap'
import defaultLayerIcon from '../../assets/map/layer-default.svg'

export function useLayerToggle({
  id,
  label,
  icon = defaultLayerIcon,
  defaultVisible = true,
  visible: controlledVisible,
  onChange,
  enabled = true,
}) {
  const { registerLayerToggle } = useSntMap()

  const isControlled = controlledVisible !== undefined
  const [internalVisible, setInternalVisible] = useState(defaultVisible)
  const visible = isControlled ? controlledVisible : internalVisible

  const handleToggle = useCallback(() => {
    const next = !visible
    if (!isControlled) setInternalVisible(next)
    onChange?.(next)
  }, [visible, isControlled, onChange])

  useEffect(() => {
    if (!enabled) return
    return registerLayerToggle({
      id,
      label,
      icon,
      visible,
      onToggle: handleToggle,
    })
  }, [registerLayerToggle, id, label, icon, visible, handleToggle, enabled])

  return visible
}
