# Pravia - Index Analysis Dashboard

This project is a Next.js application for analyzing financial indices.

## Project Structure
- `src/`: Contains the Next.js application source code.
- `Historical_Close/`: Contains the CSV data files.

## Getting Started

First, install dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment (Netlify)

1.  **Push to GitHub**: Ensure your latest code is pushed to your GitHub repository.

2.  **Connect to Netlify**:
    - Log in to Netlify.
    - Click "Add new site" -> "Import an existing project".
    - Select GitHub and choose your repository.

3.  **Configure Build Settings**:
    Netlify should detect the `netlify.toml` file automatically:
    - **Build command**: `npm run build`
    - **Publish directory**: `.next`

4.  **Data Access**:
    The application reads data from the `Historical_Close` directory. The `netlify.toml` is configured to include these files in the serverless functions, but for static generation, ensure the data is accessible.
