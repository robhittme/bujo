package db

import (
    "database/sql"
    "fmt"
    "sync"
    "io/ioutil"
    "log"

    config "github.com/robhittme/bujo-project/golang/config"
    _ "github.com/lib/pq"
)

var db *sql.DB
var once sync.Once
var err error

// Connect connects to the database using the provided config.
func Connect(cfg *config.Config) (*sql.DB, error) {
    fmt.Println("Connecting to db")
    // create the connection string
    connStr := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable",
	cfg.Database.User, cfg.Database.Password, cfg.Database.Name)

    once.Do(func() {
	db, err = sql.Open("postgres", connStr)
    })

    if err != nil {
	return nil, err
    }

    // verify the connection
    if err := db.Ping(); err != nil {
	return nil, err
    }

    return db, nil
}

func GetDB() *sql.DB {
    return db
}


func RunMigrations() {
    migrationsDir := "./db/migrations"
    migrationFiles, err := ioutil.ReadDir(migrationsDir)
    if err != nil {
	log.Fatal(err)
    }

    for _, file := range migrationFiles {
	if !file.IsDir() {
	    migrationFilePath := migrationsDir + "/" + file.Name()

	    migrationFileContent, err := ioutil.ReadFile(migrationFilePath)
	    if err != nil {
		log.Fatal(err)
	    }

	    _, err = db.Exec(string(migrationFileContent))
	    if err != nil {
		log.Fatal(err)
	    }

	    log.Println("Migration file executed:", migrationFilePath)
	}
    }

    log.Println("Migrations complete!")
}

