import { useSite } from '../context/SiteContext.jsx'

// Products come from SiteContext: the database copy (or the cached copy of the last visit), never a flash of defaults.
export default function useProducts() {
  return useSite().products
}
