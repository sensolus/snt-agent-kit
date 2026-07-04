import { useState, useEffect, useCallback } from 'react'

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

  const toggleFavourite = useCallback(async (orgId) => {
    const isFav = favourites.has(orgId)
    // Optimistic update
    setFavourites(prev => {
      const next = new Set(prev)
      if (isFav) next.delete(orgId)
      else next.add(orgId)
      return next
    })

    try {
      const res = await fetch(`/api/favourites/${orgId}`, {
        method: isFav ? 'DELETE' : 'PUT',
      })
      if (!res.ok) throw new Error()
    } catch {
      // Revert on error
      setFavourites(prev => {
        const next = new Set(prev)
        if (isFav) next.add(orgId)
        else next.delete(orgId)
        return next
      })
    }
  }, [favourites])

  const isFavourite = useCallback((orgId) => favourites.has(orgId), [favourites])

  return { favourites, toggleFavourite, isFavourite, loading }
}
