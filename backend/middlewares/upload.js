const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = upload;

// Why memoryStorage?
// Supabase SDK expects buffer
// No temp files
// Faster + cleaner

// The memory storage engine stores the files in
// memory as Buffer objects.

// When using memory storage, the file info
// will contain a field called buffer that contains
// the entire file.
