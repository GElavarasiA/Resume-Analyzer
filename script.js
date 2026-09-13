// ==========================================
// RESUME ANALYZER - SCRIPT.JS
// ==========================================


// ------------------------------------------
// File Selection
// ------------------------------------------

const resumeFile = document.getElementById("resumeFile");
const fileName = document.getElementById("fileName");

if (resumeFile) {

    resumeFile.addEventListener("change", function () {

        if (resumeFile.files.length > 0) {

            const file = resumeFile.files[0];

            fileName.textContent =
                "Selected: " + file.name;

            fileName.style.color = "#a78bfa";

        } else {

            fileName.textContent =
                "No file selected";

        }

    });

}


// ------------------------------------------
// Analyze Resume
// ------------------------------------------

async function analyzeResume() {

    const fileInput =
        document.getElementById("resumeFile");

    const message =
        document.getElementById("message");

    const loading =
        document.getElementById("loading");

    const result =
        document.getElementById("result");


    // Check file selected
    if (!fileInput || fileInput.files.length === 0) {

        showMessage(
            "Please select your resume first.",
            "error"
        );

        return;
    }


    const file = fileInput.files[0];


    // --------------------------------------
    // Allowed file types
    // --------------------------------------

    const allowedTypes = [

        "application/pdf",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "text/plain"

    ];


    if (!allowedTypes.includes(file.type)) {

        showMessage(
            "Please upload PDF, DOCX or TXT file.",
            "error"
        );

        return;
    }


    // --------------------------------------
    // File size check
    // --------------------------------------

    if (file.size > 5 * 1024 * 1024) {

        showMessage(
            "File size should be less than 5 MB.",
            "error"
        );

        return;
    }


    // --------------------------------------
    // Show loading
    // --------------------------------------

    if (message) {

        message.textContent =
            "Analyzing your resume...";

        message.style.color =
            "#a78bfa";

    }


    if (loading) {

        loading.style.display = "block";

        loading.textContent =
            "⏳ Analyzing your resume...";

    }


    // Clear old result
    if (result) {

        result.innerHTML = "";

    }


    // --------------------------------------
    // Create FormData
    // --------------------------------------

    const formData = new FormData();

    formData.append(
        "resume",
        file
    );


    // --------------------------------------
    // Send to Backend
    // --------------------------------------

    try {

        const response = await fetch(
            "/api/analyze",
            {
                method: "POST",
                body: formData
            }
        );


        const data = await response.json();


        // ----------------------------------
        // Backend Error
        // ----------------------------------

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Analysis failed."
            );

        }


        // ----------------------------------
        // Success Message
        // ----------------------------------

        if (message) {

            message.textContent =
                "✓ Resume analyzed successfully!";

            message.style.color =
                "#4ade80";

        }


        if (loading) {

            loading.style.display =
                "none";

        }


        // ----------------------------------
        // Display Result
        // ----------------------------------

        displayResults(data);


    } catch (error) {

        console.error(
            "Resume analysis error:",
            error
        );


        if (loading) {

            loading.style.display =
                "none";

        }


        if (message) {

            message.textContent =
                "Unable to analyze resume. Please try again.";

            message.style.color =
                "#ff6b6b";

        }

    }

}


// ------------------------------------------
// Show Message Helper
// ------------------------------------------

function showMessage(text, type) {

    const message =
        document.getElementById("message");


    if (!message) {

        return;

    }


    message.textContent = text;


    if (type === "error") {

        message.style.color =
            "#ff6b6b";

    } else {

        message.style.color =
            "#4ade80";

    }

}


// ------------------------------------------
// Display Analysis Results
// ------------------------------------------

function displayResults(data) {

    let resultBox =
        document.getElementById("result");


    // If result container doesn't exist
    if (!resultBox) {

        resultBox =
            document.createElement("div");

        resultBox.id =
            "result";

        const analyzerBox =
            document.querySelector(
                ".analyzer-box"
            );


        if (analyzerBox) {

            analyzerBox.appendChild(
                resultBox
            );

        } else {

            document.body.appendChild(
                resultBox
            );

        }

    }


    // --------------------------------------
    // Score
    // --------------------------------------

    const score =
        Number(data.score) || 0;


    // --------------------------------------
    // Skills
    // --------------------------------------

    const skills =
        Array.isArray(data.skills)
            ? data.skills
            : [];


    let skillsHTML = "";


    if (skills.length > 0) {

        skillsHTML =
            skills
                .map(
                    skill =>
                        `<span>${escapeHTML(skill)}</span>`
                )
                .join("");

    } else {

        skillsHTML =
            `<span>No technical skills detected</span>`;

    }


    // --------------------------------------
    // Sections
    // --------------------------------------

    const sections =
        Array.isArray(data.sections)
            ? data.sections
            : [];


    let sectionsHTML = "";


    if (sections.length > 0) {

        sectionsHTML =
            sections
                .map(
                    section =>
                        `<span>${escapeHTML(section)}</span>`
                )
                .join("");

    } else {

        sectionsHTML =
            `<span>No common sections detected</span>`;

    }


    // --------------------------------------
    // Suggestions
    // --------------------------------------

    const suggestions =
        Array.isArray(data.suggestions)
            ? data.suggestions
            : [];


    let suggestionsHTML = "";


    if (suggestions.length > 0) {

        suggestionsHTML =
            suggestions
                .map(
                    suggestion =>
                        `
                        <li>
                            💡 ${escapeHTML(suggestion)}
                        </li>
                        `
                )
                .join("");

    } else {

        suggestionsHTML =
            `
            <li>
                ✓ Your resume looks good!
            </li>
            `;

    }


    // --------------------------------------
    // Result HTML
    // --------------------------------------

    resultBox.innerHTML = `

        <div class="result-card">

            <h2>
                📊 Resume Analysis Result
            </h2>


            <!-- Score -->

            <div class="score-area">

                <div class="result-score">

                    ${score}

                    <span>/100</span>

                </div>

                <p>
                    Resume Score
                </p>

            </div>


            <!-- Progress -->

            <div class="result-progress">

                <div
                    class="result-progress-bar"
                    style="width: ${score}%"
                ></div>

            </div>


            <!-- Basic Information -->

            <div class="result-info-grid">


                <div class="info-card">

                    <div class="info-icon">
                        📄
                    </div>

                    <div>

                        <small>
                            Resume
                        </small>

                        <strong>
                            ${escapeHTML(
                                data.fileName ||
                                "Resume"
                            )}
                        </strong>

                    </div>

                </div>


                <div class="info-card">

                    <div class="info-icon">
                        📝
                    </div>

                    <div>

                        <small>
                            Word Count
                        </small>

                        <strong>
                            ${data.wordCount || 0}
                            words
                        </strong>

                    </div>

                </div>


                <div class="info-card">

                    <div class="info-icon">
                        💻
                    </div>

                    <div>

                        <small>
                            Skills Found
                        </small>

                        <strong>
                            ${skills.length}
                        </strong>

                    </div>

                </div>


                <div class="info-card">

                    <div class="info-icon">
                        📌
                    </div>

                    <div>

                        <small>
                            Sections
                        </small>

                        <strong>
                            ${sections.length}
                        </strong>

                    </div>

                </div>


            </div>


            <!-- Skills -->

            <div class="result-section">

                <h3>
                    💻 Detected Skills
                </h3>

                <div class="skill-list">

                    ${skillsHTML}

                </div>

            </div>


            <!-- Resume Sections -->

            <div class="result-section">

                <h3>
                    📌 Resume Sections
                </h3>

                <div class="skill-list">

                    ${sectionsHTML}

                </div>

            </div>


            <!-- Suggestions -->

            <div class="result-section">

                <h3>
                    💡 Improvement Suggestions
                </h3>

                <ul class="suggestion-list">

                    ${suggestionsHTML}

                </ul>

            </div>


            <!-- Success -->

            <div class="analysis-success">

                ✓ Analysis completed successfully

            </div>

        </div>

    `;


    // Smooth scroll to result

    setTimeout(() => {

        resultBox.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 200);

}


// ------------------------------------------
// Security Helper
// ------------------------------------------

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}