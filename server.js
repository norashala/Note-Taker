const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // Middleware to parse JSON bodies

// Route for serving notes.html
app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/notes.html"));
});

// API route for getting notes
app.get("/api/notes", async (req, res) => {
    const dbPath = path.join(__dirname, "db", "db.json");
    try {
        const notes = await fs.promises.readFile(dbPath, "utf8");
        res.json(JSON.parse(notes));
    } catch (error) {
        console.error("Failed to read notes from db.json:", error);
        res.status(500).json({ error: "Failed to fetch notes." });
    }
});

// Route for saving a note (POST /api/notes)
app.post("/api/notes", async (req, res) => {
    console.log("Saving a note", req.body);

    // Define the file path
    const filePath = path.join(__dirname, "db", "db.json");

    // Read the existing notes from the file
    const data = await fs.promises.readFile(filePath, "utf8");
    const notes = JSON.parse(data);

    // Add the new note to the array of notes
    const newNote = {
        title: req.body.title,
        text: req.body.text,
        id: Date.now()
    };
    notes.push(newNote);

    // Write the updated notes back to the file
    await fs.promises.writeFile(filePath, JSON.stringify(notes, null, 2));

    res.json(newNote); // Send back the saved note as confirmation to the front end
});

// Route for deleting a note (DELETE /api/notes/:id)
app.delete("/api/notes/:id", async (req, res) => {
    const deleteID = Number(req.params.id); // Casting to number since id is a number not string
    console.log(`Deleting note with ID: ${deleteID}`); // Log the ID of the note to delete
    
    // Define the file path where db.json is
    const filePath = path.join(__dirname, "db", "db.json");

    // Read the existing notes from the file
    const data = await fs.promises.readFile(filePath, "utf8");
    const notes = JSON.parse(data);

    // Filter out the note with the given ID
    const updatedNotes = notes.filter(note => note.id !== deleteID);
    
    // Write the updated notes back to the file
    await fs.promises.writeFile(filePath, JSON.stringify(updatedNotes, null, 2));

    res.json({ message: `Note ${deleteID} deleted` }); // Send back a response
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});