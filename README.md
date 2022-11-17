## Summary

RESTful game review data API built using Postgres, Node, Express, and Jest.

## Setup

1. Clone the repository: Ensure Git is installed and added to the path and enter the following into the cmd prompt: "git clone https://github.com/mr-metschnikowia/northcoders-final-proj.git"
2. In the cmd prompt, navigate into the cloned repository and enter "npm i", this will install all the dependencies listed in the package.json.
3. To seed the local development database use the "npm setup-dbs" command; You must ensure that you can access the psql database without having to manually input your psql username and password,
this can be achieved using a .pgpass file or by adding the PGUSER and PGPASS variables to the path. 
4. To run the Jest test suite use the "npm t" command.

* at least node v16.14.0 and postgres v14.5 are required to run this project locally

## Environent variable configuration

- Two.env files must be created to store node environment variables, required for datbase access; a.env.test file and a.env.development file.
- In each.env file the PGDATABASE variable must be set to the name of the database to which you want to connect: In the
.env.test file set PGDATABASE to "nc_games_test" and in the.env.development file set PGDATABASE to "nc_games".

Link to hosted website: https://lucky-handkerchief-elk.cyclic.app
