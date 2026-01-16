# Deployment Guide for Zakat-Audit

This guide explains how to deploy your "Zakat-Audit" application for free using **Render** (Backend & Database) and **Vercel** (Frontend).

## Prerequisites
- A GitHub account.
- Your code pushed to GitHub.

---

## Part 1: Backend Deployment (Render)

We will use Render to host the Java Spring Boot backend and the PostgreSQL database.

1.  **Sign Up / Login to Render**: Go to [https://render.com](https://render.com) and log in with GitHub.
2.  **Create Database**:
    *   Click **New +** -> **PostgreSQL**.
    *   Name: `audit-db` (or similar).
    *   Region: Singapore (or nearest to you).
    *   Plan: **Free**.
    *   Click **Create Database**.
    *   *Wait for it to be created*. once done, find the **Internal Database URL** and **External Database URL**.

3.  **Create Backend Service**:
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository (`Zakat-Audit`).
    *   **Root Directory**: `audit-backend`.
    *   **Runtime**: **Docker**.
    *   **Region**: Same as your database.
    *   **Plan**: **Free**.
    *   **Environment Variables** (Scroll down to "Advanced"):
        *   Add Variable: `DB_URL` -> Value: `jdbc:postgresql://<hostname>:5432/<dbname>` 
            *   *Note*: Copy the `hostname` and `dbname` from your Render Database details.
        *   `DB_USERNAME`: (Copy from Render).
        *   `DB_PASSWORD`: (Copy from Render).
        *   `PORT`: `9090`.
    *   Click **Create Web Service**.

4.  **Get Backend URL**:
    *   Once deployed, Render will give you a URL (e.g., `https://audit-backend.onrender.com`).
    *   **Copy this URL**.

---

## Part 2: Frontend Deployment (Vercel)

We will use Vercel to host the Angular frontend.

1.  **Update Environment File**:
    *   Open `audit-frontend/src/environments/environment.prod.ts` locally.
    *   Replace the placeholder URL with your **NEW Render Backend URL** (e.g., `https://audit-backend.onrender.com/api`).
    *   Commit and push this change to GitHub.

2.  **Sign Up / Login to Vercel**: Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
3.  **Add New Project**:
    *   Click **Add New...** -> **Project**.
    *   Import your `Zakat-Audit` repository.
4.  **Configure Project**:
    *   **Root Directory**: Click "Edit" and select `audit-frontend`.
    *   **Framework Preset**: It should auto-detect **Angular**.
    *   **Build Command**: `ng build` (default).
    *   **Output Directory**: `dist/audit-frontend`.
5.  **Deploy**:
    *   Click **Deploy**.

---

## Troubleshooting

-   **Backend Fails**: Check logs in Render. It usually takes 5-10 minutes to build the Docker image the first time.
-   **Frontend 404s**: If refreshing a page gives a 404, ensure `vercel.json` exists in `audit-frontend`.
