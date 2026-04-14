import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { FontProvider } from '@/context/FontContext'
import { BookmarkProvider } from '@/features/bookmarks/BookmarkContext'
import { ToastProvider } from '@/components/ui/toast'
import Layout from '@/components/layout/Layout'
import Welcome from '@/chapters/Welcome'
import ChapterPage from '@/chapters/ChapterPage'
import LastLocationTracker from '@/components/LastLocationTracker'
import GuidedTour from '@/components/tour/GuidedTour'

export default function App() {
  return (
    <ThemeProvider>
      <FontProvider>
      <BookmarkProvider>
      <ToastProvider>
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
      </ToastProvider>
      </BookmarkProvider>
      </FontProvider>
    </ThemeProvider>
  )
}
