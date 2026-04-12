import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { FontProvider } from '@/context/FontContext'
import { BookmarkProvider } from '@/context/BookmarkContext'
import Layout from '@/components/Layout/Layout'
import Welcome from '@/chapters/Welcome'
import ChapterPage from '@/chapters/ChapterPage'
import LastLocationTracker from '@/components/LastLocationTracker'
import GuidedTour from '@/components/GuidedTour/GuidedTour'

export default function App() {
  return (
    <ThemeProvider>
      <FontProvider>
      <BookmarkProvider>
      <HashRouter>
        <LastLocationTracker />
        <GuidedTour>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Welcome />} />
              <Route path="chapter/:chapterId" element={<ChapterPage />} />
            </Route>
          </Routes>
        </GuidedTour>
      </HashRouter>
      </BookmarkProvider>
      </FontProvider>
    </ThemeProvider>
  )
}
