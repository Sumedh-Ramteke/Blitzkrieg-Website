# Deployment Guide for Blitzkrieg Website

We have set up the project for automated deployment using **Netlify** (Frontend) and **Render** (Backend).

## 1. Deploy the Backend (Render)

1. Sign up / Log in to [Render](https://render.com).
2. Go to your Render Dashboard and click **New +** -> **Blueprint**.
3. Connect your GitHub account and select the `Sumedh-Ramteke/Blitzkrieg-Website` repository.
4. Render will automatically detect the `render.yaml` file in the root of the repository and set up your backend service (named `blitzkrieg-backend`).
5. Click **Apply** to start the deployment.
6. **Important Note on Disks:** The `render.yaml` includes a **Persistent Disk** to save your website's data and uploaded images across restarts. Persistent Disks require a paid Render plan. 
   - *If you are on the Free tier*, the deployment will fail. To fix this, simply edit `render.yaml` in your repository: remove the `disk:` section entirely, and change the `startCommand` to just `node src/server.js`. Keep in mind that on the Free tier, any uploaded images or data will be reset every time Render restarts the server.
7. Once deployed, copy your backend URL (e.g., `https://blitzkrieg-backend-xxxxx.onrender.com`).

## 2. Deploy the Frontend (Netlify)

1. Sign up / Log in to [Netlify](https://netlify.com).
2. Click **Add new site** -> **Import an existing project**.
3. Connect your GitHub account and select the `Sumedh-Ramteke/Blitzkrieg-Website` repository.
4. Netlify will automatically detect the `netlify.toml` configuration.
5. **CRITICAL STEP:** Before clicking "Deploy", click on **Add environment variables** and add a new variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `<YOUR_RENDER_BACKEND_URL>` (Paste the URL you copied from Render, without a trailing slash. e.g., `https://blitzkrieg-backend-xxxxx.onrender.com`)
6. Click **Deploy Site**.
7. Netlify will build the frontend and automatically set up proxy rules so that all `/api` and `/uploads` requests are securely forwarded to your Render backend without running into CORS issues.

## 3. Verify Integration

1. Visit your new Netlify URL (e.g., `https://blitzkrieg-chess.netlify.app`).
2. Navigate to the Admin or Events section to verify that the frontend is successfully communicating with the backend and fetching data.

That's it! Both the frontend and backend are integrated and live. Any new code you push to the `master` branch will now automatically deploy to both services.
