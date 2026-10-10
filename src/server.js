import 'dotenv/config'
import app from './app.js'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`API berjalan di http://localhost:${PORT}`)
  console.log(`Cek kesehatan: http://localhost:${PORT}/health`)
})
