import { useState, useEffect } from 'react'
import axios from 'axios'
import PastEvents from '../components/PastEvents'

export default function Events() {
  const [search, setSearch] = useState('')
  return (
    <div className="pt-24">
      <div className="section-container py-10">
        <h1 className="text-4xl font-extrabold mb-6">
          All <span className="text-gradient-blue-gold">Events</span>
        </h1>
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="field-surface w-full max-w-md px-4 py-2.5 rounded-xl mb-8"
        />
      </div>
      <PastEvents searchQuery={search} />
    </div>
  )
}
