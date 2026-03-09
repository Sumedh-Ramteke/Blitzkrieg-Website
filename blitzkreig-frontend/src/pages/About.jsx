export default function About() {
  return (
    <div className="pt-32 pb-20">
      <div className="section-container max-w-3xl space-y-8">
        <h1 className="text-4xl font-extrabold">
          About <span className="text-gradient-blue-gold">Blitzkreig</span>
        </h1>
        <div className="prose prose-invert prose-slate max-w-none space-y-5 text-slate-400 leading-relaxed">
          <p>
            Blitzkreig Chess Club is the official chess club of{' '}
            <span className="text-slate-200 font-medium">
              Visvesvaraya National Institute of Technology (VNIT), Nagpur.
            </span>{' '}
            Founded with the mission of nurturing competitive and recreational chess among students,
            the club has grown into one of the most active sports clubs on campus.
          </p>
          <p>
            We host rapid, blitz, and classical tournaments throughout the academic year, participate in
            inter-NIT competitions, and run a structured mentorship program that pairs experienced players
            with beginners. Our training sessions cover opening theory, middlegame strategy, and endgame
            technique.
          </p>
          <p>
            Whether you are a seasoned rated player or have never touched a chess piece, Blitzkreig
            welcomes you. The sixty-four squares await.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6 pt-4">
          {[
            { value: '2019', label: 'Founded' },
            { value: '200+', label: 'Members' },
            { value: '30+',  label: 'Events Hosted' },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-800/40 p-5 text-center">
              <div className="text-3xl font-extrabold text-vnit-gold">{value}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
