## Environent variable configuration

- Two .env files must be created to store node environment variables, a .env.test file and a .env.development file. 
- In each .env file the PGDATABASE variable must be set to the name of the database to which you want to connect: In the
.env.test file set PGDATABASE to "nc_games_test" and in the .env.development file set PGDATABASE to "nc_games".