# 🎓 Canvas Crawler

Welcome to **Canvas Crawler**! 🚀 This tool helps you fetch PDF files and external resources for each course provided on Canvas. <br>
Say goodbye to manual downloads and hello to automation! 🎉

## 📋 Requirements

Before you dive in, make sure you have the following:

- **Node.js v20 or later** installed. 🟢
- A `downloads` folder in the root directory where all your course goodies will be saved. 📂
- A `.env` file in the root directory with your Canvas access token. Don't worry, I won't peek! unless you push it here 🤫
  ```dotenv
  CANVAS_API_KEY=your_canvas_access_token (you can create one from your canvas account settings)
  CANVAS_API_URL=your_canvas_base_api_url
- A `coursesMapping.json` file in the root directory with the following content:
```json
{
  "courseIdToDescriptions": [
    {
      "code": "The Canvas Code for the course you want to extract pdf, external links",
      "descr": "A description of the course id that will be used to name the subdir in which you ll find the files"
    }
  ]
}
```

## 🚀 Installation & Usage
Ready to get started? Follow these steps:
- Clone the repository:`git clone https://github.com/zingarettimattia/canvas_crawler.git`
- Navigate to the project directory: `cd canvas_crawler`
- Verify that you meet the Requirements described above. ✅
- Install the dependencies: `npm install`
- Start the crawler:`npm run start`

And that's it! Sit back, relax, and let Canvas Crawler do the heavy lifting. 🛋️

## 📚 How It Works
Canvas Crawler will:

- Fetch course modules from Canvas from the info provided in the `coursesMapping.json` file.
- Download PDF files and save them in corresponding downloads sub folder.
- Collect external URLs and save them in a single CSV file.