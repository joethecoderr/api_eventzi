# eventzi_api
the eventzi api is the backend in charge of providing the data required by the frontend of the Eventzi platform.



# Instructions:

To run the project, you must configure the environment variables and then execute the commands:

1. npm i
2. npm run dev (start the project in development mode with nodemon)
2. npm start (start the project in production mode with node)

# To send requests to the API from your local machine you must use:  

http://localhost:{port}/  ---you can configure which port to use in .env file


After that you write the route to which you want to request. e.g.:

http://localhost:{port}/users

If you wish to use API on AWS you must request to:

https://eventziapi.herokuapp.com/ (no need to specify port in here)



