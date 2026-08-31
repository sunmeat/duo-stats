# 🦉 Duolingo Stats

**Duolingo Stats** is a small web tool for beautifully viewing and sharing public Duolingo profile statistics.

Enter a username and get a compact personalized card with an avatar, username, XP, current and longest streaks, and progress across learning courses.

### ✨ Demo

**Web:** https://duostat.vercel.app/

For example:

https://duostat.vercel.app/?u=taemnus

You can also generate a ready-to-use PNG statistics card:

https://duostat.vercel.app/api/card?username=taemnus

---

## 🚀 Features

* 🔎 Search for a Duolingo profile by username
* 🦉 Display profile avatar and information
* 🔥 Current and longest streak
* ⭐ Total XP
* 📚 List of learning courses
* 👑 XP and crowns for each course
* 🔗 Shareable profile URLs
* 🖼️ Generate statistics cards as PNG
* ⚡ Minimal interface with no registration
* 📱 Responsive design

---

## 🛠️ Tech Stack

* **React**
* **Vite**
* **JavaScript**
* **CSS**
* **Vercel**
* Duolingo public API

---

## 📦 Run Locally

Requires **Node.js 18+**.

```bash
git clone https://github.com/sunmeat/duo-stats.git
cd duo-stats
npm install
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

---

## 🔗 Shareable Profiles

Duolingo Stats supports direct links to individual profiles:

```text
https://duostat.vercel.app/?u=username
```

For example:

```text
https://duostat.vercel.app/?u=taemnus
```

Share the link with someone and their statistics will be loaded automatically.

---

## 🖼️ PNG Statistics Cards

You can generate a ready-to-use PNG card for any public profile:

```text
https://duostat.vercel.app/api/card?username=username
```

For example:

```text
https://duostat.vercel.app/api/card?username=taemnus
```

The generated card can be used in profiles, README files, social media, or simply shared with friends.

---

## 🔌 How It Works

Duolingo Stats retrieves publicly available profile information from Duolingo and transforms it into a clean, easy-to-read format.

The project uses Duolingo's public user data endpoint:

```text
https://www.duolingo.com/2017-06-30/users
```

The application does not require users to log in to Duolingo or provide any credentials.

> Duolingo Stats only works with publicly available profile data.

### Available Statistics

Depending on what Duolingo exposes publicly, the application can display information such as:

* Username
* Display name
* Avatar
* Current streak
* Longest streak
* Total XP
* Learning courses
* XP per course
* Crowns
* Registration date
* Super Duolingo status

Some private or restricted Duolingo statistics may not be available through the public API.

---

## 📁 Project Structure

```text
duo-stats/
├── api/
├── public/
├── src/
│   ├── api/
│   │   └── duolingo.js
│   ├── components/
│   │   ├── SearchBar.jsx
│   │   ├── ProfileCard.jsx
│   │   ├── CourseList.jsx
│   │   └── ShareBar.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

---

## 🏗️ Production Build

Create a production build with:

```bash
npm run build
```

The project can be deployed to Vercel or another platform capable of hosting a Vite application and its API endpoints.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## ❤️ Why?

Duolingo provides plenty of statistics, but sharing your progress is not always as simple or visually appealing as it could be.

**Duolingo Stats** turns a public Duolingo profile into a simple, beautiful card that you can open, save, or share.

> **Your language journey, one card. 🦉**
