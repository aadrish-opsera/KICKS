import SampleCard from '../components/SampleCard/SampleCard'
import '../styles/breakpoints.css'

function HomePage() {
  return (
    <main className="container">
      <h1>Home Page</h1>
      <SampleCard
        title="Design token preview"
        body="SampleCard validates CSS Modules, custom properties, and responsive breakpoints."
        actionLabel="Continue"
      />
    </main>
  )
}

export default HomePage
