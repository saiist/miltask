const Database = require('better-sqlite3')
const { readFileSync } = require('fs')
const { join } = require('path')

const dbPath = join(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/otaku-secretary-db.sqlite')
const migrationPath = join(process.cwd(), 'migrations/0001_create_auth_tables.sql')

const db = new Database(dbPath)
const migration = readFileSync(migrationPath, 'utf8')

// Split migration into individual statements
const statements = migration.split(';').filter(s => s.trim())

try {
  db.exec('BEGIN TRANSACTION')
  
  for (const statement of statements) {
    if (statement.trim()) {
      console.log('Executing:', statement.trim())
      db.exec(statement)
    }
  }
  
  db.exec('COMMIT')
  console.log('Database initialized successfully!')
} catch (error) {
  db.exec('ROLLBACK')
  console.error('Database initialization failed:', error)
  throw error
} finally {
  db.close()
}