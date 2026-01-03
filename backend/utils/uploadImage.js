const supabase = require("../config/supabase");

const uploadImage = async ({ buffer, mimetype, originalname, folder }) => {
  if (!mimetype.startsWith("image/")) {
    const err = new Error("Only image files are allowed");
    err.statusCode = 400;
    throw err;
  }

  const safeName = originalname.replace(/\s+/g, "_");
  const filePath = `${folder}/${Date.now()}_${safeName}`;

  const { error } = await supabase.storage
    .from("ping-files")
    .upload(filePath, buffer, {
      contentType: mimetype,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("ping-files").getPublicUrl(filePath);

  return data.publicUrl;
};

module.exports = { uploadImage };
