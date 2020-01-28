package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"

	"github.com/mrjones/oauth"
)

const (
	AUTH_FILE = "../credentials/twitter.json"
)

type (
	TwitterAuth struct {
		ConsumerKey       string `json:"consumer_key"`
		ConsumerSecret    string `json:"consumer_secret"`
		AccessTokenKey    string `json:"access_token_key"`
		AccessTokenSecret string `json:"access_token_secret"`
	}
)

func main() {
	data, err := ioutil.ReadFile(AUTH_FILE)
	if err != nil {
		panic(err)
	}

	var auth TwitterAuth
	if err := json.Unmarshal(data, &auth); err != nil {
		panic(err)
	}

	consumer := oauth.NewConsumer(
		auth.ConsumerKey,
		auth.ConsumerSecret,
		oauth.ServiceProvider{
			RequestTokenUrl:   "https://api.twitter.com/oauth/request_token",
			AuthorizeTokenUrl: "https://api.twitter.com/oauth/authorize",
			AccessTokenUrl:    "https://api.twitter.com/oauth/access_token",
		},
	)

	requestToken, url, err := consumer.GetRequestTokenAndUrl("oob")
	if err != nil {
		panic(err)
	}

	fmt.Println(url)

	var pin string
	fmt.Scanln(&pin)

	accessToken, err := consumer.AuthorizeToken(requestToken, pin)
	if err != nil {
		panic(err)
	}

	auth.AccessTokenKey = accessToken.Token
	auth.AccessTokenSecret = accessToken.Secret

	data, err = json.Marshal(auth)
	if err != nil {
		panic(err)
	}

	if err := ioutil.WriteFile(AUTH_FILE, data, 0644); err != nil {
		panic(err)
	}
}
