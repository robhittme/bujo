package main

import (
	"log"
	"flag"
	"os"
	"os/exec"
	 a "github.com/robhittme/bujo-project/golang/api"
	"github.com/robhittme/bujo-project/golang/config"
	cli "github.com/robhittme/bujo-project/golang/cli"
	database "github.com/robhittme/bujo-project/golang/db"
	_ "github.com/lib/pq"

)

func main() {
	var migration bool
	var c bool
	flag.BoolVar(&migration, "migrate", false, "Run migration")
	flag.BoolVar(&c, "cli", false, "Start the CLI")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}
	//connect to the database

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	

	if err := db.Ping(); err != nil {
		log.Fatal(err)
	}
	
	if migration {
		database.RunMigrations()
		return
	}


	if c {
		cmd := exec.Command("go", "run", "bujo.go")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		defer func() {
			if err := cmd.Process.Kill(); err != nil {
				log.Println("Error killing process:", err)
			}
		}()

		if err := cmd.Run(); err != nil {
			log.Println("Error running command:", err)
			os.Exit(1)
		}
		if err := cmd.Start(); err != nil {
			log.Println("Error: failed to start API server")
			return
		}

		cli.StartCli()
	}
	if !c && !migration {
		a.InitRoutes()
	}
}



