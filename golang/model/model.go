package model

import (
	"log"

	"github.com/robhittme/bujo-project/golang/db"
)

type Entry struct {
	Id                int64  `json:"id"`
	Text              string `json:"text"`
	EntryType         string `json:"entry_type"`
	CreatedTimestamp  int64  `json:"created_timestamp"`
	Completed         bool   `json:"completed"`
	Priority          bool   `json:"priority"`
	ModifiedTimestamp int64  `json:"modified_timestamp"`
}


// CreateEntry creates a new item in the database
func CreateEntry(entryType string, text string) (int64, error) {
	// prepare the SQL statement
	db := db.GetDB()

	var id int64
	err := db.QueryRow("INSERT INTO Entries (text, entry_type) VALUES ($1, $2) RETURNING id", text, entryType).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func GetEntries() ([]Entry, error) {
    db := db.GetDB()

    var entries []Entry
    // get all the entries for a user
    rows, err := db.Query("SELECT id, text, created_timestamp, entry_type, completed, priority FROM Entries")
    if err != nil {
        return []Entry{}, err
    }
    defer rows.Close()
	log.Println("!!")
    for rows.Next() {
        var e Entry
		if err := rows.Scan(&e.Id, &e.Text, &e.CreatedTimestamp, &e.EntryType, &e.Completed, &e.Priority); err != nil {
			return []Entry{}, err
		}
		entries = append(entries, e)
	}
	if err := rows.Err(); err != nil {
		return []Entry{}, err
	}
	return entries, nil
}

