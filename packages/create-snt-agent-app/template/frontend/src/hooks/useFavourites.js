import { useState, useEffect, useCallback } from 'react'

/**
 * The current user's favourite devices, by serial, kept in this app's database
 * (/api/favourites). Toggling updates the list at once and puts it back if the
 * server refuses.
 */
export function useFavourites() {
  const [favourites, setFavourites] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/favourites')
      .then(res => res.json())
      .then(ids => setFavourites(new Set(ids)))
      .catch(() => setFavourites(new Set()))
      .finally(() => setLoading(false))
  }, [])

  const toggleFavourite = useCallback(async (serial) => {
    const isFav = favourites.has(serial)
    // Optimistic update
    setFavourites(prev => {
      const next = new Set(prev)
      if (isFav) next.delete(serial)
      else next.add(serial)
      return next
    })

    try {
      const res = await fetch(`/api/favourites/${encodeURIComponent(serial)}`, {
        method: isFav ? 'DELETE' : 'PUT',
      })
      if (!res.ok) throw new Error()
    } catch {
      // Revert on error
      setFavourites(prev => {
        const next = new Set(prev)
        if (isFav) next.add(serial)
        else next.delete(serial)
        return next
      })
    }
  }, [favourites])

  const isFavourite = useCallback((serial) => favourites.has(serial), [favourites])

  return { favourites, toggleFavourite, isFavourite, loading }
}
