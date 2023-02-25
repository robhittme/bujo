package cli

import (
	"fmt"
	"net/http"
	"log"
)

func StartCli() {
	fmt.Println("Starting the client")
	GetEntries()
}

func GetEntries() {
	resp, err := http.Get("http://localhost:8080/entry")
	if err != nil {
		log.Fatal(err)
	}

	defer resp.Body.Close()
	log.Println(resp.Body)
}
