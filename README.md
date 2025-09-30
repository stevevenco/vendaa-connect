# Welcome to Vendaa

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Dockerization

This project includes Dockerfiles for development, staging, and production environments.

### Development

To build the development Docker image, run the following command:

```sh
docker build -t vite-react-dev -f Dockerfile.dev .
```

To run the development container, use the following command:

```sh
docker run -p 8080:8080 -v $(pwd)/src:/app/src vite-react-dev
```

### Staging

To build the staging Docker image, run the following command:

```sh
docker build -t vite-react-staging -f Dockerfile.staging .
```

To run the staging container, use the following command:

```sh
docker run -p 80:80 vite-react-staging
```

### Production

To build the production Docker image, run the following command:

```sh
docker build -t vite-react-prod -f Dockerfile.prod .
```

To run the production container, use the following command:

```sh
docker run -p 80:80 vite-react-prod
```
