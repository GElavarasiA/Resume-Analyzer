const express = require("express");
const multer = require("multer");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");

const app = express();
const PORT = 3000;

// File upload settings
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// Serve frontend files
app.use(express.static(__dirname));

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Resume Analyzer backend is running"
    });
});

// Analyze resume
app.post("/api/analyze", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a resume."
            });
        }

        let resumeText = "";

        // PDF
       if (req.file.mimetype === "application/pdf") {
    const parser = new PDFParse({
        data: req.file.buffer
    });

    const result = await parser.getText();
    resumeText = result.text;

    await parser.destroy();
}

        // DOCX
        else if (
            req.file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            const result = await mammoth.extractRawText({
                buffer: req.file.buffer
            });

            resumeText = result.value;
        }

        // TXT
        else if (req.file.mimetype === "text/plain") {
            resumeText = req.file.buffer.toString("utf-8");
        }

        // Unsupported file
        else {
            return res.status(400).json({
                success: false,
                message: "Only PDF, DOCX and TXT files are supported."
            });
        }

        // Clean text
        resumeText = resumeText.replace(/\s+/g, " ").trim();

        if (!resumeText) {
            return res.status(400).json({
                success: false,
                message: "Could not extract text from this resume."
            });
        }

        // Skills to detect
        const skills = [
            "HTML",
            "CSS",
            "JavaScript",
            "Python",
            "Java",
            "C",
            "C++",
            "React",
            "Node.js",
            "Express",
            "SQL",
            "MySQL",
            "MongoDB",
            "Git",
            "GitHub",
            "Jenkins",
            "Docker",
            "Linux",
            "AWS",
            "Azure",
            "Kubernetes",
            "DevOps",
            "Machine Learning",
            "TensorFlow",
            "Flask"
        ];

        // Convert resume text to lowercase
        const lowerText = resumeText.toLowerCase();

        // Detect skills
        const detectedSkills = skills.filter(skill =>
            lowerText.includes(skill.toLowerCase())
        );

        // Resume sections
        const sectionNames = [
            "education",
            "experience",
            "skills",
            "projects",
            "certifications",
            "summary",
            "objective",
            "contact"
        ];

        const detectedSections = sectionNames.filter(section =>
            lowerText.includes(section)
        );

        // Word count
        const wordCount = resumeText
            .split(/\s+/)
            .filter(word => word.length > 0)
            .length;

        // Score calculation
        let score = 0;

        // Skills score
        if (detectedSkills.length >= 5) {
            score += 30;
        } else {
            score += detectedSkills.length * 5;
        }

        // Sections score
        if (detectedSections.length >= 6) {
            score += 30;
        } else {
            score += detectedSections.length * 5;
        }

        // Word count score
        if (wordCount >= 300) {
            score += 20;
        } else if (wordCount >= 150) {
            score += 10;
        }

        // Email
        if (
            lowerText.includes("@") ||
            lowerText.includes("email")
        ) {
            score += 5;
        }

        // LinkedIn
        if (lowerText.includes("linkedin")) {
            score += 5;
        }

        // GitHub
        if (lowerText.includes("github")) {
            score += 5;
        }

        // Maximum score = 100
        if (score > 100) {
            score = 100;
        }

        // Suggestions
        const suggestions = [];

        if (detectedSkills.length < 5) {
            suggestions.push(
                "Add more relevant technical skills to your resume."
            );
        }

        if (!lowerText.includes("linkedin")) {
            suggestions.push(
                "Add your LinkedIn profile link."
            );
        }

        if (!lowerText.includes("github")) {
            suggestions.push(
                "Add your GitHub profile link."
            );
        }

        if (!lowerText.includes("projects")) {
            suggestions.push(
                "Add a Projects section with your important projects."
            );
        }

        if (!lowerText.includes("certifications")) {
            suggestions.push(
                "Add relevant certifications to strengthen your resume."
            );
        }

        if (wordCount < 150) {
            suggestions.push(
                "Your resume content is short. Add more details about projects and experience."
            );
        }

        // If no suggestions
        if (suggestions.length === 0) {
            suggestions.push(
                "Great! Your resume has a good structure. Keep updating it with relevant skills and projects."
            );
        }

        // Send response
        res.json({
            success: true,
            fileName: req.file.originalname,
            score: score,
            wordCount: wordCount,
            skills: detectedSkills,
            sections: detectedSections,
            suggestions: suggestions
        });

    } catch (error) {
        console.error("Resume analysis error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong while analyzing the resume."
        });
    }
});

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Resume Analyzer running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
    console.error("SERVER ERROR:", error);
});