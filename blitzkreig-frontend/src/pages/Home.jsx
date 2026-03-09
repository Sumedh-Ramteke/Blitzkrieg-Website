import { useSearchParams } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import PastEvents from '../components/PastEvents'

export default function Home() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  return (
    <>
      <HeroSection />
      <PastEvents searchQuery={searchQuery} />
    </>
  )
}
