# afi-loadboard-app (AfroInnovate Transportation Management Service)

Welcome to the AfroInnovate loadboard Landing Page App built using React. This repository houses the frontend codebase for the landing page that showcases our innovative transportation management solutions.

## Table of Contents

- [Dependencies](#dependencies)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

## Dependencies

Go to react readme here
This app is built using the React framework and has the following main dependencies:

- `node 18(Latest)`: Node will be required for underlying setup of the react app
- `react`: Core library for building user interfaces
- `react-dom`: React library for DOM rendering
- `react-router-dom`: For routing and navigation

You can check out `package.json` for a full list of dependencies.

## Getting Started

To run this project locally:

1. Clone the repository:
   `git clone https://github.com/afroinnovate/afi-loadboard-app.git`

2. Change directory into the cloned repository:

```sh
cd afi-loadboard-app
```

3. Install the dependencies:

```sh
npm install
```
   Before you run the app make sure you create .env file and add the contents as below
   ```
      SECRET_KEY_DEV=afroinnovate_dev_key
      SECRET_KEY_PROD=afroinnovate_prod_key

   ```
4. Run the development server:

```sh
npm run dev
```

## Running with Docker Compose

Using Docker Compose is a convenient way to run multi-container applications. With the provided `docker-compose.yml` file, you can easily start the `afi-loadboard-app` service.

### Prerequisites

- Ensure you have Docker and Docker Compose installed. If not, download and install [Docker](https://www.docker.com/get-started) and follow the [Docker Compose installation guide](https://docs.docker.com/compose/install/).

### Building and Running the React App with Docker Compose

1. Navigate to the root directory of the project where the `docker-compose.yml` file resides.
2. Build and start the service:
   ```shell
   docker-compose up --build
   ```

After the services start, you can access the app in your browser at http://localhost:3000.

**NB**: Your development environment is being listened to, so any change you made, you don't need to run the docker again, it'll pick it up from the host and sync the container automatically.

To stop the services, simply run:

`docker-compose down`

This will start the development server, and you can view the app in your browser at `http://localhost:3000`.

## Contributing

We appreciate all contributions! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Clone your forked repository:
   `git clone https://github.com/afroinnovate/afi-loadboard-app.git`

3. Change directory into the cloned repository:
   `cd afi-loadboard-app`

4. Create a new branch off the `develop` branch:
   `git checkout -b feature/my-new-feature develop`

5. Make your changes and commit them.
6. Push the changes to your forked repository on GitHub.
7. Create a Pull Request targeting the `develop` branch of the original repository.

Once your Pull Request is approved and merged, you can safely delete your branch.
