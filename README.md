# F1 Website

This is a Next.js application that displays Formula 1 results and statistics using the unofficial F1 API.

## Prerequisites

- Node.js 18+
- npm

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/f1-website.git
   ```
2. Navigate to the project directory:
   ```bash
   cd f1-website
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## How to Run Locally

To run the development server, use the following command:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Information

This project uses the unofficial F1 API from [f1api.dev](https://f1api.dev/docs). The API provides real-time and historical data for Formula 1.

The following endpoints are used in this project:

- `https://api.f1api.dev/current/drivers-standings`
- `https://api.f1api.dev/current/constructors-standings`
- `https://api.f1api.dev/current/last/race`
