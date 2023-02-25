
package config

import (
	  "encoding/json"
	    "io/ioutil"
    )

    type Config struct {
	    Server struct {
		    Port int `json:"port"`
	    } `json:"server"`
	    Database struct {
		    Host     string `json:"host"`
		    Port     int    `json:"port"`
		    User     string `json:"user"`
		    Password string `json:"password"`
		    Name     string `json:"name"`
	    } `json:"database"`
    }

    // Load loads the config from a file
    func Load() (*Config, error) {
	    file, err := ioutil.ReadFile("./config/config.json")
	    if err != nil {
		    panic(err)
	    }

	    var config Config
	    if err := json.Unmarshal(file, &config); err != nil {
		    panic(err)
	    }

	    return &config, err
    }

