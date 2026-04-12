import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { BookmarkProvider } from '@/context/BookmarkContext'
import Layout from '@/components/Layout/Layout'
import Welcome from '@/chapters/Welcome'
import ChapterPage from '@/chapters/ChapterPage'
import LastLocationTracker from '@/components/LastLocationTracker'

export default function App() {
  return (
    <ThemeProvider>
      <BookmarkProvider>
      <HashRouter>
        <LastLocationTracker />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Welcome />} />
            <Route path="chapter/:chapterId" element={<ChapterPage />} />
          </Route>
        </Routes>
      </HashRouter>
      </BookmarkProvider>
    </ThemeProvider>
  )
}
