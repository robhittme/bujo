package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/robhittme/bujo-project/golang/model"
)

type Response struct {
	Message string `json:"message"`
}

type EntryRequestBody struct {
	Text string `json:"text"`
}

func entryTypeConverter(t string) (string, string) {
	parts := strings.SplitAfterN(t, " ", 2)
	symbol := strings.TrimSpace(parts[0])
	text := strings.Join(parts[1:], "")
	switch symbol {
	case ".":
		return "task", text
	case "o":
		return "event", text
	case "-":
		return "note", text
	}
	return symbol, text
}

func InitRoutes() {
	r := http.NewServeMux()

	r.HandleFunc("/health", HealthHandler)
	r.HandleFunc("/entry", EntryHandler)

	fmt.Printf("Servers listening on port 8080\n")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := Response{Message: "Hello, World!"}
	json.NewEncoder(w).Encode(response)
}

func EntryHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		if strings.Contains(r.URL.Path, "/entry/") {
			pathParts := strings.Split(r.URL.Path, "/")
			entryID := pathParts[len(pathParts)-1]
			fmt.Println(entryID)

		} else {
			e, err := model.GetEntries()
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
			w.Header().Set("Content-Type", "application/json")
			err = json.NewEncoder(w).Encode(e)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
		}
	case http.MethodPost:
		var requestBody EntryRequestBody
		err := json.NewDecoder(r.Body).Decode(&requestBody)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		entryType, content := entryTypeConverter(requestBody.Text)
		id, err := model.CreateEntry(entryType, content)
		if err != nil {
			fmt.Println(err, "err")
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}
}
