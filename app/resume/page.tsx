"use client";
import { useState } from "react";

export default function ResumePage() {
  const [form, setForm] = useState({
    name: "",
    job: "",
    skills: "",
    experience: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateResume = async () => {
    setError("");
    setDownloadUrl("");

    if (!form.name || !form.job || !form.skills || !form.experience) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to generate resume");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">
          ✨ Build Your Resume
        </h1>

        <div className="space-y-4">
          <input
            name="name"
            value={form.name}
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <input
            name="job"
            value={form.job}
            placeholder="Target Role"
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <input
            name="skills"
            value={form.skills}
            placeholder="Skills"
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <textarea
            name="experience"
            value={form.experience}
            placeholder="Experience"
            onChange={handleChange}
            className="w-full border p-3 rounded-lg h-28"
          />
        </div>

        <button
          onClick={generateResume}
          disabled={loading}
          className="w-full mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate Resume"}
        </button>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`${form.name || "resume"}.pdf`}
            className="block w-full mt-4"
          >
            <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
              ⬇ Download Resume
            </button>
          </a>
        )}
      </div>
    </main>
  );
}