import './globals.css'

export const metadata = {
  title: 'OfficeFlex Converter',
  description: 'Smart Office Converter Extension',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
