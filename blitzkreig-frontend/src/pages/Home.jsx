import { useSearchParams } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import PastEvents from '../components/PastEvents'
import SocialMediaSection from '../components/SocialMediaSection'

export default function Home() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  return (
    <>
      <HeroSection />
      <PastEvents searchQuery={searchQuery} />
      <SocialMediaSection />
    </>
  )
}
